import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { MdEmail } from "react-icons/md";
import { RiLockPasswordLine } from "react-icons/ri";
import { FcGoogle } from "react-icons/fc";
import { BsMicrosoft } from "react-icons/bs";

const SignInDesign = () => {
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center relative">
      {/* Decorative Circles */}
        <div className="w-[303px] h-[303px] border-[12px] border-[#008D9C] rounded-full absolute top-[-133px] left-[-166px]"></div>
        <div className="w-[360px] h-[360px] border-[12px] border-[#008D9C] rounded-full absolute top-[-133px] left-[-166px]"></div>

      {/* Decorative Squares */}
      <div className="absolute top-0 left-[380px] w-[136px] h-[180px] bg-[#008D9C]"></div>
      <div className="absolute top-[453px] left-0 w-[380px] h-[180px] bg-[#008D9C]"></div>

      {/* Text */}
      <div className="absolute top-[250px] left-[155px] text-center">
        <h1 className="text-8xl font-bold text-black">SIGN IN</h1>
        <p className="text-6xl font-medium text-[#008D9C]">TO BOTCHAT</p>
      </div>

    <div className="absolute w-[450px] right-[155px] top-[100px] bg-white p-6 rounded-lg">
      <h2 className="text-2xl font-bold text-gray-800 text-center mb-2">
        Welcome back
      </h2>
      <p className="text-sm text-gray-500 text-center mb-6">
        Enter your details to continue.
      </p>
      <form onSubmit={handleLogin}>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MdEmail className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full pl-10 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008D9C]"
            />
          </div>
        </div>
        <div className="mb-4">
          <label className="flex justify-between items-center text-sm font-medium text-gray-700 mb-1">
            Password
            <a href="#" className="text-gray-500 text-sm hover:underline">
              Forgot password?
            </a>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <RiLockPasswordLine className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="password"
              placeholder="Enter your password"
              className="w-full pl-10 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008D9C]"
            />
          </div>
        </div>
        <button
          type="submit"
          className="w-full bg-[#008D9C] text-white py-2 rounded-lg hover:bg-[#007483]"
        >
          Log In
        </button>
      </form>
      <p className="text-sm text-right text-gray-600 mt-4">
        <a href="/signup" className="text-teal-500 underline">
          Create Account
        </a>
      </p>
      <div className="text-center mt-6">
        <p className="px-2 text-sm text-gray-500">or continue with</p>
      </div>
      <div className="flex mt-4 space-x-4">
        <button className="flex items-center justify-center flex-1 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200">
          <FcGoogle className="w-5 h-5 mr-2" />
          Google
        </button>
        <button className="flex items-center justify-center flex-1 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200">
          <BsMicrosoft className="w-5 h-5 mr-2" />
          Microsoft
        </button>
      </div>
    </div>
  </div>
  );
};

export default SignInDesign;
