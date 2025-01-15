import io from 'socket.io-client';

let socket = null;

export const socketService = {
    connect: (token) => {
        socket = io('http://localhost:3001', {
            auth: { token }
        });

        socket.on('connect', () => {
            console.log('Connected to WebSocket');
        });

        return socket;
    },

    disconnect: () => {
        if (socket) socket.disconnect();
    },

    // Message events
    onMessage: (callback) => {
        if (socket) {
            socket.on('new_message', (data) => {
                console.log('Received new message:', data);
                callback(data);
            });
        }
    },

    onTyping: (callback) => {
        if (socket) socket.on('typing', callback);
    },

    // Friend events
    onFriendRequest: (callback) => {
        console.log('Setting up friend request listener');
        if (socket) {
            socket.on('friend_request', (data) => {
                console.log('Received friend request via socket:', data);
                callback(data);
            });
        }
    },

    onFriendRequestAccepted: (callback) => {
        if (socket) socket.on('friend_request_accepted', callback);
    },

    onFriendRequestDeclined: (callback) => {
        if (socket) socket.on('friend_request_declined', callback);
    },

    onFriendStatusChange: (callback) => {
        if (socket) socket.on('friend_status_change', callback);
    },

    // Notification events
    onNotification: (callback) => {
        if (socket) {
            socket.on('newNotification', (data) => {
                console.log('Received notification:', data);
                callback(data.notification);
            });
        }
    },

    onNotificationUpdated: (callback) => {
        if (socket) {
            socket.on('notificationUpdated', callback);
        }
    },

    // Emitters
    emitTyping: (recipientId, isTyping) => {
        if (socket) socket.emit('typing', { recipientId, isTyping });
    },

    emitMessage: (message) => {
        if (socket) {
            console.log('Emitting message:', message);
            socket.emit('message', message);
        }
    },

    emitFriendRequest: (userId) => {
        if (socket) socket.emit('friend_request', { userId });
    },

    emitFriendRequestResponse: (requestId, accepted) => {
        if (socket) socket.emit('friend_request_response', { requestId, accepted });
    },

    emitStopTyping: (recipientId) => {
        if (socket) socket.emit('stopTyping', { recipientId });
    },

    emitNotificationRead: (notificationId) => {
        if (socket) socket.emit('notificationRead', { notificationId });
    }
}; 