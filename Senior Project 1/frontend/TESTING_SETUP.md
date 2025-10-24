# Testing Setup Guide

## 🧪 **Required Testing Dependencies**

To enable comprehensive testing for the dashboard components, install these dependencies:

### **Install Testing Libraries**
```bash
npm install --save-dev @testing-library/react @testing-library/jest-dom @testing-library/user-event
npm install --save-dev @types/jest jest jest-environment-jsdom
```

### **Update package.json Scripts**
Add these scripts to your `package.json`:

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  }
}
```

## 📋 **Jest Configuration**

The project already has `jest.config.js` and `jest.setup.js` configured. After installing dependencies, tests will work properly.

## 🎯 **Test Files Ready to Use**

Once dependencies are installed, you can create test files like:

### **Dashboard Components Test Example**
```typescript
// src/components/dashboard/__tests__/DashboardComponents.test.tsx
import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { DashboardStatCard } from '../DashboardComponents'

// Mock the icon map
jest.mock('../IconMap', () => ({
  getIcon: jest.fn((iconName: string) => {
    const MockIcon = () => <div data-testid={`icon-${iconName}`} />
    return MockIcon
  })
}))

describe('DashboardStatCard', () => {
  const mockStat = {
    id: 'test-stat',
    title: 'Test Stat',
    value: 100,
    icon: 'Users',
    color: 'blue' as const,
    change: '+10% from last month',
    trend: 'up' as const
  }

  it('renders stat card with all data', () => {
    render(<DashboardStatCard stat={mockStat} />)
    
    expect(screen.getByText('Test Stat')).toBeInTheDocument()
    expect(screen.getByText('100')).toBeInTheDocument()
    expect(screen.getByText('+10% from last month')).toBeInTheDocument()
    expect(screen.getByText('Trending up')).toBeInTheDocument()
    expect(screen.getByTestId('icon-Users')).toBeInTheDocument()
  })
})
```

## 🚀 **Quick Setup Commands**

Run these commands to set up testing:

```bash
# Install all testing dependencies
npm install --save-dev @testing-library/react @testing-library/jest-dom @testing-library/user-event @types/jest jest jest-environment-jsdom

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

## 📊 **Testing Best Practices**

### **Component Testing**
- Test component rendering with different props
- Test user interactions (clicks, form submissions)
- Test edge cases (missing data, error states)
- Test accessibility features

### **Hook Testing**
- Test custom hooks with different scenarios
- Test error handling in hooks
- Test async operations

### **Integration Testing**
- Test component interactions
- Test data flow between components
- Test API integration points

## 🔧 **Current Status**

- ✅ Jest configuration files exist
- ✅ Test utilities are available
- ❌ Testing dependencies need to be installed
- ⚠️ Test files are temporarily excluded from TypeScript compilation
- ❌ Test files need to be re-enabled after dependency installation

## 🔄 **Re-enabling Test Files**

After installing testing dependencies, you'll need to re-enable test files in TypeScript:

1. **Remove test exclusions from `tsconfig.json`**:
```json
{
  "exclude": ["node_modules"]
}
```

2. **Or use the separate type-check config**:
```bash
npm run type-check  # Uses tsconfig.typecheck.json which excludes tests
```

## 📝 **Next Steps**

1. Install testing dependencies using the commands above
2. Create test files for critical components
3. Set up CI/CD pipeline to run tests automatically
4. Add coverage reporting to ensure good test coverage

Once dependencies are installed, the dashboard components will have comprehensive test coverage ensuring reliability and maintainability.