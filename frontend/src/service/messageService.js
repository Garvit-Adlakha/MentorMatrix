import axiosInstance from "../axios/axiosInstance";

const MessageService = {
    getMessages: async (chatId) => {
        try {
            const response = await axiosInstance.get(`/message/${chatId}/messages`);
            return response.data;
        } catch (error) {
            console.error("Error fetching messages:", error);
            throw error;
        }
    },
    
    sendMessage: async (dataOrChatId, message) => {
        try {
            // Handle both formats:
            // 1. sendMessage(chatId, message)
            // 2. sendMessage({ chatId, content })
            let chatId, content;
            
            if (typeof dataOrChatId === 'object') {
                // Format: sendMessage({ chatId, content })
                chatId = dataOrChatId.chatId;
                content = dataOrChatId.content;
            } else {
                // Format: sendMessage(chatId, message)
                chatId = dataOrChatId;
                content = message;
            }
            
           
            
            const response = await axiosInstance.post(`/message/${chatId}/message`, { content });
            return response.data;
        } catch (error) {
            console.error("Error sending message:", error);
            throw error;
        }
    },
    
    markMessagesAsRead: async (chatId) => {
        try {
            const response = await axiosInstance.post(`/message/mark-read/${chatId}`);
            return response.data;
        } catch (error) {
            console.error("Error marking messages as read:", error);
            throw error;
        }
    }
}

export default MessageService;