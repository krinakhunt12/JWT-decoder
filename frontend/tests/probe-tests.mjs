// Runs the audit probes against the LIVE FastAPI backend, replicating AuditPanel's
// exact request/response handling to prove the interpretation logic is correct.

import { forgeConfusionToken, forgeUnsignedToken } from "../src/utils/jwt.js";

const API = process.env.API || "http://127.0.0.1:8021";
let failures = 0;
function check(label, pass, extra = "") {
  console.log(`  ${pass ? "ok  " : "FAIL"}  ${label}${pass || !extra ? "" : `  -> ${extra}`}`);
  if (!pass) failures += 1;
}

const health = await fetch(`${API}/`).then(r => r.json()).catch(() => null);
if (!health) {
  console.log(`backend not reachable at ${API} — start it first`);
  process.exit(1);
}
console.log(`backend: ${API}\n`);

// A real RSA public key, matching the format a user would paste into Verify.
const { generateKeyPairSync } = await import("node:crypto");
const { publicKey } = generateKeyPairSync("rsa", { modulusLength: 2048 });
const pubPem = publicKey.export({ type: "spki", format: "pem" });

const payload = { sub: "usr_92837", role: "admin", iss: "https://acme.auth0.com/", exp: 1999999999 };

async function verify(body) {
  const response = await fetch(`${API}/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return response.json();
}

// ── Probe 1: alg:none ────────────────────────────────────────────────────────
{
  const unsigned = forgeUnsignedToken(payload);
  check("forged alg:none token is unsigned", unsigned.endsWith(".") && unsigned.split(".").length === 3);
  const data = await verify({ token: unsigned, algorithm: "none", secret: "" });
  check("backend rejects alg:none", data.overall_valid === false, `overall_valid=${data.overall_valid}`);
  check("rejection message is reported", Boolean(data.message || data.error), JSON.stringify(data));
  console.log(`        → ${data.message}`);
}

// ── Probe 2: algorithm confusion ─────────────────────────────────────────────
{
  const forged = await forgeConfusionToken({ ...payload, sub: "attacker" }, pubPem, "HS256");
  check("forged confusion token built", Boolean(forged) && forged.split(".").length === 3);
  const header = JSON.parse(Buffer.from(forged.split(".")[0].replace(/-/g, "+").replace(/_/g, "/"), "base64").toString());
  check("forged token declares HS256", header.alg === "HS256", header.alg);

  const asSecret = await verify({ token: forged, algorithm: "HS256", secret: pubPem });
  check("backend rejects public key as HMAC secret", asSecret.overall_valid === false, `overall_valid=${asSecret.overall_valid}`);
  console.log(`        → ${asSecret.message}: ${(asSecret.error || "").slice(0, 100)}`);

  const asPublicKey = await verify({ token: forged, algorithm: "HS256", secret: "", public_key: pubPem });
  check("backend rejects PEM in the public_key slot for HS*", asPublicKey.overall_valid === false, `overall_valid=${asPublicKey.overall_valid}`);
  console.log(`        → ${asPublicKey.message}`);
}

// ── Negative control: the forged token must NOT verify on its own merits ──────
{
  // Sanity: if the probes were silently failing to send anything, this check would
  // show the backend accepting arbitrary junk. It must still refuse.
  const junk = await verify({ token: "a.b.c", algorithm: "HS256", secret: pubPem });
  check("backend refuses a junk token with a PEM secret", junk.overall_valid === false);
}

// ── Confirm a legitimately signed HS256 token still verifies ─────────────────
{
  const { encodeSegment, hmacSign } = await import("../src/utils/jwt.js");
  const signingInput = `${encodeSegment({ alg: "HS256", typ: "JWT" })}.${encodeSegment(payload)}`;
  const signature = await hmacSign("HS256", "my-secret-key", signingInput);
  const token = `${signingInput}.${signature}`;
  const data = await verify({ token, algorithm: "HS256", secret: "my-secret-key" });
  check("browser-signed HS256 token verifies on the backend", data.overall_valid === true, JSON.stringify(data));
  const wrong = await verify({ token, algorithm: "HS256", secret: "wrong-secret" });
  check("wrong secret still fails", wrong.overall_valid === false);
}

console.log(failures === 0 ? "\nAll probe assertions passed." : `\n${failures} probe assertion(s) FAILED.`);
process.exit(failures === 0 ? 0 : 1);