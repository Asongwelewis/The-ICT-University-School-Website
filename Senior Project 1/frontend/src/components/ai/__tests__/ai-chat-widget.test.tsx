import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AIChatWidget } from '../ai-chat-widget-improved';
import { useAIChat } from '@/hooks/use-ai-chat';
import { useAIStatus } from '@/hooks/use-ai-status';

// Mock the custom hooks
jest.mock('@/hooks/use-ai-chat');
jest.mock('@/hooks/use-ai-status');

const mockUseAIChat = useAIChat as jest.MockedFunction<typeof useAIChat>;
const mockUseAIStatus = useAIStatus as jest.MockedFunction<typeof useAIStatus>;

describe('AIChatWidget', () => {
  const defaultChatHookReturn = {
    messages: [],
    isLoading: false,
    suggestions: [],
    sendMessage: jest.fn(),
    clearMessages: jest.fn(),
    retryLastMessage: jest.fn(),
    addMessage: jest.fn(),
    updateMessageStatus: jest.fn(),
  };

  const defaultStatusHookReturn = {
    status: 'online' as const,
    service: 'Gemini Pro',
    models: ['gemini-pro'],
    isOnline: true,
    isOffline: false,
    isChecking: false,
    hasError: false,
    forceCheck: jest.fn(),
    stopPeriodicCheck: jest.fn(),
  };

  beforeEach(() => {
    mockUseAIChat.mockReturnValue(defaultChatHookReturn);
    mockUseAIStatus.mockReturnValue(defaultStatusHookReturn);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Widget Toggle', () => {
    it('should render closed widget by default', () => {
      render(<AIChatWidget />);
      
      const toggleButton = screen.getByLabelText('Open AI chat assistant');
      expect(toggleButton).toBeInTheDocument();
      expect(screen.queryByText('AI Study Assistant')).not.toBeInTheDocument();
    });

    it('should open widget when toggle button is clicked', async () => {
      const user = userEvent.setup();
      render(<AIChatWidget />);
      
      const toggleButton = screen.getByLabelText('Open AI chat assistant');
      await user.click(toggleButton);
      
      expect(screen.getByText('AI Study Assistant')).toBeInTheDocument();
    });

    it('should render open widget when defaultOpen is true', () => {
      render(<AIChatWidget defaultOpen />);
      
      expect(screen.getByText('AI Study Assistant')).toBeInTheDocument();
    });
  });

  describe('Message Handling', () => {
    it('should display welcome message when no messages exist', () => {
      render(<AIChatWidget defaultOpen />);
      
      expect(screen.getByText(/Hello! I'm your AI study assistant/)).toBeInTheDocument();
    });

    it('should display context-specific welcome message', () => {
      render(
        <AIChatWidget 
          defaultOpen 
          context={{ current_page: '/assignments/123' }} 
        />
      );
      
      expect(screen.getByText(/I'm here to help you understand your assignments/)).toBeInTheDocument();
    });

    it('should call sendMessage when message is sent', async () => {
      const user = userEvent.setup();
      const mockSendMessage = jest.fn();
      mockUseAIChat.mockReturnValue({
        ...defaultChatHookReturn,
        sendMessage: mockSendMessage,
      });

      render(<AIChatWidget defaultOpen />);
      
      const input = screen.getByPlaceholderText('Ask me anything...');
      const sendButton = screen.getByLabelText('Send message');
      
      await user.type(input, 'Test message');
      await user.click(sendButton);
      
      expect(mockSendMessage).toHaveBeenCalledWith('Test message');
    });

    it('should handle Enter key to send message', async () => {
      const user = userEvent.setup();
      const mockSendMessage = jest.fn();
      mockUseAIChat.mockReturnValue({
        ...defaultChatHookReturn,
        sendMessage: mockSendMessage,
      });

      render(<AIChatWidget defaultOpen />);
      
      const input = screen.getByPlaceholderText('Ask me anything...');
      
      await user.type(input, 'Test message');
      await user.keyboard('{Enter}');
      
      expect(mockSendMessage).toHaveBeenCalledWith('Test message');
    });
  });

  describe('Status Handling', () => {
    it('should show offline status when AI is offline', () => {
      mockUseAIStatus.mockReturnValue({
        ...defaultStatusHookReturn,
        status: 'offline',
        isOnline: false,
        isOffline: true,
      });

      render(<AIChatWidget defaultOpen />);
      
      expect(screen.getByText(/Gemini Pro is offline/)).toBeInTheDocument();
    });

    it('should disable input when AI is offline', () => {
      mockUseAIStatus.mockReturnValue({
        ...defaultStatusHookReturn,
        status: 'offline',
        isOnline: false,
        isOffline: true,
      });

      render(<AIChatWidget defaultOpen />);
      
      const input = screen.getByPlaceholderText(/Gemini Pro is offline/);
      expect(input).toBeDisabled();
    });

    it('should show loading state when sending message', () => {
      mockUseAIChat.mockReturnValue({
        ...defaultChatHookReturn,
        isLoading: true,
      });

      render(<AIChatWidget defaultOpen />);
      
      expect(screen.getByLabelText('AI is typing')).toBeInTheDocument();
    });
  });

  describe('Suggestions', () => {
    it('should display suggestions when available', () => {
      mockUseAIChat.mockReturnValue({
        ...defaultChatHookReturn,
        suggestions: ['What is this?', 'Explain more', 'Give examples'],
      });

      render(<AIChatWidget defaultOpen />);
      
      expect(screen.getByText('What is this?')).toBeInTheDocument();
      expect(screen.getByText('Explain more')).toBeInTheDocument();
      expect(screen.getByText('Give examples')).toBeInTheDocument();
    });

    it('should send suggestion as message when clicked', async () => {
      const user = userEvent.setup();
      const mockSendMessage = jest.fn();
      mockUseAIChat.mockReturnValue({
        ...defaultChatHookReturn,
        sendMessage: mockSendMessage,
        suggestions: ['What is this?'],
      });

      render(<AIChatWidget defaultOpen />);
      
      const suggestionButton = screen.getByText('What is this?');
      await user.click(suggestionButton);
      
      expect(mockSendMessage).toHaveBeenCalledWith('What is this?');
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(<AIChatWidget defaultOpen />);
      
      expect(screen.getByLabelText('Close chat')).toBeInTheDocument();
      expect(screen.getByLabelText('Minimize chat')).toBeInTheDocument();
      expect(screen.getByLabelText('Chat messages')).toBeInTheDocument();
    });

    it('should have proper roles for chat messages', () => {
      render(<AIChatWidget defaultOpen />);
      
      const messagesContainer = screen.getByRole('log');
      expect(messagesContainer).toHaveAttribute('aria-live', 'polite');
    });
  });

  describe('Widget Positioning', () => {
    it('should apply correct position classes', () => {
      const { container } = render(<AIChatWidget position="top-left" />);
      
      const widget = container.firstChild as HTMLElement;
      expect(widget).toHaveClass('top-6', 'left-6');
    });

    it('should apply custom className', () => {
      const { container } = render(<AIChatWidget className="custom-class" />);
      
      const widget = container.firstChild as HTMLElement;
      expect(widget).toHaveClass('custom-class');
    });
  });
});