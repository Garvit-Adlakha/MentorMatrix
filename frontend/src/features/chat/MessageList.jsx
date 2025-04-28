import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const MessageList = ({ groupedMessages, user, isAnyoneTyping, getTypingString, isScrolledToBottom, scrollToBottom, messagesEndRef, handleScroll, messagesContainerRef }) => (
  <div 
    className="flex-1 overflow-y-auto p-4 bg-gradient-to-b from-neutral-800/30 to-neutral-900/60 min-h-0 relative"
    onScroll={handleScroll}
    ref={messagesContainerRef} // <-- use the ref directly
  >
    <AnimatePresence>
      {groupedMessages.map(([date, dateMessages]) => (
        <motion.div 
          key={date} 
          className="mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="sticky top-2 z-10 text-center mb-4">
            <motion.span 
              className="px-4 py-1.5 bg-neutral-800/90 text-neutral-300 text-xs rounded-full shadow-md backdrop-blur-sm border border-neutral-700/50"
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            >
              {date}
            </motion.span>
          </div>
          {dateMessages.map((message, index) => (
            <motion.div
              key={message._id}
              className={`mb-4 flex ${message.sender._id === user?._id ? 'justify-end' : 'justify-start'}`}
              initial={{ opacity: 0, scale: 0.8, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ 
                type: "spring", 
                stiffness: 350, 
                damping: 25, 
                delay: index * 0.05 > 0.5 ? 0.5 : index * 0.05
              }}
            >
              {message.sender._id !== user?._id && (
                <div className="flex-shrink-0 mr-2">
                  <div className="w-8 h-8 rounded-full bg-neutral-700 flex items-center justify-center text-sm font-medium text-white">
                    {message.sender.name ? message.sender.name.charAt(0).toUpperCase() : '?'}
                  </div>
                </div>
              )}
              <div className={`max-w-[75%] ${message.sender._id === user?._id ? 'bg-primary text-white' : 'bg-neutral-800 text-neutral-100'} px-4 py-2 rounded-2xl ${message.sender._id === user?._id ? 'rounded-tr-sm' : 'rounded-tl-sm'}`}>
                {message.sender._id !== user?._id && (
                  <div className="text-xs text-neutral-400 mb-1 font-medium">
                    {message.sender.name || "Unknown User"}
                  </div>
                )}
                <div>{message.content}</div>
                <div className="text-[10px] text-right mt-1 opacity-70">
                  {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
              {message.sender._id === user?._id && (
                <div className="flex-shrink-0 ml-2">
                  <div className="w-8 h-8 rounded-full bg-primary/30 flex items-center justify-center text-sm font-medium text-white">
                    {user?.name ? user.name.charAt(0).toUpperCase() : 'Y'}
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </motion.div>
      ))}
    </AnimatePresence>
    <AnimatePresence>
      {isAnyoneTyping() && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          className="flex items-center text-xs text-muted-foreground mb-2 pl-10"
        >
          <div className="flex space-x-1 mr-2">
            <div className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce"></div>
            <div className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
          </div>
          {getTypingString()}
        </motion.div>
      )}
    </AnimatePresence>
    <AnimatePresence>
      {!isScrolledToBottom && (
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          onClick={scrollToBottom}
          className="absolute bottom-4 right-4 bg-primary shadow-lg py-2 px-4 rounded-full text-white text-sm flex items-center"
        >
          <span className="icon-arrow-right mr-1 rotate-90" />
          New Messages
        </motion.button>
      )}
    </AnimatePresence>
    <div ref={messagesEndRef} />
  </div>
);

export default MessageList;