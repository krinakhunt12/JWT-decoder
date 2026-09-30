# 🔐 JWT Decoder

A full-stack JWT decoder with a sleek dark UI, interactive JSON tree viewer, and PDF export.

---

## Stack

| Layer    | Tech                          |
|----------|-------------------------------|
| Frontend | React 18 + Vite + Tailwind CSS 3 |
| Backend  | Python 3 + FastAPI + venv     |
| PDF      | ReportLab                     |

---

## Quick Start

### 1. Backend

```bash
cd backend

# Create virtual environment
python3 -m venv venv

# Activate it
# macOS / Linux:
source venv/bin/activate
# Windows:
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run the server
uvicorn main:app --reload --port 8000
```

API will be live at → http://localhost:8000

---

### 2. Frontend

```bash
cd frontend

# Install packages
npm install

# Start dev server
npm run dev
```

App will be live at → http://localhost:5173

---

## Features

- **Instant decode** — paste any JWT and click Decode (or Ctrl+Enter)
- **Colored token preview** — header / payload / signature highlighted in orange / purple / green
- **Interactive JSON tree** — collapse/expand nested objects, toggle raw mode
- **Timestamp parsing** — `iat`, `exp`, `nbf` shown as human-readable dates with expired badge
- **Copy buttons** — copy any section as JSON
- **Export PDF** — beautifully formatted PDF with header, payload, signature sections and branded design
- **Sample token** — Load Sample button for quick demo
- **Asymmetric verification** — verify RSA and ECDSA tokens with a PEM public key or JWK, not just HMAC secrets

---

## Supported Algorithms

| Family | Algorithms              | Key material for verification             |
|--------|-------------------------|-------------------------------------------|
| HMAC   | `HS256` `HS384` `HS512` | Shared secret (symmetric)                 |
| RSA    | `RS256` `RS384` `RS512` | PEM public key, X.509 certificate, or JWK |
| ECDSA  | `ES256` `ES384` `ES512` | PEM public key or JWK (P-256 / P-384 / P-521) |

Verification hardening:

- The selected algorithm is cross-checked against the token's `alg` header — a mismatch fails
  instead of silently verifying under a weaker algorithm.
- Symmetric requests carrying a public key, and asymmetric requests carrying only a secret, are
  rejected — this closes the classic algorithm-confusion attack.
- `exp` and `nbf` are validated; `aud` is left to the consuming service.
- The `kid` header is echoed back so the right key can be selected.
- `PS*` (RSA-PSS) and `EdDSA` are not implemented by the bundled `python-jose`, so they are reported
  as unsupported rather than mis-verified.

---

## API Endpoints

| Method | Path          | Description                                       |
|--------|---------------|---------------------------------------------------|
| GET    | `/`           | Service banner + supported algorithms            |
| GET    | `/algorithms` | Algorithm catalog with families and key formats  |
| POST   | `/decode`     | Decode a JWT token                                |
| POST   | `/verify`     | Verify a signature (secret or public key)         |
| POST   | `/sign`       | Generate an HMAC-signed JWT (HS256/384/512)       |
| POST   | `/export-pdf` | Generate PDF report                               |

`/sign` stays symmetric on purpose — signing an RS*/ES* token needs the issuer's private key,
which this service never accepts.

---

## Project Structure

```
jwt-decoder/
├── backend/
│   ├── venv/           ← Python virtual environment
│   ├── main.py         ← FastAPI application
│   └── requirements.txt
└── frontend/
    ├── src/
│   │   ├── App.jsx     ← Main React component
│   │   ├── main.jsx
    │   │   ├── constants/
    │   │   │   └── algorithms.js  ← Shared algorithm catalog (mirrors backend)
    │   │   ├── components/
    │   │   │   ├── VerifyPanel.jsx     ← Secret / public key verification UI
    │   │   │   └── SecurityScanner.jsx ← Algorithm + claim risk checks
    │   │   └── index.css   ← Tailwind + custom styles
    ├── index.html
    ├── vite.config.js
    └── tailwind.config.js
```
