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
import AdminProfile from '../AdminProfile';
import api from '../../../services/api';

// ── Project Management Panel ─────────────────────────────────────────────────
function ProjectsPanel() {
  const [projects, setProjects]     = useState([]);
  const [teams, setTeams]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [creating, setCreating]     = useState(false);
  const [form, setForm]             = useState({ name: '', description: '', status: 'planning', domain: '' });
  const [domains, setDomains]       = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [saving, setSaving]         = useState(false);
  const [error, setError]           = useState('');

  const load = () => {
    setLoading(true);
    Promise.all([
      api.get('/Sims/projects/'),
      api.get('/Sims/teams/'),
      api.get('/Sims/domains/'),
    ])
      .then(([p, t, d]) => { setProjects(p.data); setTeams(t.data); setDomains(d.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleCreate = () => {
    setSaving(true);
    setError('');
    api.post('/Sims/projects/', form)
      .then(() => { setOpenDialog(false); setForm({ name: '', description: '', status: 'planning', domain: '' }); load(); })
      .catch(e => setError(e.response?.data?.error || 'Failed to create project'))
      .finally(() => setSaving(false));
  };

  const handleAssignTeam = (projectId, teamId) => {
    api.post(`/Sims/projects/${projectId}/assign-team/`, { team_id: teamId })
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
                  <TableCell>Assigned Team</TableCell>
                  <TableCell>Assign Team</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {projects.map(p => (
                  <TableRow key={p.id} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>{p.name}</Typography>
                      <Typography variant="caption" color="text.secondary">{p.description}</Typography>
                    </TableCell>
                    <TableCell><Chip label={p.status} color={statusColor(p.status)} size="small" /></TableCell>
                    <TableCell>{p.domain_name || '—'}</TableCell>
                    <TableCell>{p.team_name || <Chip label="Unassigned" size="small" variant="outlined" />}</TableCell>
                    <TableCell>
                      <Select size="small" displayEmpty defaultValue=""
                        onChange={e => handleAssignTeam(p.id, e.target.value)}
                        sx={{ minWidth: 140 }}>
                        <MenuItem value="" disabled>Select team…</MenuItem>
                        {teams.map(t => <MenuItem key={t.id} value={t.id}>{t.name}</MenuItem>)}
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
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Project</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
          {error && <Alert severity="error">{error}</Alert>}
          <TextField label="Project Name" fullWidth value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          <TextField label="Description" fullWidth multiline rows={3} value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
          <FormControl fullWidth>
            <InputLabel>Domain</InputLabel>
            <Select value={form.domain} label="Domain"
              onChange={e => setForm(f => ({ ...f, domain: e.target.value }))}>
              {domains.map(d => <MenuItem key={d.id} value={d.id}>{d.name}</MenuItem>)}
            </Select>
          </FormControl>
          <FormControl fullWidth>
            <InputLabel>Status</InputLabel>
            <Select value={form.status} label="Status"
              onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
              {['planning', 'active', 'on_hold', 'completed'].map(s =>
                <MenuItem key={s} value={s}>{s.replace('_', ' ')}</MenuItem>)}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreate} disabled={saving || !form.name}>
            {saving ? <CircularProgress size={20} /> : 'Create'}
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
          <Grid item="true" xs={6} sm={3} key={i}>
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
          { icon: <People sx={{ fontSize: 40 }} />, title: 'All Interns',
            desc: 'View interns across all domains in your entity', color: '#3b82f6' },
          { icon: <AttachMoney sx={{ fontSize: 40 }} />, title: 'Payment Management',
            desc: 'Update payment status and finalize intern payments', color: '#f59e0b' },
        ].map((card, i) => (
          <Grid item="true" xs={12} sm={6} key={i}>
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
    case 'profile':      return <AdminProfile />;
    default:             return <SMEOverview />;
  }
}
