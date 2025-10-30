# Dashboard Layout Components

A comprehensive dashboard layout system with fixed header, sidebar navigation, and responsive design.

## Features

- ✅ **Fixed Header**: Always visible header with user info and logout
- ✅ **Sidebar Navigation**: Slide-out navigation menu with role-based items
- ✅ **Responsive Design**: Works on all screen sizes
- ✅ **Keyboard Navigation**: Full keyboard accessibility support
- ✅ **Performance Optimized**: Memoized components and optimized re-renders
- ✅ **Type Safe**: Full TypeScript support with proper interfaces
- ✅ **Accessible**: WCAG compliant with proper ARIA attributes
- ✅ **Error Boundaries**: Graceful error handling
- ✅ **Testing**: Comprehensive test coverage

## Architecture

### Component Structure
```
dashboard/
├── components/
│   ├── dashboard-header.tsx       # Fixed header component
│   ├── sidebar-navigation.tsx     # Sidebar menu component
│   └── dashboard-error-boundary.tsx # Error boundary wrapper
├── hooks/
│   ├── use-sidebar-menu.ts        # Menu state management
│   └── use-logout.ts              # Logout functionality
├── types/
│   └── dashboard-types.ts         # TypeScript interfaces
├── constants/
│   └── layout-constants.ts        # Styling constants
├── __tests__/
│   └── dashboard-layout.test.tsx   # Component tests
├── dashboard-layout.tsx           # Main layout component
└── README.md                      # This file
```

### Custom Hooks

#### `useSidebarMenu()`
Manages sidebar menu state and interactions:
```typescript
const {
  isMenuOpen,
  menuRef,
  openMenu,
  closeMenu,
  toggleMenu,
  handleMenuKeyDown
} = useSidebarMenu()
```

#### `useLogout()`
Handles user logout with loading states:
```typescript
const {
  handleLogout,
  isLoggingOut
} = useLogout()
```

## Usage

### Basic Usage
```tsx
import { DashboardLayout } from '@/components/dashboard/dashboard-layout'

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <h1>Dashboard Content</h1>
      <p>Your dashboard content goes here</p>
    </DashboardLayout>
  )
}
```

### With Custom Styling
```tsx
<DashboardLayout
  className="custom-layout-class"
  headerClassName="custom-header-class"
  mainClassName="custom-main-class"
>
  <YourContent />
</DashboardLayout>
```

### With Error Boundary
```tsx
import { DashboardErrorBoundary } from '@/components/dashboard/components/dashboard-error-boundary'

<DashboardErrorBoundary>
  <DashboardLayout>
    <YourContent />
  </DashboardLayout>
</DashboardErrorBoundary>
```

## Component Props

### DashboardLayout
```typescript
interface DashboardLayoutProps {
  children: React.ReactNode
  className?: string        // Custom CSS classes for layout container
  headerClassName?: string  // Custom CSS classes for header
  mainClassName?: string    // Custom CSS classes for main content area
}
```

### DashboardHeader
```typescript
interface DashboardHeaderProps {
  displayName: string      // User's display name
  roleDisplay: string      // User's role (formatted)
  isLoggingOut: boolean    // Loading state for logout
  onLogout: () => void     // Logout handler
  className?: string       // Custom CSS classes
}
```

### SidebarNavigation
```typescript
interface SidebarNavigationProps {
  isMenuOpen: boolean                           // Menu open state
  navigationItems: NavigationItem[]             // Navigation items array
  menuRef: React.RefObject<HTMLDivElement>      // Menu container ref
  onToggleMenu: () => void                      // Toggle menu handler
  onCloseMenu: () => void                       // Close menu handler
  onMenuKeyDown: (event: React.KeyboardEvent) => void // Keyboard handler
}
```

## Styling

### CSS Classes
The layout uses Tailwind CSS with consistent design tokens:

- **Colors**: Orange theme (`orange-500`, `orange-600`)
- **Spacing**: Consistent padding and margins
- **Z-index**: Proper layering (header: 40, sidebar: 40, overlay: 30)
- **Transitions**: Smooth animations for interactions

### Customization
You can customize the layout by:

1. **Passing custom classes** via props
2. **Modifying constants** in `layout-constants.ts`
3. **Extending the theme** in your Tailwind config

## Accessibility

### Features
- ✅ **Keyboard Navigation**: Full keyboard support
- ✅ **Screen Reader Support**: Proper ARIA labels and roles
- ✅ **Focus Management**: Logical focus order
- ✅ **High Contrast**: Sufficient color contrast ratios
- ✅ **Semantic HTML**: Proper HTML structure

### Keyboard Shortcuts
- `Escape`: Close sidebar menu
- `Tab`: Navigate through interactive elements
- `Enter/Space`: Activate buttons and links

## Performance

### Optimizations
- **React.memo**: Prevents unnecessary re-renders
- **useMemo**: Memoizes computed values
- **useCallback**: Optimizes event handlers
- **Code Splitting**: Components are lazily loaded

### Bundle Size
The dashboard layout is optimized for minimal bundle impact:
- Core layout: ~15KB gzipped
- Dependencies: Shared with other components
- Tree-shaking: Unused code is eliminated

## Testing

### Test Coverage
- ✅ Component rendering
- ✅ User interactions
- ✅ Keyboard navigation
- ✅ Error states
- ✅ Accessibility compliance

### Running Tests
```bash
npm test dashboard-layout
```

## Migration Guide

### From Previous Version
If migrating from the old dashboard layout:

1. **Update imports**:
   ```typescript
   // Old
   import { DashboardLayout } from './dashboard-layout'
   
   // New
   import { DashboardLayout } from '@/components/dashboard/dashboard-layout'
   ```

2. **Props remain the same** - no breaking changes

3. **New features available**:
   - Error boundaries
   - Better performance
   - Enhanced accessibility

## Troubleshooting

### Common Issues

#### Menu not opening
- Check that `useNavigation` hook returns valid items
- Verify user authentication state
- Check console for JavaScript errors

#### Styling issues
- Ensure Tailwind CSS is properly configured
- Check for CSS conflicts
- Verify custom class names are valid

#### Performance issues
- Check for unnecessary re-renders in parent components
- Verify memoization is working correctly
- Use React DevTools Profiler

### Debug Mode
Enable debug logging:
```typescript
// In development
if (process.env.NODE_ENV === 'development') {
  console.log('Dashboard state:', { isMenuOpen, user, navigationItems })
}
```

## Contributing

### Development Setup
1. Clone the repository
2. Install dependencies: `npm install`
3. Start development server: `npm run dev`
4. Run tests: `npm test`

### Code Standards
- Use TypeScript for all new code
- Follow existing naming conventions
- Add tests for new features
- Update documentation

### Pull Request Process
1. Create feature branch
2. Implement changes with tests
3. Update documentation
4. Submit pull request
5. Address review feedback