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
        
        // Extract role from user_metadata if it exists there
        const userData = profile as any
        if (userData.user_metadata?.role && !userData.role) {
          userData.role = userData.user_metadata.role
        }
        if (userData.user_metadata?.full_name && !userData.full_name) {
          userData.full_name = userData.user_metadata.full_name
        }
        if (userData.user_metadata?.phone && !userData.phone) {
          userData.phone = userData.user_metadata.phone
        }
        if (userData.user_metadata?.department && !userData.department) {
          userData.department = userData.user_metadata.department
        }
        if (userData.user_metadata?.student_id && !userData.student_id) {
          userData.student_id = userData.user_metadata.student_id
        }
        if (userData.user_metadata?.employee_id && !userData.employee_id) {
          userData.employee_id = userData.user_metadata.employee_id
        }
        
        setUser(userData as User)
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
    
    // Extract role from user_metadata if it exists there
    const userData = (response as any).user
    if (userData.user_metadata?.role && !userData.role) {
      userData.role = userData.user_metadata.role
    }
    if (userData.user_metadata?.full_name && !userData.full_name) {
      userData.full_name = userData.user_metadata.full_name
    }
    if (userData.user_metadata?.phone && !userData.phone) {
      userData.phone = userData.user_metadata.phone
    }
    if (userData.user_metadata?.department && !userData.department) {
      userData.department = userData.user_metadata.department
    }
    if (userData.user_metadata?.student_id && !userData.student_id) {
      userData.student_id = userData.user_metadata.student_id
    }
    if (userData.user_metadata?.employee_id && !userData.employee_id) {
      userData.employee_id = userData.user_metadata.employee_id
    }
    
    setUser(userData)
  }

  const register = async (userData: any): Promise<void> => {
    const response = await apiClient.register(userData)
    if ((response as any).access_token) {
      // Extract role from user_metadata if it exists there
      const user = (response as any).user
      if (user.user_metadata?.role && !user.role) {
        user.role = user.user_metadata.role
      }
      if (user.user_metadata?.full_name && !user.full_name) {
        user.full_name = user.user_metadata.full_name
      }
      if (user.user_metadata?.phone && !user.phone) {
        user.phone = user.user_metadata.phone
      }
      if (user.user_metadata?.department && !user.department) {
        user.department = user.user_metadata.department
      }
      if (user.user_metadata?.student_id && !user.student_id) {
        user.student_id = user.user_metadata.student_id
      }
      if (user.user_metadata?.employee_id && !user.employee_id) {
        user.employee_id = user.user_metadata.employee_id
      }
      
      setUser(user)
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