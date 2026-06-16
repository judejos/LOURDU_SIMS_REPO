/**
 * SIMS — Auth Context
 * Manages token, user info, login/logout state across the app.
 */

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [user, setUser] = useState({
    username: localStorage.getItem('username') || '',
    role: localStorage.getItem('role') || '',
    empId: localStorage.getItem('empId') || '',
    fullName: localStorage.getItem('fullName') || '',
    entityId: localStorage.getItem('entityId') || '',
  });
  const [permissions, setPermissions] = useState({});
  const [loading, setLoading] = useState(true);

  const isAuthenticated = !!token;

  // Fetch permissions on mount if authenticated
  useEffect(() => {
    if (token) {
      authAPI.permissions()
        .then((res) => setPermissions(res.data))
        .catch(() => {})
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token]);

  // Listen for cross-tab login/logout events
  useEffect(() => {
    const syncLogout = (e) => {
      if (e.key === 'token') {
        if (!e.newValue) {
          // Token removed in another tab => logout
          setToken(null);
          setUser({ username: '', role: '', empId: '', fullName: '', entityId: '' });
          setPermissions({});
        } else {
          // Token added/changed in another tab => seamlessly update state without reload
          setToken(e.newValue);
          setUser({
            username: localStorage.getItem('username') || '',
            role: localStorage.getItem('role') || '',
            empId: localStorage.getItem('empId') || '',
            fullName: localStorage.getItem('fullName') || '',
            entityId: localStorage.getItem('entityId') || '',
          });
          // Permissions will auto-fetch because of the other useEffect depending on [token]
        }
      }
    };
    window.addEventListener('storage', syncLogout);
    return () => window.removeEventListener('storage', syncLogout);
  }, []);

  const login = useCallback(async (username, password) => {
    const res = await authAPI.login({ username, password });
    const data = res.data;

    if (res.status === 202 || data.message === 'OTP required') {
      return data;
    }

    localStorage.setItem('token', data.token);
    localStorage.setItem('username', data.username);
    localStorage.setItem('role', data.role);
    localStorage.setItem('empId', data.emp_id);
    localStorage.setItem('fullName', data.full_name);
    localStorage.setItem('entityId', data.entity_id || '');

    setToken(data.token);
    setUser({
      username: data.username,
      role: data.role,
      empId: data.emp_id,
      fullName: data.full_name,
      entityId: data.entity_id,
    });

    try {
      const permRes = await authAPI.permissions();
      setPermissions(permRes.data);
    } catch (e) {}

    return data;
  }, []);

  const verifyLoginOTP = useCallback(async (userId, otp) => {
    const res = await authAPI.verifyLoginOTP({ user_id: userId, otp });
    const data = res.data;

    localStorage.setItem('token', data.token);
    localStorage.setItem('username', data.username);
    localStorage.setItem('role', data.role);
    localStorage.setItem('empId', data.emp_id);
    localStorage.setItem('fullName', data.full_name);
    localStorage.setItem('entityId', data.entity_id || '');

    setToken(data.token);
    setUser({
      username: data.username,
      role: data.role,
      empId: data.emp_id,
      fullName: data.full_name,
      entityId: data.entity_id,
    });

    try {
      const permRes = await authAPI.permissions();
      setPermissions(permRes.data);
    } catch (e) {}

    return data;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authAPI.logout();
    } catch (e) {
      // Silent fail
    }
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('role');
    localStorage.removeItem('empId');
    localStorage.removeItem('fullName');
    localStorage.removeItem('entityId');
    setToken(null);
    setUser({ username: '', role: '', empId: '', fullName: '', entityId: '' });
    setPermissions({});
  }, []);

  return (
    <AuthContext.Provider value={{
      token, user, permissions, isAuthenticated, loading,
      login, verifyLoginOTP, logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}

export default AuthContext;
