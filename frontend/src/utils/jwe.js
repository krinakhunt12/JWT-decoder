// RFC 7516 JWE (JSON Web Encryption) Cryptographic Engine
// Supports 5-part compact tokens: header.encrypted_key.iv.ciphertext.tag

import { base64UrlToBytes, base64UrlFromBytes } from "./jwt";

const encoder = new TextEncoder();
const decoder = new TextDecoder("utf-8", { fatal: false });

export const JWE_KEY_ALGORITHMS = {
  "dir": { name: "Direct Encryption", type: "symmetric", desc: "Shared symmetric key is used directly as Content Encryption Key (CEK)" },
  "A128KW": { name: "AES-128 Key Wrap", type: "symmetric", desc: "128-bit key wrap of random CEK (RFC 3394)" },
  "A192KW": { name: "AES-192 Key Wrap", type: "symmetric", desc: "192-bit key wrap of random CEK (RFC 3394)" },
  "A256KW": { name: "AES-256 Key Wrap", type: "symmetric", desc: "256-bit key wrap of random CEK (RFC 3394)" },
  "RSA1_5": { name: "RSAES-PKCS1-v1_5", type: "asymmetric", desc: "Legacy RSA v1.5 key encryption (RFC 3447) - Not recommended" },
  "RSA-OAEP": { name: "RSA-OAEP (SHA-1)", type: "asymmetric", desc: "Optimal Asymmetric Encryption Padding with SHA-1 MGF1" },
  "RSA-OAEP-256": { name: "RSA-OAEP (SHA-256)", type: "asymmetric", desc: "Optimal Asymmetric Encryption Padding with SHA-256 MGF1 (Modern standard)" },
  "ECDH-ES": { name: "ECDH Ephemeral Static", type: "asymmetric", desc: "Elliptic Curve Diffie-Hellman key agreement" },
};

export const JWE_ENC_ALGORITHMS = {
  "A128GCM": { name: "AES-128 GCM", keyBits: 128, authTagBits: 128, desc: "Authenticated Encryption with Associated Data (AEAD) using Galois/Counter Mode" },
  "A192GCM": { name: "AES-192 GCM", keyBits: 192, authTagBits: 128, desc: "AEAD using 192-bit AES in Galois/Counter Mode" },
  "A256GCM": { name: "AES-256 GCM", keyBits: 256, authTagBits: 128, desc: "AEAD using 256-bit AES in Galois/Counter Mode (Military grade)" },
  "A128CBC-HS256": { name: "AES-128 CBC + HMAC-SHA-256", keyBits: 256, desc: "Composite AEAD algorithm (128-bit AES-CBC encryption + 128-bit HMAC)" },
  "A192CBC-HS384": { name: "AES-192 CBC + HMAC-SHA-384", keyBits: 384, desc: "Composite AEAD algorithm (192-bit AES-CBC encryption + 192-bit HMAC)" },
  "A256CBC-HS512": { name: "AES-256 CBC + HMAC-SHA-512", keyBits: 512, desc: "Composite AEAD algorithm (256-bit AES-CBC encryption + 256-bit HMAC)" },
};

// Ready-to-test Sample 1: Direct AES-256 GCM JWE
export const SAMPLE_JWE_DIRECT = {
  name: "Banking Treasury JWE (AES-256-GCM)",
  token: "eyJhbGciOiJkaXIiLCJlbmMiOiJBMjU2R0NNIn0..Yr46fpgeokOaf3e1.d7RxYcxrk8bWXL4lya7_kp7MKSWLUQvX2wza070vzQrkbmswV-J-y2gLytad2QPoZDJ0TBSMWZgbHaJpKOO4VDnQv94omfDXxrjP6XwLGrvX06StgXnkFqcjamKMAPzaP2BiVWM4hnxPzM9RbVv_C0cmy6iJavpwNOCV8wFeNgwEDLmJ7hYzL91JsWgC2Y1K4ScyYQDtetNSvZnKes-MlEaSNtV9nLwdmHQG2n7eE-cnBD8qwriSKinWpqrdjJ_kwseVIWVNtPKi8mI.0y5rwvQbHQa5MWhxxxMvbA",
  key: "0123456789abcdef0123456789abcdef",
  keyType: "AES 256-bit Shared Secret (32 chars / UTF-8)",
  alg: "dir",
  enc: "A256GCM",
};

