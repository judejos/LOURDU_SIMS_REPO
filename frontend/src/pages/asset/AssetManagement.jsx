import { useState, useEffect } from 'react';
import { 
  Box, Typography, Grid, Paper, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Button, IconButton, TextField, InputAdornment, Dialog
} from '@mui/material';
import { Add, Search, FilterList, Devices, QrCodeScanner, Handyman, AssignmentTurnedIn } from '@mui/icons-material';
import { assetsAPI } from '../../services/api';
import { LoadingSpinner, StatusChip, StatCard } from '../../components/common';
import { motion } from 'framer-motion';

export default function AssetManagement() {
  const [assets, setAssets] = useState([]);
  const [counts, setCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [listRes, countRes] = await Promise.all([
        assetsAPI.list(),
        assetsAPI.counts()
      ]);
      setAssets(listRes.data);
      setCounts(countRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredAssets = assets.filter(a => 
    a.asset_code?.toLowerCase().includes(search.toLowerCase()) || 
    a.assigned_to_name?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <LoadingSpinner text="Loading Assets..." />;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <Box className="page-header" sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" fontWeight={800}>Asset Management</Typography>
          <Typography variant="body2" color="text.secondary">Track hardware, badges, and resources assigned to interns.</Typography>
        </Box>
        <Button variant="contained" startIcon={<Add />}>Add New Asset</Button>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item="true" xs={12} sm={6} md={3}>
          <StatCard label="Total Assets" value={counts.total || 0} color="var(--color-primary)" icon={<Devices />} delay={0.1} />
        </Grid>
        <Grid item="true" xs={12} sm={6} md={3}>
          <StatCard label="Available" value={counts.available || 0} color="#22c55e" icon={<AssignmentTurnedIn />} delay={0.15} />
        </Grid>
        <Grid item="true" xs={12} sm={6} md={3}>
          <StatCard label="Assigned" value={counts.assigned || 0} color="#3b82f6" icon={<QrCodeScanner />} delay={0.2} />
        </Grid>
        <Grid item="true" xs={12} sm={6} md={3}>
          <StatCard label="Damaged / Issued" value={counts.damaged || 0} color="#ef4444" icon={<Handyman />} delay={0.25} />
        </Grid>
      </Grid>

      {/* Main Table */}
      <Box className="glass-card" sx={{ p: 0, overflow: 'hidden' }}>
        <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <TextField
            size="small"
            placeholder="Search by ID or Assignee..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment>,
            }}
            sx={{ minWidth: 300 }}
          />
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button variant="outlined" startIcon={<FilterList />} onClick={() => alert('Filter options coming soon!')}>Filter</Button>
          </Box>
        </Box>

        <TableContainer sx={{ maxHeight: 'calc(100vh - 350px)' }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>Asset Details</TableCell>
                <TableCell>Condition</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Assigned To</TableCell>
                <TableCell>Issue Date</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredAssets.map((row) => (
                <TableRow key={row.id} hover>
                  <TableCell>
                    <Typography fontWeight={700} variant="body2">{row.asset_code}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {row.asset_type.replace(/_/g, ' ').toUpperCase()} | SN: {row.serial_number || 'N/A'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <StatusChip status={row.condition} />
                  </TableCell>
                  <TableCell>
                    <StatusChip status={row.status} />
                  </TableCell>
                  <TableCell>
                    {row.assigned_to_name ? (
                      <Typography variant="body2" fontWeight={600}>{row.assigned_to_name}</Typography>
                    ) : (
                      <Typography variant="body2" color="text.secondary" fontStyle="italic">Unassigned</Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    {row.issue_date ? new Date(row.issue_date).toLocaleDateString() : '—'}
                  </TableCell>
                  <TableCell align="right">
                    <Button size="small">Edit</Button>
                  </TableCell>
                </TableRow>
              ))}
              {filteredAssets.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                    <Typography color="text.secondary">No assets found.</Typography>
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
