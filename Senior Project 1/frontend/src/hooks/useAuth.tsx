'use client'

import React, { useState, useEffect, createContext, useContext, ReactNode } from 'react'
import { apiClient } from '@/lib/api'

interface User {
  id: string
  email: string
  full_name: string
  role: string
  phone?: string
  department?: string
  student_id?: string
  employee_id?: string
  is_active: boolean
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (userData: any) => Promise<void>
  logout: () => Promise<void>
  updateProfile: (profileData: any) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps): JSX.Element {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async (): Promise<void> => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null
      if (token) {
        apiClient.setToken(token)
        const profile = await apiClient.getProfile()
        setUser(profile as User)
      }
    } catch (error) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('access_token')
      }
      apiClient.clearToken()
    } finally {
      setLoading(false)
    }
  }

  const login = async (email: string, password: string): Promise<void> => {
    const response = await apiClient.login({ email, password })
    setUser((response as any).user)
  }

  const register = async (userData: any): Promise<void> => {
    const response = await apiClient.register(userData)
    if ((response as any).access_token) {
      setUser((response as any).user)
    }
  }

  const logout = async (): Promise<void> => {
    try {
      await apiClient.logout()
    } catch (error) {
      console.error('Logout error:', error)
    }
    setUser(null)
  }

  const updateProfile = async (profileData: any): Promise<void> => {
    const updatedUser = await apiClient.updateProfile(profileData)
    setUser(updatedUser as User)
  }

  const contextValue: AuthContextType = {
    user,
    loading,
    login,
    register,
    logout,
    updateProfile,
  }

  return React.createElement(
    AuthContext.Provider,
    { value: contextValue },
    children
  )
}