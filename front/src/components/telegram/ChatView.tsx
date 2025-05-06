import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PaperAirplaneIcon, SparklesIcon } from '@heroicons/react/24/solid';
import type { Chat, User, Message } from '../../types/telegram';
import MessageItem from './MessageItem';
import AIAssistant from './AIAssistant';

interface ChatViewProps {
  chat: Chat | null;
  currentUser: User; 
}

const ChatView: React.FC<ChatViewProps> = ({ chat, currentUser }) => {
  const [message, setMessage] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showAIAssistant, setShowAIAssistant] = useState<boolean>(false);
  const messagesEndRef = useRef<null | HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Local state to hold updated messages for a better user experience
  const [localMessages, setLocalMessages] = useState<Message[]>([]);

  // Update local messages when chat changes
  useEffect(() => {
    if (chat) {
      setLocalMessages(chat.messages);
    }
  }, [chat]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [localMessages]);

  // Focus input when chat changes
  useEffect(() => {
    if (chat) {
      inputRef.current?.focus();
    }
  }, [chat]);

  const handleSendMessage = () => {
    if (!chat || !message.trim() || isSubmitting) return;
    
    setIsSubmitting(true);
    
    // Create a new message object
    const newMessage: Message = {
      id: `m${Date.now()}`, // Generate a unique ID
      sender: currentUser,
      text: message.trim(),
      timestamp: Date.now(),
      isRead: true
    };
    
    // Add to local messages for immediate UI update
    setLocalMessages([...localMessages, newMessage]);
    
    // In a real app, this would be an API call to send the message
    // For now, let's simulate a short delay
    setTimeout(() => {
      console.log('Message sent:', newMessage);
      
      // Reset input
      setMessage('');
      setIsSubmitting(false);
    }, 300);
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
            animate={{ y: 0, opacity: 1 }}
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
          <motion.img 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            src={chat.avatar || 'https://via.placeholder.com/40'} 
            alt={chat.name} 
            className="w-10 h-10 rounded-full mr-3 border-2 border-gray-100" 
          />
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

      <div className="flex-1 p-4 overflow-y-auto space-y-4 relative">
        <AnimatePresence>
          {localMessages.map((msg) => (
            <MessageItem key={msg.id} message={msg} currentUser={currentUser} />
          ))}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* AI Assistant Panel */}
      <AnimatePresence>
        {showAIAssistant && (
          <AIAssistant chat={{...chat, messages: localMessages}} onClose={toggleAIAssistant} />
        )}
      </AnimatePresence>

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
              className="w-full p-3 pl-4 pr-12 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              disabled={isSubmitting}
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSendMessage}
              disabled={!message.trim() || isSubmitting}
              className={`absolute right-2 top-1/2 transform -translate-y-1/2 rounded-full p-1.5 ${
                message.trim() && !isSubmitting
                  ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
              aria-label="Send message"
            >
              <PaperAirplaneIcon className="h-5 w-5" />
            </motion.button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ChatView;