// Ready-to-test Sample 2: RSA-OAEP-256 HIPAA Healthcare JWE
export const SAMPLE_JWE_RSA = {
  name: "HIPAA Patient Clearance JWE (RSA-OAEP-256)",
  token: "eyJhbGciOiJSU0EtT0FFUC0yNTYiLCJlbmMiOiJBMjU2R0NNIn0.dr4Jx2zO0q4BnigeXQirHqGqvD6-L3Up3bpDokrv_JmH8UefIbXcOL_UDQKRnadNDOJ2g6GDYjlZH2w6TJCC6AHjYpaV8JTm8kVvbSzDk5CBsHbDg1npDq4Uom0S7fVO9eikhrscPcQlnQ6f4C4wAcDGAnqpTeSkka8uqvTKoavUF85R23ptFpVMAeI4lB3svdESJeuXbvM4vLUKy-g8O5PweSU3EVuaKvcoqFaiVJoIq0D63f59ThtKW8TMxvKc3aauT_wlpOOxX-gQr2EBRH2N89EItRr-s_pmNQoZ3OBwDGRgGZx246l8N12NHdTn9oIuByDlGm01QGzL3FUcNQ.lQ_Hs-VeoQgQbAWR._Jp5rNQwuIWJxEYce4GooWP7H6Otcc8dHwzqYBaqSIiXntz7B9Vst-FFpMhfXBQlZ2vDN9miNxslAaBlumm5OSirl-88buENnM4ak5esBSWHwrQYPCUytsRHWjLdgI2CRoKdiJdH7SlwM1IZFlZ-Kt17n5NQkyk0KFKEMEAPwjAeUq75DLGhm7fLVBmV5yCp9o0cOo08VioEbtW-GNQ_N96VrAFSUiWOlHWcuQPng3uqoI9R2KpaLG2dzhw4I3lniOMxe0x5oSpLAThaGFGgB6I4BTo4PU4BDJoSguPV0UaaDHJKpZ4OZx1Cn0TeQcIMWJsJ-si1_hx2xDdOGHoB0F_l5SScdzKnJqd78Rt9ScxDsQ8U_qm48IZaMJgRrEIV3Xar4xPLQcDRElbK.l06UXTKMwwL5wYMye9K8Zw",
  key: `-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQD4u0gYsN/r5hJd
LQVEEgpwo3kuoBgOBj0CW09vCVXgpHykZ/9XjH66iunY74YCmq1zn4nxsF0Lmgum
kx7mhDa2fblp4s3QLT4Uood3gvTX6lP+0d39IrDXRwuQPO7hoSBkdu65LmStVx9w
2jfcwntFVtkO6agIiieRQM1WDGFHAFky4m9Zsn6QPHoENIgGakrK3wQ9IeRkUUbV
dY8Lx/AH/Xn/MjghGBTJoxUK52CfIQp9cMAueviZfgf04nndfRTWhS0Pi2s2uzWW
U0TnTJGdE6Ae1ni8WX+TX8vw4HjjKoKYUBA6TIIiG6pqnVy9e+YyZAIQ6rA6dSB/
MRNpx8j9AgMBAAECggEADsAYffJbTSOHOkRVuBwzx0tCf/vZgVdoXc/pbYXJtHk8
tQk/0MLRryFWzdkigtwGZkFzTkRtuCbqAvZdkkEL95WMHdXn660LLfEXhIRdHcLV
OVrbxcu9Xf7mFicu6W2DPMH61TuFl+v/PtOKFYrpAYstcx9zKhJ7VzdXFf/E8w9Z
zNuFfrrC1YZsqXmOhCWhAnZtvDEu3ynmXf2kxwCdEqzIooT+NHZGh/xPJXdNBB91
hVGbAerXTAgxK+Wf0woohk7cf8FV/8IM9MTSKxO7aperdm/OXmoOdDvl/okVnmIY
0d830pDuFwFw/0YD3fDhVgTmS8rU6tv0XrgTsNxn8QKBgQD9vFp6Yetw/TZTzoHV
N4jL+/T87sZLCPtlCr8kJh1L64s6m9py5aXn5wm5DANaXuNJ612I9HimJMWSsiDf
ipJl9N+lHDDPdzTZSiYHqaoqMYk8wcUy2y/Yh6VJ4AbriE4+UyTbZLlFtMSgEuvU
V0HJmK9hdtIRajJF50cF6nSl2QKBgQD6838TBUOKkyvyHS4rqhVbXVwqowmvy5dj
AEvbU3HKhtWOxfC8ilu/U+eBGED3gFVbWDNneWKTWGXHbTB6kHCGV1yxTwWFk7f6
j0/bh+AXPHBEdsWJUJ43aV8APgfhgTcFVZnBNyS6/6p/DF8WpXpZRb1u27F9E3S8
DTsC/s7RxQKBgQCfbC3JAScmCeKNi42lwsvPppIKLZgnYxBZLwRjmRMFNYx4GZ6K
XGH+L/q66qJcsIvMUPam6zu24BnHDuZ6rZ1INDAklG7Sm4p4EA+O9vo0ooUgyHq3
dmI8gRXIMdsHN9A5dpIMyt9hva9hCCJmeyCZorZm3XolePz3UNYeEG6UGQKBgHvi
cuwP4CzrxHkMoLtbhpmI+DPwMpr/NafhAJGwmu8xKwIFg3eAEhTctd+L+p50Uy75
1r6RNPGqZOxTYehPn80iGZdKfF5Z8ywVTYYBiMXPx1h1DcVg8ApI0WZMORXA9UmD
3Zh9wXszNZbso5CJdmHVxNOSTweA8FLZcTVkVvNFAoGANLq8oG+X4gHznuBNbM26
5clfejFWWC645PYsEsDvBLTGpIJOEwwRq+iQyzsrcvjOxePPg+XCCnSpbz2k0hjB
8DeOo6Jhr6xwk2ghdTa4fQyx2tmeVG/MH6t+FLtiqy/Npmf2sRJO8FeD2jUOz7Tj
xqhsRLmJ24a8o+s4+Rx+6aQ=
-----END PRIVATE KEY-----`,
  keyType: "RSA 2048-bit Private Key (PKCS#8 PEM)",
  alg: "RSA-OAEP-256",
  enc: "A256GCM",
};

