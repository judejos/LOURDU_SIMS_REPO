import { Box, Typography, Paper, Grid, LinearProgress, List, ListItem, ListItemText, ListItemAvatar, Avatar } from '@mui/material';
import { motion } from 'framer-motion';
import { StatCard } from '../../components/common';
import { Assessment, Star, TrendingUp, ChatBubble } from '@mui/icons-material';

const MOCK_PERFORMANCE = {
  overallScore: 92,
  tasksCompleted: 45,
  attendanceRate: 98,
  recentFeedback: [
    { id: 1, reviewer: 'Alice Smith', role: 'Manager', comment: 'Great job on the frontend API integration. Very proactive.', date: '2026-06-10' },
    { id: 2, reviewer: 'Bob Jones', role: 'Lead', comment: 'Code quality has improved significantly.', date: '2026-05-28' },
  ]
};

export default function PerformancePage() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <Box className="page-header" sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={800}>My Performance</Typography>
        <Typography variant="body2" color="text.secondary">
          Track your progress, scores, and feedback from your managers.
        </Typography>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item="true" xs={12} sm={4}>
          <StatCard label="Overall Score" value={`${MOCK_PERFORMANCE.overallScore}%`} icon={<Star />} trend={5} />
        </Grid>
        <Grid item="true" xs={12} sm={4}>
          <StatCard label="Tasks Completed" value={MOCK_PERFORMANCE.tasksCompleted} icon={<Assessment />} trend={12} />
        </Grid>
        <Grid item="true" xs={12} sm={4}>
          <StatCard label="Attendance Rate" value={`${MOCK_PERFORMANCE.attendanceRate}%`} icon={<TrendingUp />} trend={1} color="#22c55e" />
        </Grid>
      </Grid>

      <Grid container spacing={4}>
        <Grid item="true" xs={12} md={6}>
          <Paper className="glass-card" sx={{ p: 4, height: '100%' }}>
            <Typography variant="h6" fontWeight={700} mb={3}>Skill Progression</Typography>
            
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" fontWeight={600}>React / Frontend</Typography>
                <Typography variant="body2" fontWeight={700}>85%</Typography>
              </Box>
              <LinearProgress variant="determinate" value={85} sx={{ height: 8, borderRadius: 4 }} />
            </Box>

            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" fontWeight={600}>Python / Backend</Typography>
                <Typography variant="body2" fontWeight={700}>70%</Typography>
              </Box>
              <LinearProgress variant="determinate" value={70} sx={{ height: 8, borderRadius: 4, '& .MuiLinearProgress-bar': { bgcolor: 'warning.main' } }} />
            </Box>

            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" fontWeight={600}>Communication</Typography>
                <Typography variant="body2" fontWeight={700}>95%</Typography>
              </Box>
              <LinearProgress variant="determinate" value={95} sx={{ height: 8, borderRadius: 4, '& .MuiLinearProgress-bar': { bgcolor: 'success.main' } }} />
            </Box>
          </Paper>
        </Grid>

        <Grid item="true" xs={12} md={6}>
          <Paper className="glass-card" sx={{ p: 4, height: '100%' }}>
            <Typography variant="h6" fontWeight={700} mb={3} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <ChatBubble fontSize="small" color="primary" /> Recent Feedback
            </Typography>
            
            <List disablePadding>
              {MOCK_PERFORMANCE.recentFeedback.map((fb, idx) => (
                <ListItem key={fb.id} alignItems="flex-start" divider={idx !== MOCK_PERFORMANCE.recentFeedback.length - 1} sx={{ px: 0, py: 2 }}>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'var(--color-primary)', fontSize: '0.9rem', width: 36, height: 36 }}>
                      {fb.reviewer.charAt(0)}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="body2" fontWeight={700}>{fb.reviewer}</Typography>
                        <Typography variant="caption" color="text.secondary">{fb.date}</Typography>
                      </Box>
                    }
                    secondary={
                      <>
                        <Typography component="span" variant="caption" color="text.secondary" display="block" mb={1}>{fb.role}</Typography>
                        <Typography component="span" variant="body2" color="text.primary" sx={{ fontStyle: 'italic', display: 'block' }}>"{fb.comment}"</Typography>
                      </>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </motion.div>
  );
}
