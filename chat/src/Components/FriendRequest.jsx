import React from 'react';
import { BiUser } from "react-icons/bi";

const FriendRequest = ({ request, onAccept, onDecline }) => {
  console.log('Rendering friend request:', request);
  return (
    <div className="flex items-center justify-between p-3 hover:bg-gray-50 border-b">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-[#008D9C] rounded-full flex items-center justify-center">
          <BiUser className="h-6 w-6 text-white" />
        </div>
        <div>
          <div className="font-medium">{request.sender?.username || 'Unknown User'}</div>
          <div className="text-sm text-gray-500">Sent you a friend request</div>
        </div>
      </div>
      <div className="flex gap-2">
        <button 
          onClick={() => onAccept(request._id)}
          className="px-3 py-1 bg-[#008D9C] text-white rounded-lg hover:bg-[#007483] transition-colors"
        >
          Accept
        </button>
        <button 
          onClick={() => onDecline(request._id)}
          className="px-3 py-1 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
        >
          Decline
        </button>
      </div>
    </div>
  );
};

export default FriendRequest; 