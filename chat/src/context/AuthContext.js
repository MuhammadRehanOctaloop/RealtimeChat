import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem('user');
        return savedUser ? JSON.parse(savedUser) : null;
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initAuth = async () => {
            const token = localStorage.getItem('accessToken');
            if (token && !user) {
                try {
                    const response = await api.post('/auth/refresh-token');
                    const refreshedUser = response.data.user;
                    setUser(refreshedUser);
                    localStorage.setItem('user', JSON.stringify(refreshedUser));
                } catch (error) {
                    console.error('Token refresh failed:', error);
                    localStorage.removeItem('accessToken');
                    localStorage.removeItem('refreshToken');
                    localStorage.removeItem('user');
                }
            }
            setLoading(false);
        };
        initAuth();
    }, [user]);

    const register = async (username, email, password) => {
        try {
            const response = await api.post('/api/v1/auth/register', {
                username,
                email,
                password
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    };

    const login = async (email, password) => {
        try {
            const response = await api.post('/api/v1/auth/login', {
                email,
                password
            });

            const { data } = response.data;
            if (!data.accessToken || !data.user) {
                throw new Error('Invalid response from server');
            }

            const { accessToken, refreshToken, user: userData } = data;
            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('refreshToken', refreshToken);
            localStorage.setItem('user', JSON.stringify(userData));
            setUser(userData);
            return userData;
        } catch (error) {
            if (error.response?.data?.message) {
                throw new Error(error.response.data.message);
            } else {
                throw new Error('Failed to login. Please try again.');
            }
        }
    };

    const logout = async () => {
        try {
            await api.post('/api/v1/auth/logout');
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');
            setUser(null);
        }
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
