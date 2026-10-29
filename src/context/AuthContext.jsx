import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [worker, setWorker] = useState(() => {
    try {
      const stored = localStorage.getItem('mendx_worker_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('mendx_worker_token') || null);
  const [loading, setLoading] = useState(true);

  // Sync / verify profile from server on load
  useEffect(() => {
    const fetchProfile = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await api.getProfile();
        if (res.success && res.worker) {
          setWorker(res.worker);
          localStorage.setItem('mendx_worker_user', JSON.stringify(res.worker));
        }
      } catch (err) {
        console.warn('Worker session expired or invalid token:', err.message);
        logout();
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [token]);

  const login = async (email, password) => {
    const res = await api.login(email, password);
    // If OTP verification challenge is required
    if (res.requiresOtp) {
      return res;
    }
    if (!res.user || (res.user.role !== 'worker' && res.user.role !== 'admin')) {
      throw new Error('Access denied. This portal is exclusively for registered Mendx Pro service specialists.');
    }
    setToken(res.token);
    setWorker(res.user);
    localStorage.setItem('mendx_worker_token', res.token);
    localStorage.setItem('mendx_worker_user', JSON.stringify(res.user));
    return res.user;
  };

  const verifyOtp = async (challengeId, otp) => {
    const res = await api.verifyOtp(challengeId, otp);
    if (!res.user || (res.user.role !== 'worker' && res.user.role !== 'admin')) {
      throw new Error('Access denied. This portal is exclusively for registered Mendx Pro service specialists.');
    }
    setToken(res.token);
    setWorker(res.user);
    localStorage.setItem('mendx_worker_token', res.token);
    localStorage.setItem('mendx_worker_user', JSON.stringify(res.user));
    return res.user;
  };

  const resendOtp = async (challengeId) => {
    return await api.resendOtp(challengeId);
  };

  const logout = () => {
    setToken(null);
    setWorker(null);
    localStorage.removeItem('mendx_worker_token');
    localStorage.removeItem('mendx_worker_user');
  };

  const toggleAvailability = async (isAvailable) => {
    try {
      const res = await api.toggleAvailability(isAvailable);
      if (res.success) {
        setWorker((prev) => {
          const updated = { ...prev, isAvailable: res.isAvailable };
          localStorage.setItem('mendx_worker_user', JSON.stringify(updated));
          return updated;
        });
        return res.isAvailable;
      }
    } catch (err) {
      console.error('Failed to toggle availability:', err);
      throw err;
    }
  };

  const updateWorkerProfile = async (updates) => {
    const res = await api.updateProfile(updates);
    if (res.success && res.worker) {
      setWorker(res.worker);
      localStorage.setItem('mendx_worker_user', JSON.stringify(res.worker));
      return res.worker;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        worker,
        token,
        loading,
        isAuthenticated: !!token && !!worker && (worker.role === 'worker' || worker.role === 'admin'),
        login,
        verifyOtp,
        resendOtp,
        logout,
        toggleAvailability,
        updateWorkerProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
