import { useState, useRef, useEffect, useCallback } from 'react'

interface UseSidebarMenuOptions {
  onMenuClose?: () => void
}

export function useSidebarMenu(options: UseSidebarMenuOptions = {}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false)
        options.onMenuClose?.()
      }
    }

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isMenuOpen, options])

  // Handle keyboard navigation
  const handleMenuKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      setIsMenuOpen(false)
      options.onMenuClose?.()
    }
  }, [options])

  const openMenu = useCallback(() => setIsMenuOpen(true), [])
  const closeMenu = useCallback(() => {
    setIsMenuOpen(false)
    options.onMenuClose?.()
  }, [options])
  const toggleMenu = useCallback(() => setIsMenuOpen(prev => !prev), [])

  return {
    isMenuOpen,
    menuRef,
    openMenu,
    closeMenu,
    toggleMenu,
    handleMenuKeyDown
  }
}