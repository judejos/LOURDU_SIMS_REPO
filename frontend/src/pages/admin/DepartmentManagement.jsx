import { useState, useEffect } from 'react';
import { 
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Button, IconButton, Chip, TextField, Grid,
  Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import { Add, Edit, Delete, Groups, Assessment } from '@mui/icons-material';
import { orgAPI } from '../../services/api';
import { LoadingSpinner } from '../../components/common';
import { motion } from 'framer-motion';

export default function DepartmentManagement() {
  const [departments, setDepartments] = useState([]);
  const [domains, setDomains] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Dialogs
  const [openDept, setOpenDept] = useState(false);
  const [openDom, setOpenDom] = useState(false);
  const [selectedDept, setSelectedDept] = useState(null);
  
  const [deptData, setDeptData] = useState({ name: '', description: '', branch: '' });
  const [domData, setDomData] = useState({ name: '', department: '' });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [deptRes, domRes] = await Promise.all([
        orgAPI.departments(),
        orgAPI.domains()
      ]);
      setDepartments(deptRes.data);
      setDomains(domRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDeptSubmit = async () => {
    try {
      if (selectedDept) {
        await orgAPI.updateDepartment(selectedDept.id, deptData);
      } else {
        await orgAPI.createDepartment(deptData);
      }
      setOpenDept(false);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDomSubmit = async () => {
    try {
      await orgAPI.createDomain(domData);
      setOpenDom(false);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <LoadingSpinner text="Loading Departments..." />;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <Box className="page-header" sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={800}>Departments & Domains</Typography>
        <Typography variant="body2" color="text.secondary">Configure organizational structure and sub-domains.</Typography>
      </Box>

      <Grid container spacing={4}>
        {/* Departments Section */}
        <Grid item="true" xs={12} md={7}>
          <Box className="glass-card" sx={{ p: 3, height: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
              <Typography variant="h6" fontWeight={700} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Groups color="primary" /> Departments
              </Typography>
              <Button 
                variant="contained" 
                startIcon={<Add />} 
                onClick={() => {
                  setSelectedDept(null);
                  setDeptData({ name: '', description: '', branch: '' }); // Would need branch dropdown in real app
                  setOpenDept(true);
                }}
              >
                New Department
              </Button>
            </Box>
            
            <TableContainer component={Paper} elevation={0} sx={{ background: 'transparent' }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>Entity</TableCell>
                    <TableCell>Domains</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {departments.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell fontWeight={600}>{row.name}</TableCell>
                      <TableCell sx={{ color: 'text.secondary', maxWidth: 150, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {row.description}
                      </TableCell>
                      <TableCell>
                        <Chip label={row.entity_name || 'N/A'} size="small" variant="outlined" />
                      </TableCell>
                      <TableCell>{row.domain_count}</TableCell>
                      <TableCell align="right">
                        <IconButton size="small" onClick={() => {
                          setSelectedDept(row);
                          setDeptData({ name: row.name, description: row.description, branch: row.branch });
                          setOpenDept(true);
                        }}>
                          <Edit fontSize="small" />
                        </IconButton>
                        <IconButton size="small" color="error" onClick={async () => {
                          if (window.confirm(`Are you sure you want to delete ${row.name}?`)) {
                            await orgAPI.deleteDepartment(row.id);
                            fetchData();
                          }
                        }}>
                          <Delete fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </Grid>

        {/* Domains Section */}
        <Grid item="true" xs={12} md={5}>
          <Box className="glass-card" sx={{ p: 3, height: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
              <Typography variant="h6" fontWeight={700} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Assessment color="secondary" /> Domains
              </Typography>
              <Button 
                variant="outlined" 
                startIcon={<Add />}
                onClick={() => {
                  setDomData({ name: '', department: departments[0]?.id || '' });
                  setOpenDom(true);
                }}
              >
                New Domain
              </Button>
            </Box>
            
            <TableContainer component={Paper} elevation={0} sx={{ background: 'transparent' }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Domain Name</TableCell>
                    <TableCell>Parent Department</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {domains.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell fontWeight={600}>{row.name}</TableCell>
                      <TableCell>{row.department_name}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </Grid>
      </Grid>

      {/* Dept Dialog */}
      <Dialog open={openDept} onClose={() => setOpenDept(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{selectedDept ? 'Edit Department' : 'Create Department'}</DialogTitle>
        <DialogContent dividers>
          <TextField
            label="Name"
            fullWidth
            margin="normal"
            value={deptData.name}
            onChange={(e) => setDeptData({...deptData, name: e.target.value})}
          />
          <TextField
            label="Description"
            fullWidth
            margin="normal"
            multiline
            rows={3}
            value={deptData.description}
            onChange={(e) => setDeptData({...deptData, description: e.target.value})}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDept(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleDeptSubmit} disabled={!deptData.name}>
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dom Dialog */}
      <Dialog open={openDom} onClose={() => setOpenDom(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create Domain</DialogTitle>
        <DialogContent dividers>
          <TextField
            label="Domain Name"
            fullWidth
            margin="normal"
            value={domData.name}
            onChange={(e) => setDomData({...domData, name: e.target.value})}
          />
          <TextField
            select
            label="Parent Department"
            fullWidth
            margin="normal"
            value={domData.department}
            onChange={(e) => setDomData({...domData, department: e.target.value})}
            SelectProps={{ native: true }}
          >
            <option value="">Select a Department</option>
            {departments.map(d => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDom(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleDomSubmit} disabled={!domData.name || !domData.department}>
            Save
          </Button>
        </DialogActions>
      </Dialog>

    </motion.div>
  );
}
