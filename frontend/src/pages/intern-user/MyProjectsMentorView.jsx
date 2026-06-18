import React, { useState, useEffect } from 'react';
import { Box, Typography, Grid, Chip, Button, Avatar } from '@mui/material';
import { motion } from 'framer-motion';
import { FolderSpecial, People, Mail, TaskAlt } from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function MyProjectsMentorView() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const projects = user?.projects_info || [];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <Box className="page-header" sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={800}>My Projects & Mentor</Typography>
        <Typography variant="body2" color="text.secondary">View your active project assignments and mentor details</Typography>
      </Box>

      {projects.length === 0 ? (
        <Box className="glass-card" sx={{ p: 6, textAlign: 'center' }}>
          <FolderSpecial sx={{ fontSize: 48, color: 'text.secondary', mb: 2, opacity: 0.5 }} />
          <Typography variant="h6" fontWeight={700}>No Active Projects</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            You haven't been assigned to any projects yet. Please wait for your mentor to assign you.
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {/* Mentor Profile Card */}
          <Grid item xs={12} md={4}>
            <Box className="glass-card" sx={{ p: 4, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
              <Avatar sx={{ width: 80, height: 80, bgcolor: 'var(--color-primary)', mb: 2, fontSize: '2rem' }}>
                {projects[0].team_lead__full_name?.charAt(0) || 'M'}
              </Avatar>
              <Typography variant="h6" fontWeight={800}>{projects[0].team_lead__full_name || 'Assigned Soon'}</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>Your Assigned Mentor</Typography>
              <Chip label="Mentor" size="small" color="primary" sx={{ mb: 3 }} />
              
              <Box sx={{ mt: 'auto', width: '100%' }}>
                {projects[0].team_lead__user__email && (
                  <Button 
                    variant="contained" 
                    fullWidth 
                    startIcon={<Mail />}
                    onClick={() => window.location.href = `mailto:${projects[0].team_lead__user__email}`}
                    sx={{ borderRadius: 2, py: 1 }}
                  >
                    Contact Mentor
                  </Button>
                )}
              </Box>
            </Box>
          </Grid>

          {/* Projects List */}
          <Grid item xs={12} md={8}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                <FolderSpecial sx={{ color: 'var(--color-primary)' }} /> Assigned Projects
              </Typography>
              
              {projects.map(p => (
                <Box key={p.id} className="glass-card" sx={{ p: 3, borderLeft: '4px solid var(--color-primary)' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box>
                      <Typography variant="h6" fontWeight={700}>{p.name}</Typography>
                      <Typography variant="body2" color="text.secondary">Project ID: #{p.id}</Typography>
                    </Box>
                    <Chip label="Active" color="success" size="small" />
                  </Box>
                  
                  <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                    <Button 
                      variant="outlined" 
                      size="small" 
                      startIcon={<TaskAlt />}
                      onClick={() => navigate('/intern-user/tasks')}
                    >
                      View Tasks
                    </Button>
                  </Box>
                </Box>
              ))}
            </Box>
          </Grid>
        </Grid>
      )}
    </motion.div>
  );
}
