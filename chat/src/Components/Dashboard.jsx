import React, { useState, useEffect, useRef } from "react";
import { io } from 'socket.io-client';
import { useNavigate } from "react-router-dom";
import { RiLogoutBoxRLine } from "react-icons/ri";
import { BiUser } from "react-icons/bi";
import { IoMdClose } from "react-icons/io";
import NavBar from './NavBar';
import { friendService } from '../services/friendService';
import { useAuth } from '../context/AuthContext';
import { socketService } from '../services/socketService';
import { notificationService } from '../services/notificationService';
import Notifications from './Notifications';
import ChatBoard from './ChatBoard';
import { notificationUtils } from '../utils/notificationUtils';

const Dashboard = () => {
  // State management
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [friends, setFriends] = useState([]);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState(null);
  const [friendRequests, setFriendRequests] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [notificationsError, setNotificationsError] = useState(null);

  // Refs for DOM elements
  const notificationsRef = useRef(null);
  const notificationButtonRef = useRef(null);
  const friendsPollingInterval = useRef(null);
  const notificationsPollingInterval = useRef(null);

  // Hooks
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Notification handler
  const handleNotification = (notification) => {
    setNotifications(prev => [notification, ...prev]);
    setUnreadCount(prev => prev + 1);
  };

  // WebSocket and data fetching
  useEffect(() => {
    const URL = 'http://localhost:3001';
    const socket = io(URL, {
      "force new connection": true,
      "reconnectionAttempts": "infinity",
      "timeout": 10000,
      "transports": ["websocket"]
    });

    socket.timeout(5000).emit('myevent', 'Hello from the client!');

    socket.on('connect', () => {
      socket.on('myevent', (data) => {
        console.log('Received message from server:', data);
      });
    });

    socketService.connect();
    setTimeout(() => {
      socketService.emitMessage('Hello from the client!');
    }, 5000);

    const fetchNotifications = async () => {
      try {
        setNotificationsLoading(true);
        setNotificationsError(null);
        const messageNotifications = await notificationService.getMessageNotifications();
        setNotifications(messageNotifications);
        const unreadCount = messageNotifications.filter(notif => !notif.read).length;
        setUnreadCount(unreadCount);
      } catch (error) {
        console.error('Error fetching notifications:', error);
        setNotificationsError('Failed to load notifications');
        setNotifications([]);
      } finally {
        setNotificationsLoading(false);
      }
    };

    const startNotificationsPolling = () => {
      notificationsPollingInterval.current = setInterval(async () => {
        try {
          const messageNotifications = await notificationService.getMessageNotifications();
          setNotifications(prev => {
            if (JSON.stringify(prev) !== JSON.stringify(messageNotifications)) {
              return messageNotifications;
            }
            return prev;
          }, 5000);
          const newUnreadCount = messageNotifications.filter(notif => !notif.read).length;
          if (newUnreadCount !== unreadCount) {
            setUnreadCount(newUnreadCount);
          }
        } catch (error) {
          console.error('Error polling notifications:', error);
        }
      }, 50000);
    };

    fetchNotifications();
    startNotificationsPolling();

    socketService.onFriendStatusChange(({ userId, online }) => {
      setFriends(prev => prev.map(friend =>
        friend._id === userId ? { ...friend, online } : friend
      ));
    });

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

      handleNotification({
        type: 'friend_request',
        sender: data.sender,
        recipient: data.recipient,
        createdAt: new Date(),
        read: false,
        _id: data._id
      });
    });

    socketService.onFriendRequestAccepted((data) => {
      setFriends(prev => [...prev, data.user]);
    });

    socketService.onFriendRequestDeclined((requestId) => {
      setFriendRequests(prev => prev.filter(req => req._id !== requestId));
    });

    // Listen for new notifications
    socketService.onNotification((notification) => {
      // Add new notification to the list
      setNotifications(prev => [notification, ...prev]);

      // Only increment if notification is not already read
      if (!notification.read) {
        setUnreadCount(prev => prev + 1);
      }

      // Show browser notification if it's a message
      if (notification.type === 'message') {
        notificationUtils.showNotification(
          `New message from ${notification.sender.username}`,
          {
            body: notification.messageId.content,
            tag: 'message-notification',
            data: {
              notificationId: notification._id,
              senderId: notification.sender._id
            }
          }
        );
      }
    });

    socketService.onNotificationUpdated(({ notificationId, read }) => {
      setNotifications(prev =>
        prev.map(notif =>
          notif._id === notificationId ? { ...notif, read } : notif
        )
      );

      if (read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    });

    return () => {
      socketService.disconnect();
      if (notificationsPollingInterval.current) {
        clearInterval(notificationsPollingInterval.current);
      }
    };
  }, []);

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
    logout();
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleSearch = async (value) => {
    setSearchQuery(value);
    if (value.length < 2) {
      setSearchResults([]);
      return;
    }

    try {
      setSearchLoading(true);
      const results = await friendService.searchUsers(value);
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

  const handleSendFriendRequest = async (userId) => {
    try {
      setSearchLoading(true);
      const result = await friendService.sendFriendRequest(userId);

      if (!result.success) {
        if (result.error === 'Friend request already sent') {
          return result;
        }
        console.error('Error:', result.error);
        return result;
      }

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

  const handleAcceptFriendRequest = async (requestId) => {
    try {
      await friendService.acceptFriendRequest(requestId);
      setFriendRequests(prev => prev.filter(req => req._id !== requestId));
      const updatedFriends = await friendService.getFriends();
      setFriends(updatedFriends);
    } catch (error) {
      console.error('Error accepting friend request:', error);
    }
  };

  const handleDeclineFriendRequest = async (requestId) => {
    try {
      await friendService.declineFriendRequest(requestId);
      setFriendRequests(prev => prev.filter(req => req._id !== requestId));
    } catch (error) {
      console.error('Error declining friend request:', error);
    }
  };

  useEffect(() => {
    const fetchFriendRequests = async () => {
      try {
        const requests = await friendService.getFriendRequests();
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
    const interval = setInterval(fetchFriendRequests, 50000);

    return () => clearInterval(interval);
  }, []);

  const handleMarkAsRead = async (notificationId) => {
    try {
      await notificationService.markAsRead(notificationId);
      setNotifications(prev =>
        prev.map(notif =>
          notif._id === notificationId ? { ...notif, read: true } : notif
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
      setShowNotifications(false);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
      setUnreadCount(0);
      setShowNotifications(false);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showNotifications &&
        notificationsRef.current &&
        !notificationsRef.current.contains(event.target) &&
        !notificationButtonRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showNotifications]);

  const handleFriendClick = (friend) => {
    setSelectedFriend(friend);
  };

  useEffect(() => {
    notificationUtils.requestPermission();

    const loadInitialData = async () => {
      try {
        const [friendsData, requestsData, notificationsData] = await Promise.all([
          friendService.getFriends(),
          friendService.getFriendRequests(),
          notificationService.getAllNotifications()
        ]);

        setFriends(friendsData);
        setFriendRequests(requestsData);
        setNotifications(notificationsData);
      } catch (error) {
        console.error('Error loading initial data:', error);
      }
    };

    loadInitialData();
    startFriendsPolling();

    return () => {
      if (friendsPollingInterval.current) {
        clearInterval(friendsPollingInterval.current);
      }
    };
  }, []);

  const startFriendsPolling = () => {
    friendsPollingInterval.current = setInterval(async () => {
      try {
        const friendsData = await friendService.getFriends();
        setFriends(prev => {
          if (JSON.stringify(prev) !== JSON.stringify(friendsData)) {
            return friendsData;
          }
          return prev;
        });
      } catch (error) {
        console.error('Error polling friends:', error);
      }
    }, 50000);
  };

  return (
    <div className="flex h-screen bg-white relative">
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
          <h1 className="text-xl text-center font-bold text-[#008D9C] mb-4 mt-4">CHATTING</h1>

          <div className="flex justify-center ml-2 mr-2 relative">
            {showNotifications && (
              <div ref={notificationsRef} className="absolute left-5 top-full mt-2 z-50">
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
                <div className="flex-1 overflow-y-auto">
                  {friends.map((friend) => (
                    <div
                      key={friend._id}
                      onClick={() => handleFriendClick(friend)}
                      className={`flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer
                        ${selectedFriend?._id === friend._id ? 'bg-gray-100' : ''}`}
                    >
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
                  ))}
                </div>
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

      {/* Main Content Area */}
      <div className="flex-1 flex bg-[#F4F4F4] flex-col">
        {/* Show NavBar only when no friend is selected */}
        {!selectedFriend && (
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
            notifications={notifications}
            unreadNotifications={unreadCount}
            onMarkNotificationRead={handleMarkAsRead}
            onMarkAllNotificationsRead={handleMarkAllAsRead}
            toggleSidebar={toggleSidebar}
            isSidebarOpen={isSidebarOpen}
          />
        )}

        {selectedFriend ? (
          <ChatBoard
            selectedFriend={selectedFriend}
            onClose={() => setSelectedFriend(null)}
          />
        ) : (
          <div className="flex-1 flex bg-[#F4F4F4] items-center justify-center">
            <div className="text-center text-gray-500">
              <p className="text-xl font-semibold">Welcome to Chat</p>
              <p className="mt-2">Select a friend to start chatting</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;