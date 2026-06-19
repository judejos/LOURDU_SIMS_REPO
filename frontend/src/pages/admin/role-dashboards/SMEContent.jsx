/**
 * SIMS — SME (lead) Dashboard Content
 * Capabilities:
 *   - All-domain access and intern view
 *   - Create projects and assign to mentor by domain
 *   - Maintain payment status / finalize intern payments
 */

import { useState, useEffect } from 'react';
import { Box, Typography, Grid, Chip, Button, Dialog, DialogTitle,
         DialogContent, DialogActions, TextField, MenuItem, Select,
         InputLabel, FormControl, Table, TableBody, TableCell, TableHead,
         TableRow, IconButton, Alert, CircularProgress } from '@mui/material';
import { Add, FolderSpecial, Payment, People, Domain,
         AttachMoney, CheckCircle, Group } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { LoadingSpinner, StatCard } from '../../../components/common';

import TeamManagement from '../TeamManagement';
import InternLists from '../InternLists';
import PaymentList from '../PaymentList';
import DepartmentManagement from '../DepartmentManagement';
import UserProfile from '../UserProfile';
import api from '../../../services/api';

// ── Project Management Panel ─────────────────────────────────────────────────
function ProjectsPanel() {
  const [projects, setProjects]     = useState([]);
  const [teams, setTeams]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [creating, setCreating]     = useState(false);
  const [form, setForm]             = useState({ name: '', description: '', status: 'planning', domain: '', team_lead: '', document: null });
  const [domains, setDomains]       = useState([]);
  const [teamLeads, setTeamLeads]   = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [saving, setSaving]         = useState(false);
  const [error, setError]           = useState('');

  const load = () => {
    setLoading(true);
    Promise.all([
      api.get('/Sims/projects/'),
      api.get('/Sims/teams/'),
      api.get('/Sims/domains/'),
      api.get('/Sims/team-leads/'),
    ])
      .then(([p, t, d, tl]) => { 
        setProjects(p.data); 
        setTeams(t.data); 
        setDomains(d.data); 
        setTeamLeads(tl.data); 
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleCreate = () => {
    setSaving(true);
    setError('');

    const formData = new FormData();
    formData.append('name', form.name);
    formData.append('description', form.description);
    formData.append('status', form.status);
    if (form.domain) formData.append('domain', form.domain);
    if (form.team_lead) formData.append('team_lead', form.team_lead);
    if (form.document) formData.append('document', form.document);

    api.post('/Sims/projects/', formData)
      .then(() => { 
        setOpenDialog(false); 
        setForm({ name: '', description: '', status: 'planning', domain: '', team_lead: '', document: null }); 
        load(); 
      })
      .catch(e => setError(e.response?.data?.error || 'Failed to create project'))
      .finally(() => setSaving(false));
  };

  const handleAssignTeam = (projectId, teamId) => {
    api.post(`/Sims/projects/${projectId}/assign-team/`, { team_id: teamId })
      .then(() => load())
      .catch(() => {});
  };

  const handleAssignMentor = (projectId, leadId) => {
    api.post(`/Sims/projects/${projectId}/assign-team-lead/`, { lead_id: leadId })
      .then(() => load())
      .catch(() => {});
  };

  const handleStatusChange = (projectId, newStatus) => {
    api.patch(`/Sims/projects/${projectId}/`, { status: newStatus })
      .then(() => load())
      .catch(() => {});
  };

  const statusColor = (s) => ({ active: 'success', completed: 'primary', planning: 'warning', on_hold: 'default' }[s] || 'default');

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <Box className="page-header" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Typography variant="h4" fontWeight={800}>Projects</Typography>
          <Typography variant="body2" color="text.secondary">Create projects and assign to mentors by domain</Typography>
        </Box>
        <Button variant="contained" startIcon={<Add />} onClick={() => setOpenDialog(true)}
          sx={{ background: 'var(--gradient-primary)', borderRadius: 2 }}>
          New Project
        </Button>
      </Box>

      {loading ? <LoadingSpinner text="Loading projects..." /> : (
        <Box className="glass-card" sx={{ p: 3 }}>
          {projects.length === 0 ? (
            <Alert severity="info">No projects yet. Create your first project above.</Alert>
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Project</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Domain</TableCell>
                  <TableCell>Assigned Mentor</TableCell>
                  <TableCell>Assigned Team</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {projects.map(p => (
                  <TableRow key={p.id} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>{p.name}</Typography>
                      <Typography variant="caption" color="text.secondary">{p.description}</Typography>
                    </TableCell>
                    <TableCell>
                      <Select size="small" value={p.status || 'planning'} onChange={e => handleStatusChange(p.id, e.target.value)} sx={{ minWidth: 120 }}>
                        <MenuItem value="planning">planning</MenuItem>
                        <MenuItem value="active">active</MenuItem>
                        <MenuItem value="on_hold">on_hold</MenuItem>
                        <MenuItem value="completed">completed</MenuItem>
                      </Select>
                    </TableCell>
                    <TableCell>{p.domain_name || '—'}</TableCell>
                    <TableCell>
                      <Select size="small" displayEmpty value={p.team_lead || ""}
                        onChange={e => handleAssignMentor(p.id, e.target.value)}
                        sx={{ minWidth: 140 }}>
                        <MenuItem value="" disabled>Select mentor…</MenuItem>
                        <MenuItem value="unassigned"><em>Unassigned</em></MenuItem>
                        {teamLeads.filter(l => !p.domain_name || l.domain_name === p.domain_name).map(l => <MenuItem key={l.id} value={l.id}>{l.full_name} ({l.emp_id})</MenuItem>)}
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Select size="small" displayEmpty value={p.team || ""}
                        onChange={e => handleAssignTeam(p.id, e.target.value)}
                        sx={{ minWidth: 140 }}>
                        <MenuItem value="" disabled>Select team…</MenuItem>
                        <MenuItem value="unassigned"><em>Unassigned</em></MenuItem>
                        {teams.filter(t => !p.domain_name || t.domain_name === p.domain_name).map(t => <MenuItem key={t.id} value={t.id}>{t.name}</MenuItem>)}
                      </Select>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Box>
      )}

      {/* Create Project Dialog */}
      <Dialog open={openDialog} onClose={() => { setOpenDialog(false); setForm({ name: '', description: '', status: 'planning', domain: '', team_lead: '', document: null }); }} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Project</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 3 }}>
          {error && <Alert severity="error">{error}</Alert>}
          <TextField label="Project Name" fullWidth value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            sx={{ mt: 1 }} />
          <TextField label="Description" fullWidth multiline rows={3} value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
          <FormControl fullWidth>
            <InputLabel>Domain</InputLabel>
            <Select value={form.domain} label="Domain"
              onChange={e => setForm(f => ({ ...f, domain: e.target.value, team_lead: '' }))}>
              {domains.map(d => <MenuItem key={d.id} value={d.id}>{d.name}</MenuItem>)}
            </Select>
          </FormControl>
          <FormControl fullWidth disabled={!form.domain}>
            <InputLabel>Mentor</InputLabel>
            <Select value={form.team_lead || ''} label="Mentor"
              onChange={e => setForm(f => ({ ...f, team_lead: e.target.value }))}>
              <MenuItem value="">Select mentor…</MenuItem>
              {teamLeads
                .filter(tl => {
                  if (!form.domain) return true;
                  const selDomain = domains.find(d => d.id === form.domain);
                  return selDomain ? tl.domain_name === selDomain.name : true;
                })
                .map(tl => (
                  <MenuItem key={tl.id} value={tl.id}>{tl.full_name}</MenuItem>
                ))}
            </Select>
          </FormControl>
          <TextField
            label="Upload Document"
            fullWidth
            onClick={() => document.getElementById('project-document').click()}
            value={form.document ? form.document.name : ''}
            helperText="Only PDF files are allowed"
            InputProps={{
              readOnly: true,
            }}
            sx={{ 
              cursor: 'pointer', 
              '& *': { cursor: 'pointer !important' } 
            }}
          />
          <input
            id="project-document"
            type="file"
            accept=".pdf"
            hidden
            onChange={e => {
              const file = e.target.files[0];
              if (file && !file.name.toLowerCase().endsWith('.pdf')) {
                alert('Only PDF files are allowed.');
                e.target.value = null;
                return;
              }
              setForm(f => ({ ...f, document: file }));
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setOpenDialog(false); setForm({ name: '', description: '', status: 'planning', domain: '', team_lead: '', document: null }); }}>Cancel</Button>
          <Button variant="contained" onClick={handleCreate} disabled={saving || !form.name}>
            {saving ? <CircularProgress size={20} /> : 'Assign'}
          </Button>
        </DialogActions>
      </Dialog>
    </motion.div>
  );
}

// ── SME Overview ─────────────────────────────────────────────────────────────
function SMEOverview() {
  const [stats, setStats] = useState({ projects: 0, teams: 0, interns: 0, payments: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/Sims/projects/dashboard/'),
      api.get('/Sims/interns/stats/'),
    ])
      .then(([pRes, iRes]) => setStats({
        projects: pRes.data.active || 0,
        interns: iRes.data.active || 0,
      }))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
      <Box className="page-header">
        <Box>
          <Typography variant="h4" fontWeight={800}>SME Dashboard</Typography>
          <Typography variant="body2" color="text.secondary">
            Projects · All domains · Payment management
          </Typography>
        </Box>
      </Box>

      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        {[
          { label: 'Active Projects',  value: stats.projects,  color: '#6366f1', icon: <FolderSpecial /> },
          { label: 'Active Interns',   value: stats.interns,   color: '#22c55e', icon: <People /> },
        ].map((s, i) => (
          <Grid item xs={6} sm={3} key={i}>
            <StatCard {...s} delay={i * 0.05} />
          </Grid>
        ))}
      </Grid>

      {/* Quick-access cards */}
      <Grid container spacing={2.5}>
        {[
          { icon: <FolderSpecial sx={{ fontSize: 40 }} />, title: 'Projects',
            desc: 'Create projects, assign mentors by domain', color: '#6366f1' },
          { icon: <Group sx={{ fontSize: 40 }} />, title: 'Teams',
            desc: 'View all teams across your domains', color: '#22c55e' },
          { icon: <People sx={{ fontSize: 40 }} />, title: 'Intern Directory',
            desc: 'View active interns across all domains', color: '#3b82f6' },
          { icon: <AttachMoney sx={{ fontSize: 40 }} />, title: 'Payment Management',
            desc: 'Update payment status and finalize intern payments', color: '#f59e0b' },
        ].map((card, i) => (
          <Grid item xs={12} sm={6} key={i}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.1 }}>
              <Box className="glass-card" sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                  <Box sx={{ p: 1.5, borderRadius: 3, background: `${card.color}22`, color: card.color }}>
                    {card.icon}
                  </Box>
                  <Box>
                    <Typography fontWeight={700} mb={0.5}>{card.title}</Typography>
                    <Typography variant="body2" color="text.secondary">{card.desc}</Typography>
                  </Box>
                </Box>
              </Box>
            </motion.div>
          </Grid>
        ))}
      </Grid>
    </motion.div>
  );
}

export default function SMEContent({ activeItem }) {
  switch (activeItem) {
    case 'dashboard':    return <SMEOverview />;
    case 'projects':     return <ProjectsPanel />;
    case 'teams':        return <TeamManagement />;
    case 'interns':      return <InternLists />;
    case 'payment-list': return <PaymentList />;
    case 'domains':      return <DepartmentManagement />;
    case 'profile':      return <UserProfile />;
    default:             return <SMEOverview />;
  }
}
