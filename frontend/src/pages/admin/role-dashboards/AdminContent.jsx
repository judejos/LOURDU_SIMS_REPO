/**
 * SIMS — Admin (superadmin) Dashboard Content
 * Capabilities: View all data + transactions, add staff (manager/SME/mentor/staff)
 */

import { useState, useEffect } from 'react';
import { Box, Typography, Grid, TextField, Chip } from '@mui/material';
import { People, Payment, Schedule, AdminPanelSettings } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { StatCard, LoadingSpinner } from '../../../components/common';
import { dashboardAPI, usersAPI } from '../../../services/api';

import EntityManagement from '../EntityManagement';
import DepartmentManagement from '../DepartmentManagement';
import StaffList from '../StaffList';
import InternLists from '../InternLists';
import TeamManagement from '../TeamManagement';
import OnboardingList from '../../intern-mgmt/OnboardingList';
import AdminProfile from '../AdminProfile';
import AuditLogPage from '../AuditLogPage';
import PaymentList from '../PaymentList';
import RegisterPage from '../RegisterPage';

function AdminOverview() {
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

  const ic  = data?.intern_counts || {};
  const att = data?.attendance || {};
  const pay = data?.payment_summary || {};

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
      <Box className="page-header" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Typography variant="h4" fontWeight={800}>Admin Dashboard</Typography>
          <Typography variant="body2" color="text.secondary">System overview — all entities</Typography>
        </Box>
        <TextField
          type="date" size="small" value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          sx={{ bgcolor: 'var(--bg-card)', borderRadius: 1 }}
        />
      </Box>

      {/* Intern Stats */}
      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        {[
          { label: 'Total Interns',  value: ic.total || 0,        color: 'var(--color-primary)', icon: <People /> },
          { label: 'Active',         value: ic.active || 0,       color: '#22c55e',              icon: <People /> },
          { label: 'Completed',      value: ic.completed || 0,    color: '#3b82f6' },
          { label: 'Yet to Join',    value: ic.yet_to_join || 0,  color: '#f59e0b' },
          { label: 'On Leave',       value: ic.on_leave || 0,     color: '#8b5cf6' },
          { label: 'Discontinued',   value: ic.discontinued || 0, color: '#ef4444' },
        ].map((s, i) => (
          <Grid item="true" xs={6} sm={4} md={2} key={i}>
            <StatCard {...s} delay={i * 0.05} />
          </Grid>
        ))}
      </Grid>

      {/* Attendance + Payments */}
      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        <Grid item="true" xs={12} md={4}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Box className="glass-card" sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Schedule sx={{ color: 'var(--color-accent)' }} />
                <Typography fontWeight={700}>Attendance Today</Typography>
              </Box>
              <Typography variant="h3" fontWeight={800} sx={{ color: '#22c55e' }}>{att.pct || 0}%</Typography>
              <Typography variant="body2" color="text.secondary">{att.present || 0} / {att.total_active || 0} present</Typography>
            </Box>
          </motion.div>
        </Grid>
        <Grid item="true" xs={12} md={8}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
            <Box className="glass-card" sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Payment sx={{ color: '#f59e0b' }} />
                <Typography fontWeight={700}>Transaction Overview</Typography>
                <Chip label="View Only" size="small" color="warning" sx={{ ml: 'auto' }} />
              </Box>
              <Grid container spacing={2}>
                {[
                  { label: 'Completed', value: pay.completed || 0, color: 'success.main' },
                  { label: 'Pending',   value: pay.pending || 0,   color: 'warning.main' },
                  { label: 'Overdue',   value: pay.overdue || 0,   color: 'error.main' },
                  { label: 'Total Collected', value: `₹${(pay.total_amount || 0).toLocaleString()}`, color: 'text.primary' },
                ].map((p, i) => (
                  <Grid item="true" xs={3} key={i}>
                    <Typography variant="h5" fontWeight={700} color={p.color}>{p.value}</Typography>
                    <Typography variant="caption" color="text.secondary">{p.label}</Typography>
                  </Grid>
                ))}
              </Grid>
            </Box>
          </motion.div>
        </Grid>
      </Grid>

      {/* Domain Distribution */}
      {data?.dept_active_counts?.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Box className="glass-card" sx={{ p: 3 }}>
            <Typography fontWeight={700} mb={2}>Domain Distribution</Typography>
            {data.dept_active_counts.map((dept, i) => (
              <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1.5 }}>
                <Typography variant="body2" sx={{ minWidth: 140, fontWeight: 500 }}>
                  {dept.domain__name || 'Unassigned'}
                </Typography>
                <Box sx={{ flex: 1, height: 8, bgcolor: 'action.hover', borderRadius: 4, overflow: 'hidden' }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min((dept.count / (ic.active || 1)) * 100, 100)}%` }}
                    transition={{ duration: 0.8, delay: 0.5 + i * 0.1 }}
                    style={{ height: '100%', borderRadius: 4, background: 'linear-gradient(90deg, var(--color-primary), var(--color-accent))' }}
                  />
                </Box>
                <Typography variant="body2" fontWeight={700} sx={{ minWidth: 30 }}>{dept.count}</Typography>
              </Box>
            ))}
          </Box>
        </motion.div>
      )}
    </motion.div>
  );
}

export default function AdminContent({ activeItem }) {
  switch (activeItem) {
    case 'dashboard':   return <AdminOverview />;
    case 'staff':       return <StaffList />;
    case 'register':    return <RegisterPage />;
    case 'interns':     return <InternLists />;
    case 'payments':    return <PaymentList />;
    case 'domains':     return <DepartmentManagement />;
    case 'entities':    return <EntityManagement />;
    case 'teams':       return <TeamManagement />;
    case 'onboarding':  return <OnboardingList />;
    case 'audit-log':   return <AuditLogPage />;
    case 'profile':     return <AdminProfile />;
    default:            return <AdminOverview />;
  }
}
