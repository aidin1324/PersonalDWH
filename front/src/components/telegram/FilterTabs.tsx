import React from 'react';
import { motion } from 'framer-motion';
import type { ChatType } from '../../types/telegram';
import { UserIcon, UsersIcon, MegaphoneIcon, InboxIcon } from '@heroicons/react/24/outline';

interface FilterTabsProps {
  activeFilter: ChatType | "all";
  onFilterChange: (filter: ChatType | "all") => void;
  stats?: {
    total?: number;
    personal_unread?: number;
    group_unread?: number;
    channel_unread?: number;
  } | null;
  isLoading?: boolean;
}

const FilterTabs: React.FC<FilterTabsProps> = ({ 
  activeFilter, 
  onFilterChange,
  stats,
  isLoading = false
}) => {
  // Format badge count for display (truncate large numbers)
  const formatBadgeCount = (count: number): string => {
    if (count > 99) return '99+';
    return count.toString();
  };
  
  const filters = [
    {
      value: 'all' as const,
      label: 'All',
      icon: <InboxIcon className="h-4 w-4" />,
      unread_count: stats?.total || 0
    },
    {
      value: 'personal' as const,
      label: 'Direct',
      icon: <UserIcon className="h-4 w-4" />,
      unread_count: stats?.personal_unread || 0
    },
    {
      value: 'group' as const,
      label: 'Groups',
      icon: <UsersIcon className="h-4 w-4" />,
      unread_count: stats?.group_unread || 0
    },
    {
      value: 'channel' as const,
      label: 'Channels',
      icon: <MegaphoneIcon className="h-4 w-4" />,
      unread_count: stats?.channel_unread || 0
    },
  ];

  return (
    <div className="px-2 overflow-x-auto flex border-b border-gray-200 bg-white sticky top-0 z-10">
      <div className="flex space-x-2 pb-2 pt-2 w-full justify-between sm:justify-start">
        {filters.map((filter) => (
          <motion.button
            key={filter.value}
            onClick={() => onFilterChange(filter.value)}
            className={`
              py-1.5 px-3 rounded-full font-medium text-sm whitespace-nowrap flex-shrink-0
              transition-all duration-200 ease-in-out flex items-center gap-1.5
              ${isLoading ? "opacity-70 pointer-events-none" : ""}
              ${activeFilter === filter.value 
                ? "bg-gradient-to-r from-indigo-100 to-indigo-50 text-indigo-700 shadow-sm"
                : "text-gray-500 hover:text-indigo-600 hover:bg-indigo-50"
              }
            `}
            whileHover={{ scale: isLoading ? 1 : 1.03 }}
            whileTap={{ scale: isLoading ? 1 : 0.97 }}
            disabled={isLoading}
          >
            {filter.icon}
            <span className="relative hidden xs:inline">
              {filter.label}
              {filter.unread_count > 0 && (
                <motion.span 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className={`absolute -right-4 -top-1 bg-red-500 text-white text-xs 
                    rounded-full flex items-center justify-center
                    ${filter.unread_count > 9 ? 'min-w-[16px] h-4 px-1 text-[10px]' : 'w-4 h-4'}`}
                >
                  {formatBadgeCount(filter.unread_count)}
                </motion.span>
              )}
              {activeFilter === filter.value && (
                <motion.span
                  layoutId="activeFilterIndicator"
                  className="absolute -bottom-0.5 left-0 right-0 h-0.5 bg-indigo-500 rounded-full"
                  initial={false}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
            </span>
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default FilterTabs;