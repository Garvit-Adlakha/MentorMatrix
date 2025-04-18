import { create } from 'zustand';

const useChatStore = create((set, get) => ({
  // UI States
  newMessage: '',
  typing: false,
  typingUsers: new Set(),
  openSidebar: true,
  socketConnected: false,
  socket: null,
  
  // Actions
  setNewMessage: (message) => set({ newMessage: message }),
  
  setOpenSidebar: (open) => set({ openSidebar: open }),
  
  toggleSidebar: () => set((state) => ({ openSidebar: !state.openSidebar })),
  
  setSocketConnected: (connected) => set({ socketConnected: connected }),
  
  setSocket: (socket) => set({ socket }),
  
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
  
  // Helper methods
  getTypingString: () => {
    const typingArray = [...get().typingUsers];
    if (typingArray.length === 0) return '';
    if (typingArray.length === 1) return `${typingArray[0]} is typing...`;
    if (typingArray.length === 2) return `${typingArray[0]} and ${typingArray[1]} are typing...`;
    return `${typingArray[0]}, ${typingArray[1]} and ${typingArray.length - 2} more are typing...`;
  },
  
  isAnyoneTyping: () => get().typingUsers.size > 0,
}));

export default useChatStore;