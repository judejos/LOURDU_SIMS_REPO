import { useState } from 'react';
import { 
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Button, IconButton, Chip, TextField, InputAdornment
} from '@mui/material';
import { Search, FilterList, Download, ReceiptLong, Delete, Payment } from '@mui/icons-material';
import { motion } from 'framer-motion';

const MOCK_PAYMENTS = [
  { id: 'PAY-1001', intern: 'John Doe', amount: '$500', date: '2026-06-01', status: 'completed' },
  { id: 'PAY-1002', intern: 'Jane Smith', amount: '$500', date: '2026-06-01', status: 'completed' },
  { id: 'PAY-1003', intern: 'Alice Johnson', amount: '$250', date: '2026-06-15', status: 'pending' },
  { id: 'PAY-1004', intern: 'Robert Brown', amount: '$500', date: '2026-06-01', status: 'failed' },
  { id: 'PAY-1005', intern: 'Michael Davis', amount: '$500', date: '2026-06-01', status: 'completed' },
];

export default function PaymentList() {
  const [search, setSearch] = useState('');

  const filtered = MOCK_PAYMENTS.filter(p => 
    p.intern.toLowerCase().includes(search.toLowerCase()) || 
    p.id.toLowerCase().includes(search.toLowerCase())
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'success';
      case 'pending': return 'warning';
      case 'failed': return 'error';
      default: return 'default';
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <Box className="page-header" sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={800} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Payment sx={{ color: '#f59e0b' }} /> Stipend & Payments
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Track intern stipend disbursements and payment history.
        </Typography>
      </Box>

      <Box className="glass-card" sx={{ p: 3 }}>
        {/* Toolbar */}
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
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button variant="outlined" startIcon={<FilterList />}>Filter</Button>
            <Button variant="contained" startIcon={<Download />}>Export CSV</Button>
          </Box>
        </Box>
        
        {/* Table */}
        <TableContainer component={Paper} elevation={0} sx={{ background: 'transparent' }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Transaction ID</TableCell>
                <TableCell>Intern Name</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>
                    <Typography fontWeight={700} variant="body2">{row.id}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{row.intern}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={700}>{row.amount}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{row.date}</Typography>
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
                    <IconButton size="small" color="primary" title="View Receipt"><ReceiptLong fontSize="small" /></IconButton>
                    <IconButton size="small" color="error"><Delete fontSize="small" /></IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">No transactions found.</Typography>
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
