import { useState, useEffect } from 'react';
import { 
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Button, IconButton, Chip, TextField, InputAdornment,
  Dialog, DialogTitle, DialogContent, DialogActions, MenuItem, Select, FormControl, InputLabel
} from '@mui/material';
import { Add, Edit, Delete, Search, AdminPanelSettings, FilterList } from '@mui/icons-material';
import { usersAPI, authAPI, orgAPI } from '../../services/api';
import { LoadingSpinner, StatusChip } from '../../components/common';
import { motion } from 'framer-motion';

export default function StaffList() {
  const [staff, setStaff] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modals state
  const [openModal, setOpenModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [currentEmpId, setCurrentEmpId] = useState('');
  const [formData, setFormData] = useState({
    username: '', password: '', email: '', role: 'staff', department_id: ''
  });

  const [deleteDialog, setDeleteDialog] = useState({ open: false, empId: '', name: '' });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [staffRes, deptRes] = await Promise.all([
        usersAPI.staffList(),
        orgAPI.departments()
      ]);
      setStaff(staffRes.data);
      setDepartments(deptRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenAdd = () => {
    setIsEdit(false);
    setFormData({ username: '', password: '', email: '', role: 'staff', department_id: '' });
    setOpenModal(true);
  };

  const handleOpenEdit = (user) => {
    setIsEdit(true);
    setCurrentEmpId(user.emp_id);
    setFormData({
      username: user.username || '',
      password: '', // Leave blank for edit unless changing
      email: user.email || '',
      role: user.role || 'staff',
      department_id: user.department || ''
    });
    setOpenModal(true);
  };

  const handleSubmit = async () => {
    try {
      if (isEdit) {
        await usersAPI.updateUser(currentEmpId, formData);
      } else {
        await authAPI.register(formData);
      }
      setOpenModal(false);
      fetchData(); // Refresh table
    } catch (err) {
      console.error(err);
      alert('Error saving staff member.');
    }
  };

  const handleDelete = async () => {
    try {
      await usersAPI.deleteUser(deleteDialog.empId);
      setDeleteDialog({ open: false, empId: '', name: '' });
      fetchData();
    } catch (err) {
      console.error(err);
      alert('Error deleting staff.');
    }
  };

  const filteredStaff = staff.filter(s => 
    s.full_name?.toLowerCase().includes(search.toLowerCase()) || 
    s.emp_id?.toLowerCase().includes(search.toLowerCase()) ||
    s.department_name?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <LoadingSpinner text="Loading Staff..." />;

  const getRoleColor = (role) => {
    switch (role) {
      case 'superadmin': return 'error';
      case 'manager': return 'secondary';
      case 'lead': return 'primary';
      case 'mentor': return 'info';
      default: return 'default';
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <Box className="page-header" sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={800}>Staff Management</Typography>
        <Typography variant="body2" color="text.secondary">Manage managers, leads, mentors and administrative staff.</Typography>
      </Box>

      <Box className="glass-card" sx={{ p: 3 }}>
        {/* Toolbar */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
          <TextField
            size="small"
            placeholder="Search staff..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment>,
            }}
            sx={{ minWidth: 250 }}
          />
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button variant="outlined" startIcon={<FilterList />}>Filter</Button>
            <Button variant="contained" startIcon={<Add />} onClick={handleOpenAdd}>Add Staff</Button>
          </Box>
        </Box>
        
        {/* Table */}
        <TableContainer component={Paper} elevation={0} sx={{ background: 'transparent' }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Employee</TableCell>
                <TableCell>Contact</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Department</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredStaff.length > 0 ? filteredStaff.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>
                    <Typography fontWeight={700}>{row.full_name}</Typography>
                    <Typography variant="caption" color="text.secondary">{row.emp_id}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{row.email}</Typography>
                    <Typography variant="caption" color="text.secondary">{row.phone || 'No phone'}</Typography>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={row.role?.toUpperCase()} 
                      size="small" 
                      color={getRoleColor(row.role)} 
                      icon={row.role === 'superadmin' ? <AdminPanelSettings fontSize="small" /> : undefined}
                      variant={row.role === 'superadmin' ? 'filled' : 'outlined'}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{row.department_name || 'N/A'}</Typography>
                  </TableCell>
                  <TableCell>
                    <StatusChip status={row.user_status} />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton size="small" onClick={() => handleOpenEdit(row)}>
                      <Edit fontSize="small" />
                    </IconButton>
                    <IconButton size="small" color="error" onClick={() => setDeleteDialog({ open: true, empId: row.emp_id, name: row.full_name })}>
                      <Delete fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">No staff found matching "{search}"</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {/* Add/Edit Modal */}
      <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{isEdit ? 'Edit Staff' : 'Add New Staff'}</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            {!isEdit && (
              <TextField 
                label="Username" 
                value={formData.username} 
                onChange={e => setFormData({...formData, username: e.target.value})} 
                fullWidth 
              />
            )}
            <TextField 
              label="Email" 
              type="email"
              value={formData.email} 
              onChange={e => setFormData({...formData, email: e.target.value})} 
              fullWidth 
            />
            <FormControl fullWidth>
              <InputLabel>Role</InputLabel>
              <Select
                value={formData.role}
                label="Role"
                onChange={e => setFormData({...formData, role: e.target.value})}
              >
                <MenuItem value="staff">Staff</MenuItem>
                <MenuItem value="mentor">Mentor</MenuItem>
                <MenuItem value="lead">Lead</MenuItem>
                <MenuItem value="manager">Manager</MenuItem>
                <MenuItem value="superadmin">Super Admin</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Department</InputLabel>
              <Select
                value={formData.department_id || ''}
                label="Department"
                onChange={e => setFormData({...formData, department_id: e.target.value})}
              >
                {departments.map(d => (
                  <MenuItem key={d.id} value={d.id}>{d.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
            {!isEdit && (
              <TextField 
                label="Password" 
                type="password"
                value={formData.password} 
                onChange={e => setFormData({...formData, password: e.target.value})} 
                fullWidth 
              />
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenModal(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit}>
            {isEdit ? 'Save Changes' : 'Create Staff'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, empId: '', name: '' })}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to deactivate and remove <b>{deleteDialog.name}</b>?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, empId: '', name: '' })}>Cancel</Button>
          <Button color="error" variant="contained" onClick={handleDelete}>Delete</Button>
        </DialogActions>
      </Dialog>
    </motion.div>
  );
}
