import { useState, useEffect } from 'react';
import { Box, Typography, Paper, TextField, Button, FormControl, InputLabel, Select, MenuItem, Grid, IconButton } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { usersAPI, authAPI, orgAPI } from '../../services/api';
import { LoadingSpinner } from '../../components/common';
import { motion } from 'framer-motion';

export default function StaffForm({ subAction, empId }) {
  const navigate = useNavigate();
  const isEdit = subAction === 'edit';
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [domains, setDomains] = useState([]);
  const [entities, setEntities] = useState([]);
  
  const [formData, setFormData] = useState({
    emp_id: '', 
    full_name: '', 
    username: '', 
    email: '', 
    role: 'staff', 
    domain_id: '',
    entity_id: '',
    user_status: 'active',
    phone: '',
    gender: '',
    date_of_birth: '',
    aadhar_number: '',
    shift_timing: 'Standard',
    start_date: '',
    end_date: ''
  });

  const [passwordData, setPasswordData] = useState({
    password: '', // for new user
    oldPassword: '', // for editing
    newPassword: '', // for editing
    confirmPassword: ''
  });

  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    const init = async () => {
      try {
        const [domRes, entRes] = await Promise.all([
          orgAPI.domains(),
          orgAPI.entities()
        ]);
        setDomains(domRes.data);
        setEntities(entRes.data);

        if (isEdit && empId) {
          const userRes = await usersAPI.userData(empId);
          const user = userRes.data;
          setFormData({
            emp_id: user.emp_id || '',
            full_name: user.full_name || '',
            username: user.username || '',
            email: user.email || '',
            role: user.role || 'staff',
            domain_id: user.domain || '',
            entity_id: user.entity || '',
            user_status: user.user_status || 'active',
            phone: user.phone || '',
            gender: user.gender || '',
            date_of_birth: user.date_of_birth || '',
            aadhar_number: user.aadhar_number || '',
            shift_timing: user.shift_timing || 'Standard',
            start_date: user.start_date || '',
            end_date: user.end_date || ''
          });
        }
      } catch (err) {
        console.error(err);
        alert('Failed to load data.');
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [isEdit, empId]);

  // Auto-generate employee ID based on role for new staff
  useEffect(() => {
    const fetchNextId = async () => {
      if (!isEdit && formData.role) {
        try {
          const res = await usersAPI.nextEmpId(formData.role);
          if (res.data && res.data.next_emp_id) {
            setFormData(prev => ({ ...prev, emp_id: res.data.next_emp_id }));
          }
        } catch (err) {
          console.error("Failed to fetch next emp id:", err);
        }
      }
    };
    fetchNextId();
  }, [formData.role, isEdit]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setPasswordError('');

    // Validate passwords
    if (!isEdit) {
      if (passwordData.password && passwordData.password !== passwordData.confirmPassword) {
        setPasswordError('Passwords do not match');
        return;
      }
    } else {
      if (passwordData.newPassword && passwordData.newPassword !== passwordData.confirmPassword) {
        setPasswordError('New passwords do not match');
        return;
      }
    }

    try {
      setSaving(true);
      const payload = { 
        ...formData, 
        domain: formData.domain_id || null,
        entity: formData.entity_id || null
      };
      delete payload.domain_id;
      delete payload.entity_id;
      // Convert empty strings for dates to null to avoid backend errors
      if (!payload.date_of_birth) payload.date_of_birth = null;
      if (!payload.start_date) payload.start_date = null;
      if (!payload.end_date) payload.end_date = null;
      
      if (!isEdit) {
        payload.password = passwordData.password || 'Vdart@123';
      } else {
        if (passwordData.newPassword) {
          payload.new_password = passwordData.newPassword;
          payload.old_password = passwordData.oldPassword;
        }
      }

      if (isEdit) {
        await usersAPI.updateUser(empId, payload);
      } else {
        await authAPI.register(payload);
      }
      
      navigate('/admin/staff');
    } catch (err) {
      console.error(err);
      const msg = err.response?.data ? JSON.stringify(err.response.data) : 'Error saving staff member.';
      alert('Error: ' + msg);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner text="Loading Staff Details..." />;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 2 }}>
        <IconButton onClick={() => navigate('/admin/staff')} sx={{ bgcolor: 'var(--bg-card)' }}>
          <ArrowBack />
        </IconButton>
        <Box>
          <Typography variant="h4" fontWeight={800}>{isEdit ? 'Edit Staff' : 'Add New Staff'}</Typography>
          <Typography variant="body2" color="text.secondary">
            {isEdit ? `Manage details for ${formData.full_name}` : 'Enter details to create a new staff member.'}
          </Typography>
        </Box>
      </Box>

      <Paper className="glass-card" sx={{ p: 4, width: '100%' }}>
        <form onSubmit={handleSubmit}>
          
          <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>Account Information</Typography>
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={6} size={{ xs: 12, sm: 6, md: 6 }}>
              <TextField 
                label="Employee ID" 
                value={formData.emp_id} 
                onChange={e => setFormData({...formData, emp_id: e.target.value})} 
                fullWidth 
                required
                disabled
                helperText={isEdit ? "Employee ID cannot be modified" : "Employee ID is auto-generated based on Role"}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={6} size={{ xs: 12, sm: 6, md: 6 }}>
              <TextField 
                label="Username" 
                value={formData.username} 
                onChange={e => setFormData({...formData, username: e.target.value})} 
                fullWidth 
                required
              />
            </Grid>
            <Grid item xs={12} sm={6} md={6} size={{ xs: 12, sm: 6, md: 6 }}>
              <TextField 
                label="Email Address" 
                type="email"
                value={formData.email} 
                onChange={e => setFormData({...formData, email: e.target.value})} 
                fullWidth 
                required
              />
            </Grid>
            <Grid item xs={12} sm={6} md={6} size={{ xs: 12, sm: 6, md: 6 }}>
              <FormControl fullWidth>
                <InputLabel>Role</InputLabel>
                <Select
                  value={formData.role}
                  label="Role"
                  onChange={e => setFormData({...formData, role: e.target.value})}
                >
                  <MenuItem value="staff">Staff</MenuItem>
                  <MenuItem value="mentor">Mentor</MenuItem>
                  <MenuItem value="sme">SME</MenuItem>
                  <MenuItem value="manager">Manager</MenuItem>
                  <MenuItem value="superadmin">Super Admin</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={6} size={{ xs: 12, sm: 6, md: 6 }}>
              <FormControl fullWidth disabled={!['mentor', 'sme'].includes(formData.role)}>
                <InputLabel>Domain</InputLabel>
                <Select
                  value={formData.domain_id || ''}
                  label="Domain"
                  onChange={e => setFormData({...formData, domain_id: e.target.value})}
                >
                  <MenuItem value=""><em>None</em></MenuItem>
                  {domains.map(d => (
                    <MenuItem key={d.id} value={d.id}>{d.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={6} size={{ xs: 12, sm: 6, md: 6 }}>
              <FormControl fullWidth>
                <InputLabel>Entity</InputLabel>
                <Select
                  value={formData.entity_id || ''}
                  label="Entity"
                  onChange={e => setFormData({...formData, entity_id: e.target.value})}
                >
                  <MenuItem value=""><em>None</em></MenuItem>
                  {entities.map(e => (
                    <MenuItem key={e.id} value={e.id}>{e.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={6} size={{ xs: 12, sm: 6, md: 6 }}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={formData.user_status}
                  label="Status"
                  onChange={e => setFormData({...formData, user_status: e.target.value})}
                >
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                  <MenuItem value="discontinued">Discontinued</MenuItem>
                  <MenuItem value="onleave">On Leave</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>Personal Information</Typography>
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={6} size={{ xs: 12, sm: 6, md: 6 }}>
              <TextField 
                label="Full Name" 
                value={formData.full_name} 
                onChange={e => setFormData({...formData, full_name: e.target.value})} 
                fullWidth 
                required
              />
            </Grid>
            <Grid item xs={12} sm={6} md={6} size={{ xs: 12, sm: 6, md: 6 }}>
              <TextField 
                label="Phone Number" 
                value={formData.phone} 
                onChange={e => setFormData({...formData, phone: e.target.value})} 
                fullWidth 
              />
            </Grid>
            <Grid item xs={12} sm={6} md={6} size={{ xs: 12, sm: 6, md: 6 }}>
              <FormControl fullWidth>
                <InputLabel>Gender</InputLabel>
                <Select
                  value={formData.gender}
                  label="Gender"
                  onChange={e => setFormData({...formData, gender: e.target.value})}
                >
                  <MenuItem value=""><em>None</em></MenuItem>
                  <MenuItem value="Male">Male</MenuItem>
                  <MenuItem value="Female">Female</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={6} size={{ xs: 12, sm: 6, md: 6 }}>
              <TextField 
                label="Date of Birth" 
                type="date"
                value={formData.date_of_birth || ''} 
                onChange={e => setFormData({...formData, date_of_birth: e.target.value})} 
                fullWidth 
                InputLabelProps={{ shrink: true }}
                slotProps={{ inputLabel: { shrink: true } }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={6} size={{ xs: 12, sm: 6, md: 6 }}>
              <TextField 
                label="Aadhar Number" 
                value={formData.aadhar_number} 
                onChange={e => setFormData({...formData, aadhar_number: e.target.value})} 
                fullWidth 
              />
            </Grid>
          </Grid>

          <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>Employment Details</Typography>
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={6} size={{ xs: 12, sm: 6, md: 6 }}>
              <FormControl fullWidth>
                <InputLabel>Shift Timing</InputLabel>
                <Select
                  value={formData.shift_timing}
                  label="Shift Timing"
                  onChange={e => setFormData({...formData, shift_timing: e.target.value})}
                >
                  <MenuItem value="Standard">Standard</MenuItem>
                  <MenuItem value="Morning">Morning</MenuItem>
                  <MenuItem value="Evening">Evening</MenuItem>
                  <MenuItem value="Night">Night</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={6} size={{ xs: 12, sm: 6, md: 6 }}>
              <TextField 
                label="Start Date" 
                type="date"
                value={formData.start_date || ''} 
                onChange={e => setFormData({...formData, start_date: e.target.value})} 
                fullWidth 
                InputLabelProps={{ shrink: true }}
                slotProps={{ inputLabel: { shrink: true } }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={6} size={{ xs: 12, sm: 6, md: 6 }}>
              <TextField 
                label="End Date" 
                type="date"
                value={formData.end_date || ''} 
                onChange={e => setFormData({...formData, end_date: e.target.value})} 
                fullWidth 
                InputLabelProps={{ shrink: true }}
                slotProps={{ inputLabel: { shrink: true } }}
              />
            </Grid>
          </Grid>

          {/* Password Section */}
          <Box sx={{ mt: 4, mb: 2 }}>
            <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
              {isEdit ? 'Change Password (Optional)' : 'Password Setup'}
            </Typography>
            <Grid container spacing={3}>
              {isEdit ? (
                <>
                  <Grid item xs={12} sm={4} md={4} size={{ xs: 12, sm: 4, md: 4 }}>
                    <TextField 
                      label="Old Password" 
                      type="password"
                      value={passwordData.oldPassword} 
                      onChange={e => setPasswordData({...passwordData, oldPassword: e.target.value})} 
                      fullWidth 
                      helperText="Leave blank to force reset (Admin)"
                    />
                  </Grid>
                  <Grid item xs={12} sm={4} md={4} size={{ xs: 12, sm: 4, md: 4 }}>
                    <TextField 
                      label="New Password" 
                      type="password"
                      value={passwordData.newPassword} 
                      onChange={e => setPasswordData({...passwordData, newPassword: e.target.value})} 
                      fullWidth 
                      error={!!passwordError}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4} md={4} size={{ xs: 12, sm: 4, md: 4 }}>
                    <TextField 
                      label="Re-enter Password" 
                      type="password"
                      value={passwordData.confirmPassword} 
                      onChange={e => setPasswordData({...passwordData, confirmPassword: e.target.value})} 
                      fullWidth 
                      error={!!passwordError}
                      helperText={passwordError}
                    />
                  </Grid>
                </>
              ) : (
                <>
                  <Grid item xs={12} sm={6} md={6} size={{ xs: 12, sm: 6, md: 6 }}>
                    <TextField 
                      label="Password" 
                      type="password"
                      value={passwordData.password} 
                      onChange={e => setPasswordData({...passwordData, password: e.target.value})} 
                      fullWidth 
                      error={!!passwordError}
                      placeholder="Default: Vdart@123"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={6} size={{ xs: 12, sm: 6, md: 6 }}>
                    <TextField 
                      label="Re-enter Password" 
                      type="password"
                      value={passwordData.confirmPassword} 
                      onChange={e => setPasswordData({...passwordData, confirmPassword: e.target.value})} 
                      fullWidth 
                      error={!!passwordError}
                      helperText={passwordError}
                    />
                  </Grid>
                </>
              )}
            </Grid>
          </Box>
          
          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button variant="outlined" onClick={() => navigate('/admin/staff')} disabled={saving}>
              Cancel
            </Button>
            <Button variant="contained" type="submit" disabled={saving} sx={{ background: 'var(--gradient-primary)' }}>
              {saving ? 'Saving...' : (isEdit ? 'Save Changes' : 'Create Staff')}
            </Button>
          </Box>
        </form>
      </Paper>
    </motion.div>
  );
}
