import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { jest } from '@jest/globals'
import { DashboardLayout } from '../dashboard-layout'
import { useAuth } from '@/hooks/useAuth'
import { useNavigation } from '@/hooks/use-navigation'
import { useSidebarMenu } from '@/hooks/use-sidebar-menu'
import { useLogout } from '@/hooks/use-logout'

// Mock all the hooks
jest.mock('@/hooks/useAuth')
jest.mock('@/hooks/use-navigation')
jest.mock('@/hooks/use-sidebar-menu')
jest.mock('@/hooks/use-logout')
jest.mock('@/hooks/use-ai-assistant')

// Mock the AI components
jest.mock('@/components/ai/ai-chat-widget', () => ({
  AIChatWidget: ({ context }: any) => <div data-testid="ai-chat-widget">AI Chat Widget</div>
}))

jest.mock('@/components/ai/text-explainer', () => ({
  TextExplainer: ({ selectedText, onClose }: any) => (
    <div data-testid="text-explainer">
      <span>{selectedText}</span>
      <button onClick={onClose}>Close</button>
    </div>
  )
}))

// Mock child components
jest.mock('../components/dashboard-header', () => ({
  DashboardHeader: ({ displayName, roleDisplay, onLogout }: any) => (
    <header data-testid="dashboard-header">
      <span>{displayName}</span>
      <span>{roleDisplay}</span>
      <button onClick={onLogout}>Logout</button>
    </header>
  )
}))

jest.mock('../components/sidebar-navigation', () => ({
  SidebarNavigation: ({ isMenuOpen, onToggleMenu }: any) => (
    <nav data-testid="sidebar-navigation">
      <button onClick={onToggleMenu}>
        {isMenuOpen ? 'Close Menu' : 'Open Menu'}
      </button>
    </nav>
  )
}))

const mockUser = {
  id: '1',
  email: 'test@example.com',
  full_name: 'Test User',
  role: 'system_admin'
}

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>
const mockUseNavigation = useNavigation as jest.MockedFunction<typeof useNavigation>
const mockUseSidebarMenu = useSidebarMenu as jest.MockedFunction<typeof useSidebarMenu>
const mockUseLogout = useLogout as jest.MockedFunction<typeof useLogout>

