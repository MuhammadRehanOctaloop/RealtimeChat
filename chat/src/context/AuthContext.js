import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initAuth = async () => {
            const token = localStorage.getItem('accessToken');
            if (token) {
                try {
                    const response = await api.post('/auth/refresh-token');
                    setUser(response.data.user);
                } catch (error) {
                    localStorage.removeItem('accessToken');
                    localStorage.removeItem('refreshToken');
                }
            }
            setLoading(false);
        };
        initAuth();
    }, []);

    const register = async (username, email, password) => {
        try {
            const response = await api.post('/auth/register', {
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
            console.log('Attempting login with:', { email, password });
            const response = await api.post('/auth/login', {
                email,
                password
            });
            console.log('Login response:', response.data);

            const { data } = response.data;
            
            if (!data.accessToken || !data.user) {
                throw new Error('Invalid response from server');
            }

            const { accessToken, refreshToken, user: userData } = data;
            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('refreshToken', refreshToken);
            setUser(userData);
            return userData;
        } catch (error) {
            console.error('Login error:', error.response || error);
            if (error.response?.data?.message) {
                throw new Error(error.response.data.message);
            } else {
                throw new Error('Failed to login. Please try again.');
            }
        }
    };

    const logout = async () => {
        try {
            await api.post('/auth/logout');
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
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