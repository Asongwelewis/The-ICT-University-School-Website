/**
 * Reusable form field component
 * Provides consistent styling and validation display
 */
import React from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

interface FormFieldProps {
  id: string
  label: string
  type?: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  required?: boolean
  disabled?: boolean
  error?: string
  icon?: React.ReactNode
  className?: string
  inputClassName?: string
  description?: string
}

export function FormField({
  id,
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  required = false,
  disabled = false,
  error,
  icon,
  className,
  inputClassName,
  description
}: FormFieldProps) {
  return (
    <div className={cn('space-y-2', className)}>
      <Label htmlFor={id} className="text-gray-700 font-medium">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-3 h-4 w-4 text-gray-400">
            {icon}
          </div>
        )}
        <Input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={cn(
            'h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500',
            icon && 'pl-10',
            error && 'border-red-300 focus:border-red-500 focus:ring-red-500',
            inputClassName
          )}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : description ? `${id}-description` : undefined}
        />
      </div>
      
      {description && !error && (
        <p id={`${id}-description`} className="text-sm text-gray-500">
          {description}
        </p>
      )}
      
      {error && (
        <p id={`${id}-error`} className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}

// Specialized form fields for common use cases
export function EmailField(props: Omit<FormFieldProps, 'type' | 'icon'>) {
  return (
    <FormField
      {...props}
      type="email"
      icon={<svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
      </svg>}
    />
  )
}

export function PasswordField(props: Omit<FormFieldProps, 'type' | 'icon'>) {
  return (
    <FormField
      {...props}
      type="password"
      icon={<svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>}
    />
  )
}

export function TextField(props: Omit<FormFieldProps, 'type' | 'icon'>) {
  return (
    <FormField
      {...props}
      type="text"
      icon={<svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>}
    />
  )
}