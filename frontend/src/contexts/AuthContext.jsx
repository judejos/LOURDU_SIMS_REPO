/**
 * SIMS — Auth Context
 * Manages token, user info, login/logout state across the app.
 */

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(sessionStorage.getItem('token') || null);
  const [user, setUser] = useState({
    username: sessionStorage.getItem('username') || '',
    role: sessionStorage.getItem('role') || '',
    empId: sessionStorage.getItem('empId') || '',
    fullName: sessionStorage.getItem('fullName') || '',
    entityId: sessionStorage.getItem('entityId') || '',
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


  const login = useCallback(async (username, password) => {
    const res = await authAPI.login({ username, password });
    const data = res.data;

    if (res.status === 202 || data.message === 'OTP required') {
      return data;
    }

    sessionStorage.setItem('token', data.token);
    sessionStorage.setItem('username', data.username);
    sessionStorage.setItem('role', data.role);
    sessionStorage.setItem('empId', data.emp_id);
    sessionStorage.setItem('fullName', data.full_name);
    sessionStorage.setItem('entityId', data.entity_id || '');

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

    sessionStorage.setItem('token', data.token);
    sessionStorage.setItem('username', data.username);
    sessionStorage.setItem('role', data.role);
    sessionStorage.setItem('empId', data.emp_id);
    sessionStorage.setItem('fullName', data.full_name);
    sessionStorage.setItem('entityId', data.entity_id || '');

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
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('username');
    sessionStorage.removeItem('role');
    sessionStorage.removeItem('empId');
    sessionStorage.removeItem('fullName');
    sessionStorage.removeItem('entityId');
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
