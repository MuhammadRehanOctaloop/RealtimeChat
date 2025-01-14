import api from './api';

export const friendService = {
    getFriends: async () => {
        try {
            const response = await api.get('/api/v1/friends');
            return response.data.data || [];
        } catch (error) {
            console.error('Error fetching friends:', error.response?.data || error);
            return [];
        }
    },

    searchUsers: async (username) => {
        try {
            const response = await api.get('/api/v1/users/search', {
                params: { username }
            });
            return response.data.data || [];
        } catch (error) {
            console.error('Error searching users:', error);
            throw error;
        }
    },

    sendFriendRequest: async (userId) => {
        try {
            const response = await api.post('/api/v1/friends/request', { userId });
            return response.data;
        } catch (error) {
            console.error('Error sending friend request:', error);
            throw error;
        }
    },

    acceptFriendRequest: async (requestId) => {
        try {
            const response = await api.post('/api/v1/friends/accept', { requestId });
            return response.data;
        } catch (error) {
            console.error('Error accepting friend request:', error);
            throw error;
        }
    },

    declineFriendRequest: async (requestId) => {
        try {
            const response = await api.post('/api/v1/friends/decline', { requestId });
            return response.data;
        } catch (error) {
            console.error('Error declining friend request:', error);
            throw error;
        }
    }
}; 