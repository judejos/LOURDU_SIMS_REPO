import { useState } from 'react';
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, TextField } from '@mui/material';
import { History, Search } from '@mui/icons-material';
import { motion } from 'framer-motion';

export default function AuditLogPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const mockLogs = [
    { id: 1, action: 'UPDATE', table: 'UserProfile', user: 'admin1', timestamp: '2026-06-15 10:23 AM', details: 'Changed status to Active' },
    { id: 2, action: 'DELETE', table: 'Task', user: 'manager_john', timestamp: '2026-06-15 09:15 AM', details: 'Deleted task #142' },
    { id: 3, action: 'CREATE', table: 'Entity', user: 'superadmin', timestamp: '2026-06-14 16:45 PM', details: 'Created branch "North HQ"' },
    { id: 4, action: 'UPDATE', table: 'PaymentRecord', user: 'finance_lead', timestamp: '2026-06-14 11:30 AM', details: 'Marked payment #88 as Completed' },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <Box className="page-header" sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight={800} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <History color="primary" /> System Audit Log
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Immutable record of all critical system actions.
        </Typography>
      </Box>

      <Paper className="glass-card" sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', mb: 3 }}>
          <TextField
            size="small"
            placeholder="Search logs by user, action, or table..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{ startAdornment: <Search sx={{ color: 'text.secondary', mr: 1 }} /> }}
            sx={{ width: 300 }}
          />
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Timestamp</TableCell>
                <TableCell>Action</TableCell>
                <TableCell>Table</TableCell>
                <TableCell>User</TableCell>
                <TableCell>Details</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {mockLogs.map((log) => (
                <TableRow key={log.id} hover>
                  <TableCell sx={{ color: 'text.secondary' }}>{log.timestamp}</TableCell>
                  <TableCell>
                    <Chip 
                      label={log.action} 
                      size="small" 
                      color={log.action === 'DELETE' ? 'error' : log.action === 'CREATE' ? 'success' : 'primary'} 
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell fontWeight={600}>{log.table}</TableCell>
                  <TableCell>{log.user}</TableCell>
                  <TableCell>{log.details}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </motion.div>
  );
}
