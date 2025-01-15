import api from './api';

export const notificationService = {
    // Get all notifications
    getMessageNotifications: async () => {
        try {
            const response = await api.get('/api/v1/notifications/messages');
            return response.data.data;
        } catch (error) {
            console.error('Error fetching notifications:', error);
            throw error;
        }
    },

    // Get unread notifications
    getUnreadNotifications: async () => {
        try {
            const response = await api.get('/api/v1/notifications/unread');
            return response.data.data;
        } catch (error) {
            console.error('Error fetching unread notifications:', error);
            throw error;
        }
    },

    // Mark single notification as read
    markAsRead: async (notificationId) => {
        try {
            await api.patch(`/api/v1/notifications/${notificationId}/read`);
        } catch (error) {
            console.error('Error marking notification as read:', error);
            throw error;
        }
    },

    // Mark all notifications as read
    markAllAsRead: async () => {
        try {
            await api.patch('/api/v1/notifications/mark-all-read');
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
            throw error;
        }
    },

    // Delete notification
    deleteNotification: async (notificationId) => {
        try {
            await api.delete(`/api/v1/notifications/${notificationId}`);
            return true;
        } catch (error) {
            console.error('Error deleting notification:', error);
            throw error;
        }
    }
}; 