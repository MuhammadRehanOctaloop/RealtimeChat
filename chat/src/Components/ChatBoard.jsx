import React, { useState, useEffect, useRef } from 'react';
import { messageService } from '../services/messageService';
import { socketService } from '../services/socketService';
import { BsArrowRight, BsArrowDown, BsPencil, BsImage, BsPaperclip, BsTrash, BsCheckAll } from "react-icons/bs";
import { notificationUtils } from '../utils/notificationUtils';

const ChatBoard = ({ selectedFriend, onClose }) => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [loading, setLoading] = useState(false);
    const [hasNewMessages, setHasNewMessages] = useState(false);
    const [isNearBottom, setIsNearBottom] = useState(true);
    const pollingInterval = useRef(null);
    const messagesEndRef = useRef(null);
    const messageContainerRef = useRef(null);
    const [editingMessage, setEditingMessage] = useState(null);
    const fileInputRef = useRef(null);
    const imageInputRef = useRef(null);
    const typingTimeout = useRef(null);
    const [errorMessage, setErrorMessage] = useState('');
    const CHARACTER_LIMIT = 10000;
    const [isButtonDisabled, setIsButtonDisabled] = useState(false);


    const scrollToBottom = () => {
        if (messageContainerRef.current) {
            messageContainerRef.current.scrollTop = messageContainerRef.current.scrollHeight;
        }
        setHasNewMessages(false);
    };

    const handleScroll = () => {
        if (messageContainerRef.current) {
            const { scrollTop, scrollHeight, clientHeight } = messageContainerRef.current;
            const bottom = scrollHeight - scrollTop - clientHeight < 100;
            setIsNearBottom(bottom);
            if (bottom) setHasNewMessages(false);
        }
    };

    const handleMarkAsRead = async (messageId) => {
        try {
            await messageService.markAsRead(messageId);
            setMessages(prev =>
                prev.map(msg =>
                    msg._id === messageId ? { ...msg, read: true } : msg
                )
            );
        } catch (error) {
            console.error('Error marking message as read:', error);
        }
    };

    const handleMarkAsUnread = async (messageId) => {
        try {
            await messageService.markAsUnread(messageId);
            setMessages(prev =>
                prev.map(msg =>
                    msg._id === messageId ? { ...msg, read: false } : msg
                )
            );
        } catch (error) {
            console.error('Error marking message as unread:', error);
        }
    };

    useEffect(() => {
        socketService.connect();

        const loadMessages = async () => {
            try {
                setLoading(true);
                const conversation = await messageService.getConversation(selectedFriend._id);
                setMessages(Array.isArray(conversation) ? conversation : []);
                setTimeout(scrollToBottom, 100);
            } catch (error) {
                console.error('Error loading messages:', error);
                setMessages([]);
            } finally {
                setLoading(false);
            }
        };

        const setupSocketListeners = () => {
            socketService.onMessage((message) => {
                if (message.sender._id === selectedFriend._id ||
                    message.recipient._id === selectedFriend._id) {
                    setMessages(prev => Array.isArray(prev) ? [...prev, message] : [message]);
                    if (!isNearBottom) {
                        setHasNewMessages(true);
                    }
                    if (message.sender._id === selectedFriend._id) {
                        notificationUtils.showNotification(
                            `New message from ${selectedFriend.username}`,
                            {
                                body: message.content,
                                tag: 'chat-message',
                                renotify: true
                            }
                        );
                    }
                    handleMarkAsRead(message._id);
                }
            });
            socketService.onTyping(({ isTyping: typing, senderId }) => {
                if (senderId === selectedFriend._id) {
                    setIsTyping(typing);
                }
            });
        };

        const startMessagePolling = () => {
            pollingInterval.current = setInterval(async () => {
                try {
                    const conversation = await messageService.getConversation(selectedFriend._id);
                    if (conversation.length > messages.length) {
                        setMessages(conversation);
                    }
                } catch (error) {
                    console.error('Error polling messages:', error);
                }
            }, 10000);
        };

        if (selectedFriend) {
            loadMessages();
            setupSocketListeners();
            startMessagePolling();
        }

        return () => {
            socketService.disconnect();
            if (pollingInterval.current) {
                clearInterval(pollingInterval.current);
            }
        };
    }, [selectedFriend]);

    useEffect(() => {
        if (isNearBottom) {
            setTimeout(scrollToBottom, 100);
        } else {
            setHasNewMessages(true);
        }
    }, [messages]);

    useEffect(() => {
        notificationUtils.requestPermission();
    }, []);

    useEffect(() => {
        socketService.onTyping(({ typing, senderId }) => {
            if (senderId === selectedFriend._id) {
                setIsTyping(typing);
            }
        });
    }, [selectedFriend]);

    useEffect(() => {
        const markAllMessagesAsRead = async () => {
            try {
                const unreadMessages = messages.filter(msg => !msg.read && msg.sender._id === selectedFriend._id);
                for (const message of unreadMessages) {
                    await messageService.markAsRead(message._id);
                }
                setMessages(prev =>
                    prev.map(msg =>
                        msg.sender._id === selectedFriend._id ? { ...msg, read: true } : msg
                    )
                );
            } catch (error) {
                console.error('Error marking all messages as read:', error);
            }
        };

        if (selectedFriend) {
            markAllMessagesAsRead();
        }
    }, [selectedFriend]);

    useEffect(() => {
        const markAllMessagesAsRead = async () => {
            try {
                const unreadMessages = messages.filter(msg => !msg.read && msg.sender._id === selectedFriend._id);
                for (const message of unreadMessages) {
                    await messageService.markAsRead(message._id);
                }
                setMessages(prev =>
                    prev.map(msg =>
                        msg.sender._id === selectedFriend._id ? { ...msg, read: true } : msg
                    )
                );
            } catch (error) {
                console.error('Error marking all messages as read:', error);
            }
        };

        if (selectedFriend) {
            markAllMessagesAsRead();
        }
    }, [messages]);

    const handleEditMessage = (message) => {
        setEditingMessage(message);
        setNewMessage(message.content);
    };

    const handleDeleteMessage = async (messageId) => {
        try {
            await messageService.deleteMessage(messageId);
            setMessages(prev => prev.filter(msg => msg._id !== messageId));
        } catch (error) {
            console.error('Error deleting message:', error);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || newMessage.length > CHARACTER_LIMIT) return;

        try {
            setIsButtonDisabled(true);
            if (editingMessage) {
                await messageService.editMessage(editingMessage._id, newMessage);
                setMessages(prev =>
                    prev.map(msg =>
                        msg._id === editingMessage._id
                            ? { ...msg, content: newMessage, edited: true }
                            : msg
                    )
                );
                setEditingMessage(null);
            } else {
                const sentMessage = await messageService.sendMessage(selectedFriend._id, newMessage);
                setMessages(prev => [...prev, sentMessage]);
                socketService.emitMessage(sentMessage);
            }
            setNewMessage('');
            setTimeout(() => setIsButtonDisabled(false), 1000);
        } catch (error) {
            console.error('Error sending/editing message:', error);
            setIsButtonDisabled(false);
        }
    };

    const handleTyping = (e) => {
        const message = e.target.value;
        if (message.length > CHARACTER_LIMIT) {
            setErrorMessage(`Message exceeds the limit of ${CHARACTER_LIMIT} characters.`);
        } else {
            setErrorMessage('');
        }
        setNewMessage(message);
        const user = JSON.parse(localStorage.getItem('user')); // Get user from localStorage
        const senderId = user ? user._id : null; // Get userId from user object
        socketService.emitTyping({ senderId, receiverId: selectedFriend._id, typing: message.length > 0 });
        clearTimeout(typingTimeout.current);
        typingTimeout.current = setTimeout(() => {
        socketService.emitStopTyping({ senderId, receiverId: selectedFriend._id });
        }, 3000);
    };

    const handleFileSelect = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        try {
            setLoading(true);
            const sentMessage = await messageService.sendFileMessage(selectedFriend._id, file);
            setMessages(prev => [...prev, sentMessage]);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        } catch (error) {
            console.error('Error sending file:', error);
            alert('Failed to send file. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleImageSelect = async (event) => {
        const image = event.target.files[0];
        if (!image) return;

        if (!image.type.startsWith('image/')) {
            alert('Please select a valid image file');
            return;
        }

        try {
            setLoading(true);
            const sentMessage = await messageService.sendImageMessage(selectedFriend._id, image);
            setMessages(prev => [...prev, sentMessage]);
            if (imageInputRef.current) {
                imageInputRef.current.value = '';
            }
        } catch (error) {
            console.error('Error sending image:', error);
            alert('Failed to send image. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex-1 flex flex-col bg-[#F4F4F4] h-screen">
            {/* Chat Header */}
            <div className="sticky top-0 z-10 w-full flex items-center justify-between p-4 border-b bg-[#F4F4F4]">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#008D9C] rounded-full flex items-center justify-center">
                        <span className="text-white text-lg">
                            {selectedFriend.username.charAt(0).toUpperCase()}
                        </span>
                    </div>
                    <div>
                        <h3 className="font-semibold">{selectedFriend.username}</h3>
                        {isTyping && (
                            <p className="text-sm text-gray-500">typing...</p>
                        )}
                    </div>
                </div>
                <button
                    onClick={onClose}
                    className="text-gray-500 hover:text-gray-700"
                >
                    Close
                </button>
            </div>

            {/* Messages Area */}
            <div
                ref={messageContainerRef}
                className="flex-1 overflow-y-auto p-4 space-y-4 mt-2 relative"
                style={{ height: 'calc(100vh - 160px)' }}
                onScroll={handleScroll}
            >
                {loading ? (
                    <div className="text-center text-gray-500">Loading messages...</div>
                ) : !Array.isArray(messages) || messages.length === 0 ? (
                    <div className="text-center text-gray-500">No messages yet</div>
                ) : (
                    <>
                        {messages.map((message) => (
                            <div
                                key={message._id || Math.random()}
                                className={`flex ${message.sender._id === selectedFriend._id ? 'justify-start' : 'justify-end'
                                    }`}
                            >
                                <div
                                    className={`max-w-[70%] rounded-lg p-3 ${message.sender._id === selectedFriend._id
                                            ? 'bg-[#E8E8E8]'
                                            : 'bg-[#19A2B0] text-white'
                                        } text-left relative group`}
                                >
                                    {message.sender._id !== selectedFriend._id && message.type === 'text' && (
                                        <>
                                            <button
                                                onClick={() => handleEditMessage(message)}
                                                className="absolute -left-8 top-2 opacity-0 group-hover:opacity-100 
                                                    text-gray-500 hover:text-[#008D9C] transition-opacity"
                                            >
                                                <BsPencil className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteMessage(message._id)}
                                                className="absolute -left-16 top-2 opacity-0 group-hover:opacity-100 
                                                    text-gray-500 hover:text-red-500 transition-opacity"
                                            >
                                                <BsTrash className="h-4 w-4" />
                                            </button>
                                        </>
                                    )}
                                    {message.type === 'image' ? (
                                        <img
                                            src={message.fileUrl}
                                            alt="Shared image"
                                            className="rounded-lg max-w-full cursor-pointer hover:opacity-90"
                                            onClick={() => window.open(message.fileUrl, '_blank')}
                                        />
                                    ) : message.type === 'file' ? (
                                        <div className="space-y-2">
                                            <a
                                                href={message.fileUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-2 text-current hover:underline"
                                            >
                                                <BsPaperclip className="h-4 w-4" />
                                                {message.fileName}
                                            </a>
                                            <div className="text-xs opacity-70">
                                                {(message.fileSize / 1024).toFixed(1)} KB
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="break-words">{message.content}</p>
                                    )}
                                    {message.edited && message.type === 'text' && (
                                        <span className="text-xs opacity-50 italic block">(edited)</span>
                                    )}
                                    <span className={`flex ${message.sender._id === selectedFriend._id
                                            ? 'justify-start'
                                            : 'justify-end'
                                        } text-xs opacity-70`}>
                                        {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                    <span className={`flex ${message.sender._id === selectedFriend._id
                                            ? 'justify-start'
                                            : 'justify-end'
                                        } text-xs opacity-70`}>
                                        <BsCheckAll className={`ml-2 ${message.read ? 'text-blue-800' : 'text-gray-500'}`} />
                                    </span>
                                </div>
                            </div>
                        ))}
                        <div ref={messagesEndRef} className="h-4" />
                    </>
                )}

                {/* New Messages Button */}
                {hasNewMessages && !isNearBottom && (
                    <button
                        onClick={scrollToBottom}
                        className="fixed top-20 left-1/2 transform -translate-x-1/2 
                            bg-[#008D9C] text-white px-4 py-2 rounded-full shadow-lg 
                            flex items-center gap-2 hover:bg-[#007483] transition-colors"
                    >
                        <BsArrowDown className="h-4 w-4" />
                        New Messages
                    </button>
                )}
            </div>

            {/* Message Input */}
            <form onSubmit={handleSendMessage} className="sticky bottom-0 p-4 bg-[#F4F4F4] border-t">
                <div className="flex items-center space-x-2 border-[#008D9C] rounded-lg bg-[#F4F4F4] relative">
                    {/* File Input */}
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileSelect}
                        className="hidden"
                        accept=".pdf,.doc,.docx,.txt,.xls,.xlsx,.zip,.rar"
                        disabled={loading}
                    />
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className={`p-2 text-[#008D9C] hover:bg-gray-100 rounded-lg ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        disabled={loading}
                    >
                        <BsPaperclip className="h-5 w-5" />
                    </button>

                    {/* Image Input */}
                    <input
                        type="file"
                        ref={imageInputRef}
                        onChange={handleImageSelect}
                        className="hidden"
                        accept="image/*"
                        disabled={loading}
                    />
                    <button
                        type="button"
                        onClick={() => imageInputRef.current?.click()}
                        className={`p-2 text-[#008D9C] hover:bg-gray-100 rounded-lg ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        disabled={loading}
                    >
                        <BsImage className="h-5 w-5" />
                    </button>

                    <input
                        type="text"
                        value={newMessage}
                        onChange={handleTyping}
                        placeholder={editingMessage ? "Edit message..." : "Start Chatting"}
                        className="flex-1 bg-[#F4F4F4] p-3 border-[#008D9C] border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008D9C]"
                    />
                    <button
                        type="submit"
                        disabled={!newMessage.trim() || newMessage.length > CHARACTER_LIMIT || isButtonDisabled}
                        className="bg-[#008D9C] absolute right-2 text-white p-2 rounded-lg hover:bg-[#007483] disabled:opacity-50"
                    >
                        <BsArrowRight className="h-6 w-6" />
                    </button>
                </div>
                {errorMessage && (
                    <p className="text-red-500 text-sm mt-2">{errorMessage}</p>
                )}
            </form>
        </div>
    );
};

export default ChatBoard;