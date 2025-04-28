import axiosInstance from "../axios/axiosInstance"

const ChatService = {
    getChatList: async () => {
        try {
            const response = await axiosInstance.get(`/chat/`);
            return response.data.chats;
        } catch (error) {
            console.error("Error fetching chat list:", error);
            throw error;
        }
    },
    getChatById: async (chatId) => {
        try {
            const response = await axiosInstance.get(`/chat/${chatId}`);
            return response.data.chat;
        } catch (error) {
            console.error("Error fetching chat by ID:", error);
            throw error;
        }
    },
}


export default ChatService;