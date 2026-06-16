import { useState, useEffect } from 'react';
import { Box, Typography, Paper, Avatar, Button, Grid, TextField, CircularProgress } from '@mui/material';
import { motion } from 'framer-motion';
import { authAPI, usersAPI } from '../../services/api';

export default function AdminProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ username: '', email: '', phone: '' });

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await authAPI.me();
      setProfile(res.data);
      setFormData({
        username: res.data.username || '',
        email: res.data.email || '',
        phone: res.data.phone || ''
      });
    } catch (err) {
      console.error('Failed to fetch profile', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleSave = async () => {
    try {
      // Assuming usersAPI.updateUser or similar exists to update profile info
      if (profile && profile.emp_id) {
        await usersAPI.updateUser(profile.emp_id, formData);
        await fetchProfile();
      }
      setIsEditing(false);
    } catch (err) {
      console.error('Failed to update profile', err);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
        <CircularProgress sx={{ color: 'var(--color-primary)' }} />
      </Box>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <Box className="page-header" sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight={800}>Admin Profile</Typography>
        <Typography variant="body2" color="text.secondary">
          Manage your personal information and preferences.
        </Typography>
      </Box>

      {profile && (
        <Paper className="glass-card" sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', gap: 4, alignItems: 'center', mb: 4 }}>
            <Avatar sx={{ width: 100, height: 100, bgcolor: 'var(--color-primary)', fontSize: '2.5rem' }}>
              {profile.username ? profile.username[0].toUpperCase() : 'A'}
            </Avatar>
            <Box>
              <Typography variant="h5" fontWeight={700}>{profile.username || 'Administrator'}</Typography>
              <Typography variant="body1" color="text.secondary" mb={2}>{profile.email || 'admin@vdart.com'}</Typography>
              <Typography variant="body2" color="text.secondary">Role: {profile.role}</Typography>
            </Box>
          </Box>

          <Box sx={{ borderTop: '1px solid var(--border-subtle)', pt: 3 }}>
            <Typography variant="h6" mb={3}>Personal Information</Typography>
            <Grid container spacing={3}>
              <Grid item="true" xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Name / Username"
                  value={isEditing ? formData.username : profile.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  disabled={!isEditing}
                />
              </Grid>
              <Grid item="true" xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Email"
                  value={isEditing ? formData.email : profile.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  disabled={!isEditing}
                />
              </Grid>
              <Grid item="true" xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Phone"
                  value={isEditing ? formData.phone : profile.phone || ''}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  disabled={!isEditing}
                />
              </Grid>
            </Grid>

            <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
              {isEditing ? (
                <>
                  <Button variant="contained" onClick={handleSave}>Save Changes</Button>
                  <Button variant="outlined" onClick={() => setIsEditing(false)}>Cancel</Button>
                </>
              ) : (
                <Button variant="outlined" onClick={() => setIsEditing(true)}>Edit Profile</Button>
              )}
            </Box>
          </Box>
        </Paper>
      )}
    </motion.div>
  );
}