/**
 * Checks if a token string adheres to the 5-part JWE compact format.
 */
export function isJweToken(token) {
  if (typeof token !== "string") return false;
  const parts = token.trim().split(".");
  return parts.length === 5;
}

/**
 * Splits a JWE compact token into its 5 distinct cryptographic parts.
 */
export function splitJwe(token) {
  if (!isJweToken(token)) return null;
  const parts = token.trim().split(".");
  return {
    header: parts[0],
    encryptedKey: parts[1],
    iv: parts[2],
    ciphertext: parts[3],
    tag: parts[4],
  };
}

/**
 * Decodes the protected header of a JWE token.
 */
export function decodeJweHeader(token) {
  const parts = splitJwe(token);
  if (!parts) return null;
  try {
    const rawHeader = decoder.decode(base64UrlToBytes(parts.header));
    const header = JSON.parse(rawHeader);
    const algMeta = JWE_KEY_ALGORITHMS[header.alg] || { name: header.alg || "Unknown", desc: "Custom or non-standard algorithm" };
    const encMeta = JWE_ENC_ALGORITHMS[header.enc] || { name: header.enc || "Unknown", desc: "Custom content encryption" };

    return {
      header,
      rawHeader,
      alg: header.alg,
      enc: header.enc,
      zip: header.zip,
      kid: header.kid,
      algMeta,
      encMeta,
      lengths: {
        header: parts.header.length,
        encryptedKey: parts.encryptedKey.length,
        iv: parts.iv.length,
        ciphertext: parts.ciphertext.length,
        tag: parts.tag.length,
      },
    };
  } catch (err) {
    return null;
  }
}

/**
 * Client-side Decryption using browser WebCrypto SubtleCrypto.
 * Supports:
 * - 'dir' with A256GCM / A128GCM (Direct Key AES-GCM)
 * - RSA-OAEP / RSA-OAEP-256 with A256GCM
 */
