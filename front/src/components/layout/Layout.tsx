import React, { type ReactNode } from 'react';
import { motion } from 'framer-motion';
import Sidebar from './Sidebar';

interface LayoutProps {
  children: ReactNode;
  stats?: {
    personal_unread?: number;
    group_unread?: number;
    channel_unread?: number;
    total?: number;
  };
}

const Layout: React.FC<LayoutProps> = ({ children, stats }) => {
  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar stats={stats} />
      <motion.main 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="flex-1 p-6 overflow-y-auto"
      >
        {children}
      </motion.main>
    </div>
  );
};

export default Layout;