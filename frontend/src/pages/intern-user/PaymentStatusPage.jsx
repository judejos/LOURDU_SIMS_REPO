import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip } from '@mui/material';
import { motion } from 'framer-motion';

const MOCK_PAYMENTS = [
  { id: 1, month: 'May 2026', amount: '$1,500', status: 'Paid', date: '2026-06-01' },
  { id: 2, month: 'June 2026', amount: '$1,500', status: 'Pending', date: 'Upcoming' },
];

export default function PaymentStatusPage() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <Box className="page-header" sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={800}>Payment Status</Typography>
        <Typography variant="body2" color="text.secondary">
          Track your monthly stipends and payment history.
        </Typography>
      </Box>

      <Paper className="glass-card" sx={{ p: 0, overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Month</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Payment Date</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {MOCK_PAYMENTS.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>
                    <Typography variant="body2" fontWeight={700}>{row.month}</Typography>
                  </TableCell>
                  <TableCell>{row.amount}</TableCell>
                  <TableCell>
                    <Chip 
                      label={row.status} 
                      size="small" 
                      color={row.status === 'Paid' ? 'success' : 'warning'} 
                    />
                  </TableCell>
                  <TableCell align="right">{row.date}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </motion.div>
  );
}
