/**
 * SIMS — Manager Asset View (read-only)
 * Manager can VIEW asset details but cannot modify.
 */

import { useState, useEffect } from 'react';
import { Box, Typography, Grid, Chip, Table, TableBody, TableCell,
         TableHead, TableRow, CircularProgress, Alert } from '@mui/material';
import { Inventory, CheckCircle, Error, Build } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { StatCard } from '../../../components/common';
import api from '../../../services/api';

export default function ManagerAssetView() {
  const [assets, setAssets] = useState([]);
  const [counts, setCounts] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/Sims/assert-stock/'),
      api.get('/Sims/assert-stock-count/'),
    ])
      .then(([assetsRes, countsRes]) => {
        setAssets(assetsRes.data);
        setCounts(countsRes.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const statusColor = (s) => ({
    available: 'success', assigned: 'primary', damaged: 'error', lost: 'warning',
  }[s] || 'default');

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <Box className="page-header">
        <Box>
          <Typography variant="h4" fontWeight={800}>Asset Overview</Typography>
          <Typography variant="body2" color="text.secondary">View-only — asset inventory and assignments</Typography>
        </Box>
        <Chip label="View Only" color="warning" size="small" />
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Grid container spacing={2.5} sx={{ mb: 4 }}>
            {[
              { label: 'Total Assets',  value: counts.total || 0,     color: 'var(--color-primary)', icon: <Inventory /> },
              { label: 'Available',     value: counts.available || 0, color: '#22c55e',              icon: <CheckCircle /> },
              { label: 'Assigned',      value: counts.assigned || 0,  color: '#3b82f6' },
              { label: 'Damaged / Lost',value: (counts.damaged || 0) + (counts.lost || 0), color: '#ef4444', icon: <Error /> },
            ].map((s, i) => (
              <Grid item="true" xs={6} sm={3} key={i}>
                <StatCard {...s} delay={i * 0.05} />
              </Grid>
            ))}
          </Grid>

          <Box className="glass-card" sx={{ p: 3 }}>
            <Typography fontWeight={700} mb={2}>Asset Inventory</Typography>
            {assets.length === 0 ? (
              <Alert severity="info">No assets found.</Alert>
            ) : (
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Code</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Brand / Model</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Assigned To</TableCell>
                    <TableCell>Condition</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {assets.map((a) => (
                    <TableRow key={a.id} hover>
                      <TableCell><Typography variant="body2" fontWeight={600}>{a.asset_code}</Typography></TableCell>
                      <TableCell>{a.asset_type}</TableCell>
                      <TableCell>{a.brand} {a.model}</TableCell>
                      <TableCell>
                        <Chip label={a.status} color={statusColor(a.status)} size="small" />
                      </TableCell>
                      <TableCell>{a.assigned_to_name || '—'}</TableCell>
                      <TableCell>{a.condition}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </Box>
        </>
      )}
    </motion.div>
  );
}
