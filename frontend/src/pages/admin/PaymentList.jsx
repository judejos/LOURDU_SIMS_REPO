import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Button, IconButton, Chip, TextField, InputAdornment, Dialog, DialogTitle, DialogContent, DialogActions, Link, CircularProgress
} from '@mui/material';
import { Search, Save, CheckCircle, ReceiptLong, Close, QrCode } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { feesAPI, orgAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

export default function PaymentList() {
  const { user } = useAuth();
  const [payments, setPayments] = useState([]);
  const [upiId, setUpiId] = useState('');
  const [savingUpi, setSavingUpi] = useState(false);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const [verifyDialog, setVerifyDialog] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (user.entityId) {
        const configRes = await orgAPI.entityConfig(user.entityId);
        setUpiId(configRes.data.company_upi_id || '');
      }
      const payRes = await feesAPI.list();
      setPayments(payRes.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveUpi = async () => {
    if (!user.entityId) return;
    setSavingUpi(true);
    try {
      await orgAPI.updateEntityConfig(user.entityId, { company_upi_id: upiId });
      alert('UPI ID saved successfully!');
    } catch (e) {
      console.error(e);
      alert('Failed to save UPI ID');
    } finally {
      setSavingUpi(false);
    }
  };

  const handleOpenVerify = (payment) => {
    setSelectedPayment(payment);
    setVerifyDialog(true);
  };

  const handleVerify = async (status) => {
    try {
      await feesAPI.update(selectedPayment.id, { status });
      setVerifyDialog(false);
      fetchData();
    } catch (e) {
      console.error(e);
      alert('Failed to update payment status.');
    }
  };

  const filtered = payments.filter(p => 
    (p.full_name || '').toLowerCase().includes(search.toLowerCase()) || 
    (p.transaction_id || '').toLowerCase().includes(search.toLowerCase())
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid': return 'success';
      case 'submitted': return 'info';
      case 'pending': return 'warning';
      case 'overdue': return 'error';
      default: return 'default';
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <Box className="page-header" sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={800} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <QrCode sx={{ color: '#f59e0b' }} /> Fee & Payment Management
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Configure payment settings and verify intern fee submissions.
        </Typography>
      </Box>

      {/* Payment Settings */}
      <Paper className="glass-card" sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" fontWeight="bold" mb={2}>Receiving UPI Configuration</Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', maxWidth: 600 }}>
          <TextField
            fullWidth
            label="Company / Official UPI ID"
            variant="outlined"
            size="small"
            value={upiId}
            onChange={(e) => setUpiId(e.target.value)}
            placeholder="e.g., vdart@sbi"
          />
          <Button 
            variant="contained" 
            startIcon={<Save />} 
            onClick={handleSaveUpi}
            disabled={savingUpi}
          >
            {savingUpi ? 'Saving...' : 'Save'}
          </Button>
        </Box>
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
          This UPI ID will be used to generate dynamic QR codes for interns to pay their fees.
        </Typography>
      </Paper>

      {/* Payment List */}
      <Box className="glass-card" sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
          <TextField
            size="small"
            placeholder="Search by ID or Intern Name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment>,
            }}
            sx={{ minWidth: 300 }}
          />
        </Box>
        
        <TableContainer component={Paper} elevation={0} sx={{ background: 'transparent' }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Intern Name</TableCell>
                <TableCell>Transaction ID</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} align="center"><CircularProgress size={30} sx={{ my: 2 }} /></TableCell>
                </TableRow>
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">No transactions found.</Typography>
                  </TableCell>
                </TableRow>
              ) : filtered.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>
                    <Typography variant="body2" fontWeight={700}>{row.full_name || row.emp_id}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography fontWeight={700} variant="body2" color="primary">{row.transaction_id || '-'}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={700}>₹{row.amount}</Typography>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={row.status.toUpperCase()} 
                      size="small" 
                      color={getStatusColor(row.status)} 
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell align="right">
                    {row.status === 'submitted' ? (
                      <Button size="small" variant="contained" color="info" startIcon={<CheckCircle />} onClick={() => handleOpenVerify(row)}>
                        Verify
                      </Button>
                    ) : (
                      <IconButton size="small" color="primary" title="View details" onClick={() => handleOpenVerify(row)}>
                        <ReceiptLong fontSize="small" />
                      </IconButton>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {/* Verification Dialog */}
      <Dialog open={verifyDialog} onClose={() => setVerifyDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Payment Details</DialogTitle>
        <DialogContent dividers>
          {selectedPayment && (
            <Box>
              <Typography variant="subtitle2" color="text.secondary">Intern Name</Typography>
              <Typography variant="body1" mb={2}>{selectedPayment.full_name || selectedPayment.emp_id}</Typography>
              
              <Typography variant="subtitle2" color="text.secondary">Amount</Typography>
              <Typography variant="body1" mb={2} fontWeight={700}>₹{selectedPayment.amount}</Typography>

              <Typography variant="subtitle2" color="text.secondary">Transaction / UTR ID</Typography>
              <Typography variant="body1" mb={2}>{selectedPayment.transaction_id || 'Not provided'}</Typography>

              <Typography variant="subtitle2" color="text.secondary">Payment Proof / Screenshot</Typography>
              {selectedPayment.screenshot ? (
                <Box mt={1}>
                  <img src={selectedPayment.screenshot} alt="Payment Proof" style={{ maxWidth: '100%', borderRadius: 8, border: '1px solid #ddd' }} />
                  <Link href={selectedPayment.screenshot} target="_blank" display="block" mt={1}>Open Original Image</Link>
                </Box>
              ) : (
                <Typography variant="body2" color="error">No screenshot uploaded.</Typography>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setVerifyDialog(false)}>Cancel</Button>
          {selectedPayment?.status === 'submitted' && (
            <>
              <Button onClick={() => handleVerify('pending')} color="error">Reject (Mark Pending)</Button>
              <Button onClick={() => handleVerify('paid')} variant="contained" color="success">Verify & Mark Paid</Button>
            </>
          )}
        </DialogActions>
      </Dialog>
    </motion.div>
  );
}
