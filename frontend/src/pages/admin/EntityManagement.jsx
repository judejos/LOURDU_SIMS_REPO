import { useState, useEffect } from 'react';
import { 
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Button, IconButton, Dialog, DialogTitle, 
  DialogContent, DialogActions, TextField, Grid, Switch, FormControlLabel,
  Card, CardContent
} from '@mui/material';
import { Add, Edit, Delete, Domain, Business } from '@mui/icons-material';
import { orgAPI } from '../../services/api';
import { LoadingSpinner, StatusChip } from '../../components/common';
import { motion } from 'framer-motion';

export default function EntityManagement() {
  const [entities, setEntities] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Dialog state
  const [openEntity, setOpenEntity] = useState(false);
  const [openBranch, setOpenBranch] = useState(false);
  const [selectedEntity, setSelectedEntity] = useState(null);
  const [selectedBranch, setSelectedBranch] = useState(null);
  
  // Form data
  const [formData, setFormData] = useState({ name: '', description: '', is_active: true });
  const [branchData, setBranchData] = useState({ name: '', location: '', entity: '' });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [entRes, brRes] = await Promise.all([
        orgAPI.entities(),
        orgAPI.branches()
      ]);
      setEntities(entRes.data);
      setBranches(brRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleEntitySubmit = async () => {
    try {
      if (selectedEntity) {
        await orgAPI.updateEntity(selectedEntity.id, formData);
      } else {
        await orgAPI.createEntity(formData);
      }
      setOpenEntity(false);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleBranchSubmit = async () => {
    try {
      if (selectedBranch) {
        // ... (update endpoint missing in orgAPI, would need to add)
        // await orgAPI.updateBranch(selectedBranch.id, branchData);
      } else {
        await orgAPI.createBranch(branchData);
      }
      setOpenBranch(false);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <LoadingSpinner text="Loading Entities..." />;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <Box className="page-header" sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={800}>Entity Management</Typography>
        <Typography variant="body2" color="text.secondary">Manage multi-tenant organizations and branches.</Typography>
      </Box>

      <Grid container spacing={4}>
        {/* Entities Section */}
        <Grid item="true" xs={12} md={6}>
          <Box className="glass-card" sx={{ p: 3, height: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
              <Typography variant="h6" fontWeight={700} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Domain color="primary" /> Entities
              </Typography>
              <Button 
                variant="contained" 
                startIcon={<Add />} 
                onClick={() => {
                  setSelectedEntity(null);
                  setFormData({ name: '', description: '', is_active: true });
                  setOpenEntity(true);
                }}
              >
                New Entity
              </Button>
            </Box>
            
            <TableContainer component={Paper} elevation={0} sx={{ background: 'transparent' }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Branches</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {entities.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell fontWeight={600}>{row.name}</TableCell>
                      <TableCell>
                        <StatusChip status={row.is_active ? 'active' : 'inactive'} />
                      </TableCell>
                      <TableCell>{row.branch_count}</TableCell>
                      <TableCell align="right">
                        <IconButton size="small" onClick={() => {
                          setSelectedEntity(row);
                          setFormData({ name: row.name, description: row.description, is_active: row.is_active });
                          setOpenEntity(true);
                        }}>
                          <Edit fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </Grid>

        {/* Branches Section */}
        <Grid item="true" xs={12} md={6}>
          <Box className="glass-card" sx={{ p: 3, height: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
              <Typography variant="h6" fontWeight={700} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Business color="secondary" /> Branches
              </Typography>
              <Button 
                variant="outlined" 
                startIcon={<Add />}
                onClick={() => {
                  setSelectedBranch(null);
                  setBranchData({ name: '', location: '', entity: entities[0]?.id || '' });
                  setOpenBranch(true);
                }}
              >
                New Branch
              </Button>
            </Box>
            
            <TableContainer component={Paper} elevation={0} sx={{ background: 'transparent' }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Location</TableCell>
                    <TableCell>Entity</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {branches.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell fontWeight={600}>{row.name}</TableCell>
                      <TableCell>{row.location}</TableCell>
                      <TableCell>{row.entity_name}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </Grid>
      </Grid>

      {/* Entity Dialog */}
      <Dialog open={openEntity} onClose={() => setOpenEntity(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{selectedEntity ? 'Edit Entity' : 'Create Entity'}</DialogTitle>
        <DialogContent dividers>
          <TextField
            label="Name"
            fullWidth
            margin="normal"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
          />
          <TextField
            label="Description"
            fullWidth
            margin="normal"
            multiline
            rows={3}
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
          />
          <FormControlLabel
            control={
              <Switch 
                checked={formData.is_active} 
                onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
              />
            }
            label="Active Status"
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEntity(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleEntitySubmit} disabled={!formData.name}>
            Save Entity
          </Button>
        </DialogActions>
      </Dialog>

      {/* Branch Dialog */}
      <Dialog open={openBranch} onClose={() => setOpenBranch(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create Branch</DialogTitle>
        <DialogContent dividers>
          <TextField
            label="Branch Name"
            fullWidth
            margin="normal"
            value={branchData.name}
            onChange={(e) => setBranchData({...branchData, name: e.target.value})}
          />
          <TextField
            label="Location"
            fullWidth
            margin="normal"
            value={branchData.location}
            onChange={(e) => setBranchData({...branchData, location: e.target.value})}
          />
          <TextField
            select
            label="Entity"
            fullWidth
            margin="normal"
            value={branchData.entity}
            onChange={(e) => setBranchData({...branchData, entity: e.target.value})}
            SelectProps={{ native: true }}
          >
            <option value="">Select an Entity</option>
            {entities.map(ent => (
              <option key={ent.id} value={ent.id}>{ent.name}</option>
            ))}
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenBranch(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleBranchSubmit} disabled={!branchData.name || !branchData.entity}>
            Save Branch
          </Button>
        </DialogActions>
      </Dialog>

    </motion.div>
  );
}
