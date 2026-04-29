import { createContext, useContext, useState, useEffect, useRef } from 'react'
import { authAPI } from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const heartbeatRef = useRef(null)

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (token) {
      authAPI.me()
        .then(res => setUser(res.data))
        .catch(() => {
          localStorage.clear()
          setUser(null)
        })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  // Heartbeat: ping every 60s to mark user as online
  useEffect(() => {
    if (user) {
      authAPI.ping().catch(() => {}) // immediate ping on login
      heartbeatRef.current = setInterval(() => {
        authAPI.ping().catch(() => {})
      }, 60_000)
    }
    return () => clearInterval(heartbeatRef.current)
  }, [user?.id])

  const login = (userData, tokens) => {
    localStorage.setItem('access_token', tokens.access)
    localStorage.setItem('refresh_token', tokens.refresh)
    setUser(userData)
  }

  const logout = () => {
    clearInterval(heartbeatRef.current)
    localStorage.clear()
    setUser(null)
  }

  const updateUser = (newData) => setUser(prev => ({ ...prev, ...newData }))

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
