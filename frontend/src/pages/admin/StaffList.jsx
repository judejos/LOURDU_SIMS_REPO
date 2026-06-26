import { useState, useEffect } from 'react';
import { 
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Button, IconButton, Chip, TextField, InputAdornment,
  MenuItem, Select, FormControl, InputLabel, Collapse, Grid,
  Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Add, Edit, Delete, Search, AdminPanelSettings, KeyboardArrowDown, KeyboardArrowUp } from '@mui/icons-material';
import { usersAPI, authAPI, orgAPI } from '../../services/api';
import { LoadingSpinner, StatusChip } from '../../components/common';
import { motion } from 'framer-motion';

function StaffRow({ row, getRoleColor, handleOpenEdit, setDeleteDialog }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
        <TableCell>
          <IconButton aria-label="expand row" size="small" onClick={() => setOpen(!open)}>
            {open ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
          </IconButton>
        </TableCell>
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
          <Typography variant="body2">{row.domain_name || 'N/A'}</Typography>
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
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={7}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 2, p: 3, bgcolor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
              <Typography variant="subtitle2" gutterBottom component="div" sx={{ fontWeight: 800, mb: 2 }}>
                Additional Details
              </Typography>
              <Grid container spacing={3}>
                <Grid xs={12} sm={4}>
                  <Typography variant="caption" color="text.secondary">Username</Typography>
                  <Typography variant="body2" fontWeight={600}>{row.username || 'N/A'}</Typography>
                </Grid>
                <Grid xs={12} sm={4}>
                  <Typography variant="caption" color="text.secondary">Entity</Typography>
                  <Typography variant="body2" fontWeight={600}>{row.entity_name || 'N/A'}</Typography>
                </Grid>
                <Grid xs={12} sm={4}>
                  <Typography variant="caption" color="text.secondary">Shift Timing</Typography>
                  <Typography variant="body2" fontWeight={600}>{row.shift_timing || 'Standard'}</Typography>
                </Grid>
                <Grid xs={12} sm={4}>
                  <Typography variant="caption" color="text.secondary">Gender</Typography>
                  <Typography variant="body2" fontWeight={600}>{row.gender || 'N/A'}</Typography>
                </Grid>
                <Grid xs={12} sm={4}>
                  <Typography variant="caption" color="text.secondary">Date of Birth</Typography>
                  <Typography variant="body2" fontWeight={600}>{row.date_of_birth || 'N/A'}</Typography>
                </Grid>
                <Grid xs={12} sm={4}>
                  <Typography variant="caption" color="text.secondary">Aadhar Number</Typography>
                  <Typography variant="body2" fontWeight={600}>{row.aadhar_number || 'N/A'}</Typography>
                </Grid>
                <Grid xs={12} sm={4}>
                  <Typography variant="caption" color="text.secondary">Start Date</Typography>
                  <Typography variant="body2" fontWeight={600}>{row.start_date || 'N/A'}</Typography>
                </Grid>
                <Grid xs={12} sm={4}>
                  <Typography variant="caption" color="text.secondary">End Date</Typography>
                  <Typography variant="body2" fontWeight={600}>{row.end_date || 'N/A'}</Typography>
                </Grid>
              </Grid>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
}

export default function StaffList() {
  const navigate = useNavigate();
  const [staff, setStaff] = useState([]);
  const [domains, setDomains] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Filter state
  const [roleFilter, setRoleFilter] = useState('all');
  const [domainFilter, setDomainFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modals state
  const [deleteDialog, setDeleteDialog] = useState({ open: false, empId: '', name: '' });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [staffRes, domRes] = await Promise.all([
        usersAPI.staffList(),
        orgAPI.domains()
      ]);
      setStaff(staffRes.data);
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

  const handleOpenAdd = () => {
    navigate('/admin/staff/new');
  };

  const handleOpenEdit = (user) => {
    navigate(`/admin/staff/edit/${user.emp_id}`);
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

  const filteredStaff = staff.filter(s => {
    const matchesSearch = s.full_name?.toLowerCase().includes(search.toLowerCase()) || 
                          s.emp_id?.toLowerCase().includes(search.toLowerCase()) ||
                          s.domain_name?.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === 'all' || s.role === roleFilter;
    const matchesDomain = domainFilter === 'all' || String(s.domain) === String(domainFilter);
    const matchesStatus = statusFilter === 'all' || s.user_status === statusFilter;
    return matchesSearch && matchesRole && matchesDomain && matchesStatus;
  });

  if (loading) return <LoadingSpinner text="Loading Staff..." />;

  const getRoleColor = (role) => {
    switch (role) {
      case 'superadmin': return 'error';
      case 'manager': return 'secondary';
      case 'sme': return 'primary';
      case 'mentor': return 'info';
      default: return 'default';
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="page-head">
        <div>
          <h1 className="page-title">Staff Management</h1>
          <p className="page-sub">Manage managers, leads, mentors and administrative staff.</p>
        </div>
      </div>

      <Box className="glass-card" sx={{ p: 3 }}>
        {/* Toolbar */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', flex: 1 }}>
            <TextField
              size="small"
              placeholder="Search staff..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              slotProps={{
                input: {
                  startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment>,
                }
              }}
              sx={{ minWidth: 220 }}
            />
            
            <FormControl size="small" sx={{ minWidth: 140 }}>
              <InputLabel>Role</InputLabel>
              <Select
                value={roleFilter}
                label="Role"
                onChange={e => setRoleFilter(e.target.value)}
              >
                <MenuItem value="all">All Roles</MenuItem>
                <MenuItem value="staff">Staff</MenuItem>
                <MenuItem value="mentor">Mentor</MenuItem>
                <MenuItem value="sme">SME</MenuItem>
                <MenuItem value="manager">Manager</MenuItem>
                <MenuItem value="superadmin">Super Admin</MenuItem>
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 140 }}>
              <InputLabel>Domain</InputLabel>
              <Select
                value={domainFilter}
                label="Domain"
                onChange={e => setDomainFilter(e.target.value)}
              >
                <MenuItem value="all">All Domains</MenuItem>
                {domains.map(d => (
                  <MenuItem key={d.id} value={d.id}>{d.name}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 140 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                label="Status"
                onChange={e => setStatusFilter(e.target.value)}
              >
                <MenuItem value="all">All Status</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
              </Select>
            </FormControl>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button variant="contained" startIcon={<Add />} onClick={handleOpenAdd} sx={{ background: 'var(--gradient-primary)' }}>Add Staff</Button>
          </Box>
        </Box>
        
        {/* Table */}
        <TableContainer component={Paper} elevation={0} sx={{ background: 'transparent' }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell style={{ width: 40 }} />
                <TableCell>Employee</TableCell>
                <TableCell>Contact</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Domain</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredStaff.length > 0 ? filteredStaff.map((row) => (
                <StaffRow 
                  key={row.id || row.emp_id} 
                  row={row} 
                  getRoleColor={getRoleColor} 
                  handleOpenEdit={handleOpenEdit} 
                  setDeleteDialog={setDeleteDialog} 
                />
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
