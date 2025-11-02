import { useState, useCallback } from 'react';

type ChatSize = 'small' | 'medium' | 'large';

interface UseChatUIReturn {
  isOpen: boolean;
  isMinimized: boolean;
  chatSize: ChatSize;
  toggleOpen: () => void;
  toggleMinimized: () => void;
  cycleChatSize: () => void;
  openChat: () => void;
  closeChat: () => void;
}

export function useChatUI(): UseChatUIReturn {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [chatSize, setChatSize] = useState<ChatSize>('medium');

  const toggleOpen = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  const toggleMinimized = useCallback(() => {
    setIsMinimized(prev => !prev);
  }, []);

  const openChat = useCallback(() => {
    setIsOpen(true);
    setIsMinimized(false);
  }, []);

  const closeChat = useCallback(() => {
    setIsOpen(false);
    setIsMinimized(false);
  }, []);

  const cycleChatSize = useCallback(() => {
    const sizes: ChatSize[] = ['small', 'medium', 'large'];
    setChatSize(current => {
      const currentIndex = sizes.indexOf(current);
      const nextIndex = (currentIndex + 1) % sizes.length;
      return sizes[nextIndex];
    });
  }, []);

  return {
    isOpen,
    isMinimized,
    chatSize,
    toggleOpen,
    toggleMinimized,
    cycleChatSize,
    openChat,
    closeChat
  };
}