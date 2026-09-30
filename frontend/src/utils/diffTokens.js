// Pure claim-diff logic for the side-by-side comparison tool.

export const DIFF_TYPES = {
  ADDED: "added",
  REMOVED: "removed",
  CHANGED: "changed",
  SAME: "same",
  TYPE_CHANGED: "type-changed",
};

function isPlainObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function typeName(value) {
  if (value === null) return "null";
  if (Array.isArray(value)) return "array";
  return typeof value;
}

// Shallow compare per key. Nested objects are compared by JSON so a nested change
// surfaces as a single "changed" row rather than an explosion of leaf rows.
function valuesEqual(a, b) {
  if (a === b) return true;
  const ta = typeName(a);
  const tb = typeName(b);
  if (ta !== tb) return false;
  if (isPlainObject(a) || Array.isArray(a)) return JSON.stringify(a) === JSON.stringify(b);
  return false;
}

function flatten(value, prefix = "", out = {}) {
  if (isPlainObject(value)) {
    for (const [key, child] of Object.entries(value)) {
      flatten(child, prefix ? `${prefix}.${key}` : key, out);
    }
    return out;
  }
  out[prefix] = value;
  return out;
}

// Returns one row per changed-or-unchanged leaf claim, ordered by claim path.
export function diffClaims(payloadA, payloadB) {
  const flatA = flatten(isPlainObject(payloadA) ? payloadA : {});
  const flatB = flatten(isPlainObject(payloadB) ? payloadB : {});
  const paths = [...new Set([...Object.keys(flatA), ...Object.keys(flatB)])].sort();

  const rows = paths.map(path => {
    const inA = Object.prototype.hasOwnProperty.call(flatA, path);
    const inB = Object.prototype.hasOwnProperty.call(flatB, path);
    const valueA = flatA[path];
    const valueB = flatB[path];

    if (inA && !inB) {
      return { path, type: DIFF_TYPES.REMOVED, valueA, valueB: undefined };
    }
    if (!inA && inB) {
      return { path, type: DIFF_TYPES.ADDED, valueA: undefined, valueB };
    }
    if (typeName(valueA) !== typeName(valueB)) {
      return { path, type: DIFF_TYPES.TYPE_CHANGED, valueA, valueB };
    }
    if (!valuesEqual(valueA, valueB)) {
      return { path, type: DIFF_TYPES.CHANGED, valueA, valueB };
    }
    return { path, type: DIFF_TYPES.SAME, valueA, valueB };
  });

  return rows;
}

export function summarizeDiff(rows) {
  const counts = { added: 0, removed: 0, changed: 0, typeChanged: 0, same: 0 };
  for (const row of rows) {
    if (row.type === DIFF_TYPES.ADDED) counts.added += 1;
    else if (row.type === DIFF_TYPES.REMOVED) counts.removed += 1;
    else if (row.type === DIFF_TYPES.CHANGED) counts.changed += 1;
    else if (row.type === DIFF_TYPES.TYPE_CHANGED) counts.typeChanged += 1;
    else counts.same += 1;
  }
  counts.total = counts.added + counts.removed + counts.changed + counts.typeChanged;
  counts.identical = counts.total === 0;
  return counts;
}

function describeDuration(seconds) {
  const abs = Math.abs(seconds);
  if (abs < 60) return `${abs} second${abs === 1 ? "" : "s"}`;
  if (abs < 3600) {
    const m = Math.round(abs / 60);
    return `${m} minute${m === 1 ? "" : "s"}`;
  }
  if (abs < 86400) {
    const h = Math.round((abs / 3600) * 10) / 10;
    return `${h} hour${h === 1 ? "" : "s"}`;
  }
  const d = Math.round((abs / 86400) * 10) / 10;
  return `${d} day${d === 1 ? "" : "s"}`;
}

// Compares the time claims most often involved in token refresh debugging.
export function compareTimings(payloadA, payloadB, now = Math.floor(Date.now() / 1000)) {
  const claims = ["iat", "nbf", "exp"];
  const rows = claims.map(claim => {
    const valueA = payloadA?.[claim];
    const valueB = payloadB?.[claim];
    const hasA = typeof valueA === "number";
    const hasB = typeof valueB === "number";

    let delta = null;
    if (hasA && hasB) delta = valueB - valueA;

    return {
      claim,
      valueA,
      valueB,
      hasA,
      hasB,
      delta,
      deltaText: delta === null ? "—" : `${delta >= 0 ? "+" : "−"}${describeDuration(delta)}`,
    };
  });

  const lifetimeA = typeof payloadA?.iat === "number" && typeof payloadA?.exp === "number"
    ? payloadA.exp - payloadA.iat
    : null;
  const lifetimeB = typeof payloadB?.iat === "number" && typeof payloadB?.exp === "number"
    ? payloadB.exp - payloadB.iat
    : null;

  const remainingA = typeof payloadA?.exp === "number" ? payloadA.exp - now : null;
  const remainingB = typeof payloadB?.exp === "number" ? payloadB.exp - now : null;

  return {
    rows,
    lifetime: {
      a: lifetimeA,
      b: lifetimeB,
      delta: lifetimeA === null || lifetimeB === null ? null : lifetimeB - lifetimeA,
      deltaText: lifetimeA === null || lifetimeB === null
        ? "—"
        : `${lifetimeB - lifetimeA >= 0 ? "+" : "−"}${describeDuration(lifetimeB - lifetimeA)}`,
    },
    remaining: {
      a: remainingA,
      b: remainingB,
      delta: remainingA === null || remainingB === null ? null : remainingB - remainingA,
      deltaText: remainingA === null || remainingB === null
        ? "—"
        : `${remainingB - remainingA >= 0 ? "+" : "−"}${describeDuration(remainingB - remainingA)}`,
    },
    expired: {
      a: remainingA === null ? null : remainingA < 0,
      b: remainingB === null ? null : remainingB < 0,
    },
  };
}

// Flags claim-level findings that usually explain a diff — e.g. a role upgrade.
const RISKY_INCREASES = ["role", "roles", "scope", "scopes", "permissions", "is_admin", "admin", "groups", "groups:"];

export function highlightRiskyChanges(rows) {
  return rows
    .filter(row => row.type === DIFF_TYPES.CHANGED || row.type === DIFF_TYPES.ADDED || row.type === DIFF_TYPES.TYPE_CHANGED)
    .map(row => {
      const leaf = row.path.split(".").pop().toLowerCase();
      const risky = RISKY_INCREASES.some(name => leaf === name || leaf === name.split(":")[0]);
      if (!risky) return null;
      return {
        path: row.path,
        from: row.valueA,
        to: row.valueB,
        kind: row.type === DIFF_TYPES.ADDED ? "granted" : "changed",
      };
    })
    .filter(Boolean);
}

export function formatValue(value) {
  if (value === undefined) return "—";
  if (value === null) return "null";
  if (typeof value === "object") return JSON.stringify(value);
  if (typeof value === "string") return `"${value}"`;
  return String(value);
}