import { useState, useCallback, useRef } from 'react'
import { api } from '../utils/api'

export function useJwt() {
  const [token,      setToken]      = useState('')
  const [decoded,    setDecoded]    = useState(null)
  const [verifyRes,  setVerifyRes]  = useState(null)
  const [signedToken,setSignedToken]= useState('')
  const [error,      setError]      = useState('')
  const [loading,    setLoading]    = useState(false)
  const debounceRef = useRef(null)

  const decodeToken = useCallback(async (t) => {
    if (!t.trim()) { setDecoded(null); setError(''); return }
    setLoading(true)
    try {
      const result = await api.decode(t.trim())
      setDecoded(result)
      setError('')
    } catch (e) {
      setError(e.message)
      setDecoded(null)
    } finally { setLoading(false) }
  }, [])

  const handleTokenChange = useCallback((val) => {
    setToken(val)
    setVerifyRes(null)
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => decodeToken(val), 300)
  }, [decodeToken])

  const verifyToken = useCallback(async (secret, algorithm = 'HS256', publicKey = null) => {
    if (!token || (!secret && !publicKey)) return
    setLoading(true)
    try {
      const result = await api.verify(token, secret, algorithm, publicKey)
      setVerifyRes(result)
    } catch (e) {
      setError(e.message)
    } finally { setLoading(false) }
  }, [token])

  const signToken = useCallback(async (payload, secret, algorithm, expiresIn) => {
    setLoading(true)
    try {
      const result = await api.sign(payload, secret, algorithm, expiresIn)
      setSignedToken(result.token)
      handleTokenChange(result.token)
      return result
    } catch (e) {
      setError(e.message)
    } finally { setLoading(false) }
  }, [handleTokenChange])

  return {
    token, decoded, verifyRes, signedToken, error, loading,
    handleTokenChange, verifyToken, signToken, setToken: handleTokenChange,
  }
}
