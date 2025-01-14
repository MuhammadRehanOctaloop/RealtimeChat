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
        if (socket) socket.on('new_message', callback);
    },

    onTyping: (callback) => {
        if (socket) socket.on('typing', callback);
    },

    // Friend events
    onFriendRequest: (callback) => {
        if (socket) socket.on('friend_request', callback);
    },

    onFriendRequestAccepted: (callback) => {
        if (socket) socket.on('friend_request_accepted', callback);
    },

    onFriendStatusChange: (callback) => {
        if (socket) socket.on('friend_status_change', callback);
    },

    // Notification events
    onNotification: (callback) => {
        if (socket) socket.on('notification', callback);
    },

    // Emitters
    emitTyping: (recipientId, isTyping) => {
        if (socket) socket.emit('typing', { recipientId, isTyping });
    },

    emitMessage: (message) => {
        if (socket) socket.emit('message', message);
    },

    emitFriendRequest: (userId) => {
        if (socket) socket.emit('friend_request', { userId });
    },

    emitFriendRequestResponse: (requestId, accepted) => {
        if (socket) socket.emit('friend_request_response', { requestId, accepted });
    }
}; 