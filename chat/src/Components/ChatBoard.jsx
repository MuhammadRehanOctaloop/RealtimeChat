import React, { useState, useEffect, useRef } from 'react';
import { messageService } from '../services/messageService';
import { socketService } from '../services/socketService';
import { BsArrowRight, BsArrowDown, BsPencil, BsCheck, BsX } from "react-icons/bs";
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
    const [editText, setEditText] = useState('');

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

    useEffect(() => {
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
        }, 2000);
    };

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
            }
        });

        socketService.onTyping(({ isTyping: typing, userId }) => {
            if (userId === selectedFriend._id) {
                setIsTyping(typing);
            }
        });
    };

    const handleEditMessage = (message) => {
        setEditingMessage(message);
        setNewMessage(message.content);
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        try {
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
            }
            setNewMessage('');
        } catch (error) {
            console.error('Error sending/editing message:', error);
        }
    };

    const handleTyping = (e) => {
        setNewMessage(e.target.value);
        socketService.emitTyping(selectedFriend._id, e.target.value.length > 0);
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
                                className={`flex ${
                                    message.sender._id === selectedFriend._id ? 'justify-start' : 'justify-end'
                                }`}
                            >
                                <div
                                    className={`max-w-[70%] rounded-lg p-3 ${
                                        message.sender._id === selectedFriend._id
                                            ? 'bg-gray-100'
                                            : 'bg-[#008D9C] text-white'
                                    } text-left relative group`}
                                >
                                    {message.sender._id !== selectedFriend._id && (
                                        <button
                                            onClick={() => handleEditMessage(message)}
                                            className="absolute -left-8 top-2 opacity-0 group-hover:opacity-100 
                                                text-gray-500 hover:text-[#008D9C] transition-opacity"
                                        >
                                            <BsPencil className="h-4 w-4" />
                                        </button>
                                    )}
                                    <p className="break-words">{message.content}</p>
                                    {message.edited && (
                                        <span className="text-xs opacity-50 italic block">(edited)</span>
                                    )}
                                    <span className={`flex ${
                                        message.sender._id === selectedFriend._id 
                                            ? 'justify-start' 
                                            : 'justify-end'
                                    } text-xs opacity-70`}>
                                        {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
                    <input
                        type="text"
                        value={newMessage}
                        onChange={handleTyping}
                        placeholder={editingMessage ? "Edit message..." : "Start Chatting"}
                        className="flex-1 bg-[#F4F4F4] p-3 border-[#008D9C] border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008D9C]"
                    />
                    <button
                        type="submit"
                        disabled={!newMessage.trim()}
                        className="bg-[#008D9C] absolute right-2 text-white p-2 rounded-lg hover:bg-[#007483] disabled:opacity-50"
                    >
                        <BsArrowRight className="h-6 w-6" />
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ChatBoard; 