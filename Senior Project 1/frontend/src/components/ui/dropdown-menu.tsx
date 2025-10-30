/**
 * Reusable Dropdown Menu Component
 * 
 * Features:
 * - Click outside to close
 * - Keyboard navigation (Escape to close)
 * - Proper ARIA attributes
 * - Customizable positioning
 * - Animation support
 */

'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { cn } from '@/lib/utils'

interface DropdownMenuProps {
  trigger: React.ReactNode
  children: React.ReactNode
  className?: string
  align?: 'left' | 'right' | 'center'
  sideOffset?: number
  onOpenChange?: (open: boolean) => void
  disabled?: boolean
}

interface DropdownMenuItemProps {
  children: React.ReactNode
  onClick?: () => void
  className?: string
  disabled?: boolean
  asChild?: boolean
}

/**
 * Main dropdown menu component
 */
export function DropdownMenu({ 
  trigger, 
  children, 
  className = '', 
  align = 'right',
  sideOffset = 8,
  onOpenChange,
  disabled = false
}: DropdownMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLDivElement>(null)

  const handleOpenChange = useCallback((open: boolean) => {
    setIsOpen(open)
    onOpenChange?.(open)
  }, [onOpenChange])

  // Close dropdown when clicking outside
  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (
      dropdownRef.current && 
      !dropdownRef.current.contains(event.target as Node) &&
      triggerRef.current &&
      !triggerRef.current.contains(event.target as Node)
    ) {
      handleOpenChange(false)
    }
  }, [handleOpenChange])

  // Handle keyboard navigation
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      handleOpenChange(false)
    }
  }, [handleOpenChange])

  // Set up event listeners
  useEffect(() => {
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleKeyDown as any)
      
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
        document.removeEventListener('keydown', handleKeyDown as any)
      }
    }
  }, [isOpen, handleClickOutside, handleKeyDown])

  // Calculate alignment classes
  const alignmentClasses = {
    left: 'left-0',
    right: 'right-0',
    center: 'left-1/2 -translate-x-1/2'
  }

  return (
    <div className={cn('relative', className)}>
      {/* Trigger */}
      <div
        ref={triggerRef}
        onClick={() => !disabled && handleOpenChange(!isOpen)}
        onKeyDown={handleKeyDown}
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-disabled={disabled}
        className={cn(
          'cursor-pointer',
          disabled && 'cursor-not-allowed opacity-50'
        )}
      >
        {trigger}
      </div>
      
      {/* Dropdown Content */}
      {isOpen && !disabled && (
        <div 
          ref={dropdownRef}
          className={cn(
            'absolute z-50 min-w-[8rem] overflow-hidden rounded-md border bg-white p-1 shadow-md animate-in fade-in-0 zoom-in-95',
            alignmentClasses[align]
          )}
          style={{ top: `calc(100% + ${sideOffset}px)` }}
          role="menu"
          aria-orientation="vertical"
        >
          <div onClick={() => handleOpenChange(false)}>
            {children}
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * Dropdown menu item component
 */
export function DropdownMenuItem({ 
  children, 
  onClick, 
  className = '',
  disabled = false,
  asChild = false
}: DropdownMenuItemProps) {
  const handleClick = useCallback(() => {
    if (!disabled) {
      onClick?.()
    }
  }, [onClick, disabled])

  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if ((event.key === 'Enter' || event.key === ' ') && !disabled) {
      event.preventDefault()
      onClick?.()
    }
  }, [onClick, disabled])

  if (asChild) {
    return <>{children}</>
  }

  return (
    <div
      className={cn(
        'relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors',
        'hover:bg-gray-100 focus:bg-gray-100',
        disabled && 'pointer-events-none opacity-50',
        className
      )}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role="menuitem"
      tabIndex={disabled ? -1 : 0}
      aria-disabled={disabled}
    >
      {children}
    </div>
  )
}

/**
 * Dropdown menu separator
 */
export function DropdownMenuSeparator({ className = '' }: { className?: string }) {
  return (
    <div 
      className={cn('-mx-1 my-1 h-px bg-gray-200', className)} 
      role="separator"
      aria-orientation="horizontal"
    />
  )
}

/**
 * Dropdown menu label
 */
export function DropdownMenuLabel({ 
  children, 
  className = '' 
}: { 
  children: React.ReactNode
  className?: string 
}) {
  return (
    <div 
      className={cn('px-2 py-1.5 text-sm font-semibold text-gray-900', className)}
      role="presentation"
    >
      {children}
    </div>
  )
}