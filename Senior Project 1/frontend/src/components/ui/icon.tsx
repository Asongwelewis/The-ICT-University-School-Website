/**
 * Universal Icon Component for ICT University ERP System
 * 
 * Features:
 * - Type-safe icon selection
 * - Consistent sizing and styling
 * - Accessibility support
 * - Loading states
 * - Error boundaries
 */

import React, { Suspense, memo, forwardRef } from 'react'
import { cn } from '@/lib/utils'
import { 
  IconName, 
  IconSize, 
  IconColor, 
  getIcon, 
  useIcon,
  iconTheme,
  IconComponent,
  IconProps
} from '@/lib/icons'

interface BaseIconProps extends Omit<IconProps, 'size'> {
  /** Icon name from the registry */
  name: IconName
  /** Icon size using predefined scale */
  size?: IconSize
  /** Icon color using theme colors */
  color?: IconColor
  /** Additional CSS classes */
  className?: string
  /** Accessibility label */
  'aria-label'?: string
  /** Whether the icon is decorative (hidden from screen readers) */
  decorative?: boolean
  /** Loading state */
  loading?: boolean
  /** Fallback icon when the requested icon fails to load */
  fallback?: IconName
}

/**
 * Loading placeholder component
 */
const IconSkeleton = memo(({ size = 'md', className }: { size?: IconSize; className?: string }) => (
  <div 
    className={cn(
      'animate-pulse bg-muted rounded',
      `w-${iconTheme.sizes[size]} h-${iconTheme.sizes[size]}`,
      className
    )}
    aria-hidden="true"
  />
))
IconSkeleton.displayName = 'IconSkeleton'

/**
 * Error fallback component
 */
const IconError = memo(({ size = 'md', className }: { size?: IconSize; className?: string }) => {
  const AlertCircle = getIcon('alertCircle')
  return (
    <AlertCircle 
      className={cn(
        'text-destructive',
        `w-${iconTheme.sizes[size]} h-${iconTheme.sizes[size]}`,
        className
      )}
      aria-label="Icon failed to load"
    />
  )
})
IconError.displayName = 'IconError'

/**
 * Main Icon component with comprehensive features
 */
export const Icon = memo(forwardRef<SVGSVGElement, BaseIconProps>(({
  name,
  size = 'md',
  color = 'primary',
  className,
  loading = false,
  fallback = 'alertCircle',
  decorative = false,
  'aria-label': ariaLabel,
  ...props
}, ref) => {
  const { Icon: IconComponent, metadata, isValid } = useIcon(name)

  // Handle loading state
  if (loading) {
    return <IconSkeleton size={size} className={className} />
  }

  // Handle invalid icon
  if (!isValid) {
    console.warn(`Icon "${name}" not found, using fallback "${fallback}"`)
    const FallbackIcon = getIcon(fallback)
    return (
      <FallbackIcon
        ref={ref}
        className={cn(
          `w-${iconTheme.sizes[size]} h-${iconTheme.sizes[size]}`,
          iconTheme.colors[color],
          className
        )}
        aria-label={ariaLabel || `${fallback} icon`}
        aria-hidden={decorative}
        {...props}
      />
    )
  }

  // Determine accessibility attributes
  const accessibilityProps = decorative 
    ? { 'aria-hidden': true }
    : { 
        'aria-label': ariaLabel || metadata?.description || `${name} icon`,
        role: 'img'
      }

  return (
    <IconComponent
      ref={ref}
      className={cn(
        `w-${iconTheme.sizes[size]} h-${iconTheme.sizes[size]}`,
        iconTheme.colors[color],
        className
      )}
      {...accessibilityProps}
      {...props}
    />
  )
}))
Icon.displayName = 'Icon'

/**
 * Specialized icon components for common use cases
 */

/**
 * Status icon with predefined color mapping
 */
