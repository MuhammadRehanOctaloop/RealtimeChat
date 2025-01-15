import React, { useState } from 'react';
import { FaCaretDown } from "react-icons/fa";
import { FiSearch, FiMenu } from "react-icons/fi";
import { BiUser, BiUserPlus, BiBell } from "react-icons/bi";
import Notifications from './Notifications';

const NavBar = ({ 
  isDropdownOpen, 
  setIsDropdownOpen, 
  searchQuery, 
  handleSearch, 
  searchLoading, 
  searchResults, 
  handleSendFriendRequest,
  friendRequests = [],
  onAcceptRequest,
  onDeclineRequest,
  notifications = [],
  unreadNotifications = 0,
  onMarkNotificationRead,
  onMarkAllNotificationsRead,
  toggleSidebar,
  isSidebarOpen
}) => {
  const [error, setError] = useState(null);
  const [showNotifications, setShowNotifications] = useState(false);

  const handleAddFriend = async (userId) => {
    const result = await handleSendFriendRequest(userId);
    if (result && !result.success) {
      setError(result.error);
      setTimeout(() => {
        setError(null);
        setIsDropdownOpen(false);
      }, 3000); // Close dropdown and clear error after 3 seconds
    } else if (result && result.success) {
      // If request was successful, close dropdown after a brief delay
      setTimeout(() => {
        setIsDropdownOpen(false);
      }, 1000);
    }
  };

  return (
    <div className="border-b border-t bg-[#F4F4F4] border-[#008D9C] mt-3 p-2 flex justify-between mx-5 items-center relative">
      <h2 className="text-1xl p-2 font-semibold text-[#008D9C]">CHATTING</h2>
      <div className="flex items-center gap-3">
        {/* Mobile Menu Button */}
        <button 
          onClick={toggleSidebar}
          className={`
            lg:hidden bg-[#008D9C] text-white p-1 rounded-lg
            hover:bg-[#007483] transition-all duration-300
            ${isSidebarOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'}
          `}
        >
          <FiMenu className="h-6 w-6" />
        </button>

        {/* Notifications Button with Friend Requests */}
        <div className="relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="bg-[#008D9C] text-white px-4 py-1 rounded-lg flex items-center gap-2"
          >
            <BiBell className="h-5 w-5" />
            {(unreadNotifications > 0 || friendRequests.length > 0) && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                {unreadNotifications + friendRequests.length}
              </span>
            )}
          </button>
          
          {showNotifications && (
            <div className="absolute -left-40 mt-2 z-50">
              <Notifications
                notifications={notifications}
                friendRequests={friendRequests}
                onAcceptRequest={onAcceptRequest}
                onDeclineRequest={onDeclineRequest}
                onMarkAsRead={onMarkNotificationRead}
                onMarkAllAsRead={onMarkAllNotificationsRead}
              />
            </div>
          )}
        </div>

        <div className="relative">
          <button 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="bg-[#008D9C] text-white px-4 py-1 rounded-lg flex items-center gap-2"
          >
            <BiUserPlus className="h-5 w-5" />
            <span className="hidden sm:inline">Add Friend</span>
            <FaCaretDown className="h-5 w-5" />
          </button>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-60 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
              {error && (
                <div className="p-2 bg-red-100 text-red-600 text-sm">
                  {error}
                </div>
              )}
              <div className="p-2">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search users"
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg pr-8 focus:outline-none focus:ring-2 focus:ring-[#008D9C] text-sm"
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
                        onClick={() => handleAddFriend(user._id)}
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
  );
};

export default NavBar; 