'use client'

import { memo } from 'react'
import { Loader2 } from 'lucide-react'
import { DashboardHeaderProps } from '../types/dashboard-types'

export const DashboardHeader = memo<DashboardHeaderProps>(function DashboardHeader({ 
  displayName, 
  roleDisplay, 
  isLoggingOut, 
  onLogout,
  className = ""
}) {
  return (
    <header 
      className={`fixed top-0 left-0 right-0 bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg z-40 ${className}`}
      role="banner"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-3">
          <div>
            <h1 className="text-2xl font-bold">ICT University</h1>
            <p className="text-orange-100">School Management System</p>
          </div>
          <nav role="navigation" aria-label="User menu">
            <div className="flex items-center space-x-4">
              <div className="text-right" aria-label={`Logged in as ${displayName}`}>
                <span className="text-orange-100 block">Welcome, {displayName}</span>
                <span className="text-orange-200 text-sm capitalize">({roleDisplay})</span>
              </div>
              <button 
                onClick={onLogout}
                disabled={isLoggingOut}
                aria-label="Sign out of your account"
                className="bg-white/20 hover:bg-white/30 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
              >
                {isLoggingOut && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
                {isLoggingOut ? 'Signing Out...' : 'Sign Out'}
              </button>
            </div>
          </nav>
        </div>
      </div>
    </header>
  )
})