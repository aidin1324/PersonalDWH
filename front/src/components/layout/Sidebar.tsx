import React, { useState, type JSX } from 'react';
import { motion } from 'framer-motion';

interface NavItem {
  id: string;
  name: string;
  icon: JSX.Element;
  count?: number;
}

const Sidebar: React.FC = () => {
  const [activeItem, setActiveItem] = useState('telegram');
  
  const navItems: NavItem[] = [
    {
      id: 'telegram',
      name: 'Telegram',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.57-1.39-.93-2.23-1.47-.99-.65-.35-1 .22-1.57.15-.15 2.63-2.42 2.68-2.63.01-.03.01-.14-.06-.2-.07-.07-.21-.04-.3-.02-.13.03-2.2 1.4-3.22 2.05-.3.2-.86.43-1.26.42-.42-.01-1.22-.24-1.82-.44-.73-.24-1.32-.37-1.27-.8.03-.24.35-.47 1.34-.89 5.27-2.29 7.01-3.04 7.37-3.18.92-.35 1.99-.73 2.5.52.16.39.25.82.19 1.22.01 0 .23 2.35.23 2.47z" />
        </svg>
      ),
      count: 5
    },
    {
      id: 'news',
      name: 'News',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
        </svg>
      ),
      count: 3
    },
    {
      id: 'sports',
      name: 'Sports',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      ),
      count: 0
    },
    {
      id: 'settings',
      name: 'Settings',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c-.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      )
    }
  ];

  return (
    <motion.aside 
      initial={{ x: -80, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="w-72 bg-gradient-to-br from-indigo-900 to-purple-900 text-white p-5 shadow-xl"
    >
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="flex items-center mb-8"
      >
        <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center mr-3">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-700" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v14a1 1 0 01-1 1H4a1 1 0 01-1-1V3zm5 10v2h4v-2H8zm0-3v2h7V10H8zm0-3v2h7V7H8zm-3 0a1 1 0 100 2 1 1 0 000-2zm0 3a1 1 0 100 2 1 1 0 000-2zm0 3a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold">Personal DWH</h1>
      </motion.div>
      
      <nav className="space-y-1">
        {navItems.map((item, index) => (
          <motion.button
            key={item.id}
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3 + index * 0.1, duration: 0.5 }}
            onClick={() => setActiveItem(item.id)}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-300 ${
              activeItem === item.id 
                ? 'bg-white/10 shadow-lg' 
                : 'hover:bg-white/5'
            }`}
          >
            <div className="flex items-center">
              <div className={`${activeItem === item.id ? 'text-purple-300' : 'text-gray-300'} mr-3`}>
                {item.icon}
              </div>
              <span className={`font-medium ${activeItem === item.id ? 'text-white' : 'text-gray-300'}`}>
                {item.name}
              </span>
            </div>
            
            {item.count !== undefined && item.count > 0 && (
              <motion.span 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 15 }}
                className="h-5 w-5 rounded-full bg-purple-400 flex items-center justify-center text-xs font-bold"
              >
                {item.count}
              </motion.span>
            )}
          </motion.button>
        ))}
      </nav>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.5 }}
        className="mt-auto pt-8"
      >
        <div className="bg-indigo-800/50 rounded-xl p-4 mt-8">
          <h3 className="text-sm font-medium text-purple-200 mb-2">Daily Summary</h3>
          <p className="text-xs text-gray-300">5 new messages from Alice</p>
          <p className="text-xs text-gray-300">3 news updates</p>
          <div className="mt-3 pt-3 border-t border-indigo-700/30">
            <button className="text-xs text-purple-300 hover:text-white transition-colors">
              View All Updates →
            </button>
          </div>
        </div>
      </motion.div>
    </motion.aside>
  );
};

export default Sidebar;