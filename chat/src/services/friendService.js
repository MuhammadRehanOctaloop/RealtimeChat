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

    getFriendRequests: async () => {
        try {
            console.log('Fetching friend requests from:', '/api/v1/friends/requests/received');
            const result = await api.get('/api/v1/friends/requests/received');
            console.log('Friend requests response:', result.data);
            return result.data.data || [];
        } catch (error) {
            console.error('Error fetching friend requests:', {
                status: error.response?.status,
                message: error.response?.data?.message,
                error: error.response?.data || error
            });
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
            console.log('Sending friend request to userId:', userId);
            const response = await api.post('/api/v1/friends/request', { 
                userId: userId 
            });
            console.log('Friend request response:', response.data);
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            console.error('Friend request error:', {
                status: error.response?.status,
                message: error.response?.data?.message,
                error: error.response?.data
            });
            const errorMessage = error.response?.data?.message || 'Error sending friend request';
            return {
                success: false,
                error: errorMessage
            };
        }
    },

    acceptFriendRequest: async (requestId) => {
        try {
            const response = await api.post('/api/v1/friends/accept', { 
                requestId: requestId 
            });
            return response.data;
        } catch (error) {
            console.error('Error accepting friend request:', error);
            throw error;
        }
    },

    declineFriendRequest: async (requestId) => {
        try {
            const response = await api.post('/api/v1/friends/decline', { 
                requestId: requestId
            });
            return response.data;
        } catch (error) {
            console.error('Error declining friend request:', error);
            throw error;
        }
    }
}; 