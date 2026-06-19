import { useState, useEffect } from 'react';
import { 
  Box, Typography, Grid, Paper, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Button, TextField, InputAdornment, Chip, Dialog, Select, MenuItem
} from '@mui/material';
import { Search, CardMembership, QrCode, Download, Send } from '@mui/icons-material';
import { feedbackAPI } from '../../services/api';
import { LoadingSpinner, StatCard } from '../../components/common';
import { motion } from 'framer-motion';

export default function CertificateGeneration() {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [openGen, setOpenGen] = useState(false);

  const fetchCerts = async () => {
    try {
      setLoading(true);
      const res = await feedbackAPI.certificates();
      setCertificates(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCerts();
  }, []);

  const handleGenerate = async () => {
    // Demo implementation for generating a new cert
    setOpenGen(false);
    fetchCerts();
  };

  const filteredCerts = certificates.filter(c => 
    c.user_name?.toLowerCase().includes(search.toLowerCase()) || 
    c.certificate_type?.toLowerCase().includes(search.toLowerCase()) ||
    c.certificate_number?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <LoadingSpinner text="Loading Certificates..." />;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <Box className="page-header" sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" fontWeight={800}>Certificates</Typography>
          <Typography variant="body2" color="text.secondary">Generate and manage official intern certificates.</Typography>
        </Box>
        <Button variant="contained" startIcon={<CardMembership />} onClick={() => setOpenGen(true)}>Generate New</Button>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid xs={12} sm={4}>
          <StatCard label="Total Generated" value={certificates.length} color="var(--color-primary)" icon={<CardMembership />} />
        </Grid>
        <Grid xs={12} sm={4}>
          <StatCard label="Completion Certs" value={certificates.filter(c => c.certificate_type === 'completion').length} color="#22c55e" icon={<Download />} />
        </Grid>
        <Grid xs={12} sm={4}>
          <StatCard label="Excellence Awards" value={certificates.filter(c => c.certificate_type === 'excellence').length} color="#f59e0b" icon={<Star />} />
        </Grid>
      </Grid>

      {/* Main Table */}
      <Box className="glass-card" sx={{ p: 0, overflow: 'hidden' }}>
        <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <TextField
            size="small"
            placeholder="Search by ID, name, type..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment>,
            }}
            sx={{ minWidth: 300 }}
          />
        </Box>

        <TableContainer sx={{ maxHeight: 'calc(100vh - 350px)' }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>Certificate ID</TableCell>
                <TableCell>Intern</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Issue Date</TableCell>
                <TableCell>QR Verified</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredCerts.map((row) => (
                <TableRow key={row.id} hover>
                  <TableCell>
                    <Typography fontWeight={700} variant="body2" sx={{ fontFamily: 'monospace' }}>
                      {row.certificate_number}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={600}>{row.user_name || `User ${row.user}`}</Typography>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={row.certificate_type.toUpperCase()} 
                      size="small" 
                      color={row.certificate_type === 'excellence' ? 'warning' : 'primary'}
                      variant="outlined" 
                    />
                  </TableCell>
                  <TableCell>{new Date(row.issue_date).toLocaleDateString()}</TableCell>
                  <TableCell>
                    {row.qr_code_url ? <QrCode color="success" /> : <Typography variant="caption" color="text.secondary">Pending</Typography>}
                  </TableCell>
                  <TableCell align="right">
                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                      <Button size="small" variant="outlined" startIcon={<Download />}>PDF</Button>
                      <Button size="small" variant="contained" startIcon={<Send />}>Email</Button>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
              {filteredCerts.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                    <Typography color="text.secondary">No certificates generated yet.</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      <Dialog open={openGen} onClose={() => setOpenGen(false)} maxWidth="sm" fullWidth>
        <Box sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" fontWeight={700} mb={2}>Generate Certificate</Typography>
          <Typography color="text.secondary" mb={3}>Select an intern who has completed their requirements to generate an official certificate.</Typography>
          <Button variant="contained" onClick={handleGenerate} size="large" fullWidth>Generate Now</Button>
        </Box>
      </Dialog>
    </motion.div>
  );
}

// Missing icon import fallback for Star
function Star(props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
    </svg>
  );
}
