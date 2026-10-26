import { useState } from "react";
import ScrollReveal from "../ScrollReveal";

export default function CodeSnippetsSection() {
  const [activeLang, setActiveLang] = useState("python");
  const [copied, setCopied] = useState(false);

  const snippets = {
    python: {
      label: "Python (PyJWT)",
      filename: "verify_token.py",
      code: `import jwt

SECRET_KEY = "your-256-bit-secret"
ALGORITHM = "HS256"

def verify_jwt(token: str):
    try:
        # Timing-safe HMAC verification with pinned algorithm
        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM],  # Strictly pinned to prevent confusion
            options={"require": ["exp", "iat", "sub"]}
        )
        print("✓ Token Verified:", payload["sub"])
        return payload
    except jwt.ExpiredSignatureError:
        print("✗ Token has expired")
    except jwt.InvalidTokenError as e:
        print("✗ Invalid signature:", e)`,
    },
    javascript: {
      label: "TypeScript / Node.js (jose)",
      filename: "verify.ts",
      code: `import { jwtVerify } from 'jose';

const secret = new TextEncoder().encode('your-256-bit-secret');

async function verifyToken(token: string) {
  try {
    const { payload, protectedHeader } = await jwtVerify(token, secret, {
      algorithms: ['HS256'], // Explicit algorithm pinning
      clockTolerance: '5s'
    });
    console.log('✓ Token Verified for subject:', payload.sub);
    return payload;
  } catch (err) {
    console.error('✗ Cryptographic verification failure:', err);
  }
}`,
    },
    go: {
      label: "Go (golang-jwt/v5)",
      filename: "main.go",
      code: `package main

import (
    "fmt"
    "github.com/golang-jwt/jwt/v5"
)

var hmacSecret = []byte("your-256-bit-secret")

func verifyToken(tokenString string) (*jwt.MapClaims, error) {
    token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
        // Enforce HMAC algorithm family
        if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
            return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
        }
        return hmacSecret, nil
    })

    if claims, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {
        fmt.Println("✓ Valid token:", claims["sub"])
        return &claims, nil
    }
    return nil, err
}`,
    },
    curl: {
      label: "cURL / API",
      filename: "request.sh",
      code: `curl -X POST http://localhost:8000/verify \\
  -H "Content-Type: application/json" \\
  -d '{
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "secret": "your-256-bit-secret",
    "algorithm": "HS256"
  }'

# Response:
# {
#   "overall_valid": true,
#   "signature_valid": true,
#   "time_valid": true,
#   "message": "Token signature verified successfully"
# }`,
    },
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(snippets[activeLang].code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <ScrollReveal distance={36} duration={650} as="section" className="space-y-6 max-w-5xl mx-auto relative z-10">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-main pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full badge-indigo-outline text-[10px] font-bold uppercase tracking-widest font-mono-custom mb-1.5">
            <span className="w-1.5 h-1.5 rounded-full dot-indigo" />
            Developer Integration
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-main font-display-custom tracking-tight">
            Production Verification Implementation
          </h2>
          <p className="text-xs text-muted-custom mt-1">
            Copy battle-tested, timing-safe verification boilerplate across popular backends
          </p>
        </div>

        {/* Language Tabs */}
        <div className="flex bg-secondary-custom/80 border border-main p-1 rounded-xl gap-1 self-start sm:self-auto shadow-xs">
          {Object.keys(snippets).map((key) => (
            <button
              key={key}
              onClick={() => setActiveLang(key)}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                activeLang === key
                  ? "badge-indigo-outline shadow-xs text-primary-color font-semibold"
                  : "text-muted-custom hover:text-main hover:bg-white/60"
              }`}
            >
              {key === "curl" ? "cURL" : key}
            </button>
          ))}
        </div>
      </div>

      {/* Code Editor Mockup Card */}
      <div className="rounded-2xl overflow-hidden border border-slate-800 shadow-xl bg-slate-950 font-mono-custom text-xs">
        {/* Editor Top Bar */}
        <div className="flex items-center justify-between px-4 py-3 bg-slate-900 border-b border-slate-800 text-[11px]">
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80 inline-block" />
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block" />
            </div>
            <span className="text-slate-400 ml-2 font-medium">{snippets[activeLang].filename}</span>
          </div>

          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer text-[10px] uppercase tracking-wider font-bold"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <span>{copied ? "Copied ✓" : "Copy Code"}</span>
          </button>
        </div>

        {/* Code Block */}
        <pre className="p-5 overflow-x-auto text-slate-300 leading-relaxed text-[11px] selection:bg-indigo-500/30">
          <code>{snippets[activeLang].code}</code>
        </pre>
      </div>
    </ScrollReveal>
  );
}
