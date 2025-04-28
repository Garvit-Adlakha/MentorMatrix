import Sidebar from './Sidebar';
import { motion } from 'motion/react';

// Define the layout HOC
const ChatLayoutInner = (WrappedComponent) => {
  const WithLayout = (props) => {
    return (
      <div className="flex flex-col md:grid md:grid-cols-12 lg:grid-cols-12 gap-0 md:gap-3 h-screen max-h-screen min-h-0 px-0 md:px-4 pb-3 pt-3
           
      ">
        {/* Sidebar - takes up 3 columns on medium screens, 3 on large */}
        <div className="md:col-span-3 lg:col-span-3 z-20 md:pr-2 h-full min-h-0">
          <Sidebar />
        </div>

        {/* Main Chat Area - takes up 9 columns on medium screens, 9 on large */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="w-full md:col-span-9 lg:col-span-9 h-full min-h-0 rounded-xl overflow-hidden bg-gradient-to-b from-neutral-800/95 to-neutral-900/95 shadow-lg border border-neutral-700/30"
        >
          <div className="h-full w-full rounded-xl m-2 overflow-hidden min-h-0 max-h-[96vh]"> 
            <WrappedComponent {...props} />
          </div>
        </motion.div>
      </div>
    )
  }
  WithLayout.displayName = `WithChatLayout(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;
  return WithLayout;
}

export default ChatLayoutInner;