import { useState, useEffect, useRef } from 'react';
import { Box, Typography, Paper, Avatar, Button, Grid, TextField, CircularProgress, IconButton } from '@mui/material';
import { PhotoCamera } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { authAPI, usersAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

export default function UserProfile() {
  const { fetchMe } = useAuth(); // To refresh context after photo upload
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  const [formData, setFormData] = useState({ full_name: '', email: '', phone: '' });

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await authAPI.me();
      setProfile(res.data);
      setFormData({
        full_name: res.data.full_name || res.data.username || '',
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
      if (profile && profile.emp_id) {
        await usersAPI.updatePersonal(profile.emp_id, formData);
        await fetchProfile();
        if (fetchMe) await fetchMe(); // update global context
      }
      setIsEditing(false);
    } catch (err) {
      console.error('Failed to update profile', err);
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !profile?.emp_id) return;
    
    try {
      setUploading(true);
      await usersAPI.updateProfilePhoto(profile.emp_id, file);
      await fetchProfile();
      if (fetchMe) await fetchMe(); // update header avatar
    } catch (err) {
      console.error('Failed to upload photo', err);
    } finally {
      setUploading(false);
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
        <Typography variant="h4" fontWeight={800}>My Profile</Typography>
        <Typography variant="body2" color="text.secondary">
          Manage your personal information and preferences.
        </Typography>
      </Box>

      {profile && (
        <Paper className="glass-card" sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', gap: 4, alignItems: 'center', mb: 4 }}>
            <Box sx={{ position: 'relative' }}>
              <Avatar 
                src={profile.photo || ''} 
                sx={{ width: 100, height: 100, bgcolor: 'var(--color-primary)', fontSize: '2.5rem' }}
              >
                {!profile.photo && (profile.full_name ? profile.full_name[0].toUpperCase() : 'U')}
              </Avatar>
              <input
                type="file"
                accept="image/*"
                hidden
                ref={fileInputRef}
                onChange={handlePhotoUpload}
              />
              <IconButton 
                sx={{ 
                  position: 'absolute', bottom: -5, right: -5, 
                  bgcolor: 'var(--bg-card)', boxShadow: 1,
                  '&:hover': { bgcolor: 'var(--bg-paper)' }
                }}
                size="small"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                {uploading ? <CircularProgress size={20} /> : <PhotoCamera fontSize="small" />}
              </IconButton>
            </Box>
            <Box>
              <Typography variant="h5" fontWeight={700}>{profile.full_name || profile.username || 'User'}</Typography>
              <Typography variant="body1" color="text.secondary" mb={2}>{profile.email || 'user@example.com'}</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ textTransform: 'capitalize' }}>Role: {profile.role}</Typography>
            </Box>
          </Box>

          <Box sx={{ borderTop: '1px solid var(--border-subtle)', pt: 3 }}>
            <Typography variant="h6" mb={3}>Personal Information</Typography>
            <Grid container spacing={3}>
              <Grid item="true" xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Name / Username"
                  value={isEditing ? formData.full_name : (profile.full_name || profile.username)}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
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
