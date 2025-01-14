import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { BiUser, BiMessage, BiCheckCircle, BiInfoCircle } from "react-icons/bi";

const Notifications = ({ 
  notifications = [], 
  onAccept, 
  onDecline, 
  onMarkAsRead,
  loading,
  error 
}) => {
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'friend_request':
        return <BiUser className="h-5 w-5 text-white" />;
      case 'message':
        return <BiMessage className="h-5 w-5 text-white" />;
      case 'friend_accepted':
        return <BiCheckCircle className="h-5 w-5 text-white" />;
      case 'system':
        return <BiInfoCircle className="h-5 w-5 text-white" />;
      default:
        return <BiInfoCircle className="h-5 w-5 text-white" />;
    }
  };

  const renderNotificationContent = (notification) => {
    console.log('Rendering notification:', notification);
    switch (notification.type) {
      case 'friend_request':
        return (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#008D9C] rounded-full flex items-center justify-center">
                {getNotificationIcon(notification.type)}
              </div>
              <div>
                <div className="font-medium">{notification.sender?.username || 'Unknown User'}</div>
                <div className="text-sm text-gray-500">{notification.content}</div>
                <div className="text-xs text-gray-400">
                  {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#008D9C] rounded-full flex items-center justify-center">
              {getNotificationIcon(notification.type)}
            </div>
            <div>
              <div className="text-sm">{notification.content}</div>
              {notification.sender && (
                <div className="text-xs text-gray-500">From: {notification.sender.username}</div>
              )}
              <div className="text-xs text-gray-400">
                {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="w-80 bg-white rounded-lg shadow-lg border border-gray-200 max-h-96 overflow-y-auto">
      {loading ? (
        <div className="p-4 text-center text-gray-500">Loading notifications...</div>
      ) : error ? (
        <div className="p-4 text-center text-red-500">{error}</div>
      ) : notifications.length === 0 ? (
        <div className="p-4 text-center text-gray-500">No notifications</div>
      ) : (
        <>
          <div className="p-2 border-b">
            <button
              onClick={() => onMarkAsRead('all')}
              className="text-sm text-[#008D9C] hover:text-[#007483] w-full text-center"
            >
              Mark all as read
            </button>
          </div>
          {notifications.map((notification) => (
            <div
              key={notification._id}
              className={`p-3 border-b hover:bg-gray-50 cursor-pointer ${
                !notification.read ? 'bg-blue-50' : ''
              }`}
              onClick={() => !notification.read && onMarkAsRead(notification._id)}
            >
              {renderNotificationContent(notification)}
            </div>
          ))}
        </>
      )}
    </div>
  );
};

export default Notifications; 