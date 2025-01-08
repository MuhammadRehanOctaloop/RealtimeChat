import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { RiLogoutBoxRLine } from "react-icons/ri";
import { IoSettingsOutline } from "react-icons/io5";
import { FiSearch } from "react-icons/fi";
import { FaCaretDown } from "react-icons/fa";
import { BsArrowRight } from "react-icons/bs";
import { BiUser } from "react-icons/bi";
import { GiThink } from "react-icons/gi";

const Dashboard = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate('/');
  };

  return (
    <div className="flex h-screen bg-white">
      {/* Left Sidebar */}
      <div className="w-64 bg-white border-r flex flex-col">
        <div className="p-4 flex-1">
          <h1 className="text-xl text-center font-bold text-[#008D9C] mb-10">CHATTING</h1>
          
          <div className="flex justify-center">
            <button className="w-full mt-2 bg-gradient-to-r from-[#008D9C] to-[#003136] text-white py-2 px-3 rounded-lg hover:opacity-90 transition-opacity">
              <div className="flex items-center justify-center gap-2">
                <GiThink className="h-5 w-5" />
                <span>New Chat</span>
              </div>
            </button>
          </div>

          <button className="w-full text-black mt-6 py-2 px-3 rounded-lg flex items-center justify-center">
            <div className="flex items-center justify-center gap-2">
              <IoSettingsOutline className="h-5 w-5" />
              <span>Settings</span>
            </div>
          </button>

          {/* Chat History */}
          <div className="mt-6">
            <hr className="border-t-2 border-[#008D9C]" />
            <h2 className="text-sm font-medium text-center text-black mt-3">History</h2>
            
            <div className="space-y-2 mt-3">
              <div className="text-sm text-[#008D9C]">Previous 7 Days</div>
              <div className="text-sm text-gray-400">Hi, how are you...</div>
            </div>
            
            <div className="mt-4">
              <div className="text-sm text-gray-500">Previous 30 Days</div>
              <div className="text-sm text-gray-400">Lorem ipsum dolor sit adipiscing...</div>
            </div>
          </div>
        </div>
        
        {/* Logout Button */}
        <div className="p-4 mb-3">
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
        <div className="border-b border-t border-[#008D9C] mt-3 p-2 flex justify-between ml-10 mr-10 items-center relative">
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
                        placeholder="Search"
                        className="w-full px-3 py-2 border rounded-lg pr-8 focus:outline-none focus:ring-2 focus:ring-[#008D9C]"
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-2">
                        <FiSearch className="h-5 w-5 text-gray-400" />
                      </div>
                    </div>
                  </div>

                  <div className="max-h-60 overflow-y-auto">
                    {[1, 2, 3, 4].map((friend) => (
                      <div key={friend} className="flex items-center gap-3 p-2 hover:bg-gray-50 cursor-pointer">
                        <div className="w-8 h-8 bg-[#008D9C] rounded-full flex items-center justify-center">
                          <BiUser className="h-5 w-5 text-white" />
                        </div>
                        <span className="text-gray-700">Friend</span>
                      </div>
                    ))}
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
              <div className="flex items-start space-x-2">
                <div className="bg-[#008D9C] rounded-lg p-3 max-w-md">
                  <p className="text-white">Hi, how are you?</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-2">
                <div className="bg-[#E8E8E8] text-black rounded-lg p-3 max-w-md">
                  <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Message Input */}
        <div className="p-4">
          <div className="flex items-center space-x-2 border-[#008D9C] rounded-lg bg-[#F4F4F4]">
            <input
              type="text"
              placeholder="Start Chatting"
              className="flex-1 bg-[#F4F4F4] px-4 py-4 border-[#008D9C] border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008D9C]"
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
