import api from './api';

export const notificationService = {
    getNotifications: async () => {
        const response = await api.get('/notifications');
        return response.data.data;
    },

    getUnreadNotifications: async () => {
        const response = await api.get('/notifications/unread');
        return response.data.data;
    },

    markAsRead: async (notificationId) => {
        const response = await api.patch(`/notifications/${notificationId}/read`);
        return response.data;
    },

    markAllAsRead: async () => {
        const response = await api.patch('/notifications/mark-all-read');
        return response.data;
    },

    deleteNotification: async (notificationId) => {
        await api.delete(`/notifications/${notificationId}`);
    }
}; 