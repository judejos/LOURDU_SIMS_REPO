/**
 * SIMS — Password Recovery (OTP Request)
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, TextField, Button, Typography, Alert, CircularProgress } from '@mui/material';
import { motion } from 'framer-motion';
import { authAPI } from '../../services/api';

export default function Recovery() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setMessage(''); setLoading(true);
    try {
      await authAPI.requestOTP({ email });
      setMessage('OTP sent! Check your email.');
      setTimeout(() => navigate('/Reset', { state: { email } }), 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send OTP');
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
          <Typography variant="h5" fontWeight={800} textAlign="center" mb={1} className="gradient-text">
            Password Recovery
          </Typography>
          <Typography variant="body2" color="text.secondary" textAlign="center" mb={3}>
            Enter your email to receive a password reset OTP.
          </Typography>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}
          <form onSubmit={handleSubmit}>
            <TextField fullWidth label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} sx={{ mb: 3 }} />
            <Button type="submit" fullWidth variant="contained" disabled={loading} sx={{
              py: 1.3, background: 'var(--gradient-primary)', fontWeight: 700,
            }}>
              {loading ? <CircularProgress size={22} sx={{ color: '#fff' }} /> : 'Send OTP'}
            </Button>
          </form>
          <Button fullWidth onClick={() => navigate('/')} sx={{ mt: 2, color: 'text.secondary' }}>
            ← Back to Login
          </Button>
        </Box>
      </motion.div>
    </Box>
  );
}
