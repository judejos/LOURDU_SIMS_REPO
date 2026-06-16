/**
 * SIMS — Admin Dashboard
 * Main admin shell with sidebar navigation and content routing.
 */

import { useState, useEffect } from 'react';
import { Box, Typography, Grid, TextField } from '@mui/material';
import { People, School, Payment, BarChart, Schedule } from '@mui/icons-material';
import { motion } from 'framer-motion';
import DashboardShell from '../../components/layout/DashboardShell';
import { StatCard, LoadingSpinner } from '../../components/common';
import { dashboardAPI } from '../../services/api';

import EntityManagement from './EntityManagement';
import DepartmentManagement from './DepartmentManagement';
import StaffList from './StaffList';
import InternLists from './InternLists';
import TeamManagement from './TeamManagement';
import RegisterPage from './RegisterPage';
import AdminProfile from './AdminProfile';
import Settings from './Settings';
import AuditLogPage from './AuditLogPage';
import DelegationPage from './DelegationPage';
import WebhooksPage from './WebhooksPage';
import AIReportsPage from './AIReportsPage';
import ImportPage from './ImportPage';
import PaymentList from './PaymentList';
import PerformanceFeedbackPage from './PerformanceFeedbackPage';

function AdminDashboardContent() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    setLoading(true);
    dashboardAPI.summary({ date: selectedDate })
      .then((res) => setData(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [selectedDate]);

  if (loading && !data) return <LoadingSpinner text="Loading dashboard..." />;

  const ic = data?.intern_counts || {};
  const att = data?.attendance || {};
  const pay = data?.payment_summary || {};

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
      <Box className="page-header" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Typography variant="h4" fontWeight={800}>Dashboard</Typography>
          <Typography variant="body2" color="text.secondary">Welcome back! Here's your overview.</Typography>
        </Box>
        <Box>
          <TextField
            type="date"
            size="small"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            sx={{ bgcolor: 'var(--bg-card)', borderRadius: 1 }}
          />
        </Box>
      </Box>

      {/* Intern Stats */}
      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        <Grid item="true" xs={6} sm={4} md={2}>
          <StatCard label="Total Interns" value={ic.total || 0} color="var(--color-primary)" icon={<People />} delay={0} />
        </Grid>
        <Grid item="true" xs={6} sm={4} md={2}>
          <StatCard label="Active" value={ic.active || 0} color="#22c55e" icon={<School />} delay={0.05} />
        </Grid>
        <Grid item="true" xs={6} sm={4} md={2}>
          <StatCard label="Completed" value={ic.completed || 0} color="#3b82f6" delay={0.1} />
        </Grid>
        <Grid item="true" xs={6} sm={4} md={2}>
          <StatCard label="Yet to Join" value={ic.yet_to_join || 0} color="#f59e0b" delay={0.15} />
        </Grid>
        <Grid item="true" xs={6} sm={4} md={2}>
          <StatCard label="On Leave" value={ic.on_leave || 0} color="#8b5cf6" delay={0.2} />
        </Grid>
        <Grid item="true" xs={6} sm={4} md={2}>
          <StatCard label="Discontinued" value={ic.discontinued || 0} color="#ef4444" delay={0.25} />
        </Grid>
      </Grid>

      {/* Attendance & Payment Row */}
      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        <Grid item="true" xs={12} md={4}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Box className="glass-card" sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Schedule sx={{ color: 'var(--color-accent)' }} />
                <Typography fontWeight={700}>Attendance Today</Typography>
              </Box>
              <Typography variant="h3" fontWeight={800} sx={{ color: '#22c55e' }}>
                {att.pct || 0}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {att.present || 0} / {att.total_active || 0} present
              </Typography>
            </Box>
          </motion.div>
        </Grid>
        <Grid item="true" xs={12} md={8}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
            <Box className="glass-card" sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Payment sx={{ color: '#f59e0b' }} />
                <Typography fontWeight={700}>Payment Overview</Typography>
              </Box>
              <Grid container spacing={2}>
                <Grid item="true" xs={3}>
                  <Typography variant="h5" fontWeight={700} color="success.main">{pay.completed || 0}</Typography>
                  <Typography variant="caption" color="text.secondary">Completed</Typography>
                </Grid>
                <Grid item="true" xs={3}>
                  <Typography variant="h5" fontWeight={700} color="warning.main">{pay.pending || 0}</Typography>
                  <Typography variant="caption" color="text.secondary">Pending</Typography>
                </Grid>
                <Grid item="true" xs={3}>
                  <Typography variant="h5" fontWeight={700} color="error.main">{pay.overdue || 0}</Typography>
                  <Typography variant="caption" color="text.secondary">Overdue</Typography>
                </Grid>
                <Grid item="true" xs={3}>
                  <Typography variant="h5" fontWeight={700}>₹{(pay.total_amount || 0).toLocaleString()}</Typography>
                  <Typography variant="caption" color="text.secondary">Total Collected</Typography>
                </Grid>
              </Grid>
            </Box>
          </motion.div>
        </Grid>
      </Grid>

      {/* Department Distribution */}
      {data?.dept_active_counts?.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Box className="glass-card" sx={{ p: 3 }}>
            <Typography fontWeight={700} mb={2}>Department Distribution</Typography>
            {data.dept_active_counts.map((dept, i) => (
              <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1.5 }}>
                <Typography variant="body2" sx={{ minWidth: 140, fontWeight: 500 }}>
                  {dept.department__name || 'Unassigned'}
                </Typography>
                <Box sx={{ flex: 1, height: 8, bgcolor: 'action.hover', borderRadius: 4, overflow: 'hidden' }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min((dept.count / (ic.active || 1)) * 100, 100)}%` }}
                    transition={{ duration: 0.8, delay: 0.5 + i * 0.1 }}
                    style={{
                      height: '100%', borderRadius: 4,
                      background: 'linear-gradient(90deg, var(--color-primary), var(--color-accent))',
                    }}
                  />
                </Box>
                <Typography variant="body2" fontWeight={700} sx={{ minWidth: 30 }}>
                  {dept.count}
                </Typography>
              </Box>
            ))}
          </Box>
        </motion.div>
      )}
    </motion.div>
  );
}

export default function AdminDashboard() {
  const [activeItem, setActiveItem] = useState('dashboard');

  const renderContent = () => {
    switch (activeItem) {
      case 'dashboard': return <AdminDashboardContent />;
      case 'staff': return <StaffList />;
      case 'interns': return <InternLists />;
      case 'payments': return <PlaceholderPage title="Payment Management" />;
      case 'departments': return <DepartmentManagement />;
      case 'entities': return <EntityManagement />;
      case 'feedback': return <PlaceholderPage title="Feedback" />;
      case 'import': return <ImportPage />;
      case 'register': return <RegisterPage />;
      case 'teams': return <TeamManagement />;
      case 'profile': return <AdminProfile />;
      case 'audit-log': return <AuditLogPage />;
      case 'delegation': return <DelegationPage />;
      case 'webhooks': return <WebhooksPage />;
      case 'ai-reports': return <AIReportsPage />;
      case 'payment-list': return <PaymentList />;
      case 'performance-feedback': return <PerformanceFeedbackPage />;
      default: return <AdminDashboardContent />;
    }
  };

  return (
    <DashboardShell type="admin" activeItem={activeItem} onItemClick={setActiveItem}>
      {renderContent()}
    </DashboardShell>
  );
}

function PlaceholderPage({ title }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <Box className="page-header">
        <Typography variant="h4" fontWeight={800}>{title}</Typography>
        <Typography variant="body2" color="text.secondary">This module is ready — UI will be populated in Phase 3.</Typography>
      </Box>
      <Box className="glass-card" sx={{ p: 6, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary">🚀 Module scaffold ready</Typography>
        <Typography variant="body2" color="text.tertiary" mt={1}>
          Backend API for {title} is fully functional. Frontend UI coming in the next phase.
        </Typography>
      </Box>
    </motion.div>
  );
}
