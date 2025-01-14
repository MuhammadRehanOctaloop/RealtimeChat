import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { RiLogoutBoxRLine } from "react-icons/ri";
import { FiMenu } from "react-icons/fi";
import { BsArrowRight } from "react-icons/bs";
import { BiUser } from "react-icons/bi";
import { IoNotificationsOutline } from "react-icons/io5";
import { IoMdClose } from "react-icons/io";
import NavBar from './NavBar';
import { friendService } from '../services/friendService';
import { useAuth } from '../context/AuthContext';
import { socketService } from '../services/socketService';
import { messageService } from '../services/messageService';
import api from '../services/api';
import { notificationService } from '../services/notificationService';
import Notifications from './Notifications';

const Dashboard = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [friends, setFriends] = useState([]);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [messages, setMessages] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [messageInput, setMessageInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const { user } = useAuth();
  const typingTimeoutRef = useRef(null);
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [friendRequests, setFriendRequests] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationsRef = useRef(null);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [notificationsError, setNotificationsError] = useState(null);

  // Add notification handler
  const handleNotification = (notification) => {
    setNotifications(prev => [notification, ...prev]);
    setUnreadNotifications(prev => prev + 1);
  };

  // Initialize WebSocket connection
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setNotificationsLoading(true);
        setNotificationsError(null);
        console.log('Fetching notifications...');
        
        const allNotifications = await notificationService.getAllNotifications();
        console.log('Received notifications:', allNotifications);
        setNotifications(allNotifications);
        
        const unreadNotifications = await notificationService.getUnreadNotifications();
        console.log('Unread notifications:', unreadNotifications);
        setUnreadNotifications(unreadNotifications.length);
      } catch (error) {
        console.error('Error fetching notifications:', error);
        setNotificationsError('Failed to load notifications');
        setNotifications([]);
      } finally {
        setNotificationsLoading(false);
      }
    };

    fetchNotifications();
    // Set up interval to periodically fetch notifications
    const interval = setInterval(fetchNotifications, 30000);

    const socket = socketService.connect(localStorage.getItem('accessToken'));

    // Update socket notification handler
    socketService.onNotification((data) => {
      console.log('Received notification via socket:', data);
      setNotifications(prev => [data, ...prev]);
      setUnreadNotifications(prev => prev + 1);
    });

    socketService.onMessage((message) => {
      if (selectedFriend?._id === message.sender) {
        setMessages(prev => [...prev, message]);
      }
    });

    socketService.onTyping(({ userId, isTyping }) => {
      if (selectedFriend?._id === userId) {
        setIsTyping(isTyping);
      }
    });

    socketService.onFriendStatusChange(({ userId, online }) => {
      setFriends(prev => prev.map(friend => 
        friend._id === userId ? { ...friend, online } : friend
      ));
    });

    // Listen for friend requests
    socketService.onFriendRequest((data) => {
      console.log('Received friend request via socket:', data);
      setFriendRequests(prev => {
        const exists = prev.some(req => 
          req._id === data._id || 
          (req.sender._id === data.sender._id && req.recipient._id === data.recipient._id)
        );
        if (!exists) {
          return [...prev, data];
        }
        return prev;
      });

      // Add notification for friend request
      handleNotification({
        type: 'friend_request',
        sender: data.sender,
        recipient: data.recipient,
        createdAt: new Date(),
        read: false,
        _id: data._id
      });
    });

    // Listen for friend request accepted
    socketService.onFriendRequestAccepted((data) => {
      setFriends(prev => [...prev, data.user]);
      // You can add a notification here
    });

    // Listen for friend request declined
    socketService.onFriendRequestDeclined((requestId) => {
      setFriendRequests(prev => prev.filter(req => req._id !== requestId));
    });

    return () => {
      socketService.disconnect();
      clearInterval(interval);
    };
  }, []);

  // Handle friend selection
  const handleFriendSelect = async (friend) => {
    setSelectedFriend(friend);
    try {
      const messages = await messageService.getConversation(friend._id);
      setMessages(messages);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  // Handle message sending
  const handleSendMessage = async () => {
    if (!messageInput.trim() || !selectedFriend) return;

    try {
      const message = await messageService.sendMessage(
        selectedFriend._id,
        messageInput
      );
      setMessages(prev => [...prev, message]);
      setMessageInput('');
      socketService.emitMessage(message);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  // Handle typing indicator
  const handleTyping = () => {
    if (selectedFriend) {
      socketService.emitTyping(selectedFriend._id, true);
      
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      typingTimeoutRef.current = setTimeout(() => {
        socketService.emitTyping(selectedFriend._id, false);
      }, 1000);
    }
  };

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        setLoading(true);
        setError(null);
        const friendsData = await friendService.getFriends();
        setFriends(Array.isArray(friendsData) ? friendsData : []);
      } catch (error) {
        console.error('Error fetching friends:', error);
        setError('Failed to load friends. Please try again later.');
        setFriends([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFriends();
  }, []);

  const handleLogout = () => {
    navigate('/');
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Add search users function
  const handleSearch = async (value) => {
    setSearchQuery(value);
    if (value.length < 2) {
      setSearchResults([]);
      return;
    }

    try {
      setSearchLoading(true);
      const results = await friendService.searchUsers(value);
      // Filter out current user and existing friends
      const filteredResults = results.filter(
        searchUser => searchUser._id !== user?._id && 
        !friends.some(friend => friend._id === searchUser._id)
      );
      setSearchResults(filteredResults);
    } catch (error) {
      console.error('Error searching users:', error);
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  // Handle send friend request
  const handleSendFriendRequest = async (userId) => {
    try {
      setSearchLoading(true);
      const result = await friendService.sendFriendRequest(userId);
      
      if (!result.success) {
        // If it's a duplicate request, just close the dropdown
        if (result.error === 'Friend request already sent') {
          return result;
        }
        // For other errors, show them to the user
        console.error('Error:', result.error);
        return result;
      }
      
      // Remove user from search results
      setSearchResults(prev => prev.filter(user => user._id !== userId));
      return result;
    } catch (error) {
      console.error('Error sending friend request:', error);
      return {
        success: false,
        error: 'Failed to send friend request'
      };
    } finally {
      setSearchLoading(false);
    }
  };

  // Handle accept friend request
  const handleAcceptFriendRequest = async (requestId) => {
    try {
      await friendService.acceptFriendRequest(requestId);
      // Remove the request from the list
      setFriendRequests(prev => prev.filter(req => req._id !== requestId));
      // Refresh friends list
      const updatedFriends = await friendService.getFriends();
      setFriends(updatedFriends);
    } catch (error) {
      console.error('Error accepting friend request:', error);
    }
  };

  // Handle decline friend request
  const handleDeclineFriendRequest = async (requestId) => {
    try {
      await friendService.declineFriendRequest(requestId);
      setFriendRequests(prev => prev.filter(req => req._id !== requestId));
    } catch (error) {
      console.error('Error declining friend request:', error);
    }
  };

  // Add useEffect to fetch friend requests
  useEffect(() => {
    const fetchFriendRequests = async () => {
      try {
        console.log('Fetching friend requests...');
        const requests = await friendService.getFriendRequests();
        console.log('Received friend requests:', requests);
        if (Array.isArray(requests)) {
          setFriendRequests(requests);
        } else {
          console.error('Invalid friend requests format:', requests);
        }
      } catch (error) {
        console.error('Error fetching friend requests:', error);
      }
    };

    fetchFriendRequests();
    // Check for new requests every 30 seconds
    const interval = setInterval(fetchFriendRequests, 30000);

    return () => clearInterval(interval);
  }, []);

  // Handle marking notifications as read
  const handleMarkAsRead = async (notificationId) => {
    try {
      await notificationService.markAsRead(notificationId);
      setNotifications(prev => 
        prev.map(notif => 
          notif._id === notificationId ? { ...notif, read: true } : notif
        )
      );
      setUnreadNotifications(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Add function to mark all as read
  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
      setUnreadNotifications(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  // Add function to delete notification
  const handleDeleteNotification = async (notificationId) => {
    try {
      await notificationService.deleteNotification(notificationId);
      setNotifications(prev => prev.filter(notif => notif._id !== notificationId));
      // Update unread count if needed
      setUnreadNotifications(prev => 
        notifications.find(n => n._id === notificationId && !n.read) ? prev - 1 : prev
      );
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  // Add click outside handler for notifications
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showNotifications && 
          notificationsRef.current && 
          !notificationsRef.current.contains(event.target) &&
          !event.target.closest('.notification-button')) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showNotifications]);

  return (
    <div className="flex h-screen bg-white relative">
      {/* Mobile Menu Button - Hidden when sidebar is open */}
      <button 
        onClick={toggleSidebar}
        className={`
          lg:hidden absolute top-5 left-40 z-50 bg-[#008D9C] text-white p-1 rounded-lg 
          hover:bg-[#007483] transition-all duration-300
          ${isSidebarOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'}
        `}
      >
        <FiMenu className="h-6 w-6" />
      </button>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Left Sidebar */}
      <div 
        className={`
          fixed lg:static w-[250px] bg-white border-r flex flex-col h-full z-40
          transform transition-transform duration-300 ease-in-out
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Close button for mobile */}
        <button 
          onClick={toggleSidebar}
          className="lg:hidden absolute pl-2 pr-2 top-4 right-4 text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100"
        >
          <IoMdClose className="h-6 w-6" />
        </button>

        <div className="p-4 flex-1 overflow-y-auto">
          <h1 className="text-xl text-center font-bold text-[#008D9C] mb-10 mt-4">CHATTING</h1>
          
          <div className="flex justify-center ml-2 mr-2 relative">
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="notification-button w-full mt-2 bg-gradient-to-r from-[#008D9C] to-[#003136] text-white py-2 px-3 rounded-lg hover:opacity-90 transition-opacity relative"
            >
              <div className="flex items-center justify-center gap-2">
                <IoNotificationsOutline className="h-5 w-5" />
                <span>Notifications</span>
                {unreadNotifications > 0 && (
                  <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                    {unreadNotifications}
                  </div>
                )}
              </div>
            </button>
            {showNotifications && (
              <div ref={notificationsRef} className="absolute right-0 top-full mt-2 z-50">
                <Notifications
                  notifications={notifications}
                  onAccept={handleAcceptFriendRequest}
                  onDecline={handleDeclineFriendRequest}
                  onMarkAsRead={handleMarkAsRead}
                  loading={notificationsLoading}
                  error={notificationsError}
                />
              </div>
            )}
          </div>

          {/* Friends List Section */}
          <div className="mt-6">
            <hr className="border-t-2 border-[#008D9C]" />
            <h2 className="text-sm font-medium text-center text-black mt-3">Friends</h2>
            
            <div className="space-y-2 mt-3">
              {loading ? (
                <div className="text-center text-gray-500 py-2">Loading friends...</div>
              ) : error ? (
                <div className="text-center text-red-500 py-2">{error}</div>
              ) : friends.length === 0 ? (
                <div className="text-center text-gray-500 py-2">No friends yet</div>
              ) : (
                friends.map((friend) => (
                  <div key={friend._id} className="p-2 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-[#008D9C] rounded-full flex items-center justify-center">
                        <BiUser className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-500">{friend.username}</div>
                        <div className="text-xs text-gray-400">
                          {friend.online ? 'Online' : 'Offline'}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
        
        {/* Logout Button */}
        <div className="pl-6 p-4 pr-6">
          <button 
            onClick={handleLogout}
            className="w-full bg-gradient-to-r from-[#008D9C] to-[#003136] text-white py-2 px-3 rounded-lg hover:opacity-90 transition-opacity"
          >
            <div className="flex items-center justify-center">
              <RiLogoutBoxRLine className="h-5 w-5 mr-2" />
              <span>Log out</span>
            </div>
          </button>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-[#F4F4F4]">
        <NavBar 
          isDropdownOpen={isDropdownOpen}
          setIsDropdownOpen={setIsDropdownOpen}
          searchQuery={searchQuery}
          handleSearch={handleSearch}
          searchLoading={searchLoading}
          searchResults={searchResults}
          handleSendFriendRequest={handleSendFriendRequest}
          friendRequests={friendRequests}
          onAcceptRequest={handleAcceptFriendRequest}
          onDeclineRequest={handleDeclineFriendRequest}
        />

        {/* Chat Messages */}
        <div className="flex-1 flex flex-col justify-end">
          <div className="overflow-y-auto p-4 space-y-4">
            <div className="flex flex-col justify-end space-y-4">
              <div className="flex text-left items-start space-x-2">
                <div className="bg-[#008D9C] rounded-lg p-3 max-w-md">
                  <p className="text-white text-left">Hi, how are you?</p>
                </div>
              </div>
              
              <div className="flex text-left items-start space-x-2">
                <div className="bg-[#E8E8E8] text-left text-black text-left rounded-lg p-3 max-w-md">
                  <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Message Input */}
        <div className="p-4 pt-0">
          <div className="flex items-center space-x-2 border-[#008D9C] rounded-lg bg-[#F4F4F4]">
            <input
              type="text"
              placeholder="Start Chatting"
              className="flex-1 bg-[#F4F4F4] p-3 border-[#008D9C] border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008D9C]"
            />
            <button className="bg-[#008D9C] absolute right-7 text-white p-2 rounded-lg">
              <BsArrowRight className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
