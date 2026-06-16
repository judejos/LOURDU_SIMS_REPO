import { useState, useEffect } from 'react';
import { 
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Button, IconButton, Chip, Grid, TextField, InputAdornment,
  Tabs, Tab
} from '@mui/material';
import { Search, FilterList, Download, CheckCircle, Block, Email } from '@mui/icons-material';
import { onboardingAPI } from '../../services/api';
import { LoadingSpinner, StatusChip } from '../../components/common';
import { motion } from 'framer-motion';

export default function OnboardingList() {
  const [onboardingData, setOnboardingData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [tabValue, setTabValue] = useState(0);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await onboardingAPI.list();
      setOnboardingData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleApprove = async (id, email) => {
    try {
      await onboardingAPI.enable(id, { action: 'approve' });
      await onboardingAPI.sendCredentials(id); // Send email trigger
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredData = onboardingData.filter(i => {
    const matchesSearch = 
      i.full_name?.toLowerCase().includes(search.toLowerCase()) || 
      i.email?.toLowerCase().includes(search.toLowerCase());
      
    if (!matchesSearch) return false;
    
    switch (tabValue) {
      case 0: return i.status === 'pending';
      case 1: return i.status === 'approved';
      case 2: return i.status === 'rejected';
      case 3: return true; // All
      default: return true;
    }
  });

  if (loading) return <LoadingSpinner text="Loading Onboarding Requests..." />;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <Box className="page-header" sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={800}>Onboarding Approvals</Typography>
        <Typography variant="body2" color="text.secondary">Review incoming intern applications and send credentials.</Typography>
      </Box>

      <Box className="glass-card" sx={{ p: 0, overflow: 'hidden' }}>
        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 2, pt: 2 }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label={`Pending (${onboardingData.filter(i => i.status === 'pending').length})`} />
            <Tab label={`Approved (${onboardingData.filter(i => i.status === 'approved').length})`} />
            <Tab label="Rejected" />
            <Tab label={`All (${onboardingData.length})`} />
          </Tabs>
        </Box>

        {/* Toolbar */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 3, flexWrap: 'wrap', gap: 2 }}>
          <TextField
            size="small"
            placeholder="Search by name, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment>,
            }}
            sx={{ minWidth: 300 }}
          />
        </Box>
        
        {/* Table */}
        <TableContainer sx={{ maxHeight: 'calc(100vh - 350px)' }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>Applicant Details</TableCell>
                <TableCell>Academics</TableCell>
                <TableCell>Internship Config</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredData.length > 0 ? filteredData.map((row) => (
                <TableRow key={row.id} hover>
                  <TableCell>
                    <Typography fontWeight={700} variant="body2">{row.full_name}</Typography>
                    <Typography variant="caption" color="text.secondary">{row.email} | {row.phone}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{row.degree} - {row.college_department}</Typography>
                    <Typography variant="caption" color="text.secondary">{row.college_name} ({row.year_of_passing})</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{row.department_name} - {row.domain_name}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {row.start_date} to {row.end_date} | {row.scheme?.toUpperCase()}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <StatusChip status={row.status} />
                  </TableCell>
                  <TableCell align="right">
                    {row.status === 'pending' ? (
                      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                        <Button 
                          size="small" 
                          variant="contained" 
                          color="success" 
                          startIcon={<CheckCircle />}
                          onClick={() => handleApprove(row.id, row.email)}
                        >
                          Approve
                        </Button>
                        <Button size="small" variant="outlined" color="error" startIcon={<Block />}>
                          Reject
                        </Button>
                      </Box>
                    ) : row.status === 'approved' ? (
                      <Button size="small" variant="outlined" startIcon={<Email />}>
                        Resend Credentials
                      </Button>
                    ) : (
                      <Typography variant="caption" color="text.secondary">—</Typography>
                    )}
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                    <Typography color="text.secondary">No applications found.</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </motion.div>
  );
}
