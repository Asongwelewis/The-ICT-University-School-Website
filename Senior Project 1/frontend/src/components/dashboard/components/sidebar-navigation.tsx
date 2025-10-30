'use client'

import { memo } from 'react'
import { Menu } from 'lucide-react'
import Link from 'next/link'
import { SidebarNavigationProps } from '../types/dashboard-types'

export const SidebarNavigation = memo<SidebarNavigationProps>(function SidebarNavigation({
  isMenuOpen,
  navigationItems,
  menuRef,
  onToggleMenu,
  onCloseMenu,
  onMenuKeyDown
}: SidebarNavigationProps) {
  return (
    <>
      {/* Menu Toggle Button */}
      <div className="fixed top-0 left-0 z-50">
        <div className="relative" ref={menuRef}>
          <button
            onClick={onToggleMenu}
            onKeyDown={onMenuKeyDown}
            className="fixed top-4 left-4 bg-orange-500 hover:bg-orange-600 text-white p-3 rounded-full shadow-lg transition-colors z-50 focus:outline-none focus:ring-2 focus:ring-orange-300"
            aria-label="Navigation menu"
            aria-expanded={isMenuOpen}
            aria-haspopup="true"
          >
            <Menu className="h-5 w-5" />
          </button>
          
          {/* Sidebar Panel */}
          {isMenuOpen && (
            <div 
              className="fixed top-0 left-0 h-screen w-80 bg-white shadow-2xl border-r border-gray-200 z-40 transform transition-transform duration-300 ease-in-out"
              role="menu"
              aria-label="Navigation menu"
            >
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Navigation</h2>
              </div>
              <nav className="py-4" role="navigation">
                {navigationItems.map((item) => {
                  const IconComponent = item.icon
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="flex items-center gap-4 px-6 py-4 text-gray-700 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none transition-colors border-b border-gray-50"
                      onClick={onCloseMenu}
                      role="menuitem"
                      tabIndex={0}
                    >
                      <IconComponent className="h-5 w-5 text-gray-500" aria-hidden="true" />
                      <div>
                        <span className="font-medium">{item.name}</span>
                        {item.description && (
                          <p className="text-sm text-gray-500">{item.description}</p>
                        )}
                      </div>
                    </Link>
                  )
                })}
              </nav>
            </div>
          )}
        </div>
      </div>

      {/* Overlay */}
      {isMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={onCloseMenu}
          aria-hidden="true"
        />
      )}
    </>
  )
})