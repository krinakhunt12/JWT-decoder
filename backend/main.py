from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
import json
import base64
import io
import ipaddress
import os
import socket
from datetime import datetime
from urllib.parse import urljoin, urlparse, urlunparse
import hmac
import hashlib

import httpx
from jose import jws as jose_jws
from jose import jwt as jose_jwt
from jose.exceptions import ExpiredSignatureError, JWKError, JWSError, JWTClaimsError, JWTError

from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import mm
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    HRFlowable, KeepTogether
)
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_RIGHT

app = FastAPI(title="JWT Decoder API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Signature algorithm catalog (RFC 7518) ─────────────────────────────
HMAC_ALGORITHMS = ["HS256", "HS384", "HS512"]
RSA_ALGORITHMS = ["RS256", "RS384", "RS512"]
EC_ALGORITHMS = ["ES256", "ES384", "ES512"]
SUPPORTED_ALGORITHMS = HMAC_ALGORITHMS + RSA_ALGORITHMS + EC_ALGORITHMS

HMAC_DIGESTS = {
    "HS256": hashlib.sha256,
    "HS384": hashlib.sha384,
    "HS512": hashlib.sha512,
}

ALGORITHM_METADATA = {
    **{alg: {"family": "HMAC", "hash": f"SHA-{alg[2:]}", "key_field": "secret",
             "key_format": "shared secret"} for alg in HMAC_ALGORITHMS},
    **{alg: {"family": "RSA", "hash": f"SHA-{alg[2:]}", "key_field": "public_key",
             "key_format": "PEM public key or JWK"} for alg in RSA_ALGORITHMS},
    **{alg: {"family": "ECDSA", "hash": f"SHA-{alg[2:]}",
             "curve": {"ES256": "P-256", "ES384": "P-384", "ES512": "P-521"}[alg],
             "key_field": "public_key", "key_format": "PEM public key or JWK"} for alg in EC_ALGORITHMS},
}

class JWTRequest(BaseModel):
    token: str

class PDFRequest(BaseModel):
    token: str
    header: dict
    payload: dict
    signature: str

class VerifyRequest(BaseModel):
    token: str
    secret: str = ""
    algorithm: str
    public_key: str | None = None

class JWKSVerifyRequest(BaseModel):
    token: str
    jwks_url: str | None = None
    timeout: float | None = None

class SignRequest(BaseModel):
    header: dict
    payload: dict
    secret: str
    algorithm: str
    expires_in: int | None = None

def decode_base64_part(part: str) -> dict | str:
    # Add padding
    padded = part + "=" * (-len(part) % 4)
    try:
        decoded = base64.urlsafe_b64decode(padded)
        return json.loads(decoded)
    except Exception:
        return part

def format_timestamp(value):
    try:
        dt = datetime.fromtimestamp(int(value))
        return dt.strftime("%Y-%m-%d %H:%M:%S UTC")
    except Exception:
        return None

def parse_verification_key(raw: str) -> str | dict:
    """Accept a PEM public key, or a JWK JSON object pasted as text."""
    text = raw.strip()
    if text.startswith("{"):
        return json.loads(text)
    return text

def is_expired(payload) -> bool:
    if not isinstance(payload, dict) or "exp" not in payload:
        return False
    try:
        return int(payload["exp"]) < datetime.now().timestamp()
    except (TypeError, ValueError):
        return False

def verify_result(signature_valid, token_expired, message, error=None, claims_valid=True, **extra):
    return {
        "signature_valid": signature_valid,
        "token_expired": token_expired,
        "claims_valid": claims_valid,
        "overall_valid": bool(signature_valid) and not token_expired and claims_valid,
        "message": message,
        "error": error,
        **extra,
    }

# ── JWKS remote key resolution (RFC 7517) ──────────────────────────────
JWKS_MAX_BYTES = 256 * 1024
JWKS_TIMEOUT_SECONDS = 8.0
JWKS_MAX_REDIRECTS = 3

# Resolution always talks to a public internet endpoint unless explicitly opted out,
# because the URL is derived from an untrusted `iss` claim.
ALLOW_PRIVATE_JWKS = os.getenv("JWT_ALLOW_PRIVATE_JWKS", "").strip().lower() in {"1", "true", "yes"}

ALGORITHM_KTY = {
    "RS256": "RSA", "RS384": "RSA", "RS512": "RSA",
    "ES256": "EC", "ES384": "EC", "ES512": "EC",
}

# Private JWK members must never leave the server, even if a provider publishes them.
PRIVATE_JWK_MEMBERS = ("d", "p", "q", "dp", "dq", "qi", "oth")

GOOGLE_CERTS_URL = "https://www.googleapis.com/oauth2/v3/certs"
FIREBASE_CERTS_URL = "https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com"
APPLE_KEYS_URL = "https://appleid.apple.com/auth/keys"

class JWKSFetchError(Exception):
    """A JWKS document could not be fetched or understood."""

def assert_fetchable_url(url: str) -> None:
    """Refuse anything that is not a plain, public https endpoint (SSRF guard)."""
    parsed = urlparse(url)
    if parsed.scheme not in ("https", "http"):
        raise JWKSFetchError(f"Only https:// URLs can be fetched, got '{parsed.scheme or url[:12]}'.")
    if parsed.username or parsed.password:
        raise JWKSFetchError("URLs with embedded credentials are refused.")
    if not parsed.hostname:
        raise JWKSFetchError("URL has no host.")
    if parsed.scheme == "http" and not ALLOW_PRIVATE_JWKS:
        raise JWKSFetchError("Plain http:// is refused. Use https://, or set JWT_ALLOW_PRIVATE_JWKS=1 for local testing.")

    port = parsed.port or (443 if parsed.scheme == "https" else 80)
    try:
        infos = socket.getaddrinfo(parsed.hostname, port, proto=socket.IPPROTO_TCP)
    except socket.gaierror as e:
        raise JWKSFetchError(f"Cannot resolve host '{parsed.hostname}': {e}.")

    if ALLOW_PRIVATE_JWKS:
        return
    for address in sorted({info[4][0] for info in infos}):
        ip = ipaddress.ip_address(address)
        if (ip.is_private or ip.is_loopback or ip.is_link_local or ip.is_reserved
                or ip.is_multicast or ip.is_unspecified):
            raise JWKSFetchError(
                f"Refusing to fetch {address} — private, loopback, link-local and reserved "
                "addresses are blocked (set JWT_ALLOW_PRIVATE_JWKS=1 to allow local testing)."
            )

async def fetch_json(url: str, timeout: float = JWKS_TIMEOUT_SECONDS) -> dict:
    """GET a JSON document, re-validating every redirect hop and capping the body size."""
    assert_fetchable_url(url)
    current = url

    async with httpx.AsyncClient(
        follow_redirects=False,
        timeout=timeout,
        headers={"Accept": "application/json"},
    ) as client:
        for _ in range(JWKS_MAX_REDIRECTS + 1):
            async with client.stream("GET", current) as response:
                if response.status_code in (301, 302, 303, 307, 308):
                    location = response.headers.get("location")
                    if not location:
                        raise JWKSFetchError(f"{current} redirected without a Location header.")
                    current = urljoin(current, location)
                    assert_fetchable_url(current)
                    continue

                if response.status_code != 200:
                    raise JWKSFetchError(f"{current} returned HTTP {response.status_code}.")

                declared = response.headers.get("content-length")
                if declared and declared.isdigit() and int(declared) > JWKS_MAX_BYTES:
                    raise JWKSFetchError(f"Document is larger than the {JWKS_MAX_BYTES // 1024} KB limit.")

                chunks = []
                size = 0
                async for chunk in response.aiter_bytes():
                    size += len(chunk)
                    if size > JWKS_MAX_BYTES:
                        raise JWKSFetchError(f"Document is larger than the {JWKS_MAX_BYTES // 1024} KB limit.")
                    chunks.append(chunk)
                body = b"".join(chunks)

            try:
                return json.loads(body)
            except json.JSONDecodeError as e:
                raise JWKSFetchError(f"{current} did not return valid JSON: {e}.")

    raise JWKSFetchError(f"Too many redirects while fetching {url}.")

def discover_jwks_sources(iss: str) -> list[dict]:
    """Ordered discovery candidates for an issuer: known provider templates, then OIDC discovery."""
    sources = []

    def add(provider, url, kind="jwks"):
        if url and not any(source["url"] == url for source in sources):
            sources.append({"provider": provider, "url": url, "kind": kind})

    if not iss:
        return sources

    issuer = iss.rstrip("/")
    parsed = urlparse(issuer)
    if parsed.scheme not in ("https", "http") or not parsed.hostname:
        return sources

    host = parsed.hostname.lower()
    origin = urlunparse((parsed.scheme, parsed.netloc, "", "", "", ""))
    path = parsed.path.rstrip("/")

    if host in ("accounts.google.com", "accounts.google.co.uk", "oauth2.googleapis.com"):
        add("Google", GOOGLE_CERTS_URL)
    elif host == "securetoken.google.com":
        add("Firebase", FIREBASE_CERTS_URL)
    elif host == "appleid.apple.com":
        add("Apple", APPLE_KEYS_URL)
    elif host.endswith(".auth0.com"):
        add("Auth0", f"{origin}/.well-known/jwks.json")
    elif host.endswith((".okta.com", ".okta-emea.com", ".oktapreview.com")):
        add("Okta", f"{issuer}/v1/keys")
        add("Okta", f"{origin}/oauth2/default/v1/keys")
    elif host == "login.microsoftonline.com":
        tenant = path.strip("/").split("/")[0] if path.strip("/") else "common"
        add("Azure AD", f"{origin}/{tenant}/discovery/v2.0/keys")
    elif host.startswith("cognito-idp.") and host.endswith(".amazonaws.com"):
        add("AWS Cognito", f"{issuer}/.well-known/jwks.json")
    elif "/realms/" in path:
        add("Keycloak", f"{issuer}/protocol/openid-connect/certs")

    add("OIDC Discovery", f"{origin}/.well-known/openid-configuration", kind="oidc")
    add("OIDC Discovery", f"{issuer}/.well-known/openid-configuration", kind="oidc")
    add("Well-Known", f"{origin}/.well-known/jwks.json")
    add("Well-Known", f"{issuer}/.well-known/jwks.json")
    return sources

def select_jwks_keys(jwks: dict, kid: str | None) -> list[dict]:
    """Public verification keys from a key set, narrowed by kid when the token names one."""
    keys = jwks.get("keys")
    if not isinstance(keys, list):
        raise JWKSFetchError("Key set has no 'keys' array.")

    usable = []
    for key in keys:
        if not isinstance(key, dict) or key.get("kty") not in ("RSA", "EC", "OKP"):
            continue
        if key.get("use") not in (None, "sig"):
            continue
        ops = key.get("key_ops")
        if isinstance(ops, list) and ops and "verify" not in ops:
            continue
        usable.append(key)

    if kid:
        return [key for key in usable if key.get("kid") == kid]
    return usable

def public_jwk(key: dict) -> dict:
    """Strip any private members before a JWK is echoed back to a client."""
    return {k: v for k, v in key.items() if k not in PRIVATE_JWK_MEMBERS}

@app.get("/")
def root():
    return {"message": "JWT Decoder API", "supported_algorithms": SUPPORTED_ALGORITHMS}

@app.get("/algorithms")
def list_algorithms():
    return {
        "supported": SUPPORTED_ALGORITHMS,
        "families": {
            "symmetric": HMAC_ALGORITHMS,
            "asymmetric": RSA_ALGORITHMS + EC_ALGORITHMS,
        },
        "algorithms": [
            {"alg": alg, **ALGORITHM_METADATA[alg]} for alg in SUPPORTED_ALGORITHMS
        ],
    }

@app.post("/decode")
def decode_jwt(request: JWTRequest):
    token = request.token.strip()
    parts = token.split(".")

    if len(parts) != 3:
        raise HTTPException(status_code=400, detail="Invalid JWT: must have 3 parts separated by dots")

    try:
        header = decode_base64_part(parts[0])
        payload = decode_base64_part(parts[1])
        signature = parts[2]

        if not isinstance(header, dict):
            raise HTTPException(status_code=400, detail="Invalid JWT header")
        if not isinstance(payload, dict):
            raise HTTPException(status_code=400, detail="Invalid JWT payload")

        # Enrich timestamps
        time_fields = {}
        for key in ["iat", "exp", "nbf"]:
            if key in payload:
                human = format_timestamp(payload[key])
                if human:
                    time_fields[key] = human

        return {
            "header": header,
            "payload": payload,
            "signature": signature,
            "time_fields": time_fields,
            "algorithm": header.get("alg"),
            "algorithm_supported": header.get("alg") in SUPPORTED_ALGORITHMS,
            "key_id": header.get("kid"),
            "raw_parts": {
                "header": parts[0],
                "payload": parts[1],
                "signature": parts[2]
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to decode JWT: {str(e)}")


@app.post("/verify")
def verify_jwt(request: VerifyRequest):
    token = request.token.strip()
    secret = request.secret or ""
    public_key = (request.public_key or "").strip()
    algorithm = request.algorithm

    parts = token.split(".")
    if len(parts) != 3:
        return verify_result(
            False, False, "Invalid JWT",
            error="Token must have 3 dot-separated parts.",
            algorithm=algorithm,
        )

    if algorithm not in SUPPORTED_ALGORITHMS:
        return verify_result(
            False, False, "Unsupported Algorithm",
            error=f"'{algorithm}' cannot be verified. Supported: {', '.join(SUPPORTED_ALGORITHMS)}.",
            algorithm=algorithm,
        )

    meta = ALGORITHM_METADATA[algorithm]
    family = meta["family"]

    if family == "HMAC":
        if public_key:
            return verify_result(
                False, False, "Key Type Mismatch",
                error="Symmetric HS* algorithms need the shared secret, not a public key. "
                      "Accepting a public key here is the classic algorithm-confusion attack.",
                algorithm=algorithm,
            )
        if not secret:
            return verify_result(
                False, False, "Missing Secret",
                error="Enter the shared secret used to sign the token.",
                algorithm=algorithm,
            )
        key = secret
    else:
        if secret and not public_key:
            return verify_result(
                False, False, "Key Type Mismatch",
                error=f"{algorithm} is an asymmetric algorithm and cannot be verified with a shared "
                      "secret. Paste the issuer's public key instead.",
                algorithm=algorithm,
            )
        if not public_key:
            return verify_result(
                False, False, "Missing Public Key",
                error=f"Enter the issuer's PEM public key (or JWK) to verify this {family} token.",
                algorithm=algorithm,
            )
        try:
            key = parse_verification_key(public_key)
        except json.JSONDecodeError as e:
            return verify_result(
                False, False, "Invalid Key",
                error=f"Public key is not valid JSON: {e}",
                algorithm=algorithm,
            )

    try:
        header = jose_jwt.get_unverified_header(token)
    except JWTError as e:
        return verify_result(
            False, False, "Unreadable Header",
            error=f"Could not read the token header: {e}",
            algorithm=algorithm,
        )

    key_id = header.get("kid")
    token_alg = header.get("alg")

    if token_alg != algorithm:
        return verify_result(
            False, False, "Algorithm Mismatch",
            error=f"Token header declares '{token_alg}' but '{algorithm}' was selected. "
                  "The token is only valid for the algorithm it was signed with.",
            algorithm=algorithm, token_algorithm=token_alg, key_id=key_id,
        )

    payload = decode_base64_part(parts[1])
    token_expired = is_expired(payload)

    try:
        jose_jws.verify(token, key, algorithms=[algorithm])
        signature_valid = True
    except JWKError as e:
        return verify_result(
            False, token_expired, "Invalid Key",
            error=f"Could not load the verification key: {e}",
            algorithm=algorithm, token_algorithm=token_alg, key_id=key_id,
        )
    except JWSError as e:
        # python-jose re-raises a bad signature as JWSError("Signature verification failed."),
        # which is the one expected failure here — anything else is a real problem.
        if str(e) != "Signature verification failed.":
            return verify_result(
                False, token_expired, "Verification Failed",
                error=str(e),
                algorithm=algorithm, token_algorithm=token_alg, key_id=key_id,
            )
        signature_valid = False

    if not signature_valid:
        return verify_result(
            False, token_expired, "Invalid Signature",
            error=f"Signature does not match the {algorithm} verification key — the token may have been tampered with.",
            algorithm=algorithm, token_algorithm=token_alg, key_id=key_id,
        )

    try:
        jose_jwt.decode(
            token,
            key,
            algorithms=[algorithm],
            options={"verify_aud": False, "verify_iat": False},
        )
    except ExpiredSignatureError:
        return verify_result(
            True, True, "Token Expired",
            error="Signature is valid, but the exp claim is in the past — the token is no longer usable.",
            algorithm=algorithm, token_algorithm=token_alg, key_id=key_id,
        )
    except JWTClaimsError as e:
        return verify_result(
            True, token_expired, "Claims Rejected",
            error=f"Signature is valid, but a registered claim failed validation: {e}",
            claims_valid=False,
            algorithm=algorithm, token_algorithm=token_alg, key_id=key_id,
        )
    except JWTError as e:
        return verify_result(
            False, token_expired, "Verification Failed",
            error=str(e),
            algorithm=algorithm, token_algorithm=token_alg, key_id=key_id,
        )

    if token_expired:
        return verify_result(
            True, True, "Token Expired",
            error="Signature is valid, but the exp claim is in the past — the token is no longer usable.",
            algorithm=algorithm, token_algorithm=token_alg, key_id=key_id,
        )

    return verify_result(
        True, False, "Signature Verified",
        algorithm=algorithm, token_algorithm=token_alg, key_id=key_id,
    )


@app.post("/verify-jwks")
async def verify_jwks(request: JWKSVerifyRequest):
    token = request.token.strip()
    timeout = min(max(request.timeout or JWKS_TIMEOUT_SECONDS, 1.0), 20.0)

    parts = token.split(".")
    if len(parts) != 3:
        return verify_result(
            False, False, "Invalid JWT",
            error="Token must have 3 dot-separated parts.",
        )

    try:
        header = jose_jwt.get_unverified_header(token)
    except JWTError as e:
        return verify_result(
            False, False, "Unreadable Header",
            error=f"Could not read the token header: {e}",
        )

    algorithm = header.get("alg")
    key_id = header.get("kid")

    if algorithm not in SUPPORTED_ALGORITHMS or algorithm in HMAC_ALGORITHMS:
        return verify_result(
            False, False, "Unsupported Algorithm",
            error=f"JWKS resolution only applies to asymmetric tokens (RS*, ES*). "
                  f"This token declares '{algorithm or 'no alg'}'.",
            algorithm=algorithm, key_id=key_id,
        )

    payload = decode_base64_part(parts[1])
    issuer = payload.get("iss") if isinstance(payload, dict) else None
    token_expired = is_expired(payload)

    if request.jwks_url:
        sources = [{"provider": "Manual", "url": request.jwks_url.strip(), "kind": "jwks"}]
    else:
        sources = discover_jwks_sources(issuer or "")
        if not sources:
            return verify_result(
                False, token_expired, "Issuer Unavailable",
                error="This token has no usable `iss` claim to derive a key set URL from. "
                      "Paste the issuer's JWKS URL to resolve the key manually.",
                algorithm=algorithm, key_id=key_id,
            )

    attempts = []
    resolved = None
    keyset_found = None

    for source in sources:
        try:
            document = await fetch_json(source["url"], timeout)
            if source["kind"] == "oidc":
                jwks_uri = document.get("jwks_uri")
                if not jwks_uri:
                    raise JWKSFetchError("Discovery document has no jwks_uri member.")
                assert_fetchable_url(jwks_uri)
                document = await fetch_json(jwks_uri, timeout)
                source = {**source, "url": jwks_uri}
            keys = select_jwks_keys(document, key_id)
        except JWKSFetchError as e:
            attempts.append({"url": source["url"], "provider": source["provider"], "ok": False, "detail": str(e)})
            continue
        except httpx.HTTPError as e:
            attempts.append({"url": source["url"], "provider": source["provider"], "ok": False, "detail": f"Request failed: {e}"})
            continue

        attempts.append({
            "url": source["url"], "provider": source["provider"], "ok": True,
            "detail": f"{len(document.get('keys') or [])} key(s) in set",
        })
        if keyset_found is None:
            keyset_found = {"source": source, "jwks": document}
        if keys:
            resolved = {"source": source, "jwks": document, "keys": keys}
            break

    if not resolved and not keyset_found:
        detail = "No reachable key set was found. " + " ".join(
            f"{a['provider']}: {a['detail']}" for a in attempts[-2:]
        )
        return verify_result(
            False, token_expired, "Key Set Unavailable",
            error=detail.strip(),
            algorithm=algorithm, key_id=key_id, attempts=attempts,
        )

    # A reachable set that was fetched but produced no candidate key
    if not resolved:
        source = keyset_found["source"]
        return verify_result(
            False, token_expired, "Key Not Found",
            error=f"The token names kid='{key_id}' but no key in {source['url']} matches it "
                  f"(use is 'sig'). The issuer may have rotated its keys — re-check the token or "
                  "fetch the key by hand.",
            algorithm=algorithm, key_id=key_id,
            jwks_url=source["url"], jwks_provider=source["provider"],
            keys_total=len(keyset_found["jwks"].get("keys") or []), keys_tried=0,
            attempts=attempts,
        )

    source = resolved["source"]
    candidates = resolved["keys"]
    expected_kty = ALGORITHM_KTY[algorithm]
    tried = 0
    matched = None

    for key in candidates:
        if key.get("kty") != expected_kty:
            continue
        if key.get("alg") not in (None, algorithm):
            continue
        tried += 1
        try:
            if jose_jws.verify(token, key, algorithms=[algorithm]):
                matched = key
                break
        except (JWKError, JWSError, JWTError, ValueError):
            continue

    if not matched:
        return verify_result(
            False, token_expired, "Invalid Signature",
            error=f"Tried {tried} {expected_kty} key(s) from {source['url']}; none produced a valid "
                  f"{algorithm} signature. The token is not signed by this issuer or has been tampered with.",
            algorithm=algorithm, key_id=key_id,
            jwks_url=source["url"], jwks_provider=source["provider"],
            keys_total=len(resolved["jwks"].get("keys") or []), keys_tried=tried,
            attempts=attempts,
        )

    try:
        jose_jwt.decode(token, matched, algorithms=[algorithm], options={"verify_aud": False, "verify_iat": False})
        claims_valid, claims_error, expired = True, None, False
    except ExpiredSignatureError:
        claims_valid, expired = True, True
        claims_error = "Signature is valid, but the exp claim is in the past — the token is no longer usable."
    except JWTClaimsError as e:
        claims_valid, expired = False, False
        claims_error = f"Signature is valid, but a registered claim failed validation: {e}"

    if not claims_valid:
        message = "Claims Rejected"
    elif expired:
        message = "Token Expired"
    else:
        message = "Signature Verified"

    return verify_result(
        True, token_expired, message,
        error=claims_error,
        claims_valid=claims_valid,
        algorithm=algorithm, key_id=key_id or matched.get("kid"),
        issuer=issuer,
        jwks_url=source["url"], jwks_provider=source["provider"],
        keys_total=len(resolved["jwks"].get("keys") or []), keys_tried=tried,
        matched_key=public_jwk(matched),
        attempts=attempts,
    )


@app.post("/sign")
def sign_jwt(request: SignRequest):
    header = request.header.copy()
    payload = request.payload.copy()
    secret = request.secret
    algorithm = request.algorithm
    expires_in = request.expires_in

    if algorithm not in HMAC_ALGORITHMS:
        raise HTTPException(
            status_code=400,
            detail=(
                f"Signing with {algorithm} requires the issuer's private key, which this endpoint "
                f"never accepts. Supported signing algorithms: {', '.join(HMAC_ALGORITHMS)}."
            ),
        )

    # Update or add iat if not exists
    if "iat" not in payload:
        payload["iat"] = int(datetime.now().timestamp())

    # Calculate expiration
    if expires_in is not None:
        payload["exp"] = int(datetime.now().timestamp() + expires_in)

    # Force algorithm in header to match
    header["alg"] = algorithm
    header["typ"] = "JWT"

    try:
        # Compact JSON serialization and Base64url encoding
        header_json = json.dumps(header, separators=(',', ':'))
        payload_json = json.dumps(payload, separators=(',', ':'))

        header_b64 = base64.urlsafe_b64encode(header_json.encode('utf-8')).decode('utf-8').rstrip('=')
        payload_b64 = base64.urlsafe_b64encode(payload_json.encode('utf-8')).decode('utf-8').rstrip('=')

        msg = f"{header_b64}.{payload_b64}"

        digestmod = HMAC_DIGESTS[algorithm]

        sig_bytes = hmac.new(
            secret.encode('utf-8'),
            msg.encode('utf-8'),
            digestmod
        ).digest()
        
        sig_b64 = base64.urlsafe_b64encode(sig_bytes).decode('utf-8').rstrip('=')

        token = f"{msg}.{sig_b64}"
        return {
            "token": token,
            "header": header,
            "payload": payload,
            "signature": sig_b64
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to generate JWT: {str(e)}")


@app.post("/export-pdf")
def export_pdf(request: PDFRequest):
    buffer = io.BytesIO()

    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        topMargin=20*mm,
        bottomMargin=20*mm,
        leftMargin=20*mm,
        rightMargin=20*mm,
        title="JWT Decoded Report"
    )

    # Color palette
    BG_DARK = colors.HexColor("#0F172A")
    ACCENT = colors.HexColor("#6366F1")
    ACCENT_LIGHT = colors.HexColor("#818CF8")
    TEXT_PRIMARY = colors.HexColor("#1E293B")
    TEXT_SECONDARY = colors.HexColor("#475569")
    SURFACE = colors.HexColor("#F1F5F9")
    BORDER = colors.HexColor("#CBD5E1")
    SUCCESS = colors.HexColor("#10B981")
    WARNING = colors.HexColor("#F59E0B")
    DANGER = colors.HexColor("#EF4444")
    WHITE = colors.white

    styles = getSampleStyleSheet()

    title_style = ParagraphStyle(
        "TitleStyle",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=22,
        textColor=WHITE,
        alignment=TA_LEFT,
        spaceAfter=4,
    )
    subtitle_style = ParagraphStyle(
        "SubtitleStyle",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=11,
        textColor=colors.HexColor("#C7D2FE"),
        alignment=TA_LEFT,
    )
    section_title_style = ParagraphStyle(
        "SectionTitle",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=13,
        textColor=WHITE,
        spaceAfter=2,
    )
    label_style = ParagraphStyle(
        "LabelStyle",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=9,
        textColor=TEXT_SECONDARY,
        spaceAfter=1,
    )
    value_style = ParagraphStyle(
        "ValueStyle",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=10,
        textColor=TEXT_PRIMARY,
        wordWrap='CJK',
    )
    mono_style = ParagraphStyle(
        "MonoStyle",
        parent=styles["Normal"],
        fontName="Courier",
        fontSize=9,
        textColor=TEXT_PRIMARY,
        wordWrap='CJK',
        leading=14,
    )
    footer_style = ParagraphStyle(
        "FooterStyle",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=8,
        textColor=TEXT_SECONDARY,
        alignment=TA_CENTER,
    )

    story = []
    page_width = A4[0] - 40*mm

    # ── HEADER BANNER ───────────────────────────────────────
    header_data = [[
        Paragraph("🔐 JWT Decoded Report", title_style),
        Paragraph(f"Generated {datetime.now().strftime('%B %d, %Y  %H:%M')}", subtitle_style),
    ]]
    header_table = Table(header_data, colWidths=[page_width * 0.65, page_width * 0.35])
    header_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), BG_DARK),
        ("TOPPADDING", (0, 0), (-1, -1), 18),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 18),
        ("LEFTPADDING", (0, 0), (0, -1), 16),
        ("RIGHTPADDING", (-1, 0), (-1, -1), 16),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("ALIGN", (1, 0), (1, -1), "RIGHT"),
        ("ROWBACKGROUNDS", (0, 0), (-1, -1), [BG_DARK]),
        ("ROUNDEDCORNERS", [6, 6, 6, 6]),
    ]))
    story.append(header_table)
    story.append(Spacer(1, 12))

    def make_section(title_text, badge_color, rows):
        """Build a styled section card."""
        elements = []
        # Section header
        sec_header = Table([[
            Paragraph(title_text, section_title_style),
        ]], colWidths=[page_width])
        sec_header.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), badge_color),
            ("TOPPADDING", (0, 0), (-1, -1), 10),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 10),
            ("LEFTPADDING", (0, 0), (-1, -1), 14),
            ("RIGHTPADDING", (0, 0), (-1, -1), 14),
        ]))
        elements.append(sec_header)

        # Build key-value rows
        kv_rows = []
        for key, value in rows:
            kv_rows.append([
                Paragraph(str(key), label_style),
                Paragraph(str(value), mono_style if len(str(value)) > 60 else value_style),
            ])

        if kv_rows:
            kv_table = Table(kv_rows, colWidths=[page_width * 0.28, page_width * 0.72])
            kv_table.setStyle(TableStyle([
                ("BACKGROUND", (0, 0), (-1, -1), SURFACE),
                ("TOPPADDING", (0, 0), (-1, -1), 7),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
                ("LEFTPADDING", (0, 0), (-1, -1), 14),
                ("RIGHTPADDING", (0, 0), (-1, -1), 14),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("LINEBELOW", (0, 0), (-1, -2), 0.5, BORDER),
                ("TEXTCOLOR", (0, 0), (0, -1), TEXT_SECONDARY),
            ]))
            elements.append(kv_table)

        return KeepTogether(elements)

    # ── HEADER SECTION ──────────────────────────────────────
    header_rows = [(k, json.dumps(v) if isinstance(v, (dict, list)) else str(v))
                   for k, v in request.header.items()]
    story.append(make_section("HEADER  ·  Algorithm & Token Type", ACCENT, header_rows))
    story.append(Spacer(1, 10))

    # ── PAYLOAD SECTION ─────────────────────────────────────
    payload_rows = []
    claim_labels = {
        "iss": "Issuer",
        "sub": "Subject",
        "aud": "Audience",
        "exp": "Expiration Time",
        "nbf": "Not Before",
        "iat": "Issued At",
        "jti": "JWT ID",
    }
    for k, v in request.payload.items():
        label = claim_labels.get(k, k)
        if isinstance(v, (dict, list)):
            display = json.dumps(v, indent=2)
        else:
            display = str(v)
        # Check for timestamp fields
        if k in ["iat", "exp", "nbf"]:
            try:
                dt = datetime.fromtimestamp(int(v))
                display = f"{v}  →  {dt.strftime('%Y-%m-%d %H:%M:%S UTC')}"
            except Exception:
                pass
        payload_rows.append((label, display))

    story.append(make_section("PAYLOAD  ·  Claims & Data", colors.HexColor("#0F766E"), payload_rows))
    story.append(Spacer(1, 10))

    # ── SIGNATURE SECTION ───────────────────────────────────
    sig_section = make_section("SIGNATURE", colors.HexColor("#7C3AED"), [
        ("Base64url Encoded", request.signature)
    ])
    story.append(sig_section)
    story.append(Spacer(1, 14))

    # ── RAW TOKEN ───────────────────────────────────────────
    token_display = request.token[:120] + "..." if len(request.token) > 120 else request.token
    raw_label = Table([[Paragraph("RAW TOKEN", ParagraphStyle(
        "RL", parent=styles["Normal"], fontName="Helvetica-Bold",
        fontSize=9, textColor=TEXT_SECONDARY
    ))]], colWidths=[page_width])
    raw_label.setStyle(TableStyle([
        ("TOPPADDING", (0, 0), (-1, -1), 0),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
        ("LEFTPADDING", (0, 0), (-1, -1), 0),
    ]))
    story.append(raw_label)

    raw_table = Table([[
        Paragraph(token_display, ParagraphStyle(
            "RawToken", parent=styles["Normal"],
            fontName="Courier", fontSize=8,
            textColor=ACCENT_LIGHT, wordWrap='CJK', leading=13
        ))
    ]], colWidths=[page_width])
    raw_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), BG_DARK),
        ("TOPPADDING", (0, 0), (-1, -1), 12),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 12),
        ("LEFTPADDING", (0, 0), (-1, -1), 14),
        ("RIGHTPADDING", (0, 0), (-1, -1), 14),
    ]))
    story.append(raw_table)
    story.append(Spacer(1, 16))

    # ── FOOTER ──────────────────────────────────────────────
    story.append(HRFlowable(width=page_width, thickness=0.5, color=BORDER))
    story.append(Spacer(1, 6))
    story.append(Paragraph(
        "Generated by JWT Decoder  ·  This report is for informational purposes only  ·  Never share your JWT publicly",
        footer_style
    ))

    doc.build(story)
    buffer.seek(0)

    return StreamingResponse(
        buffer,
        media_type="application/pdf",
        headers={"Content-Disposition": "attachment; filename=jwt-decoded.pdf"}
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