export async function decryptJweInBrowser(token, keyText) {
  const parts = splitJwe(token);
  if (!parts) {
    throw new Error("Invalid JWE: Token must contain exactly 5 dot-separated parts.");
  }

  const headerInfo = decodeJweHeader(token);
  if (!headerInfo) {
    throw new Error("Could not parse JWE protected header.");
  }

  const { alg, enc } = headerInfo;
  const ivBytes = base64UrlToBytes(parts.iv);
  const cipherBytes = base64UrlToBytes(parts.ciphertext);
  const tagBytes = base64UrlToBytes(parts.tag);
  const aadBytes = encoder.encode(parts.header);

  // In WebCrypto AES-GCM, the authentication tag must be appended to the ciphertext
  const combinedCiphertext = new Uint8Array(cipherBytes.length + tagBytes.length);
  combinedCiphertext.set(cipherBytes, 0);
  combinedCiphertext.set(tagBytes, cipherBytes.length);

  // Case 1: Direct key (dir) + AES-GCM
  if (alg === "dir") {
    let keyBytes;
    const cleanKey = keyText.trim();

    if (cleanKey.length === 32) {
      keyBytes = encoder.encode(cleanKey);
    } else if (cleanKey.length === 64 && /^[0-9a-fA-F]+$/.test(cleanKey)) {
      // Hex representation
      keyBytes = new Uint8Array(32);
      for (let i = 0; i < 32; i++) {
        keyBytes[i] = parseInt(cleanKey.substr(i * 2, 2), 16);
      }
    } else {
      // Pad or truncate to 32 bytes
      keyBytes = encoder.encode(cleanKey);
      if (keyBytes.length !== 32 && keyBytes.length !== 16) {
        throw new Error(`Key must be 32 bytes (256 bits) for ${enc}. Current length: ${cleanKey.length} chars.`);
      }
    }

    const cryptoKey = await crypto.subtle.importKey(
      "raw",
      keyBytes,
      { name: "AES-GCM" },
      false,
      ["decrypt"]
    );

    const decryptedBuffer = await crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv: ivBytes,
        additionalData: aadBytes,
        tagLength: 128,
      },
      cryptoKey,
      combinedCiphertext
    );

    const decryptedText = decoder.decode(decryptedBuffer);
    try {
      return { payload: JSON.parse(decryptedText), isJson: true, raw: decryptedText };
    } catch {
      return { payload: { text: decryptedText }, isJson: false, raw: decryptedText };
    }
  }

  // Case 2: RSA-OAEP / RSA-OAEP-256
  if (alg === "RSA-OAEP" || alg === "RSA-OAEP-256") {
    const pem = keyText.trim();
    if (!pem.includes("PRIVATE KEY")) {
      throw new Error(`Algorithm '${alg}' requires an RSA Private Key in PEM format (-----BEGIN PRIVATE KEY-----).`);
    }

    // Strip PEM headers
    const pemContents = pem
      .replace(/-----BEGIN[A-Z0-9_\s]+-----/g, "")
      .replace(/-----END[A-Z0-9_\s]+-----/g, "")
      .replace(/\s+/g, "");

    const binaryDer = atob(pemContents);
    const derBytes = new Uint8Array(binaryDer.length);
    for (let i = 0; i < binaryDer.length; i++) {
      derBytes[i] = binaryDer.charCodeAt(i);
    }

    const hashName = alg === "RSA-OAEP-256" ? "SHA-256" : "SHA-1";

    const rsaKey = await crypto.subtle.importKey(
      "pkcs8",
      derBytes,
      {
        name: "RSA-OAEP",
        hash: hashName,
      },
      false,
      ["decrypt"]
    );

    // 1. Decrypt Encrypted CEK
    const encKeyBytes = base64UrlToBytes(parts.encryptedKey);
    const cekBuffer = await crypto.subtle.decrypt(
      { name: "RSA-OAEP" },
      rsaKey,
      encKeyBytes
    );

    // 2. Import Content Encryption Key
    const contentKey = await crypto.subtle.importKey(
      "raw",
      cekBuffer,
      { name: "AES-GCM" },
      false,
      ["decrypt"]
    );

    // 3. Decrypt Ciphertext + Tag
    const decryptedBuffer = await crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv: ivBytes,
        additionalData: aadBytes,
        tagLength: 128,
      },
      contentKey,
      combinedCiphertext
    );

    const decryptedText = decoder.decode(decryptedBuffer);
    try {
      return { payload: JSON.parse(decryptedText), isJson: true, raw: decryptedText };
    } catch {
      return { payload: { text: decryptedText }, isJson: false, raw: decryptedText };
    }
  }

  throw new Error(`Browser client decryption for '${alg}' is not supported directly. Please use backend decryption.`);
}
