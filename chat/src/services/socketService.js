import io from 'socket.io-client';

let socket = null;

export const socketService = {
    connect: () => {
        const user = JSON.parse(localStorage.getItem('user')); // Get user from localStorage
        const userId = user ? user._id : null; // Get userId from user object
        const token = localStorage.getItem('accessToken');
    
        socket = io('http://localhost:3001', {
            auth: { token, userId }  // Pass userId here
        });

        socket.on('connect', () => {
            console.log('Connected to WebSocket');
            if (userId) {
                socket.emit('join', userId); // Join the user's room
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
            socket.on('newMessage', (data) => {
                console.log('Received new message:', data);
                callback(data);
            });
        }
    },

    onTyping: (callback) => {
        if (socket) {
            socket.on('userTyping', (data) => {
                callback(data);
            });
        }
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
    emitTyping: ({ senderId, receiverId, typing }) => {
        if (socket) {
            socket.emit('typing', { senderId, receiverId, typing });
        }
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

    emitStopTyping: ({ senderId, receiverId, typing }) => {
        if (socket) socket.emit('stopTyping', { senderId, receiverId, typing });
    },

    emitNotificationRead: (notificationId) => {
        if (socket) socket.emit('notificationRead', { notificationId });
    }
};