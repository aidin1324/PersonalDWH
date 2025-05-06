import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import FilterTabs from '../components/telegram/FilterTabs';
import ChatList from '../components/telegram/ChatList';
import ChatView from '../components/telegram/ChatView';
import { mockChats } from '../data/mockTelegramData';
import type { ChatType, User } from '../types/telegram';
import { ArrowLeftIcon, MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';

const currentUser: User = { id: "me", name: "Me", avatar: "https://i.pravatar.cc/150?u=me" };

const TelegramPage: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<ChatType | "all">("all");
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isMobileView, setIsMobileView] = useState<boolean>(false);
  const [showChatList, setShowChatList] = useState<boolean>(true);

  // Check if we're in mobile view
  useEffect(() => {
    const checkMobileView = () => {
      setIsMobileView(window.innerWidth < 768);
    };
    
    // Initial check
    checkMobileView();
    
    // Add event listener
    window.addEventListener('resize', checkMobileView);
    
    // Clean up
    return () => window.removeEventListener('resize', checkMobileView);
  }, []);

  // Ensure correct view is shown on mobile when a chat is selected
  useEffect(() => {
    if (isMobileView && selectedChatId) {
      setShowChatList(false);
    }
  }, [selectedChatId, isMobileView]);

  const filteredChats = useMemo(() => {
    let chats = activeFilter === "all" 
      ? mockChats 
      : mockChats.filter(chat => chat.type === activeFilter);
      
    // Apply search filter if query exists
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      chats = chats.filter(chat => 
        chat.name.toLowerCase().includes(query) || 
        chat.messages.some(msg => msg.text.toLowerCase().includes(query))
      );
    }
    
    return chats;
  }, [activeFilter, searchQuery]);

  const selectedChat = useMemo(() => {
    return mockChats.find(chat => chat.id === selectedChatId) || null;
  }, [selectedChatId]);

  const handleSelectChat = (chatId: string) => {
    setSelectedChatId(chatId);
  };

  const handleBackToList = () => {
    setShowChatList(true);
  };

  const clearSearch = () => {
    setSearchQuery('');
  };

  return (
    <div className="flex flex-col h-full overflow-hidden bg-gray-100 rounded-xl shadow-xl">
      {/* Mobile view with selected chat */}
      {isMobileView ? (
        <AnimatePresence mode="wait" initial={false}>
          {showChatList ? (
            <motion.div 
              key="chatlist"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col h-full"
            >
              <div className="flex-none bg-white border-b border-gray-200 p-4">
                <h1 className="text-2xl font-bold text-gray-800">Messages</h1>
              </div>
              <div className="flex-none p-3 bg-white">
                <div className="relative">
                  <input 
                    type="text" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search messages..." 
                    className="w-full p-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-gray-50"
                  />
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  {searchQuery && (
                    <button 
                      onClick={clearSearch}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <XMarkIcon className="h-5 w-5" />
                    </button>
                  )}
                </div>
              </div>
              <FilterTabs activeFilter={activeFilter} onFilterChange={setActiveFilter} />
              <div className="flex-1 overflow-y-auto">
                <ChatList 
                  chats={filteredChats} 
                  selectedChatId={selectedChatId} 
                  onSelectChat={handleSelectChat} 
                />
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="chatview"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col h-full relative"
            >
              {selectedChat && (
                <button 
                  onClick={handleBackToList}
                  className="absolute left-4 top-4 p-1 rounded-full bg-gray-100 z-20 shadow-sm"
                >
                  <ArrowLeftIcon className="h-6 w-6 text-gray-700" />
                </button>
              )}
              <ChatView chat={selectedChat} currentUser={currentUser} />
            </motion.div>
          )}
        </AnimatePresence>
      ) : (
        // Desktop view with split panel
        <div className="flex h-full overflow-hidden">
          <motion.div 
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="w-1/3 min-w-[300px] max-w-[400px] flex flex-col border-r border-gray-200 bg-white shadow-md"
          >
            <div className="flex-none p-4 border-b border-gray-200">
              <h1 className="text-xl font-semibold text-gray-800">Messages</h1>
            </div>
            <div className="flex-none p-3 border-b border-gray-200">
              <div className="relative">
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search messages..." 
                  className="w-full p-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50"
                />
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                {searchQuery && (
                  <button 
                    onClick={clearSearch}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                )}
              </div>
            </div>
            <FilterTabs activeFilter={activeFilter} onFilterChange={setActiveFilter} />
            <div className="flex-1 overflow-y-auto">
              <ChatList 
                chats={filteredChats} 
                selectedChatId={selectedChatId} 
                onSelectChat={handleSelectChat} 
              />
              {filteredChats.length === 0 && (
                <div className="p-6 text-center">
                  <p className="text-gray-500">No matching conversations found</p>
                  {searchQuery && (
                    <button 
                      onClick={clearSearch}
                      className="mt-2 text-indigo-600 font-medium hover:text-indigo-700"
                    >
                      Clear search
                    </button>
                  )}
                </div>
              )}
            </div>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="flex-1"
          >
            <ChatView chat={selectedChat} currentUser={currentUser} />
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default TelegramPage;