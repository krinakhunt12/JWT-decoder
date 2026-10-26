import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { isAsymmetric, SUPPORTED_ALGORITHMS } from "../constants/algorithms";
import {
  isJweToken,
  decodeJweHeader,
  decryptJweInBrowser,
  SAMPLE_JWE_DIRECT,
  SAMPLE_JWE_RSA,
} from "../utils/jwe";
import { decodeToken } from "../utils/jwt";

const API = "http://localhost:8000";

export const SAMPLE_JWT =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c3JfOTI4MzciLCJuYW1lIjoiS3JpbmEiLCJyb2xlIjoic2VuaW9yX2RldmVsb3BlciIsInRlbmFudCI6ImNvZGVzbWl0aHMiLCJzY29wZXMiOlsicHJvZmlsZTpyZWFkIiwiY29kZTp3cml0ZSIsImFwaXM6bWFuYWdlIl0sImlhdCI6MTcxNjQ3MzYwMCwiZXhwIjoyMDQ3NDEyODAwfQ.P_aH_P7Uv9a2jXQnUq9f4Y5X_7N4v5Z6u7t8e9r0A1B";

const JwtContext = createContext(null);

export function JwtProvider({ children }) {
  // Toast notifications
  const [toasts, setToasts] = useState([]);
  const addToast = useCallback((message, type = "info") => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  }, []);
  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Decoder states
  const [token, setToken] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);

  // JWE (JSON Web Encryption — RFC 7516) states
  const [jweKey, setJweKey] = useState("");
  const [decryptedJweData, setDecryptedJweData] = useState(null);
  const [decryptingJwe, setDecryptingJwe] = useState(false);
  const [decryptJweError, setDecryptJweError] = useState("");

  // History
  const [history, setHistory] = useState(() => {
    try {
      const s = localStorage.getItem("jwt_history");
      return s ? JSON.parse(s) : [];
    } catch {
      return [];
    }
  });

  const saveToHistory = useCallback((tok, header, payload) => {
    if (!tok) return;
    setHistory((prev) => {
      const filtered = prev.filter((item) => item.token !== tok);
      const sub = payload?.sub || payload?.name || payload?.role || "Decoded Payload";
      const alg = header?.alg || "HS256";
      const newItem = {
        id: Math.random().toString(36).substring(2, 9),
        token: tok,
        sub,
        alg,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      const updated = [newItem, ...filtered].slice(0, 10);
      localStorage.setItem("jwt_history", JSON.stringify(updated));
      return updated;
    });
  }, []);

  const removeHistoryItem = useCallback(
    (id) => {
      setHistory((prev) => {
        const u = prev.filter((i) => i.id !== id);
        localStorage.setItem("jwt_history", JSON.stringify(u));
        return u;
      });
      addToast("Removed from history", "info");
    },
    [addToast]
  );

  const clearHistory = useCallback(() => {
    setHistory([]);
    localStorage.removeItem("jwt_history");
    addToast("History cleared", "info");
  }, [addToast]);

  // Verification states
  const [verifySecret, setVerifySecret] = useState("my-secret-key");
  const [verifyPublicKey, setVerifyPublicKey] = useState("");
  const [verifyAlgorithm, setVerifyAlgorithm] = useState("HS256");
  const [verifyResult, setVerifyResult] = useState(null);
  const [verifying, setVerifying] = useState(false);
  const [showSecret, setShowSecret] = useState(false);
  const [showPublicKey, setShowPublicKey] = useState(false);

  // JWKS remote resolution states
  const [jwksUrl, setJwksUrl] = useState("");
  const [jwksResult, setJwksResult] = useState(null);
  const [resolving, setResolving] = useState(false);

  // Live Token Generator states
  const [genHeaderAlg, setGenHeaderAlg] = useState("HS256");
  const [genPayloadStr, setGenPayloadStr] = useState(
    JSON.stringify(
      {
        sub: "usr_92837",
        name: "Krina",
        role: "senior_developer",
        tenant: "codesmiths",
        scopes: ["profile:read", "code:write", "apis:manage"],
      },
      null,
      2
    )
  );
  const [genSecret, setGenSecret] = useState("my-secret-key");
  const [genExpiresIn, setGenExpiresIn] = useState("3600");
  const [generatedToken, setGeneratedToken] = useState("");
  const [genResult, setGenResult] = useState(null);
  const [genError, setGenError] = useState("");
  const [showGenSecret, setShowGenSecret] = useState(false);

  // Decode operation (supporting both RFC 7519 JWS and RFC 7516 JWE)
  const decode = useCallback(
    async (t = token) => {
      const tk = (t || "").trim();
      if (!tk) return;
      setLoading(true);
      setError("");
      setResult(null);
      setVerifyResult(null);
      setJwksResult(null);
      setDecryptedJweData(null);
      setDecryptJweError("");

      const parts = tk.split(".");

      // ─── 1. RFC 7516 JWE (5-part Encrypted Token) Handling ───
      if (parts.length === 5) {
        const headerInfo = decodeJweHeader(tk);
        if (headerInfo) {
          // Pre-populate matching sample key if user loaded a demo token
          if (tk === SAMPLE_JWE_DIRECT.token) {
            setJweKey(SAMPLE_JWE_DIRECT.key);
          } else if (tk === SAMPLE_JWE_RSA.token) {
            setJweKey(SAMPLE_JWE_RSA.key);
          }

          const jweData = {
            is_jwe: true,
            token_type: "JWE",
            header: headerInfo.header,
            payload: {
              _jwe_status: "Encrypted",
              _standard: "RFC 7516 JSON Web Encryption",
              alg: headerInfo.alg,
              enc: headerInfo.enc,
              zip: headerInfo.zip,
              message: `Ciphertext payload is encrypted with ${headerInfo.enc || "AEAD"}. Enter decryption key below to inspect decrypted claims.`,
            },
            signature: parts[4], // Authentication Tag
            algorithm: headerInfo.alg,
            encryption: headerInfo.enc,
            key_id: headerInfo.kid,
            time_fields: {},
            raw_parts: {
              header: parts[0],
              encrypted_key: parts[1],
              iv: parts[2],
              ciphertext: parts[3],
              tag: parts[4],
            },
            jwe_meta: {
              alg: headerInfo.alg,
              enc: headerInfo.enc,
              zip: headerInfo.zip,
              kid: headerInfo.kid,
              algMeta: headerInfo.algMeta,
              encMeta: headerInfo.encMeta,
              lengths: headerInfo.lengths,
            },
          };

          setResult(jweData);
          addToast("RFC 7516 JWE (Encrypted Token) detected ✓", "info");
          saveToHistory(tk, headerInfo.header, { sub: `JWE [${headerInfo.alg} · ${headerInfo.enc}]` });
          setLoading(false);
          return;
        }
      }

      // ─── 2. RFC 7519 JWS (3-part Signed Token) Handling ───
      try {
        const res = await fetch(`${API}/decode`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: tk }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.detail || "Decode failed");
        setResult(data);
        addToast("JWT decoded successfully", "success");
        saveToHistory(tk, data.header, data.payload);
        if (data.header?.alg && SUPPORTED_ALGORITHMS.includes(data.header.alg)) {
          setVerifyAlgorithm(data.header.alg);
        }
      } catch (e) {
        // High-resilience client-side decode fallback
        const clientParsed = decodeToken(tk);
        if (clientParsed) {
          const clientData = {
            is_jwe: false,
            token_type: "JWS",
            header: clientParsed.header,
            payload: clientParsed.payload,
            signature: clientParsed.signature,
            time_fields: {},
            algorithm: clientParsed.header?.alg,
            algorithm_supported: SUPPORTED_ALGORITHMS.includes(clientParsed.header?.alg),
            key_id: clientParsed.header?.kid,
            raw_parts: {
              header: clientParsed.header,
              payload: clientParsed.payload,
              signature: clientParsed.signature,
            },
          };
          setResult(clientData);
          addToast("JWT decoded client-side ✓", "success");
          saveToHistory(tk, clientParsed.header, clientParsed.payload);
          if (clientParsed.header?.alg && SUPPORTED_ALGORITHMS.includes(clientParsed.header.alg)) {
            setVerifyAlgorithm(clientParsed.header.alg);
          }
        } else {
          setError(e.message);
          addToast(`Decode error: ${e.message}`, "error");
        }
      } finally {
        setLoading(false);
      }
    },
    [token, addToast, saveToHistory]
  );

  // ─── JWE Decryption Action (Client-side WebCrypto with backend fallback) ───
  const decryptJwe = useCallback(
    async (customKey = jweKey) => {
      const k = (customKey || "").trim();
      const tk = token.trim();
      if (!tk || !k) {
        setDecryptJweError("Please provide a decryption key (AES secret or RSA Private Key).");
        return;
      }

      setDecryptingJwe(true);
      setDecryptJweError("");

      // Attempt 1: In-browser WebCrypto decryption (100% private, zero server persistence)
      try {
        const clientDecrypted = await decryptJweInBrowser(tk, k);
        setDecryptedJweData(clientDecrypted);
        addToast("JWE decrypted & authenticated via WebCrypto ✓", "success");

        // Merge decrypted payload so bi-temporal lifecycle monitor and claim trees activate
        if (clientDecrypted.payload && typeof clientDecrypted.payload === "object") {
          setResult((prev) => (prev ? { ...prev, payload: clientDecrypted.payload } : prev));
        }
        setDecryptingJwe(false);
        return;
      } catch (browserErr) {
        console.warn("Client WebCrypto decryption notice, testing backend engine:", browserErr.message);
      }

      // Attempt 2: Backend python-jose decryption fallback
      try {
        const res = await fetch(`${API}/decrypt-jwe`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: tk, key: k }),
        });
        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.error || data.detail || "Decryption failed");
        }
        setDecryptedJweData({ payload: data.payload, raw: data.raw_decrypted, isJson: data.is_json });
        addToast("JWE decrypted & authenticated via cryptographic engine ✓", "success");
        if (data.payload && typeof data.payload === "object") {
          setResult((prev) => (prev ? { ...prev, payload: data.payload, time_fields: data.time_fields || {} } : prev));
        }
      } catch (backendErr) {
        setDecryptJweError(backendErr.message);
        addToast(`Decryption failed: ${backendErr.message}`, "error");
      } finally {
        setDecryptingJwe(false);
      }
    },
    [token, jweKey, addToast]
  );

  const loadSampleJwe = useCallback(
    (type = "direct") => {
      const sample = type === "rsa" ? SAMPLE_JWE_RSA : SAMPLE_JWE_DIRECT;
      setToken(sample.token);
      setJweKey(sample.key);
      decode(sample.token);
      addToast(`Loaded ${sample.name} ✨`, "success");
    },
    [decode, addToast]
  );

  const loadSampleKeyForCurrentJwe = useCallback(() => {
    const tk = token.trim();
    if (tk === SAMPLE_JWE_DIRECT.token) {
      setJweKey(SAMPLE_JWE_DIRECT.key);
      addToast("Loaded matching AES-256 demo key ✓", "info");
    } else if (tk === SAMPLE_JWE_RSA.token) {
      setJweKey(SAMPLE_JWE_RSA.key);
      addToast("Loaded matching RSA Private Key PEM ✓", "info");
    } else {
      setJweKey(SAMPLE_JWE_DIRECT.key);
      addToast("Loaded demo key format", "info");
    }
  }, [token, addToast]);

  const loadHistoryItem = useCallback(
    (tok) => {
      setToken(tok);
      decode(tok);
      addToast("Loaded from history", "info");
    },
    [decode, addToast]
  );

  // Auto-verify signature for standard JWS tokens
  useEffect(() => {
    if (result?.is_jwe) return; // JWE does not use JWS signature verification

    const needsPublicKey = isAsymmetric(verifyAlgorithm);
    const keyMissing = needsPublicKey ? !verifyPublicKey.trim() : !verifySecret;
    if (!result || !token || keyMissing) {
      setVerifyResult(null);
      return;
    }
    let mounted = true;
    const verify = async () => {
      setVerifying(true);
      try {
        const res = await fetch(`${API}/verify`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            token: token.trim(),
            secret: needsPublicKey ? "" : verifySecret,
            algorithm: verifyAlgorithm,
            public_key: needsPublicKey ? verifyPublicKey : null,
          }),
        });
        const data = await res.json();
        if (mounted) {
          if (data.overall_valid && (!verifyResult || !verifyResult.overall_valid)) {
            addToast("Signature verified ✓", "success");
          }
          setVerifyResult(data);
        }
      } catch (e) {
        console.error("Verify error", e);
      } finally {
        if (mounted) setVerifying(false);
      }
    };
    const t = setTimeout(verify, 200);
    return () => {
      mounted = false;
      clearTimeout(t);
    };
  }, [token, result, verifySecret, verifyPublicKey, verifyAlgorithm, addToast]);

  // JWKS resolver
  const resolveJwks = useCallback(async () => {
    const tk = token.trim();
    if (!tk) return;
    setResolving(true);
    try {
      const res = await fetch(`${API}/verify-jwks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: tk, jwks_url: jwksUrl.trim() || null }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "JWKS resolution failed");
      setJwksResult(data);
      addToast(
        data.overall_valid
          ? `Signature verified via ${data.jwks_provider} ✓`
          : `JWKS resolution: ${data.message}`,
        data.overall_valid ? "success" : "warning"
      );
    } catch (e) {
      addToast(`JWKS error: ${e.message}`, "error");
    } finally {
      setResolving(false);
    }
  }, [token, jwksUrl, addToast]);

  const useMatchedKey = useCallback(
    (pem) => {
      if (!pem) return;
      setVerifyPublicKey(pem);
      if (jwksResult?.algorithm) {
        setVerifyAlgorithm(jwksResult.algorithm);
      }
      addToast("Public key imported from JWKS into verification panel ✓", "success");
    },
    [jwksResult, addToast]
  );

  const clearJwks = useCallback(() => {
    setJwksUrl("");
    setJwksResult(null);
  }, []);

  // Live Token Generator effect
  useEffect(() => {
    let mounted = true;
    const generate = async () => {
      setGenError("");
      try {
        let parsed;
        try {
          parsed = JSON.parse(genPayloadStr);
        } catch {
          if (mounted) setGenError("Invalid JSON in payload");
          return;
        }

        const res = await fetch(`${API}/sign`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            header: { alg: genHeaderAlg, typ: "JWT" },
            payload: parsed,
            secret: genSecret,
            algorithm: genHeaderAlg,
            expires_in: genExpiresIn ? parseInt(genExpiresIn) : null,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.detail || "Sign failed");
        if (mounted) {
          setGeneratedToken(data.token);
          setGenResult(data);
        }
      } catch (e) {
        if (mounted) setGenError(e.message);
      }
    };
    const t = setTimeout(generate, 300);
    return () => {
      mounted = false;
      clearTimeout(t);
    };
  }, [genPayloadStr, genHeaderAlg, genSecret, genExpiresIn]);

  // PDF report export
  const exportPDF = async () => {
    if (!result) return;
    setExporting(true);
    try {
      const res = await fetch(`${API}/export-pdf`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: token.trim(),
          header: result.header,
          payload: result.payload,
          signature: result.signature,
        }),
      });
      if (!res.ok) throw new Error("PDF export failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `jwt-report-${result.payload.sub || "decoded"}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      addToast("PDF exported successfully", "success");
    } catch (e) {
      setError(e.message);
      addToast(`PDF error: ${e.message}`, "error");
    } finally {
      setExporting(false);
    }
  };

  const loadSample = useCallback(() => {
    setToken(SAMPLE_JWT);
    decode(SAMPLE_JWT);
  }, [decode]);

  const clear = useCallback(() => {
    setToken("");
    setResult(null);
    setError("");
    setVerifyResult(null);
    setJweKey("");
    setDecryptedJweData(null);
    setDecryptJweError("");
    clearJwks();
    addToast("Cleared", "info");
  }, [clearJwks, addToast]);

  const openInDecoder = useCallback(
    (tok, navigate) => {
      setToken(tok);
      if (navigate) navigate("/decode");
      decode(tok);
      addToast("Token loaded in decoder", "info");
    },
    [decode, addToast]
  );

  // Complete reset of all states
  const resetAllStates = useCallback(() => {
    setToken("");
    setResult(null);
    setError("");
    setLoading(false);
    setExporting(false);
    setVerifySecret("my-secret-key");
    setVerifyPublicKey("");
    setVerifyAlgorithm("HS256");
    setVerifyResult(null);
    setVerifying(false);
    setShowSecret(false);
    setShowPublicKey(false);
    setJwksUrl("");
    setJwksResult(null);
    setResolving(false);
    setGeneratedToken("");
    setGenResult(null);
    setGenError("");
    setJweKey("");
    setDecryptedJweData(null);
    setDecryptingJwe(false);
    setDecryptJweError("");
    addToast("All application states successfully reset", "info");
  }, [addToast]);

  const value = {
    toasts,
    addToast,
    removeToast,
    token,
    setToken,
    result,
    setResult,
    error,
    loading,
    exporting,
    history,
    loadHistoryItem,
    clearHistory,
    removeHistoryItem,
    verifyAlgorithm,
    setVerifyAlgorithm,
    verifySecret,
    setVerifySecret,
    verifyPublicKey,
    setVerifyPublicKey,
    verifyResult,
    verifying,
    showSecret,
    setShowSecret,
    showPublicKey,
    setShowPublicKey,
    jwksUrl,
    setJwksUrl,
    jwksResult,
    resolving,
    resolveJwks,
    useMatchedKey,
    clearJwks,
    genHeaderAlg,
    setGenHeaderAlg,
    genPayloadStr,
    setGenPayloadStr,
    genSecret,
    setGenSecret,
    genExpiresIn,
    setGenExpiresIn,
    generatedToken,
    genResult,
    genError,
    showGenSecret,
    setShowGenSecret,
    decode,
    loadSample,
    clear,
    openInDecoder,
    exportPDF,
    resetAllStates,
    // JWE additions
    jweKey,
    setJweKey,
    decryptedJweData,
    decryptingJwe,
    decryptJweError,
    decryptJwe,
    loadSampleJwe,
    loadSampleKeyForCurrentJwe,
  };

  return <JwtContext.Provider value={value}>{children}</JwtContext.Provider>;
}

export function useJwtContext() {
  const context = useContext(JwtContext);
  if (!context) {
    throw new Error("useJwtContext must be used within a JwtProvider");
  }
  return context;
}
