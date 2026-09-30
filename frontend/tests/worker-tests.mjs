// Drives the real cracker worker module in Node by shimming the worker global.
// Proves the full sweep path: dictionary -> HMAC -> constant-time compare -> hit.

import { encodeSegment } from "../src/utils/jwt.js";
import { hmacSign } from "../src/utils/jwt.js";

const sent = [];
globalThis.self = {
  set onmessage(handler) { this._handler = handler; },
  get onmessage() { return this._handler; },
  postMessage: message => sent.push(message),
  _handler: null,
};

await import("../src/workers/secretCracker.worker.js");

let failures = 0;
function check(label, pass, extra = "") {
  console.log(`  ${pass ? "ok  " : "FAIL"}  ${label}${pass || !extra ? "" : `  -> ${extra}`}`);
  if (!pass) failures += 1;
}

async function runCrack(token, alg) {
  sent.length = 0;
  self.onmessage({ data: { type: "crack", token, alg } });
  // The worker handler is async; wait for a terminal message.
  for (let i = 0; i < 200000; i += 1) {
    const terminal = sent.find(m => ["cracked", "exhausted", "error"].includes(m.type));
    if (terminal) return { terminal, all: [...sent] };
    await new Promise(r => setTimeout(r, 1));
  }
  return { terminal: null, all: [...sent] };
}

async function mintToken(secret, alg, payload = { sub: "u1", role: "admin" }) {
  const header = { alg, typ: "JWT" };
  const signingInput = `${encodeSegment(header)}.${encodeSegment(payload)}`;
  const signature = await hmacSign(alg, secret, signingInput);
  return `${signingInput}.${signature}`;
}

console.log("── cracker worker ──\n");

// 1. Recovers a secret that is early in the dictionary.
{
  const token = await mintToken("secret", "HS256");
  const started = Date.now();
  const { terminal, all } = await runCrack(token, "HS256");
  check("cracks 'secret' (HS256)", terminal?.type === "cracked", JSON.stringify(terminal));
  check("reports the recovered secret", terminal?.secret === "secret", terminal?.secret);
  check("reports its position", typeof terminal?.index === "number" && terminal.index < 100, `index ${terminal?.index}`);
  check("early hit returns fast", Date.now() - started < 5000, `${Date.now() - started} ms`);
  console.log(`        hit at candidate #${(terminal?.index ?? 0) + 1} in ${Date.now() - started} ms`);
}

// 2. Recovers a mutated secret.
{
  const token = await mintToken("jwt_secret_2024", "HS256");
  const { terminal } = await runCrack(token, "HS256");
  check("cracks mutated 'jwt_secret_2024'", terminal?.type === "cracked" && terminal?.secret === "jwt_secret_2024", JSON.stringify(terminal));
}

// 3. Recovers an HS384 secret.
{
  const token = await mintToken("supersecret", "HS384");
  const { terminal } = await runCrack(token, "HS384");
  check("cracks HS384 token", terminal?.type === "cracked" && terminal?.secret === "supersecret", JSON.stringify(terminal));
}

// 4. Recovers an HS512 secret.
{
  const token = await mintToken("password123", "HS512");
  const { terminal } = await runCrack(token, "HS512");
  check("cracks HS512 token", terminal?.type === "cracked" && terminal?.secret === "password123", JSON.stringify(terminal));
}

// 5. Exhausts the dictionary on a strong secret.
{
  const token = await mintToken("k7#Qm2!vXp9@LzR4$WtYb8&NfH3%DvC6", "HS256");
  const started = Date.now();
  const { terminal, all } = await runCrack(token, "HS256");
  check("reports exhaustion on a strong secret", terminal?.type === "exhausted", JSON.stringify(terminal));
  check("exhausted message reports total", terminal?.total > 10000, `${terminal?.total}`);
  check("sweeps every candidate", all.some(m => m.type === "progress" && m.percent === 100), "reached 100%");
  check("emits multiple progress updates", all.filter(m => m.type === "progress").length > 3, `${all.filter(m => m.type === "progress").length} msgs`);
  const percents = all.filter(m => m.type === "progress").map(m => m.percent);
  check("progress is monotonic", percents.every((p, i) => i === 0 || p >= percents[i - 1]), percents.join(","));
  check("progress starts below 100%", percents[0] < 100, `${percents[0]}%`);
  console.log(`        swept ${terminal?.total?.toLocaleString()} candidates in ${Date.now() - started} ms`);
}

// 6. Rejects malformed input instead of throwing.
{
  const { terminal } = await runCrack("not-a-jwt", "HS256");
  check("rejects a malformed token", terminal?.type === "error", JSON.stringify(terminal));
}
{
  const { terminal } = await runCrack(await mintToken("secret", "HS256"), "RS256");
  check("refuses asymmetric alg", terminal?.type === "error" && /not an HMAC/.test(terminal.error), JSON.stringify(terminal));
}
{
  const { terminal } = await runCrack(await mintToken("secret", "HS256"), "none");
  check("refuses alg none", terminal?.type === "error", JSON.stringify(terminal));
}

// 7. The count message works.
{
  sent.length = 0;
  self.onmessage({ data: { type: "count" } });
  await new Promise(r => setTimeout(r, 20));
  check("count message returns dictionary size", sent[0]?.type === "count" && sent[0].total > 10000, JSON.stringify(sent[0]));
}

console.log(failures === 0 ? "\nAll worker assertions passed." : `\n${failures} worker assertion(s) FAILED.`);
process.exit(failures === 0 ? 0 : 1);