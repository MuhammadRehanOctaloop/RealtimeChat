import api from './api';

export const notificationService = {
    // Get all notifications
    getAllNotifications: async () => {
        try {
            const response = await api.get('/api/v1/notifications');
            console.log('All notifications response:', response.data);
            // Extract notifications array from response
            return response.data.data.notifications || [];
        } catch (error) {
            console.error('Error fetching notifications:', error);
            return [];
        }
    },

    // Get unread notifications
    getUnreadNotifications: async () => {
        try {
            const response = await api.get('/api/v1/notifications/unread');
            console.log('Unread notifications response:', response.data);
            // Extract notifications array from response
            return response.data.data.notifications || [];
        } catch (error) {
            console.error('Error fetching unread notifications:', error);
            return [];
        }
    },

    // Mark single notification as read
    markAsRead: async (notificationId) => {
        try {
            const response = await api.patch(`/api/v1/notifications/${notificationId}/read`);
            return response.data.data.notification;
        } catch (error) {
            console.error('Error marking notification as read:', error);
            throw error;
        }
    },

    // Mark all notifications as read
    markAllAsRead: async () => {
        try {
            const response = await api.patch('/api/v1/notifications/mark-all-read');
            return response.data;
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