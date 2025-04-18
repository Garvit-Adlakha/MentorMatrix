import React from 'react'
import Sidebar from './Sidebar';
import AppLayout from './AppLayout';
import { motion } from 'motion/react';

// Define the layout HOC
const ChatLayoutInner = (WrappedComponent) => {
  const WithLayout = (props) => {
    return (
      <div className="flex flex-col md:grid md:grid-cols-4 lg:grid-cols-4 max-h-[95v] md:mt-3 px-3 sm:px-6 gap-4">
        <div className="md:inline-block  max-h-[95vh] md:col-span-1 z-20">
          <Sidebar />
        </div>
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full md:col-span-3 h-[95vh] mt-2 md:pl-3 z-10 rounded-xl shadow-md bg-neutral-800/80 overflow-hidden"
        >
          <div className="h-full md:col-span-3 p-4 rounded-lg">
            <WrappedComponent {...props} />
          </div>
        </motion.div>
      </div>
    )
  }
  WithLayout.displayName = `WithChatLayout(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;
  return WithLayout;
}

// Compose the HOCs correctly: First apply AppLayout, then apply ChatLayout
const ChatLayout = (Component) => {
  return ChatLayoutInner(Component);
};

export default ChatLayout;