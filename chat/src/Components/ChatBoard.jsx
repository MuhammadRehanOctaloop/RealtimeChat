import React, { useState, useEffect } from 'react';
import { messageService } from '../services/messageService';
import { socketService } from '../services/socketService';
import { BsArrowRight } from "react-icons/bs";

const ChatBoard = ({ selectedFriend, onClose }) => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (selectedFriend) {
            loadMessages();
            setupSocketListeners();
        }

        return () => {
            socketService.disconnect();
        };
    }, [selectedFriend]);

    const loadMessages = async () => {
        try {
            setLoading(true);
            const conversation = await messageService.getConversation(selectedFriend._id);
            setMessages(Array.isArray(conversation) ? conversation : []);
        } catch (error) {
            console.error('Error loading messages:', error);
            setMessages([]);
        } finally {
            setLoading(false);
        }
    };

    const setupSocketListeners = () => {
        socketService.onMessage((message) => {
            setMessages(prev => Array.isArray(prev) ? [...prev, message] : [message]);
        });

        socketService.onTyping(({ isTyping: typing, userId }) => {
            if (userId === selectedFriend._id) {
                setIsTyping(typing);
            }
        });
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        try {
            await messageService.sendMessage(selectedFriend._id, newMessage);
            setNewMessage('');
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };

    const handleTyping = (e) => {
        setNewMessage(e.target.value);
        socketService.emitTyping(selectedFriend._id, e.target.value.length > 0);
    };

    return (
        <div className="flex-1 flex flex-col bg-[#F4F4F4] rounded-lg shadow-lg">
            {/* Chat Header */}
            <div className="flex items-center justify-between p-4 border-b">
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
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {loading ? (
                    <div className="text-center text-gray-500">Loading messages...</div>
                ) : !Array.isArray(messages) || messages.length === 0 ? (
                    <div className="text-center text-gray-500">No messages yet</div>
                ) : (
                    messages.map((message) => (
                        <div
                            key={message._id || Math.random()}
                            className={`flex ${
                                message.sender === selectedFriend._id ? 'justify-start' : 'justify-end'
                            }`}
                        >
                            <div
                                className={`max-w-[70%] rounded-lg p-3 ${
                                    message.sender === selectedFriend._id
                                        ? 'bg-gray-100'
                                        : 'bg-[#008D9C] text-white'
                                }`}
                            >
                                <p>{message.content}</p>
                                <span className="text-xs opacity-70">
                                    {new Date(message.createdAt).toLocaleTimeString()}
                                </span>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Message Input */}
            <form onSubmit={handleSendMessage} className="p-4 pt-0">
                <div className="flex items-center space-x-2 border-[#008D9C] rounded-lg bg-[#F4F4F4] relative">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={handleTyping}
                        placeholder="Start Chatting"
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