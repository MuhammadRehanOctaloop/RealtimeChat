import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { MdEmail } from "react-icons/md";
import { RiLockPasswordLine } from "react-icons/ri";
import { FcGoogle } from "react-icons/fc";
import { BsMicrosoft } from "react-icons/bs";
import { useAuth } from '../context/AuthContext';

const SignInDesign = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

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
  
    const handleLogin = async (e) => {
        e.preventDefault();
        const newErrors = {};

        // Email validation
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!formData.email || !emailRegex.test(formData.email)) {
            newErrors.email = 'Please enter a valid email address';
        }

        // Password validation - temporarily simplify for testing
        if (!formData.password) {
            newErrors.password = 'Password is required';
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        try {
            setLoading(true);
            setErrors({}); // Clear any previous errors
            console.log('Submitting login form:', formData); // Debug log
            await login(formData.email, formData.password);
            navigate('/dashboard');
        } catch (error) {
            console.error('Login error in component:', error); // Debug log
            setErrors({
                general: error.response?.data?.message || error.message || 'Login failed. Please check your credentials.'
            });
        } finally {
            setLoading(false);
        }
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
                    <h1 className="text-5xl md:text-6xl lg:text-8xl font-bold text-black mb-2">SIGN IN</h1>
                    <p className="text-3xl md:text-4xl lg:text-6xl font-medium text-[#008D9C]">TO BOTCHAT</p>
                </div>
            </div>

            {/* Right Section - Form */}
            <div className="col-span-1 md:col-span-6 flex items-center justify-center pr-6 pt-15 relative z-10">
                <div className="w-full max-w-[450px] bg-white p-6 rounded-lg">
                    <h2 className="text-3xl md:text-3xl font-bold text-gray-800 text-center p-2">
                        Welcome back
                    </h2>
                    <p className="text-sm text-gray-500 text-center p-2 mb-4 pt-0">
                        Enter your details to continue.
                    </p>

                    <form onSubmit={handleLogin}>
                        {errors.general && (
                            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
                                {errors.general}
                            </div>
                        )}
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
                            <label className="flex justify-between items-center text-sm text-left font-medium text-black mb-1">
                                Password
                                <a href="#" className="text-gray-500 text-sm hover:underline">
                                    Forgot password?
                                </a>
                            </label>
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
                            disabled={loading}
                            className="mt-2 w-full bg-[#008D9C] text-white py-2 rounded-lg hover:bg-[#007483] transition-colors"
                        >
                            {loading ? 'Logging in...' : 'Log In'}
                        </button>
                    </form>

                    {/* Login Link */}
                    <p className="text-sm text-right text-gray-600 mt-3">
                        <Link to="/signup" className="text-[#008D9C] underline">
                            Create Account
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

export default SignInDesign;
