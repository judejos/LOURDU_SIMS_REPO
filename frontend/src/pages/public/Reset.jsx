/**
 * SIMS — Password Reset (OTP Verify + New Password)
 */
import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Box, TextField, Button, Typography, Alert, CircularProgress } from '@mui/material';
import { motion } from 'framer-motion';
import { authAPI } from '../../services/api';

export default function Reset() {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState(location.state?.email || '');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [step, setStep] = useState(1); // 1: verify OTP, 2: set password

  const handleVerify = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await authAPI.verifyOTP({ email, otp });
      setStep(2); setMessage('OTP verified! Set your new password.');
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid OTP');
    } finally { setLoading(false); }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) { setError('Passwords do not match'); return; }
    setError(''); setLoading(true);
    try {
      await authAPI.resetPassword({ email, otp, new_password: newPassword });
      setMessage('Password reset successful!');
      setTimeout(() => navigate('/loginpage'), 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Reset failed');
    } finally { setLoading(false); }
  };

  return (
    <Box sx={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, var(--bg-primary) 0%, #302b63 50%, #24243e 100%)',
    }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Box sx={{
          width: 400, p: 5, background: 'rgba(26,26,62,0.6)', backdropFilter: 'blur(30px)',
          border: '1px solid rgba(255,255,255,0.1)', borderRadius: 4,
        }}>
          <Typography variant="h5" fontWeight={800} textAlign="center" mb={3} className="gradient-text">
            {step === 1 ? 'Verify OTP' : 'Set New Password'}
          </Typography>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}

          {step === 1 ? (
            <form onSubmit={handleVerify}>
              <TextField fullWidth label="Email" value={email} onChange={(e) => setEmail(e.target.value)} sx={{ mb: 2 }} />
              <TextField fullWidth label="OTP" value={otp} onChange={(e) => setOtp(e.target.value)} sx={{ mb: 3 }} placeholder="6-digit OTP" />
              <Button type="submit" fullWidth variant="contained" disabled={loading} sx={{
                py: 1.3, background: 'var(--gradient-primary)', fontWeight: 700,
              }}>
                {loading ? <CircularProgress size={22} sx={{ color: '#fff' }} /> : 'Verify OTP'}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleReset}>
              <TextField fullWidth label="New Password" type="password" value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)} sx={{ mb: 2 }} />
              <TextField fullWidth label="Confirm Password" type="password" value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)} sx={{ mb: 3 }} />
              <Button type="submit" fullWidth variant="contained" disabled={loading} sx={{
                py: 1.3, background: 'var(--gradient-primary)', fontWeight: 700,
              }}>
                {loading ? <CircularProgress size={22} sx={{ color: '#fff' }} /> : 'Reset Password'}
              </Button>
            </form>
          )}
          <Button fullWidth onClick={() => navigate('/loginpage')} sx={{ mt: 2, color: 'text.secondary' }}>
            ← Back to Login
          </Button>
        </Box>
      </motion.div>
    </Box>
  );
}
