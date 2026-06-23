import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Button, IconButton, Grid, TextField, InputAdornment,
  Tabs, Tab, Dialog, DialogTitle, DialogContent, DialogActions, FormControl, InputLabel, Select, MenuItem, Checkbox, Tooltip, Menu
} from '@mui/material';
import { Search, FilterList, Download, Visibility, Edit, Delete, Add, TrendingUp, MoreVert } from '@mui/icons-material';
import { usersAPI, authAPI, orgAPI } from '../../services/api';
import { LoadingSpinner, StatusChip } from '../../components/common';
import PromotionModal from '../../components/common/PromotionModal';
import { motion } from 'framer-motion';

export default function InternLists({ readOnly = false, isCombined = false }) {
  const location = useLocation();
  const [interns, setInterns] = useState([]);
  const [domains, setDomains] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [domainFilter, setDomainFilter] = useState('all');
  
  const initialTab = location.state?.internTab !== undefined ? location.state.internTab : 1;
  const [tabValue, setTabValue] = useState(initialTab);

  useEffect(() => {
    if (location.state?.internTab !== undefined) {
      setTabValue(location.state.internTab);
    }
  }, [location.state]);

  // Modals state
  const [openModal, setOpenModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [currentEmpId, setCurrentEmpId] = useState('');
  const [formData, setFormData] = useState({
    emp_id: '', full_name: '', username: '', password: '', email: '', role: 'intern', domain_id: ''
  });
  const [deleteDialog, setDeleteDialog] = useState({ open: false, empId: '', name: '' });
  const [promotionDialog, setPromotionDialog] = useState({ open: false, intern: null });

  // Bulk Selection
  const [selected, setSelected] = useState([]);
  const [bulkAction, setBulkAction] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [internRes, domRes] = await Promise.all([
        usersAPI.interns(),
        orgAPI.domains()
      ]);
      setInterns(internRes.data);
      setDomains(domRes.data);
      setSelected([]);
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
    setFormData({ emp_id: '', full_name: '', username: '', password: '', email: '', role: 'intern', domain_id: '' });
    setOpenModal(true);
  };

  const handleOpenEdit = (intern) => {
    setIsEdit(true);
    setCurrentEmpId(intern.emp_id);
    setFormData({
      emp_id: intern.emp_id || '',
      full_name: intern.full_name || '',
      username: intern.username || '',
      password: '',
      email: intern.email || '',
      role: 'intern',
      domain_id: intern.domain || ''
    });
    setOpenModal(true);
  };

  const handleSubmit = async () => {
    try {
      const payload = { ...formData, domain: formData.domain_id || null };
      delete payload.domain_id;
      if (isEdit) {
        await usersAPI.updateUser(currentEmpId, payload);
      } else {
        await authAPI.register(payload);
      }
      setOpenModal(false);
      fetchData(); 
    } catch (err) {
      console.error(err);
      const msg = err.response?.data ? JSON.stringify(err.response.data) : 'Error saving intern.';
      alert('Error: ' + msg);
    }
  };

  const handleDelete = async () => {
    try {
      await usersAPI.deleteUser(deleteDialog.empId);
      setDeleteDialog({ open: false, empId: '', name: '' });
      fetchData();
    } catch (err) {
      console.error(err);
      alert('Error deleting intern.');
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setSelected([]); // Clear selection when switching tabs
  };

  // Checkbox handlers
  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelecteds = filteredInterns.map((n) => n.emp_id);
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  };

  const handleClick = (event, id) => {
    const selectedIndex = selected.indexOf(id);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1),
      );
    }
    setSelected(newSelected);
  };

  const handleBulkAction = async () => {
    if (!bulkAction || selected.length === 0) return;
    try {
      setLoading(true);
      await Promise.all(selected.map(id => usersAPI.updateUser(id, { user_status: bulkAction })));
      setSelected([]);
      setBulkAction('');
      fetchData();
    } catch (err) {
      console.error(err);
      alert('Error updating interns.');
    } finally {
      setLoading(false);
    }
  };

  // Filter
  const filteredInterns = interns.filter(i => {
    const matchesSearch = 
      i.full_name?.toLowerCase().includes(search.toLowerCase()) || 
      i.emp_id?.toLowerCase().includes(search.toLowerCase()) ||
      i.domain_name?.toLowerCase().includes(search.toLowerCase());
      
    if (!matchesSearch) return false;
    
    const matchesDomain = domainFilter === 'all' || i.domain === domainFilter;
    if (!matchesDomain) return false;
    
    switch (tabValue) {
      case 0: return i.user_status !== 'yettojoin'; 
      case 1: return ['active', 'inprogress'].includes(i.user_status);
      case 2: return ['onleave', 'discontinued'].includes(i.user_status);
      case 3: return i.user_status === 'yettojoin';
      case 4: return i.user_status === 'completed';
      case 5: return i.user_status === 'onleave';
      case 6: return i.user_status === 'discontinued';
      default: return true;
    }
  });

  if (loading) return <LoadingSpinner text="Loading Interns..." />;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      {!isCombined && (
        <Box className="page-header" sx={{ mb: 4 }}>
          <Typography variant="h4" fontWeight={800}>{readOnly ? 'Intern Directory' : 'Intern Management'}</Typography>
          <Typography variant="body2" color="text.secondary">{readOnly ? 'View all interns and their details across all domains.' : 'View and manage the complete intern lifecycle.'}</Typography>
        </Box>
      )}

      <Box className="glass-card" sx={{ p: 0, overflow: 'hidden' }}>


        {/* Toolbar */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 3, flexWrap: 'wrap', gap: 2 }}>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <TextField
              size="small"
              placeholder="Search interns by name, ID, domain..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              slotProps={{
                input: {
                  startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment>,
                }
              }}
              sx={{ minWidth: 300 }}
            />
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Status Filter</InputLabel>
              <Select value={tabValue} label="Status Filter" onChange={(e) => setTabValue(e.target.value)}>
                <MenuItem value={0}>All ({interns.filter(i => i.user_status !== 'yettojoin').length})</MenuItem>
                <MenuItem value={1}>Active ({interns.filter(i => ['active', 'inprogress'].includes(i.user_status)).length})</MenuItem>
                <MenuItem value={3}>Yet to Join ({interns.filter(i => i.user_status === 'yettojoin').length})</MenuItem>
                <MenuItem value={4}>Completed ({interns.filter(i => i.user_status === 'completed').length})</MenuItem>
                <MenuItem value={5}>On Leave ({interns.filter(i => i.user_status === 'onleave').length})</MenuItem>
                <MenuItem value={6}>Discontinued ({interns.filter(i => i.user_status === 'discontinued').length})</MenuItem>
                <MenuItem value={2}>Other</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Domain Filter</InputLabel>
              <Select 
                value={domainFilter} 
                label="Domain Filter" 
                onChange={(e) => setDomainFilter(e.target.value)}
              >
                <MenuItem value="all">All Domains</MenuItem>
                {domains.map(d => (
                  <MenuItem key={d.id} value={d.id}>{d.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
            {!readOnly && selected.length > 0 && (
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', bgcolor: 'primary.50', p: 0.5, borderRadius: 1, px: 2 }}>
                <Typography variant="body2" fontWeight={600} color="primary">{selected.length} selected</Typography>
                <FormControl size="small" sx={{ minWidth: 150 }}>
                  <InputLabel>Bulk Action</InputLabel>
                  <Select value={bulkAction} label="Bulk Action" onChange={(e) => setBulkAction(e.target.value)}>
                    <MenuItem value="active">Mark Active</MenuItem>
                    <MenuItem value="completed">Mark Completed</MenuItem>
                    <MenuItem value="discontinued">Mark Discontinued</MenuItem>
                  </Select>
                </FormControl>
                <Button variant="contained" size="small" disabled={!bulkAction} onClick={handleBulkAction}>Apply</Button>
              </Box>
            )}
          </Box>
          {!readOnly && (
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button variant="outlined" startIcon={<Download />} onClick={() => alert('Exporting data to CSV...')}>Export</Button>
            </Box>
          )}
        </Box>
        
        {/* Table */}
        <TableContainer sx={!isCombined ? { maxHeight: 'calc(100vh - 280px)' } : {}}>
          <Table stickyHeader={!isCombined}>
            <TableHead>
              <TableRow>
                {!readOnly && (
                  <TableCell padding="checkbox">
                    <Checkbox
                      indeterminate={selected.length > 0 && selected.length < filteredInterns.length}
                      checked={filteredInterns.length > 0 && selected.length === filteredInterns.length}
                      onChange={handleSelectAllClick}
                    />
                  </TableCell>
                )}
                <TableCell>Intern</TableCell>
                <TableCell>Contact</TableCell>
                <TableCell>Domain</TableCell>
                <TableCell>Timeline</TableCell>
                <TableCell>Status</TableCell>
                {!readOnly && <TableCell align="right">Actions</TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredInterns.length > 0 ? filteredInterns.map((row) => {
                const isItemSelected = selected.indexOf(row.emp_id) !== -1;
                return (
                  <TableRow key={row.emp_id} hover selected={isItemSelected}>
                    {!readOnly && (
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={isItemSelected}
                          onChange={(event) => handleClick(event, row.emp_id)}
                        />
                      </TableCell>
                    )}
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Box 
                          sx={{ 
                            width: 36, height: 36, borderRadius: '50%', 
                            background: 'var(--gradient-primary)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: 'white', fontWeight: 700, fontSize: '0.8rem'
                          }}
                        >
                          {row.full_name?.charAt(0) || 'I'}
                        </Box>
                        <Box>
                          <Typography fontWeight={700} variant="body2">{row.full_name}</Typography>
                          <Typography variant="caption" color="text.secondary">{row.emp_id}</Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{row.email}</Typography>
                      <Typography variant="caption" color="text.secondary">{row.phone || '—'}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{row.domain_name || 'N/A'}</Typography>
                      <Typography variant="caption" color="text.secondary">{row.scheme?.toUpperCase()} Scheme</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{row.start_date || '—'}</Typography>
                      <Typography variant="caption" color="text.secondary">To: {row.end_date || '—'}</Typography>
                    </TableCell>
                    <TableCell>
                      <StatusChip status={row.user_status} />
                    </TableCell>
                    {!readOnly && (
                      <TableCell align="right">
                        <Tooltip title="Promote">
                          <IconButton size="small" onClick={() => setPromotionDialog({ open: true, intern: row })} sx={{ color: 'var(--color-primary)' }}>
                            <TrendingUp fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit">
                          <IconButton size="small" onClick={() => handleOpenEdit(row)}>
                            <Edit fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton size="small" color="error" onClick={() => setDeleteDialog({ open: true, empId: row.emp_id, name: row.full_name })}>
                            <Delete fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    )}
                  </TableRow>
                );
              }) : (
                <TableRow>
                  <TableCell colSpan={readOnly ? 5 : 7} align="center" sx={{ py: 6 }}>
                    <Box sx={{ color: 'text.secondary', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                      <Search sx={{ fontSize: 40, opacity: 0.5 }} />
                      <Typography>No interns found matching your criteria</Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {/* Add/Edit Modal */}
      <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{isEdit ? 'Edit Intern' : 'Add New Intern'}</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            {!isEdit && (
              <>
                <TextField 
                  label="Employee ID (e.g. VDI001)" 
                  value={formData.emp_id} 
                  onChange={e => setFormData({...formData, emp_id: e.target.value})} 
                  fullWidth 
                  autoComplete="off"
                />
                <TextField 
                  label="Username" 
                  value={formData.username} 
                  onChange={e => setFormData({...formData, username: e.target.value})} 
                  fullWidth 
                  autoComplete="off"
                />
              </>
            )}
            <TextField 
              label="Full Name" 
              value={formData.full_name} 
              onChange={e => setFormData({...formData, full_name: e.target.value})} 
              fullWidth 
              autoComplete="off"
            />
            <TextField 
              label="Email" 
              type="email"
              value={formData.email} 
              onChange={e => setFormData({...formData, email: e.target.value})} 
              fullWidth 
              autoComplete="off"
            />
            <FormControl fullWidth>
              <InputLabel>Domain</InputLabel>
              <Select
                value={formData.domain_id || ''}
                label="Domain"
                onChange={e => setFormData({...formData, domain_id: e.target.value})}
              >
                {domains.map(d => (
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
                autoComplete="new-password"
              />
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenModal(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit}>
            {isEdit ? 'Save Changes' : 'Create Intern'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, empId: '', name: '' })}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to deactivate and remove intern <b>{deleteDialog.name}</b>?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, empId: '', name: '' })}>Cancel</Button>
          <Button color="error" variant="contained" onClick={handleDelete}>Delete</Button>
        </DialogActions>
      </Dialog>

      {/* Promotion Modal */}
      <PromotionModal 
        open={promotionDialog.open} 
        intern={promotionDialog.intern} 
        onClose={() => setPromotionDialog({ open: false, intern: null })} 
        onSuccess={() => {
          setPromotionDialog({ open: false, intern: null });
          fetchData();
        }}
      />
    </motion.div>
  );
}
