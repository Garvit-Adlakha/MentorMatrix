import { create } from 'zustand';

const useChatStore = create((set, get) => ({
  // User state
  user: null,
  
  // UI States
  newMessage: '',
  typing: false,
  typingUsers: new Set(),
  openSidebar: true,
  socketConnected: false,
  socket: null,
  activeChat: null,
  notificationCount: 0,
  unreadChats: new Set(),
  isDarkMode: true,
  
  // Actions
  setUser: (user) => set({ user }),
  
  setNewMessage: (message) => set({ newMessage: message }),
  
  setActiveChat: (chat) => set({ 
    activeChat: chat,
    // Clear unread for this chat
    unreadChats: chat ? new Set([...get().unreadChats].filter(id => id !== chat._id)) : get().unreadChats
  }),
  
  setOpenSidebar: (open) => set({ openSidebar: open }),
  
  toggleSidebar: () => set((state) => ({ openSidebar: !state.openSidebar })),
  
  setSocketConnected: (connected) => set({ socketConnected: connected }),
  
  setSocket: (socket) => set({ socket }),
  
  toggleDarkMode: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
  
  // Notification handling
  incrementNotificationCount: () => set((state) => ({ notificationCount: state.notificationCount + 1 })),
  
  resetNotificationCount: () => set({ notificationCount: 0 }),
  
  addUnreadChat: (chatId) => set((state) => {
    // Only add if it's not the active chat
    if (state.activeChat && state.activeChat._id === chatId) return state;
    
    const updatedChats = new Set([...state.unreadChats]);
    updatedChats.add(chatId);
    return { 
      unreadChats: updatedChats,
      notificationCount: state.notificationCount + 1
    };
  }),
  
  clearUnreadChats: () => set({ unreadChats: new Set(), notificationCount: 0 }),
  
  // Typing indicators
  setTyping: (isTyping) => set({ typing: isTyping }),
  
  addTypingUser: (userName) => set((state) => {
    const updatedUsers = new Set([...state.typingUsers]);
    updatedUsers.add(userName);
    return { typingUsers: updatedUsers };
  }),
  
  removeTypingUser: (userName) => set((state) => {
    const updatedUsers = new Set([...state.typingUsers]);
    updatedUsers.delete(userName);
    return { typingUsers: updatedUsers };
  }),
  
  clearTypingUsers: () => set({ typingUsers: new Set() }),
  
  // Helper methods
  getTypingString: () => {
    const typingArray = [...get().typingUsers];
    if (typingArray.length === 0) return '';
    if (typingArray.length === 1) return `${typingArray[0]} is typing...`;
    if (typingArray.length === 2) return `${typingArray[0]} and ${typingArray[1]} are typing...`;
    return `${typingArray[0]}, ${typingArray[1]} and ${typingArray.length - 2} more are typing...`;
  },
  
  isAnyoneTyping: () => get().typingUsers.size > 0,
  
  hasUnreadMessages: (chatId) => get().unreadChats.has(chatId),
}));

export default useChatStore;