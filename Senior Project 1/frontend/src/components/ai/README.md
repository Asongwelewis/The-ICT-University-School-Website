# AI Chat Widget - Improved Architecture

## Overview

The AI Chat Widget has been completely refactored to follow modern React best practices, improve performance, and enhance maintainability. The new architecture separates concerns, uses custom hooks for state management, and provides better error handling.

## Architecture Improvements

### 1. **Separation of Concerns**

The original monolithic component has been split into:

- **Main Widget Component** (`ai-chat-widget-improved.tsx`) - UI orchestration and layout
- **Custom Hooks** - Business logic and state management
  - `useAIChat` - Chat message handling and API communication
  - `useAIStatus` - AI service status monitoring
- **Sub-components** - Reusable UI components
  - `ChatMessage` - Individual message rendering
  - `ChatInput` - Input handling with modern event management
  - `ChatStatusIndicator` - Status display and error handling

### 2. **Performance Optimizations**

- **Memoized Components**: All sub-components use `React.memo` to prevent unnecessary re-renders
- **Optimized Hooks**: Custom hooks use `useCallback` and `useMemo` appropriately
- **Efficient State Updates**: Reduced state updates and improved batching
- **Request Cancellation**: Automatic cleanup of ongoing requests

### 3. **Modern API Usage**

- **Replaced Deprecated APIs**: `onKeyPress` → `onKeyDown` with proper event handling
- **AbortController**: Proper request cancellation and cleanup
- **Modern Event Handling**: No deprecated event handlers

### 4. **Enhanced Error Handling**

- **Typed Errors**: Custom error classes with specific error codes
- **Retry Mechanisms**: Automatic retry with exponential backoff
- **User-Friendly Messages**: Clear error messages and recovery options
- **Graceful Degradation**: Widget remains functional even when AI is offline

## Usage

### Basic Usage

```tsx
import { AIChatWidget } from '@/components/ai/ai-chat-widget-improved';

function MyPage() {
  return (
    <div>
      {/* Your page content */}
      <AIChatWidget />
    </div>
  );
}
```

### Advanced Usage

```tsx
import { AIChatWidget } from '@/components/ai/ai-chat-widget-improved';

function CoursePage({ courseId }: { courseId: string }) {
  const context = {
    current_page: '/courses',
    course_id: courseId,
    user_id: 'user123'
  };

  return (
    <div>
      {/* Your page content */}
      <AIChatWidget
        context={context}
        position="bottom-left"
        defaultOpen={false}
        className="custom-widget-styles"
      />
    </div>
  );
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `context` | `ChatContext` | `undefined` | Context information for AI responses |
| `className` | `string` | `''` | Additional CSS classes |
| `defaultOpen` | `boolean` | `false` | Whether widget starts open |
| `position` | `'bottom-right' \| 'bottom-left' \| 'top-right' \| 'top-left'` | `'bottom-right'` | Widget position |

## Custom Hooks

### `useAIChat`

Manages chat messages, API communication, and conversation state.

```tsx
const {
  messages,
  isLoading,
  suggestions,
  sendMessage,
  clearMessages,
  retryLastMessage
} = useAIChat({
  context: { current_page: '/assignments' },
  maxHistoryLength: 20
});
```

### `useAIStatus`

Monitors AI service status with automatic health checks.

```tsx
const {
  status,
  service,
  isOnline,
  forceCheck,
  lastChecked,
  error
} = useAIStatus({
  checkInterval: 30000,
  retryAttempts: 3
});
```

## Components

### `ChatMessage`

Renders individual chat messages with proper styling and error states.

```tsx
<ChatMessage
  message={message}
  onRetry={handleRetry}
  showRetry={message.status === 'error'}
/>
```

### `ChatInput`

Modern input component with proper keyboard handling and validation.

```tsx
<ChatInput
  value={inputValue}
  onChange={setInputValue}
  onSend={handleSend}
  disabled={isLoading}
  placeholder="Ask me anything..."
  maxLength={1000}
  autoFocus
/>
```

### `ChatStatusIndicator`

Displays AI service status with retry options.

```tsx
<ChatStatusIndicator
  status={aiStatus}
  service="Gemini Pro"
  onRetry={forceCheck}
  compact={false}
/>
```

## Key Improvements

### 1. **Code Quality**

- ✅ **No Code Smells**: Eliminated long methods, complex conditionals
- ✅ **Single Responsibility**: Each component has one clear purpose
- ✅ **DRY Principle**: No duplicate code, reusable components
- ✅ **Type Safety**: Full TypeScript coverage with custom types

### 2. **Performance**

- ✅ **Memoization**: Prevents unnecessary re-renders
- ✅ **Efficient Updates**: Optimized state management
- ✅ **Request Cleanup**: Proper cleanup of ongoing requests
- ✅ **Lazy Loading**: Components load only when needed

### 3. **User Experience**

- ✅ **Better Error Handling**: Clear error messages and recovery
- ✅ **Accessibility**: Proper ARIA labels and keyboard navigation
- ✅ **Responsive Design**: Works on all screen sizes
- ✅ **Loading States**: Clear feedback during operations

### 4. **Developer Experience**

- ✅ **Better Testing**: Comprehensive test coverage
- ✅ **Type Safety**: Full TypeScript support
- ✅ **Documentation**: Clear API documentation
- ✅ **Debugging**: Better error messages and logging

## Migration Guide

### From Original Widget

1. **Update Import**:
   ```tsx
   // Old
   import { AIChatWidget } from '@/components/ai/ai-chat-widget';
   
   // New
   import { AIChatWidget } from '@/components/ai/ai-chat-widget-improved';
   ```

2. **Update Props** (if using custom props):
   ```tsx
   // Old
   <AIChatWidget context={{ current_page: '/courses' }} />
   
   // New (same API, but with additional options)
   <AIChatWidget 
     context={{ current_page: '/courses' }}
     position="bottom-right"
     defaultOpen={false}
   />
   ```

3. **No Breaking Changes**: The new widget maintains the same API while adding new features.

## Testing

Run the test suite:

```bash
npm test -- ai-chat-widget.test.tsx
```

The widget includes comprehensive tests covering:
- Widget toggle functionality
- Message sending and receiving
- Status handling and error states
- Accessibility features
- Keyboard interactions

## Future Enhancements

- **Theme Support**: Light/dark mode toggle
- **Voice Input**: Speech-to-text integration
- **File Uploads**: Support for document analysis
- **Conversation Export**: Save chat history
- **Custom Styling**: Theme customization API