import { createContext, useContext, useState, ReactNode } from 'react'
import { api } from '@/lib/api'

interface User {
  id: string
  name: string
  username: string
  role: string
}

interface AuthContextType {
  user: User | null
  login: (username: string, password: string) => Promise<void>
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const stored = sessionStorage.getItem('user')
  const [user, setUser] = useState<User | null>(stored ? JSON.parse(stored) : null)

  const login = async (username: string, password: string) => {
    const { data } = await api.post('/auth/login', { username, password })
    sessionStorage.setItem('token', data.token)
    sessionStorage.setItem('user', JSON.stringify(data.user))
    setUser(data.user)
  }

  const logout = async () => {
    try { await api.post('/auth/logout') } catch {}
    sessionStorage.removeItem('token')
    sessionStorage.removeItem('user')
    setUser(null)
    window.location.href = '/login'
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
