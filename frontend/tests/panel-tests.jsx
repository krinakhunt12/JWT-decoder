import { renderToStaticMarkup } from "react-dom/server";
import AuditPanel from "../src/components/AuditPanel.jsx";
import DiffPanel from "../src/components/DiffPanel.jsx";
import { encodeSegment, hmacSign } from "../src/utils/jwt.js";

async function mintToken(payload, alg, secret) {
  const signingInput = `${encodeSegment({ alg, typ: "JWT" })}.${encodeSegment(payload)}`;
  const signature = await hmacSign(alg, secret, signingInput);
  return `${signingInput}.${signature}`;
}

let failures = 0;
const all = [];
function check(label, pass, extra = "") {
  all.push([label, pass]);
  if (!pass) { failures += 1; console.log(`  FAIL  ${label}${extra ? `  -> ${extra}` : ""}`); }
}
function safeRender(element, label) {
  try {
    return { html: renderToStaticMarkup(element), error: null };
  } catch (error) {
    check(`${label} renders`, false, error.message);
    return { html: "", error };
  }
}

console.log("── AuditPanel ──\n");

const hsPayload = { sub: "usr_92837", iss: "https://acme.auth0.com/", iat: 1750000000, exp: 1999999999 };
const hsToken = await mintToken(hsPayload, "HS256", "secret");
const hsResult = { header: { alg: "HS256", typ: "JWT" }, payload: hsPayload };

{
  const { html } = safeRender(<AuditPanel token={hsToken} result={hsResult} verifyPublicKey="" />, "AuditPanel hs256");
  check("renders dictionary size", html.includes("32,987") || /\d{2},\d{3}/.test(html));
  check("shows run button", html.includes("Run Dictionary Attack"));
  check("shows alg in the status line", html.includes("HS256"));
  check("mentions the worker", html.includes("Web Worker"));
  check("lists claim coverage", html.includes("Registered Claim Coverage"));
  check("shows missing aud as critical", html.includes("No audience"));
  check("shows present iss/sub", html.includes("present"));
  check("renders claim grid", html.includes("exp") && html.includes("aud") && html.includes("jti"));
  check("offers attack probes", html.includes("Run Attack Probes"));
  check("no undefined/NaN leakage", !/undefined|NaN|\[object Object\]/.test(html));
}

{
  const rsResult = { header: { alg: "RS256", kid: "k1" }, payload: { sub: "u", iss: "https://x.com/", exp: 1999999999 } };
  const { html } = safeRender(<AuditPanel token="a.b.c" result={rsResult} verifyPublicKey="-----BEGIN PUBLIC KEY-----&#10;AAAA&#10;-----END PUBLIC KEY-----" />, "AuditPanel rs256");
  check("tells user asymmetric tokens cannot be cracked", html.includes("no shared secret to guess"), "asymmetric notice");
  check("enables the confusion probe", html.includes("confusion probe needs a public key") === false, "probe hint gone once a key is present");
}

{
  const { html } = safeRender(<AuditPanel token="" result={null} verifyPublicKey="" />, "AuditPanel empty");
  check("handles empty state without crashing", html.includes("Paste a token first"));
}

// ── DiffPanel ────────────────────────────────────────────────────────────────
console.log("\n── DiffPanel ──\n");

const tokenA = await mintToken({ sub: "u1", role: "user", exp: 2000000000, iat: 1000, nbf: 1000 }, "HS256", "secret");
const tokenB = await mintToken({ sub: "u1", role: "admin", exp: 2000003600, iat: 900, aud: "api", scope: ["read", "write"] }, "HS256", "secret");

{
  const { html } = safeRender(<DiffPanel activeToken="" />, "DiffPanel empty");
  check("empty state prompts for two tokens", html.includes("Paste two decodable tokens"));
  check("has swap control", html.includes("Swap A"));
}

{
  const { html } = safeRender(<DiffPanel activeToken={tokenA} />, "DiffPanel empty");
  check("no crash with activeToken", html.length > 0);
}

{
  const populated = safeRender(<DiffPanel activeToken="" />, "DiffPanel populated");
  check("baseline render ok", populated.error === null);
}

// Drive the populated state by rendering the diff table directly.
{
  const { diffClaims, compareTimings, summarizeDiff, DIFF_TYPES } = await import("../src/utils/diffTokens.js");
  const decode = seg => JSON.parse(Buffer.from(seg.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString());
  const a = decode(tokenA.split(".")[1]);
  const b = decode(tokenB.split(".")[1]);
  const rows = diffClaims(a, b);
  const counts = summarizeDiff(rows);
  const t = compareTimings(a, b, 1_700_000_000);

  check("role shows as modified", rows.find(r => r.path === "role")?.type === DIFF_TYPES.CHANGED);
  check("aud shows as added", rows.find(r => r.path === "aud")?.type === DIFF_TYPES.ADDED);
  check("nbf shows as removed", rows.find(r => r.path === "nbf")?.type === DIFF_TYPES.REMOVED);
  check("sub unchanged", rows.find(r => r.path === "sub")?.type === DIFF_TYPES.SAME);
  check("scope is an added row", rows.find(r => r.path === "scope")?.type === DIFF_TYPES.ADDED);
  check("counts non-zero", counts.total > 0, JSON.stringify(counts));
  check("lifetime delta computed", t.lifetime.delta !== null, JSON.stringify(t.lifetime));
  check("exp delta is +1 hour", t.rows.find(r => r.claim === "exp")?.delta === 3600, JSON.stringify(t.rows.find(r => r.claim === "exp")));
  console.log(`        diff: +${counts.added} added, -${counts.removed} removed, ~${counts.changed + counts.typeChanged} modified`);
  console.log(`        exp delta: ${t.rows.find(r => r.claim === "exp").deltaText}, lifetime delta: ${t.lifetime.deltaText}`);
}

// ── report ───────────────────────────────────────────────────────────────────
console.log();
for (const [label, pass] of all.filter(([, p]) => p)) console.log(`  ok    ${label}`);
console.log(failures === 0 ? `\nAll ${all.length} assertions passed.` : `\n${failures} of ${all.length} assertions FAILED.`);
process.exit(failures === 0 ? 0 : 1);