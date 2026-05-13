import Sidebar from './Sidebar';
import { motion } from 'motion/react';

// Define the layout HOC
const ChatLayoutInner = (WrappedComponent) => {
  const WithLayout = (props) => {
    return (
      <div className="chat-layout landing-theme">
        {/* Sidebar - takes up 3 columns on medium screens, 3 on large */}
        <div className="md:col-span-3 lg:col-span-3 z-20 md:pr-2 h-full min-h-0">
          <Sidebar />
        </div>

        {/* Main Chat Area - takes up 9 columns on medium screens, 9 on large */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="chat-panel"
        >
          <div className="chat-panel-inner">
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