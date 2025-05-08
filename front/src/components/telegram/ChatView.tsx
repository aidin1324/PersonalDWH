import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PaperAirplaneIcon, SparklesIcon, ArrowDownIcon, ArrowUpIcon } from '@heroicons/react/24/solid';
import type { Chat, User, Message, MessagePaginationState } from '../../types/telegram';
import MessageItem from './MessageItem';
import AIAssistant from './AIAssistant';
import { TelegramApiService } from '../../services/TelegramApiService';
import { AvatarFallback } from '../../utils/avatarUtils';

interface ChatViewProps {
  chat: Chat | null;
  currentUser: User; 
}

const DEFAULT_LIMIT = 15;

const ChatView: React.FC<ChatViewProps> = ({ chat, currentUser }) => {
  const [message, setMessage] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showAIAssistant, setShowAIAssistant] = useState<boolean>(false);
  const messagesEndRef = useRef<null | HTMLDivElement>(null);
  const messagesContainerRef = useRef<null | HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const [localMessages, setLocalMessages] = useState<Message[]>([]);
  
  const [messagePagination, setMessagePagination] = useState<MessagePaginationState>({
    loading: false,
    hasMore: true,
    offset_id: 0,
    limit: DEFAULT_LIMIT
  });
  
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [showScrollToBottom, setShowScrollToBottom] = useState<boolean>(false);

  useEffect(() => {
    const fetchMessages = async () => {
      if (!chat) return;
      
      try {
        setIsLoading(true);
        setLoadError(null);
        setMessagePagination({
          loading: true,
          hasMore: true,
          offset_id: 0,
          limit: DEFAULT_LIMIT
        });
        
        const response = await TelegramApiService.getMessages(String(chat.id), DEFAULT_LIMIT, 0);
        const fetchedMessages: Message[] = response.messages; 
        
        const sortedMessages = [...fetchedMessages].sort((a, b) => a.timestamp - b.timestamp);
        
        const uniqueMessages = sortedMessages.filter((msg, index, self) => index === self.findIndex(t => t.id === msg.id));
        setLocalMessages(uniqueMessages);

        setMessagePagination(prev => ({
          ...prev,
          loading: false,
          hasMore: fetchedMessages.length >= DEFAULT_LIMIT,
          offset_id: fetchedMessages.length > 0 ? Number(fetchedMessages[fetchedMessages.length - 1].id) : 0
        }));

        setTimeout(() => {
          scrollToBottom('auto');
        }, 100);
      } catch (error) {
        console.error('Failed to fetch messages:', error);
        setLoadError('Failed to load messages');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchMessages();
  }, [chat]);

  const loadMoreMessages = useCallback(async () => {
    if (!chat || messagePagination.loading || !messagePagination.hasMore) return;
    
    try {
      setMessagePagination(prev => ({ ...prev, loading: true }));
      
      const response = await TelegramApiService.loadMoreMessages(
        String(chat.id), 
        messagePagination.limit,
        messagePagination.offset_id
      );
      
      const olderFetchedMessages: Message[] = response.messages;
      
      if (olderFetchedMessages.length === 0) {
        setMessagePagination(prev => ({
          ...prev,
          loading: false,
          hasMore: false
        }));
        return;
      }
      
      setLocalMessages(prevLocalMessages => {
        const combinedMessages = [...olderFetchedMessages, ...prevLocalMessages];
        const sortedCombined = combinedMessages.sort((a, b) => a.timestamp - b.timestamp);
        return sortedCombined.filter((msg, index, self) => index === self.findIndex(t => t.id === msg.id));
      });
      
      setMessagePagination(prev => ({
        ...prev,
        loading: false,
        hasMore: olderFetchedMessages.length >= prev.limit,
        offset_id: olderFetchedMessages.length > 0 
          ? Number(olderFetchedMessages[olderFetchedMessages.length - 1].id) 
          : prev.offset_id
      }));
    } catch (error) {
      console.error('Failed to load more messages:', error);
      setMessagePagination(prev => ({ ...prev, loading: false }));
    }
  }, [chat, messagePagination.loading, messagePagination.hasMore, messagePagination.limit, messagePagination.offset_id]);

  useEffect(() => {
    if (chat) {
      setMessagePagination({
        loading: false,
        hasMore: true,
        offset_id: 0,
        limit: DEFAULT_LIMIT
      });
    }
  }, [chat?.id]);

  useEffect(() => {
    const scrollContainer = messagesContainerRef.current;
    if (!scrollContainer) return;
    
    const handleScroll = () => {
      const isNearBottom = (
        scrollContainer.scrollHeight - scrollContainer.scrollTop - scrollContainer.clientHeight
      ) < 150;
      
      setShowScrollToBottom(!isNearBottom);
    };
    
    scrollContainer.addEventListener('scroll', handleScroll);
    return () => scrollContainer.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  useEffect(() => {
    if (chat) {
      inputRef.current?.focus();
    }
  }, [chat]);

  const handleSendMessage = async () => {
    if (!chat || !message.trim() || isSubmitting) return;
    
    setIsSubmitting(true);
    
    const newMessage: Message = {
      id: `temp-${Date.now()}`, 
      sender: currentUser,
      text: message.trim(),
      timestamp: Date.now(),
      isRead: true,
      from_author: true,
    };
    
    setLocalMessages(prev => [...prev, newMessage]);
    
    setMessage('');
    
    scrollToBottom();
    
    try {
      await TelegramApiService.sendMessage(String(chat.id), message.trim());
    } catch (error) {
      console.error('Failed to send message:', error);
      setLocalMessages(prev => prev.filter(msg => msg.id !== newMessage.id));
      setMessage(newMessage.text);
      alert('Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleAIAssistant = () => {
    setShowAIAssistant(prev => !prev);
  };

  if (!chat) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center h-full bg-gray-50">
        <div className="text-center">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-indigo-400 to-purple-500 flex items-center justify-center shadow-md"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
            </svg>
          </motion.div>
          <motion.p 
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-gray-700 text-lg font-medium"
          >
            Select a chat to start messaging
          </motion.p>
          <motion.p 
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-gray-500 mt-2 max-w-xs mx-auto"
          >
            Choose from your existing conversations or start a new one
          </motion.p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-gray-50">
      <header className="bg-white p-4 border-b border-gray-200 flex items-center justify-between shadow-sm">
        <div className="flex items-center">
            {chat.avatar_url
            ? (
              <motion.img 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              src={chat.avatar_url}
              alt={chat.name} 
              className="w-10 h-10 rounded-full mr-3 border-2 border-gray-100 shadow-sm" 
              />
            )
            : (
              <AvatarFallback name={chat.name} sizeClasses="w-10 h-10" containerClasses="mr-3 border-2 border-gray-100" />
            )
            }
          <div>
            <h2 className="text-lg font-semibold text-gray-800">{chat.name}</h2>
            <p className="text-xs text-gray-500">
              {chat.type === 'personal' ? 'Direct Message' : 
              chat.type === 'group' ? 'Group Chat' : 'Channel'}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleAIAssistant}
            className={`p-2 rounded-full transition-colors ${
              showAIAssistant 
              ? 'bg-indigo-100 text-indigo-700'
              : 'hover:bg-gray-100 text-gray-500'
            }`}
            aria-label="AI Assistant"
            title="AI Communication Assistant"
          >
            <SparklesIcon className="h-5 w-5" />
          </motion.button>
        </div>
      </header>

      <div 
        ref={messagesContainerRef}
        className="flex-1 p-4 overflow-y-auto space-y-4 relative"
      >
        {messagePagination.hasMore && (
          <div className="flex justify-center my-2">
            <motion.button
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={loadMoreMessages}
              disabled={messagePagination.loading}
              className="px-4 py-2 bg-white border border-gray-200 rounded-full shadow-sm hover:shadow-md transition-all flex items-center space-x-1 text-gray-600 hover:text-indigo-600 disabled:opacity-50 disabled:pointer-events-none"
            >
              {messagePagination.loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-indigo-500 mr-2"></div>
                  <span>Loading...</span>
                </>
              ) : (
                <>
                  <ArrowUpIcon className="h-4 w-4" />
                  <span>Load earlier messages</span>
                </>
              )}
            </motion.button>
          </div>
        )}
        
        {isLoading && (
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        )}
        
        {loadError && (
          <div className="bg-red-50 p-3 rounded-md text-center text-red-500 shadow-sm">
            {loadError}
            <button 
              onClick={() => window.location.reload()} 
              className="ml-2 text-red-600 underline hover:text-red-800"
            >
              Retry
            </button>
          </div>
        )}

        <AnimatePresence>
          {localMessages.map((msg) => (
            <MessageItem 
              key={msg.id} 
              message={msg} 
              currentUser={currentUser} 
              showMedia={true} 
              chatId={String(chat.id)}
            />
          ))}
        </AnimatePresence>
        <div ref={messagesEndRef} />
        
        {showScrollToBottom && (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute bottom-5 right-4 p-2 rounded-full bg-indigo-600 text-white shadow-lg hover:bg-indigo-700 hover:shadow-xl transition-all"
            onClick={() => scrollToBottom()}
          >
            <ArrowDownIcon className="h-5 w-5" />
          </motion.button>
        )}
      </div>

      <AnimatePresence>
        {showAIAssistant && (
          <AIAssistant chat={{...chat, messages: localMessages}} onClose={toggleAIAssistant} />
        )}
      </AnimatePresence>

      {chat && chat.type !== 'channel' && (
        <footer className="bg-white p-3 border-t border-gray-200">
          <div className="flex items-center space-x-2">
            <div className="flex-1 relative">
              <input 
                ref={inputRef}
                type="text" 
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a message..." 
                className="w-full p-3 pl-4 pr-12 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm"
                disabled={isSubmitting}
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSendMessage}
                disabled={!message.trim() || isSubmitting}
                className={`absolute right-2 top-1/2 transform -translate-y-1/2 rounded-full p-2 ${
                  message.trim() && !isSubmitting
                    ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
                aria-label="Send message"
              >
                <PaperAirplaneIcon className="h-5 w-5" />
              </motion.button>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
};

export default ChatView;