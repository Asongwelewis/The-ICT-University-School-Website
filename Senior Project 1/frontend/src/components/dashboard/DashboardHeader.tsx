'use client'

import { Badge } from '@/components/ui/badge'

interface User {
  id: string
  email: string
  full_name?: string
  role: string
}

interface DashboardHeaderProps {
  user: User | null
  onLogout: () => void
}

export function DashboardHeader({ user, onLogout }: DashboardHeaderProps) {
  const formatRole = (role: string) => {
    return role.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  return (
    <header className="bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div>
            <h1 className="text-2xl font-bold">ICT University</h1>
            <p className="text-orange-100">School Management System</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <span className="text-orange-100 block">
                Welcome, {user?.full_name || user?.email}
              </span>
              <Badge variant="secondary" size="sm" className="mt-1">
                {user?.role ? formatRole(user.role) : 'Unknown'}
              </Badge>
            </div>
            <button 
              onClick={onLogout}
              className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-white/50"
              aria-label="Sign out"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}