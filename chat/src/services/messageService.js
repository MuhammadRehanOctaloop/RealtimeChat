import api from './api';

export const messageService = {
    getConversation: async (userId) => {
        try {
            const response = await api.get(`/api/v1/messages/conversation/${userId}`);
            return response.data.data.messages || [];
        } catch (error) {
            console.error('Error fetching conversation:', error);
            return [];
        }
    },

    sendMessage: async (recipientId, content) => {
        try {
            const response = await api.post('/api/v1/messages', { 
                recipientId, 
                content,
                type: 'text'
            });
            return response.data.data.message;
        } catch (error) {
            console.error('Error sending message:', error);
            throw error;
        }
    },

    editMessage: async (messageId, content) => {
        try {
            const response = await api.patch(`/api/v1/messages/${messageId}`, { content });
            return response.data.data.message;
        } catch (error) {
            console.error('Error editing message:', error);
            throw error;
        }
    },

    deleteMessage: async (messageId) => {
        await api.delete(`/api/v1/messages/${messageId}`);
    },

    sendFileMessage: async (recipientId, file) => {
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('recipientId', recipientId);

            const response = await api.post('/api/v1/messages', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                },
            });
            return response.data.data.message;
        } catch (error) {
            console.error('Error sending file:', error);
            throw error;
        }
    },

    sendImageMessage: async (recipientId, image) => {
        try {
            const formData = new FormData();
            formData.append('file', image);
            formData.append('recipientId', recipientId);

            const response = await api.post('/api/v1/messages', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                },
            });
            return response.data.data.message;
        } catch (error) {
            console.error('Error sending image:', error);
            throw error;
        }
    }
}; 