export const StatusIcon = memo(({ 
  status, 
  size = 'md', 
  className,
  ...props 
}: {
  status: 'success' | 'warning' | 'error' | 'info' | 'loading'
  size?: IconSize
  className?: string
} & Omit<BaseIconProps, 'name' | 'color' | 'size'>) => {
  const statusConfig = {
    success: { name: 'checkCircle' as IconName, color: 'success' as IconColor },
    warning: { name: 'alertCircle' as IconName, color: 'warning' as IconColor },
    error: { name: 'alertCircle' as IconName, color: 'error' as IconColor },
    info: { name: 'alertCircle' as IconName, color: 'info' as IconColor },
    loading: { name: 'loader2' as IconName, color: 'muted' as IconColor }
  }

  const config = statusConfig[status]
  
  return (
    <Icon
      name={config.name}
      color={config.color}
      size={size}
      className={cn(
        status === 'loading' && 'animate-spin',
        className
      )}
      {...props}
    />
  )
})
StatusIcon.displayName = 'StatusIcon'

/**
 * Role icon component
 */
export const RoleIcon = memo(({ 
  role, 
  size = 'md', 
  className,
  ...props 
}: {
  role: string
  size?: IconSize
  className?: string
} & Omit<BaseIconProps, 'name' | 'size'>) => {
  const roleIconMap: Record<string, IconName> = {
    student: 'graduationCap',
    academic_staff: 'bookOpen',
    staff: 'briefcase',
    system_admin: 'shield',
    admin: 'settings',
    hr_personnel: 'users',
    finance_staff: 'dollarSign',
    marketing_team: 'target'
  }

  const iconName = roleIconMap[role] || 'user'

  return (
    <Icon
      name={iconName}
      size={size}
      className={className}
      aria-label={`${role} role icon`}
      {...props}
    />
  )
})
RoleIcon.displayName = 'RoleIcon'

/**
 * Interactive icon button component
 */
export const IconButton = memo(forwardRef<HTMLButtonElement, {
  icon: IconName
  size?: IconSize
  variant?: 'default' | 'ghost' | 'outline'
  disabled?: boolean
  loading?: boolean
  'aria-label': string
  onClick?: () => void
  className?: string
}>(({
  icon,
  size = 'md',
  variant = 'default',
  disabled = false,
  loading = false,
  'aria-label': ariaLabel,
  onClick,
  className,
  ...props
}, ref) => {
  const variantStyles = {
    default: 'bg-primary text-primary-foreground hover:bg-primary/90',
    ghost: 'hover:bg-accent hover:text-accent-foreground',
    outline: 'border border-input hover:bg-accent hover:text-accent-foreground'
  }

  return (
    <button
      ref={ref}
      type="button"
      disabled={disabled || loading}
      onClick={onClick}
      aria-label={ariaLabel}
      className={cn(
        'inline-flex items-center justify-center rounded-md transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        'disabled:pointer-events-none disabled:opacity-50',
        `p-${size === 'xs' ? '1' : size === 'sm' ? '1.5' : '2'}`,
        variantStyles[variant],
        className
      )}
      {...props}
    >
      <Icon
        name={loading ? 'loader2' : icon}
        size={size}
        decorative
        className={loading ? 'animate-spin' : undefined}
      />
    </button>
  )
}))
IconButton.displayName = 'IconButton'

/**
 * Icon with text component for labels and menu items
 */
export const IconWithText = memo(({
  icon,
  children,
  iconSize = 'md',
  spacing = 'md',
  direction = 'horizontal',
  className,
  ...props
}: {
  icon: IconName
  children: React.ReactNode
  iconSize?: IconSize
  spacing?: 'sm' | 'md' | 'lg'
  direction?: 'horizontal' | 'vertical'
  className?: string
} & Omit<BaseIconProps, 'name' | 'size'>) => {
  const spacingMap = {
    sm: direction === 'horizontal' ? 'gap-1' : 'gap-1',
    md: direction === 'horizontal' ? 'gap-2' : 'gap-2',
    lg: direction === 'horizontal' ? 'gap-3' : 'gap-3'
  }

  return (
    <div
      className={cn(
        'flex items-center',
        direction === 'vertical' ? 'flex-col' : 'flex-row',
        spacingMap[spacing],
        className
      )}
    >
      <Icon name={icon} size={iconSize} {...props} />
      <span>{children}</span>
    </div>
  )
})
IconWithText.displayName = 'IconWithText'

// Export types for external use
export type { BaseIconProps as IconProps }