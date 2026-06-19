/**
 * SIMS — Intern Self-Service Dashboard
 * Main intern dashboard shell with attendance widget, tasks, and AI features.
 */

import { useState, useEffect } from 'react';
import { Box, Typography, Grid, Button, Chip } from '@mui/material';
import { Schedule, Task, Assessment, SmartToy, People } from '@mui/icons-material';
import { motion } from 'framer-motion';
import DashboardShell from '../../components/layout/DashboardShell';
import { StatCard, LoadingSpinner, StatusChip } from '../../components/common';
import { dashboardAPI, attendanceAPI, tasksAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';

function InternDashContent() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState(null);
  const [attendance, setAttendance] = useState(null);
  const [checkedIn, setCheckedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      dashboardAPI.general().catch(() => ({ data: {} })),
      tasksAPI.dueToday().catch(() => ({ data: [] })),
      attendanceAPI.myAttendance().catch(() => ({ data: [] })),
    ]).then(([dashRes, dueRes, attRes]) => {
      setTasks(dashRes.data);
      // Check if already checked in today
      const today = new Date().toISOString().split('T')[0];
      const todayRecord = attRes.data.find((r) => r.date === today);
      if (todayRecord?.check_in) setCheckedIn(true);
      setAttendance(attRes.data);
    }).finally(() => setLoading(false));
  }, []);

  const handleCheckIn = async () => {
    try {
      await attendanceAPI.checkIn();
      setCheckedIn(true);
    } catch (err) {
      alert(err.response?.data?.error || 'Check-in failed');
    }
  };

  const handleCheckOut = async () => {
    try {
      await attendanceAPI.checkOut();
      setCheckedIn(false);
    } catch (err) {
      alert(err.response?.data?.error || 'Check-out failed');
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <Box className="page-header">
        <Typography variant="h4" fontWeight={800}>
          Welcome, {user.fullName || user.username}! 👋
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Your intern dashboard — here's what's happening today.
        </Typography>
      </Box>

      {/* Check-in Widget */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Box className="glass-card" sx={{ p: 3, mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Schedule sx={{ color: 'var(--color-accent)', fontSize: 32 }} />
              <Box>
                <Typography fontWeight={700}>Attendance</Typography>
                <Typography variant="body2" color="text.secondary">
                  {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', gap: 1.5 }}>
              {!checkedIn ? (
                <Button variant="contained" onClick={handleCheckIn} sx={{
                  background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                  fontWeight: 700, px: 3,
                }}>
                  ⏱️ Check In
                </Button>
              ) : (
                <Button variant="contained" onClick={handleCheckOut} color="error" sx={{ fontWeight: 700, px: 3 }}>
                  🛑 Check Out
                </Button>
              )}
            </Box>
          </Box>
        </Box>
      </motion.div>

      {/* Task Stats */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid xs={6} md={3}>
          <StatCard label="Total Tasks" value={tasks?.total_tasks || 0} color="var(--color-primary)" icon={<Task />} delay={0.15} />
        </Grid>
        <Grid xs={6} md={3}>
          <StatCard label="In Progress" value={tasks?.in_progress_tasks || 0} color="#f59e0b" delay={0.2} />
        </Grid>
        <Grid xs={6} md={3}>
          <StatCard label="Completed" value={tasks?.completed_tasks || 0} color="#22c55e" delay={0.25} />
        </Grid>
        <Grid xs={6} md={3}>
          <StatCard label="Pending" value={tasks?.pending_tasks || 0} color="#3b82f6" delay={0.3} />
        </Grid>
      </Grid>

      {/* Quick Access Cards */}
      <Grid container spacing={2.5}>
        <Grid xs={12} md={4}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
            <Box className="glass-card" sx={{ p: 3, cursor: 'pointer', '&:hover': { borderColor: 'var(--color-primary)' } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                <People sx={{ color: 'var(--color-primary)' }} />
                <Typography fontWeight={700}>My Projects & Mentor</Typography>
              </Box>
              <Box sx={{ mb: 1.5, mt: 0.5 }}>
                {user?.projects_info && user.projects_info.length > 0 ? (
                  user.projects_info.map(p => (
                    <Chip key={p.id} label={p.name} size="small" color="primary" sx={{ mr: 0.5, mb: 0.5, fontWeight: 600 }} />
                  ))
                ) : (
                  <Chip label="No Active Project" size="small" variant="outlined" />
                )}
              </Box>
              <Typography variant="body2" color="text.secondary">
                {user?.projects_info && user.projects_info.length > 0 && user.projects_info[0].team_lead__full_name
                  ? `Mentor: ${user.projects_info[0].team_lead__full_name}. Contact for leaves or doubts.`
                  : 'You will be assigned a mentor shortly.'}
              </Typography>
              {user?.projects_info && user.projects_info.length > 0 && user.projects_info[0].team_lead__user__email && (
                 <Button 
                   variant="outlined" 
                   size="small" 
                   sx={{ mt: 2 }}
                   onClick={(e) => { e.stopPropagation(); window.location.href = `mailto:${user.projects_info[0].team_lead__user__email}`; }}
                 >
                   Contact Mentor
                 </Button>
              )}
            </Box>
          </motion.div>
        </Grid>
        <Grid xs={12} md={4}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <Box className="glass-card" sx={{ p: 3, cursor: 'pointer', '&:hover': { borderColor: 'var(--color-primary)' } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                <Assessment sx={{ color: '#f59e0b' }} />
                <Typography fontWeight={700}>Performance</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                View your attendance, task completion rate, and quality metrics.
              </Typography>
            </Box>
          </motion.div>
        </Grid>
        <Grid xs={12} md={4}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
            <Box className="glass-card" sx={{ p: 3, cursor: 'pointer', '&:hover': { borderColor: 'var(--color-accent)' } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                <SmartToy sx={{ color: 'var(--color-accent)' }} />
                <Typography fontWeight={700}>AI Assistant</Typography>
                <Chip label="NEW" size="small" sx={{ bgcolor: 'var(--color-primary)15', color: 'var(--color-primary)', fontWeight: 700 }} />
              </Box>
              <Typography variant="body2" color="text.secondary">
                Get AI-powered insights, resume building, mock interviews, and learning paths.
              </Typography>
            </Box>
          </motion.div>
        </Grid>
      </Grid>
    </motion.div>
  );
}

import AttendanceManagement from './AttendanceManagement';
import LeaveManagement from './LeaveManagement';
import InternHoursCalculator from './InternHoursCalculator';
import InternTasks from './Tasks';
import AiAssistant from './AiAssistant';
import MockInterviewPage from './MockInterviewPage';
import ResumeBuilderPage from './ResumeBuilderPage';
import LearningPage from './LearningPage';
import CalendarPage from './CalendarPage';
import DocumentView from './DocumentView';
import PaymentStatusPage from './PaymentStatusPage';
import AssetReport from './AssetReport';
import PerformancePage from './PerformancePage';
import StudentStaffFeedback from './StudentStaffFeedback';
import TeamsManagement from './TeamsManagement';
import ExitSummaryPage from './ExitSummaryPage';
import UserProfile from '../admin/UserProfile';
import MyProjectsMentorView from './MyProjectsMentorView';

export default function InternDashboard() {
  const location = useLocation();

  // Extract the active item from the URL path.
  const pathParts = location.pathname.split('/').filter(Boolean);
  const activeItem = pathParts.length > 1 ? pathParts[1] : 'dashboard';

  const renderContent = () => {
    switch (activeItem) {
      case 'dashboard': return <InternDashContent />;
      case 'my-projects': return <MyProjectsMentorView />;
      case 'attendance': return <AttendanceManagement />;
      case 'leave': return <LeaveManagement />;
      case 'calculator': return <InternHoursCalculator />;
      case 'tasks': return <InternTasks />;
      case 'ai-assistant': return <AiAssistant />;
      case 'mock-interview': return <MockInterviewPage />;
      case 'resume-builder': return <ResumeBuilderPage />;
      case 'exit-summary': return <ExitSummaryPage />;
      case 'learning': return <LearningPage />;
      case 'calendar': return <CalendarPage />;
      case 'documents': return <DocumentView />;
      case 'payments': return <PaymentStatusPage />;
      case 'assets': return <AssetReport />;
      case 'performance': return <PerformancePage />;
      case 'feedback': return <StudentStaffFeedback />;
      case 'teams': return <TeamsManagement />;
      case 'profile': return <UserProfile />;
      default: return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <Box className="page-header">
            <Typography variant="h4" fontWeight={800} sx={{ textTransform: 'capitalize' }}>
              {activeItem.replace(/-/g, ' ')}
            </Typography>
          </Box>
          <Box className="glass-card" sx={{ p: 6, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary">🚀 Module ready</Typography>
            <Typography variant="body2" color="text.tertiary" mt={1}>
              Backend API is live. Full UI coming in next phases.
            </Typography>
          </Box>
        </motion.div>
      );
    }
  };

  return (
    <DashboardShell type="intern" basePath="/intern-user">
      <Routes>
        <Route path="/" element={<Navigate to="dashboard" replace />} />
        <Route path="*" element={renderContent()} />
      </Routes>
    </DashboardShell>
  );
}
