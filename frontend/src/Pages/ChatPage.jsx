import React, { useState, useEffect } from 'react'
import ChatLayout from '../components/layouts/ChatLayout'
import { useSuspenseQuery } from '@tanstack/react-query'
import authService from '../service/authService'
import { IconArrowRight } from '../components/ui/Icons'

const ChatPage = () => {
  const [selectedChat, setSelectedChat] = useState(null)
  
  // Get current user
  const { data: userData } = useSuspenseQuery({
    queryKey: ['user'],
    queryFn: () => authService.currentUser(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  })

  const user = userData?.user

  return (
    <div className="flex flex-col h-full">
      {selectedChat ? (
        <div className="flex-1 flex flex-col">
          {/* Chat will be loaded here */}
          <ChatLayout />
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center p-6 max-w-md max-h-[calc(100vh-4rem)] overflow-auto">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <IconArrowRight className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-medium mb-2">Select a conversation</h3>
            <p className="text-muted-foreground">
              Choose a project chat from the sidebar to start messaging
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

// Export the component wrapped with the ChatLayout HOC
export default ChatLayout(ChatPage)