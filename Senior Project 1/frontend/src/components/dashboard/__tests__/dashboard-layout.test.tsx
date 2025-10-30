import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { DashboardLayout } from '../dashboard-layout'
import { useAuth } from '@/hooks/useAuth'
import { useNavigation } from '@/hooks/use-navigation'

// Mock the hooks
jest.mock('@/hooks/useAuth')
jest.mock('@/hooks/use-navigation')
jest.mock('@/hooks/use-toast')

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>
const mockUseNavigation = useNavigation as jest.MockedFunction<typeof useNavigation>

const mockUser = {
  id: '1',
  email: 'test@example.com',
  full_name: 'Test User',
  role: 'student'
}

const mockNavigationItems = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: () => <div>Icon</div>,
    description: 'Main dashboard'
  }
]

describe('DashboardLayout', () => {
  beforeEach(() => {
    mockUseAuth.mockReturnValue({
      user: mockUser,
      logout: jest.fn()
    } as any)

    mockUseNavigation.mockReturnValue(mockNavigationItems)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('renders user information correctly', () => {
    render(
      <DashboardLayout>
        <div>Test Content</div>
      </DashboardLayout>
    )

    expect(screen.getByText('Welcome, Test User')).toBeInTheDocument()
    expect(screen.getByText('(student)')).toBeInTheDocument()
  })

  it('opens and closes sidebar menu', async () => {
    render(
      <DashboardLayout>
        <div>Test Content</div>
      </DashboardLayout>
    )

    const menuButton = screen.getByLabelText('Navigation menu')
    
    // Menu should be closed initially
    expect(screen.queryByText('Navigation')).not.toBeInTheDocument()
    
    // Open menu
    fireEvent.click(menuButton)
    await waitFor(() => {
      expect(screen.getByText('Navigation')).toBeInTheDocument()
    })
    
    // Close menu by clicking overlay
    const overlay = screen.getByRole('button', { hidden: true })
    fireEvent.click(overlay)
    await waitFor(() => {
      expect(screen.queryByText('Navigation')).not.toBeInTheDocument()
    })
  })

  it('handles keyboard navigation', async () => {
    render(
      <DashboardLayout>
        <div>Test Content</div>
      </DashboardLayout>
    )

    const menuButton = screen.getByLabelText('Navigation menu')
    
    // Open menu
    fireEvent.click(menuButton)
    await waitFor(() => {
      expect(screen.getByText('Navigation')).toBeInTheDocument()
    })
    
    // Close with Escape key
    fireEvent.keyDown(menuButton, { key: 'Escape' })
    await waitFor(() => {
      expect(screen.queryByText('Navigation')).not.toBeInTheDocument()
    })
  })

  it('renders children content', () => {
    render(
      <DashboardLayout>
        <div data-testid="test-content">Test Content</div>
      </DashboardLayout>
    )

    expect(screen.getByTestId('test-content')).toBeInTheDocument()
  })

  it('applies custom class names', () => {
    const { container } = render(
      <DashboardLayout 
        className="custom-layout"
        headerClassName="custom-header"
        mainClassName="custom-main"
      >
        <div>Test Content</div>
      </DashboardLayout>
    )

    expect(container.firstChild).toHaveClass('custom-layout')
  })
})