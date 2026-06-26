import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Button, IconButton, Chip, TextField, InputAdornment, Dialog, DialogTitle, DialogContent, DialogActions, Link, CircularProgress, FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import { Search, Save, CheckCircle, ReceiptLong, Close, QrCode, Add } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { feesAPI, orgAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

export default function PaymentList() {
  const { user } = useAuth();
  const canEdit = ['sme', 'superadmin'].includes(user?.role);
  
  const [payments, setPayments] = useState([]);
  const [upiId, setUpiId] = useState('');
  const [savingUpi, setSavingUpi] = useState(false);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const [verifyDialog, setVerifyDialog] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);

  const [createDialog, setCreateDialog] = useState(false);
  const [newPayment, setNewPayment] = useState({ emp_id: '', amount: '', payment_type: 'full', installment_number: 1, due_date: '' });
  const [creating, setCreating] = useState(false);

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

  const handleCreatePayment = async () => {
    if (!newPayment.emp_id || !newPayment.amount) return alert('Please enter Intern ID and Amount.');
    setCreating(true);
    try {
      await feesAPI.create(newPayment);
      setCreateDialog(false);
      setNewPayment({ emp_id: '', amount: '', payment_type: 'full', installment_number: 1, due_date: '' });
      fetchData();
      alert('Payment request created successfully!');
    } catch (e) {
      console.error(e);
      alert('Failed to create payment request. Check if the Intern ID exists.');
    } finally {
      setCreating(false);
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
      <div className="page-head">
        <div>
          <div className="page-title-row">
            <QrCode sx={{ color: '#f59e0b', fontSize: 28 }} />
            <h1 className="page-title">Fee & Payment Management</h1>
          </div>
          <p className="page-sub">Configure payment settings and verify intern fee submissions.</p>
        </div>
      </div>

      {/* Payment Settings */}
      {canEdit && (
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
      )}

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
          {canEdit && (
            <Button variant="contained" startIcon={<Add />} onClick={() => setCreateDialog(true)}>
              Create Payment Request
            </Button>
          )}
        </Box>
        
        <TableContainer component={Paper} elevation={0} sx={{ background: 'transparent' }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Intern Name</TableCell>
                <TableCell>Payment Type</TableCell>
                <TableCell>Transaction ID</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Status</TableCell>
                {canEdit && <TableCell align="right">Actions</TableCell>}
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
                    <Typography variant="caption" color="text.secondary">{row.emp_id}</Typography>
                  </TableCell>
                  <TableCell>
                    {row.payment_type === 'part' ? (
                      <Chip label={`Installment ${row.installment_number}`} size="small" color="secondary" variant="outlined" />
                    ) : (
                      <Chip label="Full Payment" size="small" color="primary" variant="outlined" />
                    )}
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
                  {canEdit && (
                    <TableCell align="right">
                      <IconButton size="small" color="primary" title="View details" onClick={() => handleOpenVerify(row)}>
                        <ReceiptLong fontSize="small" />
                      </IconButton>
                    </TableCell>
                  )}
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

      {/* Create Payment Dialog */}
      <Dialog open={createDialog} onClose={() => !creating && setCreateDialog(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Create Payment Request</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField 
              label="Intern Employee ID (e.g., VDI001)" 
              value={newPayment.emp_id} 
              onChange={e => setNewPayment({...newPayment, emp_id: e.target.value.toUpperCase()})}
              fullWidth 
            />
            <TextField 
              label="Amount (₹)" 
              type="number" 
              value={newPayment.amount} 
              onChange={e => setNewPayment({...newPayment, amount: e.target.value})}
              fullWidth 
            />
            <FormControl fullWidth>
              <InputLabel>Payment Type</InputLabel>
              <Select
                value={newPayment.payment_type}
                label="Payment Type"
                onChange={e => setNewPayment({...newPayment, payment_type: e.target.value})}
              >
                <MenuItem value="full">Full Payment</MenuItem>
                <MenuItem value="part">Part Payment / Installment</MenuItem>
              </Select>
            </FormControl>
            {newPayment.payment_type === 'part' && (
              <TextField 
                label="Installment Number" 
                type="number" 
                value={newPayment.installment_number} 
                onChange={e => setNewPayment({...newPayment, installment_number: parseInt(e.target.value) || 1})}
                fullWidth 
              />
            )}
            <TextField 
              label="Due Date (Optional)" 
              type="date" 
              InputLabelProps={{ shrink: true }}
              value={newPayment.due_date} 
              onChange={e => setNewPayment({...newPayment, due_date: e.target.value})}
              fullWidth 
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialog(false)} disabled={creating}>Cancel</Button>
          <Button variant="contained" onClick={handleCreatePayment} disabled={creating}>
            {creating ? 'Creating...' : 'Create Request'}
          </Button>
        </DialogActions>
      </Dialog>
    </motion.div>
  );
}
