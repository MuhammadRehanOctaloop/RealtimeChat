import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { RiLogoutBoxRLine } from "react-icons/ri";
import { FiSearch, FiMenu } from "react-icons/fi";
import { FaCaretDown } from "react-icons/fa";
import { BsArrowRight } from "react-icons/bs";
import { BiUser } from "react-icons/bi";
import { IoNotificationsOutline } from "react-icons/io5";
import { IoMdClose } from "react-icons/io";
import { friendService } from '../services/friendService';
import { useAuth } from '../context/AuthContext';
import { socketService } from '../services/socketService';
import { messageService } from '../services/messageService';
import api from '../services/api';

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

  // Initialize WebSocket connection
  useEffect(() => {
    const socket = socketService.connect(localStorage.getItem('accessToken'));

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

    socketService.onNotification((notification) => {
      setNotifications(prev => [notification, ...prev]);
      setUnreadNotifications(prev => prev + 1);
    });

    // Listen for friend requests
    socketService.onFriendRequest((data) => {
      setFriendRequests(prev => [...prev, data]);
      // You can add a notification here
    });

    // Listen for friend request accepted
    socketService.onFriendRequestAccepted((data) => {
      setFriends(prev => [...prev, data.user]);
      // You can add a notification here
    });

    return () => socketService.disconnect();
  }, [selectedFriend]);

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
      await friendService.sendFriendRequest(userId);
      // Remove user from search results
      setSearchResults(prev => prev.filter(user => user._id !== userId));
      setIsDropdownOpen(false);
      // You can add a success notification here
    } catch (error) {
      console.error('Error sending friend request:', error);
      // You can add an error notification here
    } finally {
      setSearchLoading(false);
    }
  };

  // Handle accept friend request
  const handleAcceptFriendRequest = async (requestId) => {
    try {
      await friendService.acceptFriendRequest(requestId);
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
          
          <div className="flex justify-center ml-2 mr-2">
            <button className="w-full mt-2 bg-gradient-to-r from-[#008D9C] to-[#003136] text-white py-2 px-3 rounded-lg hover:opacity-90 transition-opacity relative">
              <div className="flex items-center justify-center gap-2">
                <IoNotificationsOutline className="h-5 w-5" />
                <span>Notifications</span>
                <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  3
                </div>
              </div>
            </button>
          </div>

          {/* Friends List - Updated */}
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
        {/* Chat Header with Dropdown */}
        <div className="border-b border-t border-[#008D9C] mt-3 p-2 flex justify-between mx-5 items-center relative">
          <h2 className="text-1xl font-semibold text-[#008D9C]">CHATTING</h2>
          <div className="flex items-center">
            <div className="relative">
              <button 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="bg-[#008D9C] text-white px-4 py-1 rounded-lg flex items-center gap-2"
              >
                Add Friend
                <FaCaretDown className="h-5 w-5" />
              </button>

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-60 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                  <div className="p-2">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search users"
                        value={searchQuery}
                        onChange={(e) => handleSearch(e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg pr-8 focus:outline-none focus:ring-2 focus:ring-[#008D9C]"
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-2">
                        {searchLoading ? (
                          <div className="animate-spin h-5 w-5 border-2 border-[#008D9C] border-t-transparent rounded-full" />
                        ) : (
                          <FiSearch className="h-5 w-5 text-gray-400" />
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="max-h-60 overflow-y-auto">
                    {searchQuery.length < 2 ? (
                      <div className="p-4 text-center text-gray-500">
                        Type at least 2 characters to search
                      </div>
                    ) : searchLoading ? (
                      <div className="p-4 text-center text-gray-500">
                        Loading...
                      </div>
                    ) : searchResults.length === 0 ? (
                      <div className="p-4 text-center text-gray-500">
                        No users found
                      </div>
                    ) : (
                      searchResults.map((user) => (
                        <div 
                          key={user._id}
                          className="flex items-center gap-3 p-2 hover:bg-gray-50 cursor-pointer"
                        >
                          <div className="w-8 h-8 bg-[#008D9C] rounded-full flex items-center justify-center">
                            <BiUser className="h-5 w-5 text-white" />
                          </div>
                          <div className="flex-1">
                            <div className="text-gray-700">{user.username}</div>
                            <div className="text-xs text-gray-500">{user.email}</div>
                          </div>
                          <button
                            onClick={() => handleSendFriendRequest(user._id)}
                            className="text-xs bg-[#008D9C] text-white px-2 py-1 rounded hover:bg-[#007483] transition-colors"
                          >
                            Add
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

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
