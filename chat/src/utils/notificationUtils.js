export const notificationUtils = {
    
    requestPermission: async () => {
        if (!("Notification" in window)) {
            console.log("This browser does not support notifications");
            return false;
        }

        if (Notification.permission === "granted") {
            return true;
        }

        const permission = await Notification.requestPermission();
        return permission === "granted";
    },

    showNotification: (title, options = {}) => {
        if (Notification.permission === "granted" && document.hidden) {
            try {
                new Notification(title, {
                    icon: '/logo192.png', // Add your app icon
                    badge: '/logo192.png',
                    ...options
                });
            } catch (error) {
                console.error('Error showing notification:', error);
            }
        }
    }
};