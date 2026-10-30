import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

const getInitialWorker = () => {
  try {
    // 1. Check user's login logic in sessionStorage first
    const demoStored = sessionStorage.getItem('mendxDemoWorker');
    if (demoStored) {
      const demo = JSON.parse(demoStored);
      return {
        _id: 'demo-worker-' + (demo.email || '1'),
        fullName: demo.name || 'Specialist',
        email: demo.email,
        role: demo.role || 'worker',
        demoMode: true,
        city: 'Mumbai',
        serviceArea: 'Mumbai & Suburbs',
        skills: ['Deep Cleaning', 'Appliance Repair', 'Sanitization'],
        isAvailable: true,
        payoutRate: 0.75,
      };
    }
    // 2. Check localStorage for persistent backend session
    const stored = localStorage.getItem('mendx_worker_user');
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};

const getInitialToken = () => {
  try {
    if (sessionStorage.getItem('mendxDemoWorker')) {
      return 'demo-worker-session-token';
    }
    return localStorage.getItem('mendx_worker_token') || null;
  } catch {
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [worker, setWorker] = useState(getInitialWorker);
  const [token, setToken] = useState(getInitialToken);
  const [loading, setLoading] = useState(false);

  // Sync / verify profile from server on load (only for real backend tokens)
  useEffect(() => {
    const fetchProfile = async () => {
      // If logged in via demo worker, session is already valid
      if (sessionStorage.getItem('mendxDemoWorker')) {
        setLoading(false);
        return;
      }

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
        console.warn('Worker profile sync notice:', err.message);
        // Only log out if backend returns 401 Unauthorized
        if (err.message && (err.message.includes('401') || err.message.toLowerCase().includes('unauthorized'))) {
          logout();
        }
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [token]);

  const login = async (email, password) => {
    const res = await api.login(email, password);
    if (!res.token || !res.user) {
      throw new Error('Access denied. Invalid credentials.');
    }
    if (res.user.role !== 'worker' && res.user.role !== 'admin') {
      throw new Error('Access denied. This portal is exclusively for registered Mendx Pro service specialists.');
    }
    setToken(res.token);
    setWorker(res.user);
    setLoading(false);
    localStorage.setItem('mendx_worker_token', res.token);
    localStorage.setItem('mendx_worker_user', JSON.stringify(res.user));
    return res.user;
  };

  const register = async (workerData) => {
    const res = await api.register(workerData);
    if (!res.token || !res.user) {
      throw new Error('Registration failed. Please check your information.');
    }
    setToken(res.token);
    setWorker(res.user);
    setLoading(false);
    localStorage.setItem('mendx_worker_token', res.token);
    localStorage.setItem('mendx_worker_user', JSON.stringify(res.user));
    return res.user;
  };

  const logout = () => {
    setToken(null);
    setWorker(null);
    try {
      sessionStorage.removeItem('mendxDemoWorker');
      localStorage.removeItem('mendx_worker_token');
      localStorage.removeItem('mendx_worker_user');
    } catch {
      // ignore
    }
  };

  const toggleAvailability = async (isAvailable) => {
    try {
      const res = await api.toggleAvailability(isAvailable);
      if (res.success) {
        setWorker((prev) => {
          const updated = { ...prev, isAvailable: res.isAvailable };
          if (prev?.demoMode) {
            const demo = JSON.parse(sessionStorage.getItem('mendxDemoWorker') || '{}');
            sessionStorage.setItem('mendxDemoWorker', JSON.stringify({ ...demo, isAvailable: res.isAvailable }));
          } else {
            localStorage.setItem('mendx_worker_user', JSON.stringify(updated));
          }
          return updated;
        });
        return res.isAvailable;
      }
    } catch (err) {
      console.error('Failed to toggle availability:', err);
      // If in demo mode, toggle locally
      setWorker((prev) => {
        const nextAvail = isAvailable !== undefined ? Boolean(isAvailable) : !prev?.isAvailable;
        return { ...prev, isAvailable: nextAvail };
      });
    }
  };

  const updateWorkerProfile = async (updates) => {
    try {
      const res = await api.updateProfile(updates);
      if (res.success && res.worker) {
        setWorker(res.worker);
        localStorage.setItem('mendx_worker_user', JSON.stringify(res.worker));
        return res.worker;
      }
    } catch (err) {
      // Local fallback for demo mode
      setWorker((prev) => ({ ...prev, ...updates }));
      return { ...worker, ...updates };
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
        register,
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
