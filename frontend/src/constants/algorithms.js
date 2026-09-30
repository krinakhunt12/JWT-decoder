// Signature algorithms supported by the backend (RFC 7518 §3).
// Mirrors ALGORITHM_METADATA in backend/main.py — keep both in sync.

export const ALGORITHM_GROUPS = [
  {
    family: "HMAC",
    label: "Symmetric · HMAC (shared secret)",
    keyField: "secret",
    algorithms: [
      { value: "HS256", label: "HS256 — HMAC-SHA256" },
      { value: "HS384", label: "HS384 — HMAC-SHA384" },
      { value: "HS512", label: "HS512 — HMAC-SHA512" },
    ],
  },
  {
    family: "RSA",
    label: "Asymmetric · RSA (public key)",
    keyField: "publicKey",
    algorithms: [
      { value: "RS256", label: "RS256 — RSA PKCS#1 v1.5 / SHA-256" },
      { value: "RS384", label: "RS384 — RSA PKCS#1 v1.5 / SHA-384" },
      { value: "RS512", label: "RS512 — RSA PKCS#1 v1.5 / SHA-512" },
    ],
  },
  {
    family: "ECDSA",
    label: "Asymmetric · ECDSA (public key)",
    keyField: "publicKey",
    algorithms: [
      { value: "ES256", label: "ES256 — ECDSA P-256 / SHA-256" },
      { value: "ES384", label: "ES384 — ECDSA P-384 / SHA-384" },
      { value: "ES512", label: "ES512 — ECDSA P-521 / SHA-512" },
    ],
  },
];

export const SUPPORTED_ALGORITHMS = ALGORITHM_GROUPS.flatMap(group =>
  group.algorithms.map(alg => alg.value)
);

export function getAlgorithm(alg) {
  for (const group of ALGORITHM_GROUPS) {
    const match = group.algorithms.find(item => item.value === alg);
    if (match) return { ...match, family: group.family, keyField: group.keyField };
  }
  return null;
}

export function isAsymmetric(alg) {
  const meta = getAlgorithm(alg);
  return Boolean(meta) && meta.family !== "HMAC";
}
