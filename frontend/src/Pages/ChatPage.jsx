import ChatLayout from '../components/layouts/ChatLayout'
import { useSuspenseQuery } from '@tanstack/react-query'
import authService from '../service/authService'
import { motion } from 'framer-motion'
import Chat from '../features/chat/Chat'
import useChatStore from '../store/chatStore'
import { useEffect } from 'react'
import io from 'socket.io-client';

const ChatPage = () => {

  const {setSocket,setUser}=useChatStore()

  useEffect(()=>{
    const socket=io("http://localhost:8000")

    setSocket(socket)
    return()=>{
      socket.disconnect()
      setSocket(null)
    }
  },[setSocket])


  // Get current user
  const { data: userData } = useSuspenseQuery({
    queryKey: ['user'],
    queryFn: () => authService.currentUser(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  })

  const user = userData?.user
  
  // Set user in chat store
  useEffect(() => {
    if (user) {
      setUser(user)
    }
  }, [user, setUser])

  return (
    <motion.div 
      className="flex flex-col h-screen"
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