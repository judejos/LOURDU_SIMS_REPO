/**
 * SIMS — Admin (superadmin) Dashboard Content
 * Capabilities: View all data + transactions, add staff (manager/SME/mentor/staff)
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Grid, TextField, Chip, Button } from '@mui/material';
import { People, Payment, Schedule, AdminPanelSettings, CheckCircle, Verified, HourglassEmpty, PersonOff, Block, Download, Domain } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { StatCard, LoadingSpinner } from '../../../components/common';
import { dashboardAPI, usersAPI } from '../../../services/api';


import EntityManagement from '../EntityManagement';
import DepartmentManagement from '../DepartmentManagement';
import StaffList from '../StaffList';
import StaffForm from '../StaffForm';
import InternLists from '../InternLists';
import TeamManagement from '../TeamManagement';
import InternDirectory from '../../intern-mgmt/InternDirectory';
import UserProfile from '../UserProfile';
import AuditLogPage from '../AuditLogPage';
import PaymentList from '../PaymentList';
import RegisterPage from '../RegisterPage';

function AdminOverview() {
  const navigate = useNavigate();
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

  const total = ic.total || 0;
  const activePct = total ? Math.round((ic.active / total) * 100) : 0;
  const domainCount = data?.dept_active_counts?.length || 5;

  const formatDateString = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const day = d.getDate();
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = monthNames[d.getMonth()];
    const year = d.getFullYear();
    return `${day} ${month} ${year}`;
  };

  const handleExport = () => {
    if (!data) return;
    const csvContent = "data:text/csv;charset=utf-8," 
      + [
          ["Dashboard Summary Export", `Date: ${selectedDate}`],
          [],
          ["Metric", "Value", "Status/Details"],
          ["Total Interns", ic.total || 0, `Across ${domainCount} domains`],
          ["Active Interns", ic.active || 0, `${activePct}% of total`],
          ["Yet to Join", ic.yet_to_join || 0, "Onboarding pending"],
          ["Completed", ic.completed || 0, "No completions yet"],
          ["On Leave", ic.on_leave || 0, ""],
          ["Discontinued", ic.discontinued || 0, ""],
          ["Attendance Today", `${att.pct || 0}%`, `${att.present || 0}/${att.total_active || 0} present`],
          ["Transactions Completed", pay.completed || 0, `Total Collected: INR ${pay.total_amount || 0}`],
          ["Transactions Pending", pay.pending || 0, ""],
          ["Transactions Overdue", pay.overdue || 0, ""],
          [],
          ["Domain Distribution", "Intern Count"],
          ...(data.dept_active_counts || []).map(d => [d.domain__name || "Unassigned", d.count])
        ].map(e => e.map(val => `"${val}"`).join(",")).join("\n");
        
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `admin_dashboard_summary_${selectedDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const maxDomainCount = Math.max(...(data?.dept_active_counts || []).map(d => d.count), 1);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} style={{ width: '100%', maxWidth: '100%' }}>
      {/* Page Header */}
      <Box className="page-header" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2, mb: 4 }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Typography variant="h4" sx={{ fontWeight: 800 }}>Admin dashboard</Typography>
            <Box sx={{ bgcolor: 'rgba(37, 99, 235, 0.15)', color: '#2563eb', px: 1.5, py: 0.2, borderRadius: '20px', fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.02em' }}>
              LIVE
            </Box>
          </Box>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5, fontWeight: 500 }}>
            System overview, all entities · Updated just now
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {/* Custom Date Picker */}
          <Box 
            onClick={() => {
              const el = document.getElementById('dashboard-date-picker');
              if (el) {
                try { el.showPicker(); } catch(e) { el.click(); }
              }
            }} 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1.5, 
              px: 2, 
              py: 1, 
              bgcolor: 'var(--bg-card)', 
              border: '1px solid var(--border-color)', 
              borderRadius: '8px', 
              cursor: 'pointer',
              position: 'relative'
            }}
          >
            <Schedule sx={{ color: 'text.secondary', fontSize: '1.2rem' }} />
            <Typography sx={{ fontWeight: 600, fontSize: '0.9rem', color: 'text.primary' }}>
              {formatDateString(selectedDate)}
            </Typography>
            <input 
              type="date" 
              id="dashboard-date-picker" 
              value={selectedDate} 
              onChange={(e) => setSelectedDate(e.target.value)} 
              style={{ 
                position: 'absolute', 
                top: 0, 
                left: 0, 
                width: '100%', 
                height: '100%', 
                opacity: 0, 
                cursor: 'pointer' 
              }} 
            />
          </Box>
        </Box>
      </Box>

      {/* Top Stat Cards */}
      <Grid container spacing={3.5} alignItems="stretch" sx={{ mb: 4, width: '100%', maxWidth: '100%' }}>
        {/* Card 1: Total Interns */}
        <Grid item xs={6} sm={4} md={2} sx={{ display: 'flex' }}>
          <Box 
            className="stat-card" 
            onClick={() => navigate('/admin/intern-directory', { state: { internTab: 0 } })}
            sx={{ 
              flex: 1, 
              display: 'flex', 
              flexDirection: 'column', 
              justifyContent: 'space-between', 
              minHeight: '140px', 
              position: 'relative', 
              overflow: 'hidden',
              cursor: 'pointer'
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Typography sx={{ fontSize: '0.9rem', color: 'text.secondary', fontWeight: 500 }}>Total interns</Typography>
            </Box>
            <Box sx={{ mt: 2 }}>
              <Typography sx={{ fontSize: '2.6rem', fontWeight: 800, lineHeight: 1, color: 'text.primary' }}>{ic.total || 0}</Typography>
              <Typography sx={{ fontSize: '0.85rem', color: 'text.secondary', mt: 1.5, fontWeight: 500 }}>Across {domainCount} domains</Typography>
            </Box>
          </Box>
        </Grid>

        {/* Card 2: Active */}
        <Grid item xs={6} sm={4} md={2} sx={{ display: 'flex' }}>
          <Box 
            className="stat-card" 
            onClick={() => navigate('/admin/intern-directory', { state: { internTab: 1 } })}
            sx={{ 
              flex: 1, 
              display: 'flex', 
              flexDirection: 'column', 
              justifyContent: 'space-between', 
              minHeight: '140px',
              cursor: 'pointer'
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Typography sx={{ fontSize: '0.9rem', color: 'text.secondary', fontWeight: 500 }}>Active</Typography>
            </Box>
            <Box sx={{ mt: 2 }}>
              <Typography sx={{ fontSize: '2.6rem', fontWeight: 800, lineHeight: 1, color: 'text.primary' }}>{ic.active || 0}</Typography>
              <Typography sx={{ fontSize: '0.85rem', color: '#22c55e', mt: 1.5, fontWeight: 600 }}>{activePct}% of total</Typography>
            </Box>
          </Box>
        </Grid>

        {/* Card 3: Yet to Join */}
        <Grid item xs={6} sm={4} md={2} sx={{ display: 'flex' }}>
          <Box 
            className="stat-card" 
            onClick={() => navigate('/admin/intern-directory', { state: { internTab: 3 } })}
            sx={{ 
              flex: 1, 
              display: 'flex', 
              flexDirection: 'column', 
              justifyContent: 'space-between', 
              minHeight: '140px',
              cursor: 'pointer'
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Typography sx={{ fontSize: '0.9rem', color: 'text.secondary', fontWeight: 500 }}>Yet to join</Typography>
            </Box>
            <Box sx={{ mt: 2 }}>
              <Typography sx={{ fontSize: '2.6rem', fontWeight: 800, lineHeight: 1, color: 'text.primary' }}>{ic.yet_to_join || 0}</Typography>
              <Typography sx={{ fontSize: '0.85rem', color: 'text.secondary', mt: 1.5, fontWeight: 500 }}>Onboarding pending</Typography>
            </Box>
          </Box>
        </Grid>

        {/* Card 4: Completed */}
        <Grid item xs={6} sm={4} md={2} sx={{ display: 'flex' }}>
          <Box 
            className="stat-card" 
            onClick={() => navigate('/admin/intern-directory', { state: { internTab: 4 } })}
            sx={{ 
              flex: 1, 
              display: 'flex', 
              flexDirection: 'column', 
              justifyContent: 'space-between', 
              minHeight: '140px',
              cursor: 'pointer'
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Typography sx={{ fontSize: '0.9rem', color: 'text.secondary', fontWeight: 500 }}>Completed</Typography>
            </Box>
            <Box sx={{ mt: 2 }}>
              <Typography sx={{ fontSize: '2.6rem', fontWeight: 800, lineHeight: 1, color: 'text.primary' }}>{ic.completed || 0}</Typography>
              <Typography sx={{ fontSize: '0.85rem', color: 'text.secondary', mt: 1.5, fontWeight: 500 }}>No completions yet</Typography>
            </Box>
          </Box>
        </Grid>

        {/* Card 5: On Leave */}
        <Grid item xs={6} sm={4} md={2} sx={{ display: 'flex' }}>
          <Box 
            className="stat-card" 
            onClick={() => navigate('/admin/intern-directory', { state: { internTab: 5 } })}
            sx={{ 
              flex: 1, 
              display: 'flex', 
              flexDirection: 'column', 
              justifyContent: 'space-between', 
              minHeight: '140px',
              cursor: 'pointer'
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Typography sx={{ fontSize: '0.9rem', color: 'text.secondary', fontWeight: 500 }}>On leave</Typography>
            </Box>
            <Box sx={{ mt: 2 }}>
              <Typography sx={{ fontSize: '2.6rem', fontWeight: 800, lineHeight: 1, color: 'text.primary' }}>{ic.on_leave || 0}</Typography>
              <Typography sx={{ fontSize: '0.85rem', color: 'text.secondary', mt: 1.5, fontWeight: 500 }}>Away today</Typography>
            </Box>
          </Box>
        </Grid>

        {/* Card 6: Discontinued */}
        <Grid item xs={6} sm={4} md={2} sx={{ display: 'flex' }}>
          <Box 
            className="stat-card" 
            onClick={() => navigate('/admin/intern-directory', { state: { internTab: 6 } })}
            sx={{ 
              flex: 1, 
              display: 'flex', 
              flexDirection: 'column', 
              justifyContent: 'space-between', 
              minHeight: '140px',
              cursor: 'pointer'
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Typography sx={{ fontSize: '0.9rem', color: 'text.secondary', fontWeight: 500 }}>Discontinued</Typography>
            </Box>
            <Box sx={{ mt: 2 }}>
              <Typography sx={{ fontSize: '2.6rem', fontWeight: 800, lineHeight: 1, color: 'text.primary' }}>{ic.discontinued || 0}</Typography>
              <Typography sx={{ fontSize: '0.85rem', color: 'text.secondary', mt: 1.5, fontWeight: 500 }}>No longer active</Typography>
            </Box>
          </Box>
        </Grid>
      </Grid>

      {/* Bottom Row Analytics Cards */}
      <Grid container spacing={3.5} alignItems="stretch" sx={{ width: '100%', maxWidth: '100%' }}>
        {/* Card 1: Attendance Today */}
        <Grid item xs={12} md={4} sx={{ display: 'flex' }}>
          <Box className="glass-card" sx={{ p: 4, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Schedule sx={{ color: 'text.secondary', fontSize: '1.2rem' }} />
              <Typography sx={{ fontWeight: 700, fontSize: '1.05rem', color: 'text.primary' }}>Attendance today</Typography>
            </Box>
            <Box>
              <Typography sx={{ fontSize: '3rem', fontWeight: 800, color: '#22c55e', lineHeight: 1 }}>
                {att.pct || 0}%
              </Typography>
              <Box sx={{ width: '100%', height: 6, bgcolor: 'action.hover', borderRadius: 3, mt: 2, overflow: 'hidden' }}>
                <Box sx={{ height: '100%', bgcolor: '#22c55e', borderRadius: 3, width: `${Math.min(att.pct || 0, 100)}%` }} />
              </Box>
            </Box>
            <Typography sx={{ fontSize: '0.9rem', color: 'text.secondary', fontWeight: 500 }}>
              {att.present || 0} of {att.total_active || 0} present
            </Typography>
          </Box>
        </Grid>

        {/* Card 2: Transactions */}
        <Grid item xs={12} md={4} sx={{ display: 'flex' }}>
          <Box className="glass-card" sx={{ p: 4, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Payment sx={{ color: 'text.secondary', fontSize: '1.2rem' }} />
                <Typography sx={{ fontWeight: 700, fontSize: '1.05rem', color: 'text.primary' }}>Transactions</Typography>
              </Box>
              <Box sx={{ bgcolor: 'var(--warning-bg)', color: 'warning.main', px: 1.5, py: 0.3, borderRadius: '6px', fontSize: '0.72rem', fontWeight: 700 }}>
                View only
              </Box>
            </Box>
            <Typography sx={{ fontSize: '2.8rem', fontWeight: 800, color: 'text.primary', lineHeight: 1 }}>
              ₹{(pay.total_amount || 0).toLocaleString()}
            </Typography>
            <Box sx={{ display: 'flex', gap: 3 }}>
              <Box>
                <Typography sx={{ fontSize: '1.3rem', fontWeight: 700, color: '#22c55e', lineHeight: 1 }}>{pay.completed || 0}</Typography>
                <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary', fontWeight: 500, mt: 0.5 }}>done</Typography>
              </Box>
              <Box>
                <Typography sx={{ fontSize: '1.3rem', fontWeight: 700, color: '#f59e0b', lineHeight: 1 }}>{pay.pending || 0}</Typography>
                <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary', fontWeight: 500, mt: 0.5 }}>pending</Typography>
              </Box>
              <Box>
                <Typography sx={{ fontSize: '1.3rem', fontWeight: 700, color: '#ef4444', lineHeight: 1 }}>{pay.overdue || 0}</Typography>
                <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary', fontWeight: 500, mt: 0.5 }}>overdue</Typography>
              </Box>
            </Box>
          </Box>
        </Grid>

        {/* Card 3: Domain Distribution */}
        <Grid item xs={12} md={4} sx={{ display: 'flex' }}>
          <Box className="glass-card" sx={{ p: 4, flex: 1, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
              <Domain sx={{ color: 'text.secondary', fontSize: '1.2rem' }} />
              <Typography sx={{ fontWeight: 700, fontSize: '1.05rem', color: 'text.primary' }}>Domain distribution</Typography>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1, justifyContent: 'center' }}>
              {data?.dept_active_counts?.length > 0 ? (
                data.dept_active_counts.slice(0, 5).map((dept, i) => {
                  const widthPct = (dept.count / maxDomainCount) * 100;
                  return (
                    <Box key={i} sx={{ display: 'flex', flexDirection: 'column', gap: 0.8 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography sx={{ fontSize: '0.9rem', fontWeight: 600, color: 'text.primary' }}>
                          {dept.domain__name || 'Unassigned'}
                        </Typography>
                        <Typography sx={{ fontSize: '0.9rem', fontWeight: 700, color: 'text.primary' }}>
                          {dept.count}
                        </Typography>
                      </Box>
                      <Box sx={{ width: '100%', height: 6, bgcolor: 'action.hover', borderRadius: 3, overflow: 'hidden' }}>
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${widthPct}%` }}
                          transition={{ duration: 0.8, delay: 0.2 + i * 0.1 }}
                          style={{ height: '100%', borderRadius: 3, background: 'var(--gradient-primary)' }}
                        />
                      </Box>
                    </Box>
                  );
                })
              ) : (
                <Typography sx={{ fontSize: '0.9rem', color: 'text.secondary', fontStyle: 'italic', textAlign: 'center', py: 4 }}>
                  No active domains
                </Typography>
              )}
            </Box>
          </Box>
        </Grid>
      </Grid>
    </motion.div>
  );
}

export default function AdminContent({ activeItem, subAction, subId }) {
  switch (activeItem) {
    case 'dashboard':   return <AdminOverview />;
    case 'staff':       
      if (subAction === 'edit' || subAction === 'new') {
        return <StaffForm subAction={subAction} empId={subId} />;
      }
      return <StaffList />;
    case 'register':    return <RegisterPage />;
    case 'payments':    return <PaymentList />;
    case 'entities':    return <EntityManagement />;
    case 'intern-directory': return <InternDirectory />;
    case 'profile':     return <UserProfile />;
    case 'audit-log':   return <AuditLogPage />;
    default:            return <AdminOverview />;
  }
}
