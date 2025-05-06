import React from 'react';
import { motion } from 'framer-motion';
import type { ChatType } from '../../types/telegram';
import { UserIcon, UsersIcon, MegaphoneIcon, InboxIcon } from '@heroicons/react/24/outline';

interface FilterTabsProps {
  activeFilter: ChatType | "all";
  onFilterChange: (filter: ChatType | "all") => void;
}

const filters: { label: string; value: ChatType | "all"; icon: React.ReactNode }[] = [
  { 
    label: "All", 
    value: "all",
    icon: <InboxIcon className="h-4 w-4" />
  },
  { 
    label: "Personal", 
    value: "personal",
    icon: <UserIcon className="h-4 w-4" />
  },
  { 
    label: "Groups", 
    value: "group",
    icon: <UsersIcon className="h-4 w-4" />
  },
  { 
    label: "Channels", 
    value: "channel",
    icon: <MegaphoneIcon className="h-4 w-4" />
  },
];

const FilterTabs: React.FC<FilterTabsProps> = ({ activeFilter, onFilterChange }) => {
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
              ${activeFilter === filter.value 
                ? "bg-gradient-to-r from-indigo-100 to-indigo-50 text-indigo-700 shadow-sm"
                : "text-gray-500 hover:text-indigo-600 hover:bg-indigo-50"
              }
            `}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            {filter.icon}
            <span className="relative hidden xs:inline">
              {filter.label}
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