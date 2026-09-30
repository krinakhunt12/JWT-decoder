import {
  base64UrlFromBytes,
  base64UrlToBytes,
  constantTimeEqual,
  decodeSegment,
  encodeSegment,
  forgeConfusionToken,
  forgeUnsignedToken,
  hmacSign,
  splitToken,
  webCryptoAvailable,
} from "../src/utils/jwt.js";
import {
  DIFF_TYPES,
  compareTimings,
  diffClaims,
  highlightRiskyChanges,
  summarizeDiff,
} from "../src/utils/diffTokens.js";
import { buildCandidateSecrets, DICTIONARY_SEEDS, TOTAL_CANDIDATES } from "../src/constants/weakSecrets.js";

let failures = 0;
const results = [];
function check(label, pass, extra = "") {
  results.push([label, pass, extra]);
  if (!pass) failures += 1;
}
function eq(label, actual, expected) {
  check(label, JSON.stringify(actual) === JSON.stringify(expected), `got ${JSON.stringify(actual)} want ${JSON.stringify(expected)}`);
}

console.log(`crypto.subtle available: ${webCryptoAvailable()}\n`);

// ── base64url ────────────────────────────────────────────────────────────────
{
  const encoder = new TextEncoder();
  const text = "héllo wörld ✓ ~+-_/ 123";
  const bytes = encoder.encode(text);
  const roundTrip = new TextDecoder().decode(base64UrlToBytes(base64UrlFromBytes(bytes)));
  eq("base64url round-trips utf-8", roundTrip, text);

  const raw = new Uint8Array([251, 255, 190, 0, 1, 2]);
  const encoded = base64UrlFromBytes(raw);
  check("base64url is url-safe (no + or /)", !/[+/]/.test(encoded), encoded);
  check("base64url has no padding", !encoded.includes("="), encoded);
  eq("base64url decodes back to bytes", [...base64UrlToBytes(encoded)], [...raw]);

  eq("decodeSegment parses JSON", decodeSegment(encodeSegment({ alg: "RS256", kid: "k1" })), { alg: "RS256", kid: "k1" });
  eq("splitToken rejects 2 parts", splitToken("a.b"), null);
  check("splitToken accepts 3 parts", Boolean(splitToken(encodeSegment({}) + "." + encodeSegment({}) + ".sig")));
}

// ── constant time compare ────────────────────────────────────────────────────
{
  check("ctEqual equal strings", constantTimeEqual("abc", "abc"));
  check("ctEqual different strings", !constantTimeEqual("abc", "abd"));
  check("ctEqual length mismatch", !constantTimeEqual("abc", "abcd"));
  check("ctEqual empty", constantTimeEqual("", ""));
  check("ctEqual non-strings false", !constantTimeEqual(null, "abc"));
}

// ── claim diff ───────────────────────────────────────────────────────────────
{
  const a = { sub: "u1", role: "user", exp: 1000, nbf: 900, scope: ["read"] };
  const b = { sub: "u1", role: "admin", exp: 4600, nbf: 900, aud: "api", scope: ["read", "write"], count: 5 };

  const rows = diffClaims(a, b);
  const byPath = Object.fromEntries(rows.map(r => [r.path, r.type]));

  eq("unchanged sub", byPath.sub, DIFF_TYPES.SAME);
  eq("changed role", byPath.role, DIFF_TYPES.CHANGED);
  eq("changed exp", byPath.exp, DIFF_TYPES.CHANGED);
  eq("unchanged nbf", byPath.nbf, DIFF_TYPES.SAME);
  eq("added aud", byPath.aud, DIFF_TYPES.ADDED);
  eq("added count", byPath.count, DIFF_TYPES.ADDED);
  eq("added array member is a change", byPath.scope, DIFF_TYPES.CHANGED);
  // Paths: sub, role, exp, nbf, scope (5 from A) + aud, count (2 from B) = 7 rows.
  eq("every leaf claim gets a row", rows.length, 7);

  const counts = summarizeDiff(rows);
  eq("counts.added", counts.added, 2);
  eq("counts.changed", counts.changed, 3);
  eq("counts.removed", counts.removed, 0);
  eq("counts.same", counts.same, 2);
  check("counts.total counts only differences", counts.total === 5, `got ${counts.total}`);
  check("not identical", counts.identical === false);

  const removed = diffClaims({ a: 1, gone: 2 }, { a: 1 });
  eq("removed claim", removed.find(r => r.path === "gone").type, DIFF_TYPES.REMOVED);

  const typed = diffClaims({ n: 5 }, { n: "5" });
  eq("type change detected", typed.find(r => r.path === "n").type, DIFF_TYPES.TYPE_CHANGED);

  const nested = diffClaims({ user: { id: 1, org: "a" } }, { user: { id: 1, org: "b" } });
  eq("nested leaf diff", nested.find(r => r.path === "user.org").type, DIFF_TYPES.CHANGED);
  eq("nested sibling unchanged", nested.find(r => r.path === "user.id").type, DIFF_TYPES.SAME);

  const arrOfObj = diffClaims({ items: [{ a: 1 }] }, { items: [{ a: 2 }] });
  eq("array of objects diffs as leaf", arrOfObj.find(r => r.path === "items").type, DIFF_TYPES.CHANGED);

  eq("null vs missing is added", diffClaims({}, { n: null }).find(r => r.path === "n").type, DIFF_TYPES.ADDED);
  eq("undefined-safe empty input", summarizeDiff(diffClaims(null, undefined)).identical, true);
}

