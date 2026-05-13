import ChatLayout from '../components/layouts/ChatLayout'
import { useSuspenseQuery } from '@tanstack/react-query'
import authService from '../service/authService'
import { motion } from 'framer-motion'
import Chat from '../features/chat/Chat'
import useChatStore from '../store/chatStore'
import { useEffect } from 'react'
import io from 'socket.io-client';

const ChatPage = () => {

  const { setSocket, setUser, setSocketConnected } = useChatStore()

  const getSocketUrl = () => {
    if (import.meta.env.VITE_SOCKET_URL) {
      return import.meta.env.VITE_SOCKET_URL;
    }

    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
    return apiUrl.replace(/\/api\/v\d+\/?$/, '');
  };

  useEffect(()=>{
    const socketUrl = getSocketUrl();
    console.log('[Socket] Connecting to:', socketUrl);

    const socket = io(socketUrl, {
      withCredentials: true,
      transports: ['websocket'], // Force websocket only, disable polling for better performance
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    socket.on('connect', () => {
      console.log('[Socket] Connected! Transport:', socket.io.engine.transport.name);
      setSocketConnected(true);
    });

    socket.on('disconnect', () => {
      console.log('[Socket] Disconnected');
      setSocketConnected(false);
    });

    socket.on('connect_error', (error) => {
      console.error('[Socket] Connection error:', error.message);
    });

    setSocket(socket)
    return()=>{
      socket.disconnect()
      setSocket(null)
      setSocketConnected(false)
    }
  },[setSocket, setSocketConnected])


  // Get current user
  const { data: userData } = useSuspenseQuery({
    queryKey: ['user'],
    queryFn: () => authService.currentUser(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  })

  const user = userData
  
  // Set user in chat store
  useEffect(() => {
    if (user) {
      setUser(user)
    }
  }, [user, setUser])

  // Authenticate socket with user id once both are available
  useEffect(() => {
    const { socket } = useChatStore.getState();
    if (socket && user?._id) {
      if (socket.connected) {
        socket.emit('authenticate', { userId: user._id });
      } else {
        socket.once('connect', () => {
          socket.emit('authenticate', { userId: user._id });
        });
      }
    }
  }, [user]);

  return (
    <motion.div 
      className="chat-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex-1 flex flex-col min-h-0">
        <Chat />
      </div>
    </motion.div>
  )
}

// Export the component wrapped with the ChatLayout HOC
const ChatPageWithLayout = ChatLayout(ChatPage)
export default ChatPageWithLayout