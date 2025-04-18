import React, { useRef, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useQueryClient, useMutation, useQuery } from '@tanstack/react-query';
import { IconMenu, IconSend, IconSmile } from '../ui/Icons';
import { motion, AnimatePresence } from 'framer-motion';
import useChatStore from '../../store/chatStore';
import chatService from '../../service/chatService';

// Utility functions for timestamp and date formatting
const formatTime = (timestamp) => {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const formatDate = (timestamp) => {
  if (!timestamp) return '';
  
  const date = new Date(timestamp);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  if (date.toDateString() === today.toDateString()) {
    return 'Today';
  } else if (date.toDateString() === yesterday.toDateString()) {
    return 'Yesterday';
  } else {
    return date.toLocaleDateString();
  }
};

const Chat = ({ activeChat, user }) => {
  const messageInputRef = useRef(null);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const queryClient = useQueryClient();
  const [typingUsers, setTypingUsers] = useState([]);
  
  const { 
    newMessage, setNewMessage, 
    toggleSidebar, socketConnected, socket,
    typing, setTyping
  } = useChatStore();
  
  // Fetch messages for active chat
  const { data: messageData } = useQuery({
    queryKey: ['messages', activeChat?._id],
    queryFn: () => activeChat ? chatService.getChatMessages(activeChat._id) : { messages: [] },
    enabled: !!activeChat,
    refetchInterval: false,
  });
  
  const messages = messageData?.messages || [];
  
  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);
  
  // Mark messages as read when chat becomes active
  useEffect(() => {
    if (activeChat && messages.length > 0) {
      const unreadMessages = messages.filter(
        msg => msg.sender._id !== user?._id && msg.status === 'sent'
      );
      
      if (unreadMessages.length > 0) {
        chatService.markMessagesAsRead(activeChat._id)
          .then(() => {
            if (socket) {
              socket.emit('markMessagesRead', { chatId: activeChat._id });
            }
          })
          .catch(error => console.error('Error marking messages as read:', error));
      }
    }
  }, [activeChat, messages, socket, user]);
  
  // Setup socket event listeners for typing indicators
  useEffect(() => {
    if (!socket) return;
    
    socket.on('typing', ({ chatId, userName }) => {
      if (chatId === activeChat?._id && userName !== user?.name) {
        setTypingUsers(prev => {
          if (!prev.includes(userName)) {
            return [...prev, userName];
          }
          return prev;
        });
      }
    });
    
    socket.on('stopTyping', ({ chatId, userName }) => {
      if (chatId === activeChat?._id) {
        setTypingUsers(prev => prev.filter(name => name !== userName));
      }
    });
    
    return () => {
      socket.off('typing');
      socket.off('stopTyping');
    };
  }, [socket, activeChat, user]);
  
  // Mutation for sending messages
  const mutation = useMutation({
    mutationFn: chatService.sendMessage,
    onSuccess: (data) => {
      queryClient.invalidateQueries(['messages', activeChat._id]);
      
      if (socket) {
        socket.emit('newMessage', data);
      }
    },
    onError: (error) => {
      console.error('Error sending message:', error);
    }
  });
  
  // Handle typing indicator
  const handleTyping = () => {
    if (!socket || !activeChat) return;
    
    if (!typing) {
      setTyping(true);
      socket.emit('typing', { chatId: activeChat._id, userName: user?.name });
    }
    
    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Set new timeout
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('stopTyping', { chatId: activeChat._id, userName: user?.name });
      setTyping(false);
    }, 3000);
  };
  
  // Send message function
  const sendMessage = () => {
    if (!activeChat || !newMessage.trim()) return;
    
    try {
      // Stop typing indicator
      if (socket) {
        socket.emit('stopTyping', { chatId: activeChat._id, userName: user?.name });
      }
      
      // Send message
      mutation.mutate({ chatId: activeChat._id, content: newMessage });
      
      // Clear input field
      setNewMessage('');
      
      // Focus back on input
      messageInputRef.current?.focus();
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };
  
  // Check if anyone is typing
  const isAnyoneTyping = () => {
    return typingUsers.length > 0;
  };
  
  // Generate appropriate typing indicator text
  const getTypingString = () => {
    if (typingUsers.length === 0) return '';
    if (typingUsers.length === 1) return `${typingUsers[0]} is typing...`;
    if (typingUsers.length === 2) return `${typingUsers[0]} and ${typingUsers[1]} are typing...`;
    return 'Multiple people are typing...';
  };
  
  // Group messages by date
  const groupMessagesByDate = () => {
    const groups = {};
    
    messages.forEach((message) => {
      const date = formatDate(message.createdAt);
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
    });
    
    return Object.entries(groups);
  };
  
  // If no active chat, show placeholder
  if (!activeChat) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center p-6">
          <p className="text-lg font-medium">Select a chat to start messaging</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <div className="p-4 border-b border-border flex items-center">
        <button
          onClick={toggleSidebar}
          className="md:hidden mr-3 p-2 rounded-md hover:bg-accent"
        >
          <IconMenu size={20} />
        </button>
        
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mr-3">
            {activeChat.isGroupChat ? (
              <span className="font-medium text-primary">
                {activeChat.chatName?.substring(0, 2) || 'GC'}
              </span>
            ) : (
              <span className="font-medium text-primary">
                {activeChat.users?.find(u => u._id !== user?._id)?.name?.substring(0, 2) || '?'}
              </span>
            )}
          </div>
          <div>
            <h3 className="font-medium">
              {activeChat.isGroupChat
                ? activeChat.chatName
                : activeChat.users?.find(u => u._id !== user?._id)?.name || 'Chat'}
            </h3>
            <p className="text-xs text-muted-foreground">
              {socketConnected ? 'Online' : 'Offline'}
            </p>
          </div>
        </div>
      </div>
      
      {/* Message List */}
      <div className="flex-1 overflow-y-auto p-4 bg-gradient-to-b from-background/80 to-background">
        <AnimatePresence>
          {groupMessagesByDate().map(([date, dateMessages]) => (
            <motion.div 
              key={date} 
              className="mb-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <div className="text-center mb-4">
                <motion.span 
                  className="px-3 py-1 bg-primary/10 text-primary text-xs rounded-full shadow-sm"
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
                    delay: index * 0.05 
                  }}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 shadow-sm ${
                      message.sender._id === user?._id
                        ? 'bg-gradient-to-br from-primary to-primary/90 text-primary-foreground rounded-tr-none'
                        : 'bg-gradient-to-br from-accent/90 to-accent/70 rounded-tl-none'
                    }`}
                  >
                    {message.sender._id !== user?._id && !activeChat.isGroupChat && (
                      <p className="text-xs font-medium mb-1">{message.sender.name}</p>
                    )}
                    <p className="break-words">{message.content}</p>
                    <p className="text-xs text-right mt-1 opacity-70">
                      {formatTime(message.createdAt)}
                      {message.sender._id === user?._id && (
                        <span className="ml-1">
                          {message.status === 'read' ? '✓✓' : '✓'}
                        </span>
                      )}
                    </p>
                  </div>
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
              className="flex items-center text-xs text-muted-foreground mb-2"
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
        
        <div ref={messagesEndRef} />
      </div>
      
      {/* Message Input */}
      <div className="border-t border-border p-4">
        <div className="flex gap-2">
          <input
            ref={messageInputRef}
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            onInput={handleTyping}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 bg-accent/30 border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <button
            onClick={sendMessage}
            disabled={!newMessage.trim() || !socketConnected}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:bg-primary/50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <IconSend size={16} />
            Send
          </button>
          <button
            className="px-4 py-2 bg-accent text-accent-foreground rounded-lg hover:bg-accent/90 flex items-center gap-2"
          >
            <IconSmile size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

Chat.propTypes = {
  activeChat: PropTypes.object,
  user: PropTypes.object,
};

export default Chat;