/**
 * SIMS — Manager Dashboard Content
 * Capabilities:
 *   - Intern approval (onboarding)
 *   - View payment history (read-only)
 *   - Approve certificates for completed interns
 *   - View asset details
 */

import { useState, useEffect } from 'react';
import { Box, Typography, Grid, Chip, Button, Table, TableBody, TableCell,
         TableHead, TableRow, Avatar, CircularProgress, Alert } from '@mui/material';
import { PersonAdd, Payment, Verified, Inventory, People, CheckCircle,
         HourglassEmpty, TrendingUp } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { LoadingSpinner, StatCard } from '../../../components/common';
import { usersAPI, dashboardAPI } from '../../../services/api';

// Sub-page imports
import InternDirectory from '../../intern-mgmt/InternDirectory';
import PaymentList from '../PaymentList';
import UserProfile from '../UserProfile';
import PerformanceFeedbackPage from '../PerformanceFeedbackPage';

// Lazy import for assets page — only Manager sees this
import AssetListPage from './ManagerAssetView';

// Certificate approval panel
function CertificateApprovals() {
  const [interns, setInterns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    usersAPI.interns({ status: 'completed' })
      .then(res => setInterns(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner text="Loading completed interns..." />;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <Box className="page-header">
        <Typography variant="h4" fontWeight={800}>Certificate Approvals</Typography>
        <Typography variant="body2" color="text.secondary">
          Generate and approve certificates for completed interns
        </Typography>
      </Box>
      <Box className="glass-card" sx={{ p: 3 }}>
        {interns.length === 0 ? (
          <Alert severity="info">No completed interns found for certificate generation.</Alert>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Intern</TableCell>
                <TableCell>Domain</TableCell>
                <TableCell>Period</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {interns.map((intern) => (
                <TableRow key={intern.emp_id} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Avatar sx={{ bgcolor: 'var(--color-primary)', width: 32, height: 32, fontSize: '0.8rem' }}>
                        {intern.full_name?.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" fontWeight={600}>{intern.full_name}</Typography>
                        <Typography variant="caption" color="text.secondary">{intern.emp_id}</Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip label={intern.domain_name || 'N/A'} size="small" variant="outlined" />
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption" color="text.secondary">
                      {intern.start_date} → {intern.end_date}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip label="Completed" color="success" size="small" />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button size="small" variant="contained" color="primary"
                        onClick={() => window.open(`/api/certificates/completion/${intern.emp_id}`, '_blank')}>
                        Completion Cert
                      </Button>
                      <Button size="small" variant="outlined" color="secondary"
                        onClick={() => window.open(`/api/certificates/attendance/${intern.emp_id}`, '_blank')}>
                        Attendance Cert
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Box>
    </motion.div>
  );
}

function ManagerOverview() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      usersAPI.internStats(),
      dashboardAPI.summary({}),
    ])
      .then(([statsRes, dashRes]) => {
        setStats({ interns: statsRes.data, dash: dashRes.data });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading && !stats) return <LoadingSpinner text="Loading dashboard..." />;

  const ic  = stats?.interns || {};
  const pay = stats?.dash?.payment_summary || {};

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
      <Box className="page-header">
        <Box>
          <Typography variant="h4" fontWeight={800}>Manager Dashboard</Typography>
          <Typography variant="body2" color="text.secondary">
            Intern approvals · Payment history · Certificates · Assets
          </Typography>
        </Box>
      </Box>

      {/* Quick stats */}
      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        {[
          { label: 'Total Interns',  value: ic.total || 0,       color: 'var(--color-primary)', icon: <People /> },
          { label: 'Active',         value: ic.active || 0,      color: '#22c55e',              icon: <CheckCircle /> },
          { label: 'Completed',      value: ic.completed || 0,   color: '#3b82f6',              icon: <TrendingUp /> },
          { label: 'Pending Review', value: ic.yet_to_join || 0, color: '#f59e0b',              icon: <HourglassEmpty /> },
        ].map((s, i) => (
          <Grid item="true" xs={6} sm={3} key={i}>
            <StatCard {...s} delay={i * 0.05} />
          </Grid>
        ))}
      </Grid>

      {/* Actions Quick Access */}
      <Grid container spacing={2.5}>
        {[
          { icon: <PersonAdd sx={{ fontSize: 40 }} />, title: 'Onboarding Approvals',
            desc: 'Review and approve pending intern onboarding submissions', color: '#6366f1', page: 'onboarding' },
          { icon: <Payment sx={{ fontSize: 40 }} />, title: 'Payment History',
            desc: 'View payment records and transaction history (read-only)', color: '#f59e0b', page: 'payment-list' },
          { icon: <Verified sx={{ fontSize: 40 }} />, title: 'Certificate Approvals',
            desc: 'Generate and approve certificates for completed interns', color: '#22c55e', page: 'certificates' },
          { icon: <Inventory sx={{ fontSize: 40 }} />, title: 'Asset Overview',
            desc: 'View asset inventory and intern asset assignments', color: '#8b5cf6', page: 'assets' },
        ].map((card, i) => (
          <Grid item="true" xs={12} sm={6} key={i}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.1 }}>
              <Box className="glass-card" sx={{ p: 3, cursor: 'default' }}>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                  <Box sx={{
                    p: 1.5, borderRadius: 3,
                    background: `${card.color}22`,
                    color: card.color,
                  }}>
                    {card.icon}
                  </Box>
                  <Box>
                    <Typography fontWeight={700} mb={0.5}>{card.title}</Typography>
                    <Typography variant="body2" color="text.secondary">{card.desc}</Typography>
                  </Box>
                </Box>
              </Box>
            </motion.div>
          </Grid>
        ))}
      </Grid>
    </motion.div>
  );
}

export default function ManagerContent({ activeItem }) {
  switch (activeItem) {
    case 'dashboard':           return <ManagerOverview />;
    case 'intern-directory':    return <InternDirectory />;
    case 'payment-list':        return <PaymentList />;
    case 'certificates':        return <CertificateApprovals />;
    case 'assets':              return <AssetListPage />;
    case 'performance-feedback':return <PerformanceFeedbackPage />;
    case 'profile':             return <UserProfile />;
    default:                    return <ManagerOverview />;
  }
}
