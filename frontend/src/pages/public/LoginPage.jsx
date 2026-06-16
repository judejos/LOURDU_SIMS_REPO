/**
 * SIMS — Login Page
 * Premium glassmorphism login with animated gradient background.
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, TextField, Button, Typography, IconButton, InputAdornment,
  Alert, CircularProgress,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Please enter both username and password');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const data = await login(username, password);
      // Role-based redirect
      const role = data.role;
      if (['superadmin', 'manager'].includes(role)) {
        navigate('/admin/dashboard');
      } else if (role === 'intern') {
        navigate('/intern-user/dashboard');
      } else if (role === 'staff') {
        navigate('/intern/dashboard'); // Intern Management Dashboard
      } else if (role === 'lead') {
        navigate('/task/dashboard'); // Task/Engineering Dashboard
      } else if (role === 'mentor') {
        navigate('/intern/dashboard'); // Mentors manage interns and tasks
      } else {
        navigate('/admin/dashboard'); // Fallback
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--gradient-hero)',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Animated background orbs */}
      <Box sx={{
        position: 'absolute', top: '-20%', right: '-10%',
        width: 500, height: 500, borderRadius: '50%',
        background: 'radial-gradient(circle, var(--accent-glow) 0%, transparent 70%)',
        filter: 'blur(60px)', animation: 'float 8s ease-in-out infinite',
      }} />
      <Box sx={{
        position: 'absolute', bottom: '-20%', left: '-10%',
        width: 400, height: 400, borderRadius: '50%',
        background: 'radial-gradient(circle, var(--shadow-glow) 0%, transparent 70%)',
        filter: 'blur(60px)', animation: 'float 10s ease-in-out infinite reverse',
      }} />

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <Box sx={{
          width: 420, p: 5,
          background: 'var(--bg-card)',
          backdropFilter: 'blur(30px)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 4, position: 'relative',
          boxShadow: 'var(--shadow-lg)'
        }}>
          {/* Logo */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Box sx={{
              width: 56, height: 56, borderRadius: 3, mx: 'auto', mb: 2,
              background: 'var(--gradient-primary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.5rem', fontWeight: 900, color: '#fff',
              boxShadow: 'var(--shadow-glow)',
            }}>
              S
            </Box>
            <Typography variant="h4" fontWeight={800} sx={{
              background: 'var(--gradient-primary)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>
              SIMS
            </Typography>
            <Typography variant="body2" color="text.secondary" mt={0.5}>
              Student Intern Management System
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>
          )}

          <form onSubmit={handleLogin}>
            <TextField
              fullWidth
              label="Email Address"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              sx={{ mb: 2.5 }}
              autoFocus
              id="login-username"
            />
            <TextField
              fullWidth
              label="Password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              sx={{ mb: 1 }}
              id="login-password"
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword(!showPassword)} size="small">
                        {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }
              }}
            />

            <Box sx={{ textAlign: 'right', mb: 3 }}>
              <Typography
                variant="caption"
                sx={{ color: 'var(--color-accent)', cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
                onClick={() => navigate('/Recovery')}
              >
                Forgot Password?
              </Typography>
            </Box>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              id="login-submit"
              sx={{
                py: 1.5, fontWeight: 700, fontSize: '1rem',
                background: 'var(--gradient-primary)',
                borderRadius: 3,
                '&:hover': {
                  background: 'linear-gradient(135deg, #5e35b1, #0097a7)',
                  boxShadow: '0 6px 25px rgba(108,63,224,0.4)',
                },
              }}
            >
              {loading ? <CircularProgress size={24} sx={{ color: '#fff' }} /> : 'Sign In'}
            </Button>
          </form>

          <Typography variant="caption" color="text.secondary" display="block" mt={3} sx={{ textAlign: 'center' }}>
            © 2026 SIMS — Powered by AI
          </Typography>
        </Box>
      </motion.div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -30px) scale(1.05); }
          66% { transform: translate(-20px, 20px) scale(0.95); }
        }
      `}</style>
    </Box>
  );
}
