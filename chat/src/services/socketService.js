import io from 'socket.io-client';

let socket = null;

export const socketService = {
    connect: () => {
        const user = JSON.parse(localStorage.getItem('user')); // Get user from localStorage
        const userId = user ? user._id : null; // Get userId from user object
        const token = localStorage.getItem('accessToken');
        console.log('Connecting with userId:', userId, 'and token:', token); // Debug log

        socket = io('http://localhost:3001', {
            auth: { token, userId }  // Pass userId here
        });

        socket.on('connect', () => {
            console.log('Connected to WebSocket');
            if (userId) {
                socket.emit('join', userId); // Join the user's room
                console.log(`User ${userId} joined their room`);
            }
        });

        socket.on('connect_error', (err) => {
            console.error('Connection error:', err.message);
        });

        return socket;
    },

    disconnect: () => {
        if (socket) socket.disconnect();
    },

    // Message events
    onMessage: (callback) => {
        if (socket) {
            console.log('----------------inside onMessage-----------------');
            socket.on('newMessage', (data) => {
                console.log('Received new message:', data);
                callback(data);
            });
        }
    },

    onTyping: (callback) => {
        if (socket) socket.on('userTyping', callback);
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
        if (socket) socket.emit('userTyping', { recipientId, isTyping });
    },

    emitMessage: (message) => {
        if (socket) {
            console.log('Emitting message:', message);
            socket.emit('new_message', message);
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