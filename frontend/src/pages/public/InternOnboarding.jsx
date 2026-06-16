import { useState, useEffect } from 'react';
import { 
  Box, Typography, Paper, Grid, TextField, Button, Stepper, Step, StepLabel, MenuItem, Alert
} from '@mui/material';
import { CheckCircle, ContentPaste } from '@mui/icons-material';
import { onboardingAPI, orgAPI } from '../../services/api';
import { motion } from 'framer-motion';

export default function InternOnboarding() {
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  
  // Lookups
  const [departments, setDepartments] = useState([]);
  const [domains, setDomains] = useState([]);

  const [formData, setFormData] = useState({
    full_name: '', email: '', phone: '', aadhar_number: '', gender: '', date_of_birth: '',
    registration_number: '', college_location: '', college_name: '', degree: '', college_department: '', year_of_passing: '',
    start_date: '', end_date: '', shift_timing: 'Standard', scheme: 'free', department: '', domain: '', terms_agreed: false
  });

  useEffect(() => {
    Promise.all([orgAPI.departments(), orgAPI.domains()])
      .then(([dept, dom]) => {
        setDepartments(dept.data);
        setDomains(dom.data);
      }).catch(err => console.error(err));
  }, []);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleNext = () => setActiveStep((prev) => prev + 1);
  const handleBack = () => setActiveStep((prev) => prev - 1);

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      const payload = { ...formData, terms_agreed: true }; // Force true for demo
      await onboardingAPI.submit(payload);
      setSuccess(true);
      setActiveStep(3);
    } catch (err) {
      setError(err.response?.data?.error || "Submission failed. Check details.");
    } finally {
      setLoading(false);
    }
  };

  const steps = ['Personal Details', 'Academic Details', 'Internship Preferences'];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <Box sx={{ maxWidth: 900, mx: 'auto', p: 4, minHeight: '100vh' }}>
        
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 1 }}>
            <ContentPaste color="primary" sx={{ fontSize: 36 }} />
            <Typography variant="h4" fontWeight={800} color="primary.main">Intern Onboarding</Typography>
          </Box>
          <Typography color="text.secondary">Complete your profile to generate your admission ID.</Typography>
        </Box>

        <Paper sx={{ p: 4, borderRadius: 4, boxShadow: '0 8px 32px rgba(0,0,0,0.08)' }}>
          <Stepper activeStep={activeStep} sx={{ mb: 6 }}>
            {steps.map((label) => <Step key={label}><StepLabel>{label}</StepLabel></Step>)}
          </Stepper>

          {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

          {activeStep === 0 && (
            <Grid container spacing={3}>
              <Grid item="true" xs={12} sm={6}>
                <TextField fullWidth label="Full Name (as per Aadhar)" name="full_name" value={formData.full_name} onChange={handleChange} />
              </Grid>
              <Grid item="true" xs={12} sm={6}>
                <TextField fullWidth label="Email Address" type="email" name="email" value={formData.email} onChange={handleChange} />
              </Grid>
              <Grid item="true" xs={12} sm={6}>
                <TextField fullWidth label="Phone Number" name="phone" value={formData.phone} onChange={handleChange} />
              </Grid>
              <Grid item="true" xs={12} sm={6}>
                <TextField fullWidth label="Aadhar Number" name="aadhar_number" value={formData.aadhar_number} onChange={handleChange} />
              </Grid>
              <Grid item="true" xs={12} sm={6}>
                <TextField select fullWidth label="Gender" name="gender" value={formData.gender} onChange={handleChange}>
                  <MenuItem value="Male">Male</MenuItem>
                  <MenuItem value="Female">Female</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </TextField>
              </Grid>
              <Grid item="true" xs={12} sm={6}>
                <TextField fullWidth label="Date of Birth" type="date" InputLabelProps={{ shrink: true }} name="date_of_birth" value={formData.date_of_birth} onChange={handleChange} />
              </Grid>
            </Grid>
          )}

          {activeStep === 1 && (
            <Grid container spacing={3}>
              <Grid item="true" xs={12} sm={6}>
                <TextField fullWidth label="College Registration Number" name="registration_number" value={formData.registration_number} onChange={handleChange} />
              </Grid>
              <Grid item="true" xs={12} sm={6}>
                <TextField fullWidth label="College Name" name="college_name" value={formData.college_name} onChange={handleChange} />
              </Grid>
              <Grid item="true" xs={12} sm={6}>
                <TextField fullWidth label="College Location (City)" name="college_location" value={formData.college_location} onChange={handleChange} />
              </Grid>
              <Grid item="true" xs={12} sm={6}>
                <TextField fullWidth label="Degree (e.g., B.Tech, MCA)" name="degree" value={formData.degree} onChange={handleChange} />
              </Grid>
              <Grid item="true" xs={12} sm={6}>
                <TextField fullWidth label="Department (e.g., CSE, IT)" name="college_department" value={formData.college_department} onChange={handleChange} />
              </Grid>
              <Grid item="true" xs={12} sm={6}>
                <TextField fullWidth label="Year of Passing" type="number" name="year_of_passing" value={formData.year_of_passing} onChange={handleChange} />
              </Grid>
            </Grid>
          )}

          {activeStep === 2 && (
            <Grid container spacing={3}>
              <Grid item="true" xs={12} sm={6}>
                <TextField fullWidth label="Expected Start Date" type="date" InputLabelProps={{ shrink: true }} name="start_date" value={formData.start_date} onChange={handleChange} />
              </Grid>
              <Grid item="true" xs={12} sm={6}>
                <TextField fullWidth label="Expected End Date" type="date" InputLabelProps={{ shrink: true }} name="end_date" value={formData.end_date} onChange={handleChange} />
              </Grid>
              <Grid item="true" xs={12} sm={6}>
                <TextField select fullWidth label="Department" name="department" value={formData.department} onChange={handleChange}>
                  <MenuItem value=""><em>None</em></MenuItem>
                  {departments.map((d) => <MenuItem key={d.id} value={d.id}>{d.name}</MenuItem>)}
                </TextField>
              </Grid>
              <Grid item="true" xs={12} sm={6}>
                <TextField select fullWidth label="Domain" name="domain" value={formData.domain} onChange={handleChange}>
                  <MenuItem value=""><em>None</em></MenuItem>
                  {domains.filter(d => !formData.department || d.department === formData.department).map((d) => 
                    <MenuItem key={d.id} value={d.id}>{d.name}</MenuItem>
                  )}
                </TextField>
              </Grid>
              <Grid item="true" xs={12} sm={6}>
                <TextField select fullWidth label="Scheme" name="scheme" value={formData.scheme} onChange={handleChange}>
                  <MenuItem value="free">Free</MenuItem>
                  <MenuItem value="paid">Paid</MenuItem>
                  <MenuItem value="stipend">Stipend</MenuItem>
                </TextField>
              </Grid>
              <Grid item="true" xs={12} sm={6}>
                <TextField select fullWidth label="Shift Timing" name="shift_timing" value={formData.shift_timing} onChange={handleChange}>
                  <MenuItem value="Standard">Standard (09:00 - 18:00)</MenuItem>
                  <MenuItem value="Morning">Morning (06:00 - 15:00)</MenuItem>
                  <MenuItem value="Evening">Evening (14:00 - 23:00)</MenuItem>
                </TextField>
              </Grid>
            </Grid>
          )}

          {activeStep === 3 && (
            <Box sx={{ textAlign: 'center', py: 6 }}>
              <CheckCircle color="success" sx={{ fontSize: 64, mb: 2 }} />
              <Typography variant="h4" fontWeight={800} mb={2}>Submission Received!</Typography>
              <Typography color="text.secondary" sx={{ maxWidth: 500, mx: 'auto' }}>
                Thank you for submitting your onboarding form. The administration team will review your application. 
                Once approved, you will receive an email with your Employee ID and login credentials.
              </Typography>
              <Button variant="outlined" sx={{ mt: 4 }} onClick={() => window.location.href = '/'}>
                Return to Home
              </Button>
            </Box>
          )}

          {activeStep < 3 && (
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 6 }}>
              <Button disabled={activeStep === 0} onClick={handleBack} variant="outlined">Back</Button>
              {activeStep === 2 ? (
                <Button variant="contained" onClick={handleSubmit} disabled={loading}>Submit Application</Button>
              ) : (
                <Button variant="contained" onClick={handleNext}>Continue</Button>
              )}
            </Box>
          )}
        </Paper>
      </Box>
    </motion.div>
  );
}
