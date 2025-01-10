import React, { useState } from "react";
import { Link } from "react-router-dom";
import { MdEmail } from "react-icons/md";
import { RiLockPasswordLine } from "react-icons/ri";
import { FcGoogle } from "react-icons/fc";
import { BsMicrosoft } from "react-icons/bs";
import { BiUser } from "react-icons/bi";

const SignUpDesign = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: ''
    });
    const [errors, setErrors] = useState({});

    const handleInputChange = (e) => {
        const { id, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [id]: value
        }));
        // Clear error when typing
        if (errors[id]) {
            setErrors(prev => ({
                ...prev,
                [id]: ''
            }));
        }
    };

    const handleSignUp = (e) => {
        e.preventDefault();
        const newErrors = {};

        // Name validation (letters only, 2-30 characters)
        const nameRegex = /^[A-Za-z\s]{2,30}$/;
        if (!formData.name || !nameRegex.test(formData.name)) {
            newErrors.name = 'Name should be 2-30 characters, letters only';
        }

        // Email validation
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!formData.email || !emailRegex.test(formData.email)) {
            newErrors.email = 'Please enter a valid email address';
        }

        // Password validation (min 8 chars, 1 uppercase, 1 lowercase, 1 number)
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
        if (!formData.password || !passwordRegex.test(formData.password)) {
            newErrors.password = 'Password must be at least 8 characters with uppercase, lowercase and number';
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        // If validation passes, proceed with signup
        console.log('Form submitted:', formData);
        // Add your signup logic here
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-12 min-h-screen bg-white relative overflow-hidden">
            {/* Decorative Elements Container */}
            <div className="absolute inset-0">
                {/* Circles */}
                <div className="absolute top-[-133px] left-[-166px]">
                    <div className="w-[360px] md:block hidden h-[360px] border-[12px] border-[#008D9C] rounded-full"></div>
                    <div className="w-[303px] md:block hidden h-[303px] border-[12px] border-[#008D9C] rounded-full absolute top-[4px] left-[4px]"></div>
                </div>
                
                {/* Squares */}
                <div className="hidden md:block absolute top-0 left-[390px] w-[136px] h-[180px] bg-[#008D9C]"></div>
                <div className="hidden md:block absolute bottom-0 left-0 w-[380px] h-[180px] bg-[#008D9C]"></div>
            </div>

            {/* Left Section - Title */}
            <div className="col-span-1 md:col-span-6 flex flex-col justify-center p-10 relative z-10">
                <div className="text-center">
                    <h1 className="text-5xl md:text-6xl lg:text-8xl font-bold text-black mb-2">SIGN UP</h1>
                    <p className="text-3xl md:text-4xl lg:text-4xl font-medium text-[#008D9C]">TO BOTCHAT</p>
                </div>
            </div>

            {/* Right Section - Form */}
            <div className="col-span-1 md:col-span-6 flex items-center justify-center pr-6 pt-15 relative z-10">
                <div className="w-full max-w-[450px] bg-white p-6 rounded-lg">
                    <h2 className="text-3xl md:text-3xl font-bold text-gray-800 text-center mb-2">
                        Create an Account
                    </h2>
                    <p className="text-sm text-gray-500 text-center mb-5">
                        Let's get started with your 30 days trial
                    </p>

                    <form onSubmit={handleSignUp}>
                        {/* Name Input */}
                        <div className="mb-4">
                            <label className="block text-sm text-left font-medium text-black mb-1">Name</label>
                            <div className="relative">
                                <BiUser className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                                <input
                                    type="text"
                                    id="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    placeholder="Enter your name"
                                    className={`w-full pl-10 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008D9C] ${errors.name ? 'border-red-500' : ''}`}
                                />
                            </div>
                            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                        </div>

                        {/* Email Input */}
                        <div className="mb-4">
                            <label className="block text-sm text-left font-medium text-black mb-1">Email</label>
                            <div className="relative">
                                <MdEmail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                                <input
                                    type="email"
                                    id="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    placeholder="Enter your email"
                                    className={`w-full pl-10 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008D9C] ${errors.email ? 'border-red-500' : ''}`}
                                />
                            </div>
                            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                        </div>

                        {/* Password Input */}
                        <div className="mb-4">
                            <label className="block text-sm text-left font-medium text-black mb-1">Password</label>
                            <div className="relative">
                                <RiLockPasswordLine className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                                <input
                                    type="password"
                                    id="password"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    placeholder="Enter your password"
                                    className={`w-full pl-10 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008D9C] ${errors.password ? 'border-red-500' : ''}`}
                                />
                            </div>
                            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            className=" mt-2 w-full bg-[#008D9C] text-white py-2 rounded-lg hover:bg-[#007483] transition-colors"
                        >
                            Create Account
                        </button>
                    </form>

                    {/* Login Link */}
                    <p className="text-sm text-right text-gray-600 mt-3">
                        <Link to="/" className="text-[#008D9C] underline">
                            Login
                        </Link>
                    </p>

                    {/* Social Login */}
                    <div className="mt-5">
                        <p className="text-sm text-gray-500 text-center mb-4">or continue with</p>
                        <div className="grid grid-cols-2 gap-4">
                            <button className="flex items-center justify-center py-2 px-4 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors">
                                <FcGoogle className="w-5 h-5 mr-2" />
                                Google
                            </button>
                            <button className="flex items-center justify-center py-2 px-4 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors">
                                <BsMicrosoft className="w-5 h-5 mr-2" />
                                Microsoft
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SignUpDesign;