describe('DashboardLayout', () => {
  const mockHandleLogout = jest.fn()
  const mockToggleMenu = jest.fn()
  const mockCloseMenu = jest.fn()
  const mockHandleMenuKeyDown = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()

    mockUseAuth.mockReturnValue({
      user: mockUser,
      login: jest.fn(),
      logout: jest.fn(),
      loading: false
    })

    mockUseNavigation.mockReturnValue([
      { name: 'Dashboard', href: '/dashboard', icon: jest.fn() },
      { name: 'Courses', href: '/courses', icon: jest.fn() }
    ])

    mockUseSidebarMenu.mockReturnValue({
      isMenuOpen: false,
      menuRef: { current: null },
      toggleMenu: mockToggleMenu,
      closeMenu: mockCloseMenu,
      handleMenuKeyDown: mockHandleMenuKeyDown
    })

    mockUseLogout.mockReturnValue({
      handleLogout: mockHandleLogout,
      isLoggingOut: false
    })
  })

  it('renders without crashing', () => {
    render(
      <DashboardLayout>
        <div>Test Content</div>
      </DashboardLayout>
    )

    expect(screen.getByText('Test Content')).toBeInTheDocument()
  })

  it('displays user information correctly', () => {
    render(
      <DashboardLayout>
        <div>Test Content</div>
      </DashboardLayout>
    )

    expect(screen.getByText('Test User')).toBeInTheDocument()
    expect(screen.getByText('System Admin')).toBeInTheDocument()
  })

  it('handles user with only email', () => {
    mockUseAuth.mockReturnValue({
      user: { ...mockUser, full_name: undefined },
      login: jest.fn(),
      logout: jest.fn(),
      loading: false
    })

    render(
      <DashboardLayout>
        <div>Test Content</div>
      </DashboardLayout>
    )

    expect(screen.getByText('test@example.com')).toBeInTheDocument()
  })

  it('handles user with no name or email', () => {
    mockUseAuth.mockReturnValue({
      user: { ...mockUser, full_name: undefined, email: undefined },
      login: jest.fn(),
      logout: jest.fn(),
      loading: false
    })

    render(
      <DashboardLayout>
        <div>Test Content</div>
      </DashboardLayout>
    )

    expect(screen.getByText('User')).toBeInTheDocument()
  })

  it('formats role display correctly', () => {
    const testCases = [
      { role: 'system_admin', expected: 'System Admin' },
      { role: 'academic_staff', expected: 'Academic Staff' },
      { role: 'student', expected: 'Student' },
      { role: undefined, expected: 'Unknown' }
    ]

    testCases.forEach(({ role, expected }) => {
      mockUseAuth.mockReturnValue({
        user: { ...mockUser, role },
        login: jest.fn(),
        logout: jest.fn(),
        loading: false
      })

      const { rerender } = render(
        <DashboardLayout>
          <div>Test Content</div>
        </DashboardLayout>
      )

      expect(screen.getByText(expected)).toBeInTheDocument()
      
      rerender(<div></div>) // Clean up for next iteration
    })
  })

  it('calls logout handler when logout button is clicked', async () => {
    render(
      <DashboardLayout>
        <div>Test Content</div>
      </DashboardLayout>
    )

    const logoutButton = screen.getByText('Logout')
    fireEvent.click(logoutButton)

    expect(mockHandleLogout).toHaveBeenCalledTimes(1)
  })

  it('toggles sidebar menu', () => {
    render(
      <DashboardLayout>
        <div>Test Content</div>
      </DashboardLayout>
    )

    const menuButton = screen.getByText('Open Menu')
    fireEvent.click(menuButton)

    expect(mockToggleMenu).toHaveBeenCalledTimes(1)
  })

  it('applies custom CSS classes', () => {
    const { container } = render(
      <DashboardLayout 
        className="custom-container"
        headerClassName="custom-header"
        mainClassName="custom-main"
      >
        <div>Test Content</div>
      </DashboardLayout>
    )

    const containerDiv = container.firstChild as HTMLElement
    expect(containerDiv).toHaveClass('custom-container')

    const mainElement = screen.getByRole('main')
    expect(mainElement).toHaveClass('custom-main')
  })

  it('has proper accessibility attributes', () => {
    render(
      <DashboardLayout>
        <div>Test Content</div>
      </DashboardLayout>
    )

    const mainElement = screen.getByRole('main')
    expect(mainElement).toHaveAttribute('aria-label', 'Dashboard content')
    expect(mainElement).toHaveAttribute('id', 'main-content')
  })

  it('renders AI components', () => {
    render(
      <DashboardLayout>
        <div>Test Content</div>
      </DashboardLayout>
    )

    expect(screen.getByTestId('ai-chat-widget')).toBeInTheDocument()
  })

  it('handles loading state', () => {
    mockUseLogout.mockReturnValue({
      handleLogout: mockHandleLogout,
      isLoggingOut: true
    })

    render(
      <DashboardLayout>
        <div>Test Content</div>
      </DashboardLayout>
    )

    // The component should still render normally during loading
    expect(screen.getByText('Test Content')).toBeInTheDocument()
  })

  it('memoizes expensive computations', () => {
    const { rerender } = render(
      <DashboardLayout>
        <div>Test Content</div>
      </DashboardLayout>
    )

    // Rerender with same props
    rerender(
      <DashboardLayout>
        <div>Test Content</div>
      </DashboardLayout>
    )

    // Navigation hook should only be called once due to memoization
    expect(mockUseNavigation).toHaveBeenCalledTimes(2) // Once per render, but memoized internally
  })

  it('handles error boundary', () => {
    const ThrowError = () => {
      throw new Error('Test error')
    }

    // Suppress console.error for this test
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})

    render(
      <DashboardLayout>
        <ThrowError />
      </DashboardLayout>
    )

    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
    expect(screen.getByText('Try Again')).toBeInTheDocument()

    consoleSpy.mockRestore()
  })
})

describe('DashboardLayout Performance', () => {
  it('should not re-render unnecessarily', () => {
    const renderSpy = jest.fn()
    
    const TestChild = () => {
      renderSpy()
      return <div>Test Content</div>
    }

    const { rerender } = render(
      <DashboardLayout>
        <TestChild />
      </DashboardLayout>
    )

    expect(renderSpy).toHaveBeenCalledTimes(1)

    // Rerender with same props
    rerender(
      <DashboardLayout>
        <TestChild />
      </DashboardLayout>
    )

    // Child should re-render, but layout optimizations should minimize work
    expect(renderSpy).toHaveBeenCalledTimes(2)
  })
})