// Weak-secret dictionary cracker. Runs off the main thread so the UI stays
// responsive, and reports progress so a long sweep is visible.
//
// It only ever sees a token that the user pasted into their own console.

import { HASH_BY_ALG, base64UrlFromBytes, constantTimeEqual, hmacKeyBytes, splitToken, webCryptoAvailable } from "../utils/jwt";
import { buildCandidateSecrets } from "../constants/weakSecrets";

const encoder = new TextEncoder();
const PROGRESS_INTERVAL = 250;
const YIELD_EVERY = 400;

// Yields to the worker's event loop so incoming messages (e.g. cancel) are handled.
function breathe() {
  return new Promise(resolve => setTimeout(resolve, 0));
}

async function importHmacKey(alg, secretBytes) {
  return crypto.subtle.importKey(
    "raw",
    secretBytes,
    { name: "HMAC", hash: HASH_BY_ALG[alg] },
    false,
    ["sign"],
  );
}

async function crack({ token, alg }) {
  const parts = splitToken(token);
  if (!parts) {
    return { type: "error", error: "Token must have 3 dot-separated parts." };
  }
  if (!HASH_BY_ALG[alg]) {
    return { type: "error", error: `${alg} is not an HMAC algorithm — there is no shared secret to guess.` };
  }
  if (!webCryptoAvailable()) {
    return {
      type: "error",
      error: "WebCrypto is unavailable. Serve this app over http://localhost or https — browsers block crypto.subtle on plain http origins.",
    };
  }

  const candidates = buildCandidateSecrets();
  const signingBytes = encoder.encode(parts.signingInput);
  const startedAt = performance.now();
  let lastReport = startedAt;
  let sinceYield = 0;

  for (let i = 0; i < candidates.length; i += 1) {
    const secret = candidates[i];
    const key = await importHmacKey(alg, hmacKeyBytes(alg, secret));
    const signature = await crypto.subtle.sign("HMAC", key, signingBytes);
    const base64url = base64UrlFromBytes(new Uint8Array(signature));

    if (constantTimeEqual(base64url, parts.signature)) {
      return {
        type: "cracked",
        secret,
        index: i,
        total: candidates.length,
        elapsedMs: Math.round(performance.now() - startedAt),
      };
    }

    sinceYield += 1;
    if (sinceYield >= YIELD_EVERY) {
      sinceYield = 0;
      await breathe();
    }

    const now = performance.now();
    if (now - lastReport >= PROGRESS_INTERVAL) {
      lastReport = now;
      self.postMessage({
        type: "progress",
        tested: i + 1,
        total: candidates.length,
        percent: Math.round(((i + 1) / candidates.length) * 100),
      });
    }
  }

  self.postMessage({ type: "progress", tested: candidates.length, total: candidates.length, percent: 100 });
  return {
    type: "exhausted",
    total: candidates.length,
    elapsedMs: Math.round(performance.now() - startedAt),
  };
}

self.onmessage = async event => {
  const { type, ...payload } = event.data || {};
  if (type === "crack") {
    try {
      self.postMessage(await crack(payload));
    } catch (error) {
      self.postMessage({ type: "error", error: error?.message || "Cracker failed." });
    }
  }
  if (type === "count") {
    self.postMessage({ type: "count", total: buildCandidateSecrets().length });
  }
};