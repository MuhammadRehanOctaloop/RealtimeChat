import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { BiUser } from "react-icons/bi";

const Notifications = ({ notifications, onAccept, onDecline, onMarkAsRead }) => {
  const renderNotificationContent = (notification) => {
    switch (notification.type) {
      case 'friend_request':
        return (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#008D9C] rounded-full flex items-center justify-center">
                <BiUser className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className="font-medium">{notification.sender?.username}</div>
                <div className="text-sm text-gray-500">Sent you a friend request</div>
                <div className="text-xs text-gray-400">
                  {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => onAccept(notification.sender._id)}
                className="px-2 py-1 bg-[#008D9C] text-white text-sm rounded-lg hover:bg-[#007483]"
              >
                Accept
              </button>
              <button
                onClick={() => onDecline(notification.sender._id)}
                className="px-2 py-1 bg-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-300"
              >
                Decline
              </button>
            </div>
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#008D9C] rounded-full flex items-center justify-center">
              <BiUser className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="text-sm">{notification.content}</div>
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
      {notifications.length === 0 ? (
        <div className="p-4 text-center text-gray-500">No notifications</div>
      ) : (
        notifications.map((notification) => (
          <div
            key={notification._id}
            className={`p-3 border-b hover:bg-gray-50 cursor-pointer ${
              !notification.read ? 'bg-blue-50' : ''
            }`}
            onClick={() => !notification.read && onMarkAsRead(notification._id)}
          >
            {renderNotificationContent(notification)}
          </div>
        ))
      )}
    </div>
  );
};

export default Notifications; 