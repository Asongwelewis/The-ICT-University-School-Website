/**
 * Custom hook for form validation with reusable validation rules.
 */
import { useState, useCallback } from 'react'

export interface ValidationRule {
  required?: boolean
  minLength?: number
  maxLength?: number
  pattern?: RegExp
  custom?: (value: string) => string | null
}

export interface ValidationRules {
  [key: string]: ValidationRule
}

export interface ValidationErrors {
  [key: string]: string
}

export function useFormValidation(rules: ValidationRules) {
  const [errors, setErrors] = useState<ValidationErrors>({})

  const validateField = useCallback((name: string, value: string): string | null => {
    const rule = rules[name]
    if (!rule) return null

    // Required validation
    if (rule.required && (!value || value.trim() === '')) {
      return `${name} is required`
    }

    // Skip other validations if field is empty and not required
    if (!value && !rule.required) return null

    // Min length validation
    if (rule.minLength && value.length < rule.minLength) {
      return `${name} must be at least ${rule.minLength} characters`
    }

    // Max length validation
    if (rule.maxLength && value.length > rule.maxLength) {
      return `${name} must be no more than ${rule.maxLength} characters`
    }

    // Pattern validation
    if (rule.pattern && !rule.pattern.test(value)) {
      return `${name} format is invalid`
    }

    // Custom validation
    if (rule.custom) {
      return rule.custom(value)
    }

    return null
  }, [rules])

  const validateForm = useCallback((formData: Record<string, string>): boolean => {
    const newErrors: ValidationErrors = {}
    let isValid = true

    Object.keys(rules).forEach(fieldName => {
      const error = validateField(fieldName, formData[fieldName] || '')
      if (error) {
        newErrors[fieldName] = error
        isValid = false
      }
    })

    setErrors(newErrors)
    return isValid
  }, [rules, validateField])

  const validateSingleField = useCallback((name: string, value: string) => {
    const error = validateField(name, value)
    setErrors(prev => ({
      ...prev,
      [name]: error || ''
    }))
    return !error
  }, [validateField])

  const clearErrors = useCallback(() => {
    setErrors({})
  }, [])

  const clearFieldError = useCallback((fieldName: string) => {
    setErrors(prev => ({
      ...prev,
      [fieldName]: ''
    }))
  }, [])

  return {
    errors,
    validateForm,
    validateSingleField,
    clearErrors,
    clearFieldError,
    hasErrors: Object.values(errors).some(error => error !== '')
  }
}

// Common validation rules
export const commonValidationRules = {
  email: {
    required: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    custom: (value: string) => {
      if (value && !value.includes('@')) {
        return 'Please enter a valid email address'
      }
      return null
    }
  },
  password: {
    required: true,
    minLength: 6,
    custom: (value: string) => {
      if (value && !/(?=.*[a-zA-Z])(?=.*\d)/.test(value)) {
        return 'Password must contain at least one letter and one number'
      }
      return null
    }
  },
  name: {
    required: true,
    minLength: 1,
    maxLength: 50,
    pattern: /^[a-zA-Z\s'-]+$/,
    custom: (value: string) => {
      if (value && value.trim().length < 2) {
        return 'Name must be at least 2 characters'
      }
      return null
    }
  },
  confirmPassword: (originalPassword: string) => ({
    required: true,
    custom: (value: string) => {
      if (value !== originalPassword) {
        return 'Passwords do not match'
      }
      return null
    }
  }),
  
  // School-specific validation rules
  studentId: {
    required: true,
    pattern: /^[A-Z]{2,3}\d{4,6}$/,
    custom: (value: string) => {
      if (value && !value.match(/^[A-Z]{2,3}\d{4,6}$/)) {
        return 'Student ID must be in format: ABC1234 or AB123456'
      }
      return null
    }
  },
  courseCode: {
    required: true,
    pattern: /^[A-Z]{2,4}\d{3,4}$/,
    custom: (value: string) => {
      if (value && !value.match(/^[A-Z]{2,4}\d{3,4}$/)) {
        return 'Course code must be in format: CS101 or MATH1234'
      }
      return null
    }
  },
  grade: {
    required: true,
    pattern: /^(100|[0-9]{1,2})(\.[0-9]{1,2})?$/,
    custom: (value: string) => {
      const numValue = parseFloat(value)
      if (isNaN(numValue) || numValue < 0 || numValue > 100) {
        return 'Grade must be between 0 and 100'
      }
      return null
    }
  },
  phoneNumber: {
    required: false,
    pattern: /^[\+]?[1-9][\d]{0,15}$/,
    custom: (value: string) => {
      if (value && !value.match(/^[\+]?[1-9][\d]{0,15}$/)) {
        return 'Please enter a valid phone number'
      }
      return null
    }
  }
}