// ── timing comparison ────────────────────────────────────────────────────────
{
  const now = 1_000_000;
  // A lives 200s, B lives 400s — B is the longer-lived token by 200s.
  const a = { iat: now - 100, exp: now + 100 };
  const b = { iat: now - 200, exp: now + 200 };

  const t = compareTimings(a, b, now);
  eq("exp delta", t.rows.find(r => r.claim === "exp").delta, 100);
  check("exp delta text is humanized", /\+/.test(t.rows.find(r => r.claim === "exp").deltaText), t.rows.find(r => r.claim === "exp").deltaText);
  eq("lifetime A", t.lifetime.a, 200);
  eq("lifetime B", t.lifetime.b, 400);
  eq("lifetime delta", t.lifetime.delta, 200);
  eq("lifetime text humanized to minutes", t.lifetime.deltaText, "+3 minutes");
  eq("remaining A", t.remaining.a, 100);
  eq("remaining B", t.remaining.b, 200);
  eq("remaining delta", t.remaining.delta, 100);
  eq("neither expired", t.expired.a || t.expired.b, false);

  const sameLifetime = compareTimings({ iat: 0, exp: 100 }, { iat: 500, exp: 600 }, now);
  eq("equal lifetimes report zero", sameLifetime.lifetime.deltaText, "+0 seconds");

  const expired = compareTimings({ exp: now - 5 }, {}, now);
  eq("expired detected", expired.expired.a, true);

  const missing = compareTimings({}, {}, now);
  eq("missing exp delta is null", missing.rows.find(r => r.claim === "exp").delta, null);
  eq("missing exp text is dash", missing.rows.find(r => r.claim === "exp").deltaText, "—");

  const hours = compareTimings({ exp: 0 }, { exp: 7200 }, now);
  check("2h delta humanized as hours", hours.rows.find(r => r.claim === "exp").deltaText.includes("2 hours"), hours.rows.find(r => r.claim === "exp").deltaText);
}

// ── risky change highlight ───────────────────────────────────────────────────
{
  const rows = diffClaims(
    { role: "user", scopes: ["read"], sub: "u1", exp: 1 },
    { role: "admin", scopes: ["read", "write"], sub: "u1", exp: 2 },
  );
  const risky = highlightRiskyChanges(rows);
  const paths = risky.map(r => r.path).sort();
  eq("flags role and scopes", paths, ["role", "scopes"]);
  check("does not flag exp or sub", !paths.includes("exp") && !paths.includes("sub"), paths.join(","));

  const nestedRole = highlightRiskyChanges(diffClaims({ user: { role: "user" } }, { user: { role: "admin" } }));
  eq("flags nested role", nestedRole.map(r => r.path), ["user.role"]);
}

// ── dictionary ───────────────────────────────────────────────────────────────
{
  const list = buildCandidateSecrets();
  eq("TOTAL_CANDIDATES matches build output", TOTAL_CANDIDATES, list.length);
  check("dictionary is large", list.length >= 10000, `got ${list.length}`);
  eq("no duplicates", new Set(list).size, list.length);
  check("no empty secrets", !list.includes(""));
  check("no whitespace-only", !list.some(s => s.trim() === ""));
  check("all strings", list.every(s => typeof s === "string"));
  check("includes documented examples", ["secret", "123456", "password", "admin", "app_secret", "jwt_secret"].every(s => list.includes(s)));
  check("includes mutations of seeds", ["secret123", "supersecret!", "jwt_secret_2024", "secret-2025", "key.2026"].every(s => list.includes(s)), "seed mutations");
  check("seed groups present", Object.keys(DICTIONARY_SEEDS).length === 5);
  console.log(`  dictionary: ${list.length.toLocaleString()} candidates from ${Object.values(DICTIONARY_SEEDS).flat().length} seeds`);
}

// ── HMAC correctness (vectors from RFC 4231 / python-jose) ───────────────────
{
  const vectors = JSON.parse(process.env.HMAC_VECTORS || "[]");
  for (const v of vectors) {
    const sig = await hmacSign(v.alg, v.secret, v.data);
    eq(`HMAC ${v.alg} matches reference`, sig, v.signature);
  }
}

// ── forge helpers ────────────────────────────────────────────────────────────
{
  const unsigned = forgeUnsignedToken({ sub: "x" });
  check("forgeUnsignedToken has empty signature", unsigned.endsWith("."), unsigned);
  eq("forgeUnsignedToken alg", JSON.parse(new TextDecoder().decode(base64UrlToBytes(unsigned.split(".")[0]))).alg, "none");
  check("forgeUnsignedToken is 3 parts", unsigned.split(".").length === 3);

  const pub = "-----BEGIN PUBLIC KEY-----\nMFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAE\n-----END PUBLIC KEY-----";
  const confusion = await forgeConfusionToken({ role: "admin" }, pub, "HS256");
  const parts = confusion.split(".");
  eq("forged confusion token alg is HS256", JSON.parse(new TextDecoder().decode(base64UrlToBytes(parts[0]))).alg, "HS256");
  const recomputed = await hmacSign("HS256", pub, `${parts[0]}.${parts[1]}`);
  eq("forged signature is the public-key HMAC", parts[2], recomputed);

  const bad = await forgeConfusionToken({ role: "admin" }, pub, "RS256");
  eq("forgeConfusionToken refuses non-HMAC alg", bad, null);
}

// ── report ───────────────────────────────────────────────────────────────────
console.log();
for (const [label, pass, extra] of results) {
  console.log(`  ${pass ? "ok  " : "FAIL"}  ${label}${pass || !extra ? "" : `  -> ${extra}`}`);
}
console.log(failures === 0 ? `\nAll ${results.length} assertions passed.` : `\n${failures} of ${results.length} assertions FAILED.`);
process.exit(failures === 0 ? 0 : 1);