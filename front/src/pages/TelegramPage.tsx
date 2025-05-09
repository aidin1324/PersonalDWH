import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import FilterTabs from '../components/telegram/FilterTabs';
import ChatList from '../components/telegram/ChatList';
import ChatView from '../components/telegram/ChatView';
import { TelegramApiService } from '../services/TelegramApiService';
import type { ChatType, User, Chat, PaginationState } from '../types/telegram';
import { ArrowLeftIcon, MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';

// Current user is hardcoded for now, in a real app would come from authentication
const currentUser: User = { id: "me", name: "Me", avatar_url: "https://i.pravatar.cc/150?u=me" };

// Initial pagination settings
const DEFAULT_LIMIT = 60;

interface TelegramPageProps {
  // Add prop for stats callback
  onStatsUpdate?: (stats: any) => void;
}

const TelegramPage: React.FC<TelegramPageProps> = ({ onStatsUpdate }) => {
  const [activeFilter, setActiveFilter] = useState<ChatType | "all">("all");
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isMobileView, setIsMobileView] = useState<boolean>(false);
  const [showChatList, setShowChatList] = useState<boolean>(true);
  
  // State for storing data from API
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showFloatingLoadMore, setShowFloatingLoadMore] = useState<boolean>(false);
  const [stats, setStats] = useState<{
    personal_unread: number;
    group_unread: number;
    channel_unread: number;
    total?: number;
  } | null>(null);
  
  // Pagination state
  const [pagination, setPagination] = useState<PaginationState>({
    loading: false,
    hasMore: true,
    offsetDate: undefined,
    limit: DEFAULT_LIMIT
  });

  // Ref for chat list container to handle scroll events
  const chatListRef = useRef<HTMLDivElement>(null);

  // Update parent component when stats change
  useEffect(() => {
    if (stats && onStatsUpdate) {
      onStatsUpdate(stats);
    }
  }, [stats, onStatsUpdate]);

  // Fetch chats from the API - FIXED: removed pagination.offsetDate from dependencies
  const fetchChats = useCallback(async (reset: boolean = true) => {
    try {
      setLoading(true);
      setError(null);
      
      // If resetting, clear date offset
      if (reset) {
        setPagination(prev => ({ ...prev, offsetDate: undefined, hasMore: true }));
      }
      
      // Get date from current state only if not resetting
      const date = reset ? undefined : pagination.offsetDate;
      
      const response = await TelegramApiService.getChats(activeFilter, pagination.limit, date);
      
      // Convert backend chat format to frontend format
      const chatList = response.chats.map(chat => TelegramApiService.convertToClientChat(chat));
      
      setChats(reset ? chatList : prevChats => [...prevChats, ...chatList]);
      
      // Calculate total unread messages
      const total = (response.stats.personal_unread || 0) + 
                   (response.stats.group_unread || 0) + 
                   (response.stats.channel_unread || 0);

      setStats({
        ...response.stats,
        total
      });
      
      // Update pagination state with next_offset_date
      setPagination(prev => ({
        ...prev,
        hasMore: response.next_offset_date != null,
        offsetDate: response.next_offset_date
      }));
    } catch (err) {
      console.error('Failed to fetch chats:', err);
      setError('Failed to load chats. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [activeFilter, pagination.limit]); // FIXED: removed pagination.offsetDate from dependencies

  // Function to load more chats (pagination)
  const loadMoreChats = useCallback(async () => {
    if (pagination.loading || !pagination.hasMore) return;

    try {
      setPagination(prev => ({ ...prev, loading: true }));
      
      const response = await TelegramApiService.loadMoreChats(
        activeFilter,
        pagination.limit,
        pagination.offsetDate
      );

      // Convert backend chat format to frontend format
      const chatList = response.chats.map(chat => TelegramApiService.convertToClientChat(chat));
      
      // Append new chats to existing chats
      setChats(prevChats => [...prevChats, ...chatList]);
      
      // Update stats if they changed
      if (response.stats) {
        const total = (response.stats.personal_unread || 0) + 
                     (response.stats.group_unread || 0) + 
                     (response.stats.channel_unread || 0);

        setStats({
          ...response.stats,
          total
        });
      }
      
      // Update pagination state for next offset_date
      setPagination(prev => ({
        ...prev,
        loading: false,
        hasMore: response.next_offset_date != null,
        offsetDate: response.next_offset_date
      }));
    } catch (err) {
      console.error('Failed to load more chats:', err);
      setPagination(prev => ({ ...prev, loading: false }));
    }
  }, [activeFilter, pagination.loading, pagination.hasMore, pagination.limit, pagination.offsetDate]);

  // Handle scroll events for infinite scrolling
  const handleScroll = useCallback(() => {
    if (!chatListRef.current || pagination.loading) return;
    const { scrollTop, scrollHeight, clientHeight } = chatListRef.current;
    const scrolledToBottom = (scrollHeight - scrollTop - clientHeight) < 100;
    
    // Show the floating button when we're near the bottom and have more items to load
    setShowFloatingLoadMore(scrolledToBottom && pagination.hasMore);
    
    if (scrolledToBottom && pagination.hasMore) {
      loadMoreChats();
    }
  }, [loadMoreChats, pagination.hasMore, pagination.loading]);

  // Add scroll event listener
  useEffect(() => {
    const chatListElement = chatListRef.current;
    if (chatListElement) {
      chatListElement.addEventListener('scroll', handleScroll);
      return () => chatListElement.removeEventListener('scroll', handleScroll);
    }
  }, [handleScroll]);

  // FIXED: Load chats only when filter changes, not when fetchChats or offsetDate changes
  useEffect(() => {
    // Load chats on mount or when filter changes
    fetchChats(true);
  }, [activeFilter]); // FIXED: removed fetchChats from dependencies

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

  // Filter and search chats
  const filteredChats = useMemo(() => {
    if (!chats || chats.length === 0) return [];
    
    // Search is applied after API filtering
    if (!searchQuery.trim()) return chats;
    
    const query = searchQuery.toLowerCase();
    return chats.filter(chat => 
      chat.name.toLowerCase().includes(query)
    );
  }, [chats, searchQuery]);

  // Get the selected chat
  const selectedChat = useMemo(() => {
    return chats.find(chat => chat.id === selectedChatId) || null;
  }, [selectedChatId, chats]);

  const handleSelectChat = (chatId: string) => {
    setSelectedChatId(chatId);
  };

  const handleBackToList = () => {
    setShowChatList(true);
  };

  const clearSearch = () => {
    setSearchQuery('');
  };

  const handleFilterChange = (filter: ChatType | "all") => {
    setActiveFilter(filter);
    setSelectedChatId(null);
    setShowChatList(true);
    // Fetch will be triggered by the useEffect that depends on activeFilter
  };

  // Handle refresh button
  const handleRefresh = () => {
    fetchChats(true);
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
              <div className="flex-none bg-white border-b border-gray-200 p-4 flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800">Messages</h1>
                <button 
                  onClick={handleRefresh} 
                  className="p-1 rounded-full hover:bg-gray-100 text-gray-600"
                  disabled={loading}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
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
              <FilterTabs 
                activeFilter={activeFilter} 
                onFilterChange={handleFilterChange} 
                stats={stats} 
                isLoading={loading} 
              />
              <div ref={chatListRef} className="flex-1 overflow-y-auto relative">
                {loading && !chats.length ? (
                  <div className="flex justify-center items-center h-full">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-700"></div>
                  </div>
                ) : error ? (
                  <div className="p-4 text-center">
                    <p className="text-red-500">{error}</p>
                    <button 
                      onClick={handleRefresh} 
                      className="mt-2 px-4 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600"
                    >
                      Try Again
                    </button>
                  </div>
                ) : (
                  <>
                    <ChatList 
                      chats={filteredChats} 
                      selectedChatId={selectedChatId} 
                      onSelectChat={handleSelectChat} 
                    />
                    
                    {/* Load more chats button */}
                    {pagination.hasMore && filteredChats.length > 0 && (
                      <div className="flex justify-center py-4">
                        <button 
                          onClick={loadMoreChats}
                          disabled={pagination.loading}
                          className="px-4 py-2 bg-white border border-gray-200 rounded-md shadow-sm hover:shadow text-gray-600 hover:text-indigo-600 transition-colors disabled:opacity-50"
                        >
                          {pagination.loading ? (
                            <span className="flex items-center">
                              <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-500 mr-2"></span>
                              Loading...
                            </span>
                          ) : (
                            'Load more chats'
                          )}
                        </button>
                      </div>
                    )}
                    
                    {showFloatingLoadMore && (
                      <button 
                        onClick={loadMoreChats}
                        disabled={pagination.loading}
                        className="fixed bottom-4 right-4 px-4 py-2 bg-indigo-500 text-white rounded-full shadow-lg hover:bg-indigo-600 transition disabled:opacity-50"
                      >
                        {pagination.loading ? (
                          <span className="flex items-center">
                            <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                            Loading...
                          </span>
                        ) : (
                          'Load more'
                        )}
                      </button>
                    )}
                    
                    {filteredChats.length === 0 && !pagination.loading && (
                      <div className="p-6 text-center">
                        <p className="text-gray-500">No conversations found</p>
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
                  </>
                )}
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
                  className="absolute left-4 top-4 p-2 rounded-full bg-gray-100 z-20 shadow-sm hover:bg-gray-200"
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
            <div className="flex-none p-4 border-b border-gray-200 flex justify-between items-center">
              <h1 className="text-xl font-semibold text-gray-800">Messages</h1>
              <button 
                onClick={handleRefresh} 
                className="p-1 rounded-full hover:bg-gray-100 text-gray-600"
                disabled={loading}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
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
            <FilterTabs 
              activeFilter={activeFilter} 
              onFilterChange={handleFilterChange} 
              stats={stats} 
              isLoading={loading} 
            />
            <div ref={chatListRef} className="flex-1 overflow-y-auto relative">
              {loading && !chats.length ? (
                <div className="flex justify-center items-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-700"></div>
                </div>
              ) : error ? (
                <div className="p-6 text-center">
                  <p className="text-red-500">{error}</p>
                  <button 
                    onClick={handleRefresh} 
                    className="mt-2 px-4 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600"
                  >
                    Try Again
                  </button>
                </div>
              ) : (
                <>
                  <ChatList 
                    chats={filteredChats} 
                    selectedChatId={selectedChatId} 
                    onSelectChat={handleSelectChat} 
                  />
                  
                  {/* Load more chats button */}
                  {pagination.hasMore && filteredChats.length > 0 && (
                    <div className="flex justify-center py-4">
                      <button 
                        onClick={loadMoreChats}
                        disabled={pagination.loading}
                        className="px-4 py-2 bg-white border border-gray-200 rounded-md shadow-sm hover:shadow text-gray-600 hover:text-indigo-600 transition-colors disabled:opacity-50"
                      >
                        {pagination.loading ? (
                          <span className="flex items-center">
                            <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-500 mr-2"></span>
                            Loading...
                          </span>
                        ) : (
                          'Load more chats'
                        )}
                      </button>
                    </div>
                  )}
                  
                  {showFloatingLoadMore && (
                    <button 
                      onClick={loadMoreChats}
                      disabled={pagination.loading}
                      className="fixed bottom-4 right-4 px-4 py-2 bg-indigo-500 text-white rounded-full shadow-lg hover:bg-indigo-600 transition disabled:opacity-50"
                    >
                      {pagination.loading ? (
                        <span className="flex items-center">
                          <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                          Loading...
                        </span>
                      ) : (
                        'Load more'
                      )}
                    </button>
                  )}
                  
                  {filteredChats.length === 0 && !pagination.loading && (
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
                </>
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