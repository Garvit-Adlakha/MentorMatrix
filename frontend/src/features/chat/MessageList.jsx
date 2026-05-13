import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const MessageList = ({ groupedMessages, user, isAnyoneTyping, getTypingString, isScrolledToBottom, scrollToBottom, messagesEndRef, handleScroll, messagesContainerRef }) => (
  <div 
    className="chat-messages"
    onScroll={handleScroll}
    ref={messagesContainerRef}
  >
    <AnimatePresence>
      {groupedMessages.map(([date, dateMessages]) => (
        <motion.div 
          key={date} 
          className="mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="sticky top-2 z-10 text-center mb-6">
            <motion.span 
              className="chat-date-pill"
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            >
              {date}
            </motion.span>
          </div>
          {dateMessages.map((message, index) => (
            <motion.div
              key={message._id}
              className={`mb-5 flex ${message.sender._id === user?._id ? 'justify-end' : 'justify-start'}`}
              initial={{ opacity: 0, scale: 0.8, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ 
                type: 'spring', 
                stiffness: 350, 
                damping: 25, 
                delay: index * 0.05 > 0.5 ? 0.5 : index * 0.05
              }}
            >
              {message.sender._id !== user?._id && (
                <div className="flex-shrink-0 mr-3">
                  <div className="chat-avatar">
                    {message.sender.name ? message.sender.name.charAt(0).toUpperCase() : '?'}
                  </div>
                </div>
              )}
              <div className={`chat-bubble ${message.sender._id === user?._id ? 'chat-bubble--mine' : 'chat-bubble--theirs'}`}
                tabIndex={0}
              >
                {message.sender._id !== user?._id && (
                  <div className="text-xs text-zinc-400 mb-1 font-semibold">
                    {message.sender.name || 'Unknown User'}
                  </div>
                )}
                <div>{message.content}</div>
                <div className="chat-bubble-time">
                  {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
              {message.sender._id === user?._id && (
                <div className="flex-shrink-0 ml-3">
                  <div className="chat-avatar chat-avatar--self">
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
          className="chat-typing"
        >
          <div className="flex space-x-1 mr-2">
            <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
          </div>
          {getTypingString()}
        </motion.div>
      )}
    </AnimatePresence>
    <div ref={messagesEndRef} />
  </div>
);

export default MessageList;