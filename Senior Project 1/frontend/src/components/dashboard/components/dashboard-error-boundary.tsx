'use client'

import { Component, ErrorInfo, ReactNode } from 'react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class DashboardErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Dashboard Error Boundary caught an error:', error, errorInfo)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="max-w-md w-full">
            <Alert variant="destructive">
              <AlertDescription>
                <div className="space-y-4">
                  <h3 className="font-semibold">Something went wrong with the dashboard</h3>
                  <p className="text-sm">
                    {this.state.error?.message || 'An unexpected error occurred'}
                  </p>
                  <div className="flex gap-2">
                    <Button 
                      onClick={this.handleReset}
                      variant="outline"
                      size="sm"
                    >
                      Try Again
                    </Button>
                    <Button 
                      onClick={() => window.location.reload()}
                      variant="outline"
                      size="sm"
                    >
                      Reload Page
                    </Button>
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}