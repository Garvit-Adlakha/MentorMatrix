import React, { useRef, useEffect, useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useQueryClient, useMutation, useQuery } from '@tanstack/react-query';
import { IconMenu, IconSend, IconArrowRight, IconPaperclip, IconCamera } from '../../components/ui/Icons';
import { motion, AnimatePresence } from 'framer-motion';
import useChatStore from '../../store/chatStore';
import MessageService from '../../service/messageService';
import { formatDate, formatTime } from '../../libs/utils';
import { useParams } from 'react-router-dom';
import ChatHeader from './ChatHeader';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import ChatService from '../../service/ChatService';
import authService from '../../service/authService';

const Chat = () => {
  const { chatId } = useParams();
  const messageInputRef = useRef(null);
  const messagesContainerRef = useRef(null); // <-- add this ref
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const queryClient = useQueryClient();
  const [typingUsers, setTypingUsers] = useState([]);
  const [attachment, setAttachment] = useState(null);
  const [isScrolledToBottom, setIsScrolledToBottom] = useState(true);
  const [messages, setMessages] = useState([]);
  
  const { 
    newMessage, setNewMessage, 
    toggleSidebar, socketConnected, socket,
    typing, setTyping, activeChat, setActiveChat,
  } = useChatStore();
  
  const {data:user,isLoading:userLoading}=useQuery({
    queryKey: ['user'],
    queryFn:()=>authService.currentUser(),
    staleTime: 1000 * 60 * 5, // 5 minutes
    cacheTime: 1000 * 60 * 10, // 10 minutes
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
    retry: false,
  })

  // Handle scroll events to track if user is at bottom of chat
  const handleScroll = () => {
    if (!messagesContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
    const atBottom = Math.abs(scrollHeight - clientHeight - scrollTop) < 50;
    setIsScrolledToBottom(atBottom);
  };
  
  // Fetch chat details
  useEffect(() => {
    if (chatId) {
      const fetchChatDetails = async () => {
        try {
          const chatDetails = await ChatService.getChatById(chatId);
          setActiveChat(chatDetails); // <-- use .chat
        } catch (error) {
          console.error('Error fetching chat details:', error);
        }
      };
      fetchChatDetails();
    }
  }, [chatId, setActiveChat]);

  // Fetch messages once when chatId or activeChat changes
  useEffect(() => {
    const fetchMessages = async () => {
      if (activeChat?._id || chatId) {
        try {
          const res = await MessageService.getMessages(activeChat?._id || chatId);
          setMessages(res.messages || []);
        } catch (error) {
          console.error('Error fetching messages:', error);
        }
      }
    };
    fetchMessages();
  }, [activeChat, chatId]);

  // Listen for new messages via socket
  useEffect(() => {
;
    if (!socket || !(activeChat?._id || chatId)) return;
    
    socket.emit('joinChat', activeChat?._id || chatId);
    
    const handleReceiveMessage = (msg) => {
      if (msg.chatId === (activeChat?._id || chatId)) {
        // Ensure the message has complete sender information
        const newMessage = {
          ...msg,
          sender: {
            _id: msg.sender?._id || msg.senderId,
            name: msg.sender?.name || 'Unknown User',
            email: msg.sender?.email || '',
          }
        };
        
        // Use function-based state update to avoid race conditions
        setMessages((prev) => {
          // Check if this message already exists in our messages array
          const messageExists = prev.some(m => 
            // If message has _id, check by _id
            (newMessage._id && m._id === newMessage._id) || 
            // Fallback check based on content and timestamp if no _id
            (!newMessage._id && m.content === newMessage.content && 
             m.sender._id === newMessage.sender._id &&
             m.createdAt === newMessage.createdAt)
          );
          
          if (!messageExists) {
            return [...prev, newMessage];
          }
          return prev;
        });
      }
    };
    
    socket.on('receiveMessage', handleReceiveMessage);
    
    return () => {
      socket.emit('leaveChat', activeChat?._id || chatId);
      socket.off('receiveMessage', handleReceiveMessage);
    };
  }, [socket, activeChat, chatId]); // Remove messages from dependency array

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages.length > 0 && isScrolledToBottom) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [messages, isScrolledToBottom]);
  
  // Socket Authentication effect
  useEffect(() => {
    if (socket && user?._id) {
      socket.emit('authenticate', { userId: user._id });
    }
  }, [socket, user]);
  
  // Mark messages as read when chat becomes active
  useEffect(() => {
    if ((activeChat || chatId) && messages.length > 0) {
      const unreadMessages = messages.filter(
        msg => msg.sender._id !== user?._id && msg.status === 'sent'
      );
      if (unreadMessages.length > 0) {
        MessageService.markMessagesAsRead(activeChat?._id || chatId)
          .then(() => {
            if (socket) {
              socket.emit('markMessagesRead', { chatId: activeChat?._id || chatId });
            }
          })
          .catch(error => console.error('Error marking messages as read:', error));
      }
    }
  }, [activeChat, chatId, messages, socket, user]);
  
  // Setup socket event listeners for typing indicators
  useEffect(() => {
    if (!socket) return;
    const handleTyping = ({ chatId: incomingChatId, userName }) => {
      if ((activeChat?._id === incomingChatId || chatId === incomingChatId) && userName !== user?.name) {
        setTypingUsers(prev => {
          if (!prev.includes(userName)) {
            return [...prev, userName];
          }
          return prev;
        });
      }
    };
    const handleStopTyping = ({ chatId: incomingChatId, userName }) => {
      if (activeChat?._id === incomingChatId || chatId === incomingChatId) {
        setTypingUsers(prev => prev.filter(name => name !== userName));
      }
    };
    socket.on('typing', handleTyping);
    socket.on('stopTyping', handleStopTyping);
    return () => {
      socket.off('typing', handleTyping);
      socket.off('stopTyping', handleStopTyping);
    };
  }, [socket, activeChat, chatId, user]);
  
  // Replace alert with a toast if available, fallback to console
  const showError = (msg) => {
    if (window?.toast) {
      window.toast.error(msg);
    } else {
      console.error(msg);
    }
  };




  
  
  // Mutation for sending messages
  const mutation = useMutation({
    mutationFn: (data)=>MessageService.sendMessage(data),
    onSuccess: (data) => {
      setAttachment(null);
      // Don't add message here - wait for the socket event
      // The message will be added via the receiveMessage socket event
    },
    onError: (error) => {
      showError('Failed to send message. Please try again.');
      console.error('Error sending message:', error);
    }
  });
  
  // Handle typing indicator
  const handleTyping = () => {
    if (!socket || (!activeChat && !chatId)) return;
    
    if (!typing) {
      setTyping(true);
      socket.emit('typing', { chatId: activeChat?._id || chatId, userName: user?.name });
    }
    
    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Set new timeout
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('stopTyping', { chatId: activeChat?._id || chatId, userName: user?.name });
      setTyping(false);
    }, 3000);
  };
  
  // Handle file attachment
  const handleAttachment = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAttachment(file);
    }
  };
  
  // Send message function
  const sendMessage = () => {
    if ((!activeChat && !chatId) || (!newMessage.trim() && !attachment)) return;
    try {
      // Stop typing indicator
      if (socket) {
        socket.emit('stopTyping', { chatId: activeChat?._id || chatId, userName: user?.name });
      }
      // Validate attachment (optional: max 5MB, allowed types)
      if (attachment) {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
        if (!allowedTypes.includes(attachment.type)) {
          showError('Only images and PDFs are allowed.');
          return;
        }
        if (attachment.size > 5 * 1024 * 1024) {
          showError('File size should be less than 5MB.');
          return;
        }
      }
      // Prepare form data if there's an attachment
      let messageData = { 
        chatId: activeChat?._id || chatId, 
        content: newMessage.trim() || (attachment ? 'Sent an attachment' : '')
      };
      if (attachment) {
        const formData = new FormData();
        formData.append('file', attachment);
        formData.append('chatId', activeChat?._id || chatId);
        formData.append('content', newMessage.trim() || 'Sent an attachment');
        messageData = formData;
      }
      // Send message via REST API
      mutation.mutate(messageData);
      setNewMessage('');
      messageInputRef.current?.focus();
    } catch (error) {
      showError('Failed to send message. Please try again.');
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
    return `${typingUsers.slice(0,2).join(', ')} and ${typingUsers.length - 2} other${typingUsers.length > 3 ? 's' : ''} are typing...`;
  };
  
  // Group messages by date (memoized for performance)
  const groupedMessages = useMemo(() => {
    const groups = {};
    messages.forEach((message) => {
      const date = formatDate(message.createdAt);
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
    });
    return Object.entries(groups);
  }, [messages]);

  // Show New Messages button when not scrolled to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    setIsScrolledToBottom(true);
  };
  

  if(userLoading){
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center">
          <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
          <p className="mt-4 text-muted-foreground">Loading user...</p>
        </div>
      </div>
    )
  }


  // If no active chat, show placeholder
  if (!activeChat && !chatId) {
    return (
      <div className="flex items-center justify-center h-full bg-gradient-to-br from-background to-background/95">
        <div className="text-center p-6 max-w-md">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <IconArrowRight className="w-10 h-10 text-primary" />
          </motion.div>
          <motion.h3 
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-2xl font-semibold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70"
          >
            Select a conversation
          </motion.h3>
          <motion.p 
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-muted-foreground text-lg"
          >
            Choose a project chat from the sidebar to start messaging
          </motion.p>
        </div>
      </div>
    );
  }

  // Show loading state
  // Define isLoading based on messages being null (initial fetch)
  const isLoading = messages === null;
  
  if (isLoading || userLoading) {
    return (
      <div className="flex items-center justify-center h-full bg-gradient-to-br from-background to-background/95">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
          <p className="mt-4 text-muted-foreground text-lg">Loading messages...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col h-full min-h-0 bg-gradient-to-br from-background to-background/95 ">
      <ChatHeader
        activeChat={activeChat}
        socketConnected={socketConnected}
        toggleSidebar={toggleSidebar}
      />
      <div className="flex-1 overflow-auto relative">
        <MessageList
          groupedMessages={groupedMessages}
          user={user}
          isAnyoneTyping={isAnyoneTyping}
          getTypingString={getTypingString}
          isScrolledToBottom={isScrolledToBottom}
          scrollToBottom={scrollToBottom}
          messagesEndRef={messagesEndRef}
          handleScroll={handleScroll}
          messagesContainerRef={messagesContainerRef}
        />
        {!isScrolledToBottom && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            onClick={scrollToBottom}
            className="absolute bottom-24 right-6 bg-primary text-primary-foreground p-3 rounded-full shadow-lg hover:bg-primary/90 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50"
            aria-label="Scroll to bottom"
          >
            <IconArrowRight className="w-5 h-5 rotate-90" />
          </motion.button>
        )}
      </div>
      <MessageInput
        newMessage={newMessage}
        setNewMessage={setNewMessage}
        messageInputRef={messageInputRef}
        handleTyping={handleTyping}
        sendMessage={sendMessage}
        attachment={attachment}
        setAttachment={setAttachment}
        handleAttachment={handleAttachment}
        socketConnected={socketConnected}
        mutation={mutation}
      />
    </div>
  );
};

Chat.propTypes = {
  activeChat: PropTypes.object,
  user: PropTypes.object,
};

export default Chat;