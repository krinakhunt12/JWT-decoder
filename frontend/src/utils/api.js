const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

async function call(path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.detail || 'API error')
  return data
}

export const api = {
  decode: (token)                     => call('/decode', { token }),
  verify: (token, secret, algorithm, public_key = null) =>
    call('/verify', { token, secret, algorithm, public_key }),
  sign:   (payload, secret, algorithm, expires_in) =>
    call('/sign', { payload, secret, algorithm, expires_in }),
}
