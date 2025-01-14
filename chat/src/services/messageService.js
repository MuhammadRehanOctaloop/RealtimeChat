import api from './api';

export const messageService = {
    getConversation: async (userId) => {
        const response = await api.get(`/api/v1/messages/conversation/${userId}`);
        return response.data.data;
    },

    sendMessage: async (recipientId, content) => {
        const response = await api.post('/api/v1/messages', { recipientId, content });
        return response.data;
    },

    editMessage: async (messageId, content) => {
        const response = await api.patch(`/api/v1/messages/${messageId}`, { content });
        return response.data;
    },

    deleteMessage: async (messageId) => {
        await api.delete(`/api/v1/messages/${messageId}`);
    }
}; 