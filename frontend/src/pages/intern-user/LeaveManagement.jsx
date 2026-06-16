import { useState } from 'react';
import { 
  Box, Typography, Grid, Paper, TextField, Button, MenuItem, Stepper, Step, StepLabel, Alert 
} from '@mui/material';
import { DateRange, CheckCircle } from '@mui/icons-material';
import { attendanceAPI } from '../../services/api';
import { motion } from 'framer-motion';

export default function LeaveManagement() {
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    leave_type: 'casual',
    start_date: '',
    end_date: '',
    reason: ''
  });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async () => {
    if (!formData.start_date || !formData.end_date || !formData.reason) {
      setError("Please fill out all fields.");
      return;
    }
    setLoading(true);
    setError('');
    try {
      await attendanceAPI.requestLeave(formData);
      setActiveStep(1);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to submit leave request.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <Box className="page-header" sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={800}>Apply for Leave</Typography>
        <Typography variant="body2" color="text.secondary">Request time off.</Typography>
      </Box>

      <Box className="glass-card" sx={{ p: 4, maxWidth: 600, mx: 'auto' }}>
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          <Step><StepLabel>Details</StepLabel></Step>
          <Step><StepLabel>Confirmation</StepLabel></Step>
        </Stepper>

        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

        {activeStep === 0 && (
          <Grid container spacing={3}>
            <Grid item="true" xs={12}>
              <TextField select fullWidth label="Leave Type" name="leave_type" value={formData.leave_type} onChange={handleChange}>
                <MenuItem value="casual">Casual Leave</MenuItem>
                <MenuItem value="sick">Sick Leave</MenuItem>
                <MenuItem value="personal">Personal Leave</MenuItem>
              </TextField>
            </Grid>
            <Grid item="true" xs={12} sm={6}>
              <TextField fullWidth label="Start Date" type="date" InputLabelProps={{ shrink: true }} name="start_date" value={formData.start_date} onChange={handleChange} required />
            </Grid>
            <Grid item="true" xs={12} sm={6}>
              <TextField fullWidth label="End Date" type="date" InputLabelProps={{ shrink: true }} name="end_date" value={formData.end_date} onChange={handleChange} required />
            </Grid>
            <Grid item="true" xs={12}>
              <TextField fullWidth multiline rows={4} label="Reason" name="reason" value={formData.reason} onChange={handleChange} required />
            </Grid>
            <Grid item="true" xs={12}>
              <Button variant="contained" fullWidth size="large" onClick={handleSubmit} disabled={loading} startIcon={<DateRange />}>
                Submit Request
              </Button>
            </Grid>
          </Grid>
        )}

        {activeStep === 1 && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <CheckCircle color="success" sx={{ fontSize: 64, mb: 2 }} />
            <Typography variant="h5" fontWeight={700} mb={1}>Request Submitted</Typography>
            <Typography color="text.secondary" mb={4}>Your leave request has been sent to your manager for approval.</Typography>
            <Button variant="outlined" onClick={() => {
              setFormData({ leave_type: 'casual', start_date: '', end_date: '', reason: '' });
              setActiveStep(0);
            }}>
              Submit Another Request
            </Button>
          </Box>
        )}
      </Box>
    </motion.div>
  );
}
