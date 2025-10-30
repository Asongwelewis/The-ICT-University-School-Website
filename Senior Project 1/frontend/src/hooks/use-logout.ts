import { useState, useCallback } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/use-toast'

export function useLogout() {
  const { logout } = useAuth()
  const { toast } = useToast()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleLogout = useCallback(async () => {
    setIsLoggingOut(true)
    try {
      await logout()
      toast({
        title: "Signed Out",
        description: "You have been successfully signed out.",
        variant: "default",
      })
    } catch (error) {
      console.error('Logout error:', error)
      toast({
        title: "Logout Failed",
        description: "There was an error signing you out. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoggingOut(false)
    }
  }, [logout, toast])

  return {
    handleLogout,
    isLoggingOut
  }
}