/**
 * SIMS — Mentor Dashboard Content
 * Capabilities:
 *   - Single domain access (own domain only)
 *   - Create team and assign team lead from interns
 *   - Assign tasks from assigned project to interns
 *   - Receive, validate, and approve intern leave requests
 */

import { useState, useEffect } from 'react';
import { Box, Typography, Grid, Chip, Button, Avatar, Table, TableBody,
         TableCell, TableHead, TableRow, Dialog, DialogTitle, DialogContent,
         DialogActions, TextField, MenuItem, Select, InputLabel, FormControl,
         CircularProgress, Alert, Divider } from '@mui/material';
import { Group, Task, CalendarMonth, People, Add, CheckCircle,
         Cancel, FolderSpecial, Workspaces } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { LoadingSpinner, StatCard } from '../../../components/common';
import api from '../../../services/api';
import UserProfile from '../UserProfile';
import TeamManagement from '../TeamManagement';

// ── Leave Approvals Panel ────────────────────────────────────────────────────
function LeaveApprovalsPanel() {
  const [leaves, setLeaves]         = useState([]);
  const [loading, setLoading]       = useState(true);
  const [processing, setProcessing] = useState({});

  const load = () => {
    setLoading(true);
    api.get('/Sims/attendances/leave_approval/')
      .then(res => setLeaves(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleAction = (leaveId, status) => {
    setProcessing(p => ({ ...p, [leaveId]: true }));
    api.patch(`/Sims/attendances/leave_approval/${leaveId}/`, { status })
      .then(() => load())
      .catch(() => {})
      .finally(() => setProcessing(p => ({ ...p, [leaveId]: false })));
  };

  const typeColor = (t) => ({ casual: 'primary', sick: 'warning', emergency: 'error' }[t] || 'default');

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <Box className="page-header">
        <Box>
          <Typography variant="h4" fontWeight={800}>Leave Approvals</Typography>
          <Typography variant="body2" color="text.secondary">
            Pending leave requests from your team interns
          </Typography>
        </Box>
        <Chip label={`${leaves.length} Pending`} color={leaves.length > 0 ? 'warning' : 'default'} />
      </Box>

      {loading ? <LoadingSpinner text="Loading leave requests..." /> : (
        <Box className="glass-card" sx={{ p: 3 }}>
          {leaves.length === 0 ? (
            <Alert severity="success" icon={<CheckCircle />}>
              No pending leave requests from your team.
            </Alert>
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Intern</TableCell>
                  <TableCell>Leave Type</TableCell>
                  <TableCell>Dates</TableCell>
                  <TableCell>Reason</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {leaves.map(l => (
                  <TableRow key={l.id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar sx={{ bgcolor: 'var(--color-primary)', width: 32, height: 32, fontSize: '0.8rem' }}>
                          {l.user_name?.charAt(0) || '?'}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight={600}>{l.user_name}</Typography>
                          <Typography variant="caption" color="text.secondary">{l.user_emp_id}</Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip label={l.leave_type} color={typeColor(l.leave_type)} size="small" />
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption">{l.start_date} → {l.end_date}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {l.reason || '—'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button size="small" variant="contained" color="success"
                          startIcon={processing[l.id] ? <CircularProgress size={14} /> : <CheckCircle />}
                          disabled={!!processing[l.id]}
                          onClick={() => handleAction(l.id, 'approved')}>
                          Approve
                        </Button>
                        <Button size="small" variant="outlined" color="error"
                          startIcon={<Cancel />}
                          disabled={!!processing[l.id]}
                          onClick={() => handleAction(l.id, 'rejected')}>
                          Reject
                        </Button>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Box>
      )}
    </motion.div>
  );
}

// ── Task Assignment Panel ─────────────────────────────────────────────────────
function TaskAssignmentPanel() {
  const [projects, setProjects]     = useState([]);
  const [interns, setInterns]       = useState([]);
  const [tasks, setTasks]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [form, setForm]             = useState({ title: '', description: '', project: '', assigned_to: '', due_date: '', priority: 'medium' });
  const [saving, setSaving]         = useState(false);
  const [error, setError]           = useState('');

  const load = () => {
    setLoading(true);
    Promise.all([
      api.get('/Sims/projects/'),
      api.get('/Sims/interns/'),
      api.get('/Sims/tasks/'),
    ])
      .then(([p, i, t]) => { setProjects(p.data); setInterns(i.data); setTasks(t.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleCreate = () => {
    setSaving(true);
    setError('');
    api.post('/Sims/tasks/', form)
      .then(() => {
        setOpenDialog(false);
        setForm({ title: '', description: '', project: '', assigned_to: '', due_date: '', priority: 'medium' });
        load();
      })
      .catch(e => setError(e.response?.data?.error || 'Failed to create task'))
      .finally(() => setSaving(false));
  };

  const statusColor   = (s) => ({ todo: 'default', inprogress: 'warning', completed: 'success', verified: 'primary' }[s] || 'default');
  const priorityColor = (p) => ({ high: 'error', medium: 'warning', low: 'success' }[p] || 'default');

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <Box className="page-header" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Typography variant="h4" fontWeight={800}>Task Assignment</Typography>
          <Typography variant="body2" color="text.secondary">Assign tasks from your projects to team interns</Typography>
        </Box>
        <Button variant="contained" startIcon={<Add />} onClick={() => setOpenDialog(true)}
          sx={{ background: 'var(--gradient-primary)', borderRadius: 2 }}>
          Assign Task
        </Button>
      </Box>

      {loading ? <LoadingSpinner text="Loading tasks..." /> : (
        <Box className="glass-card" sx={{ p: 3 }}>
          {tasks.length === 0 ? (
            <Alert severity="info">No tasks yet. Create your first task assignment above.</Alert>
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Task</TableCell>
                  <TableCell>Project</TableCell>
                  <TableCell>Assigned To</TableCell>
                  <TableCell>Priority</TableCell>
                  <TableCell>Due Date</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {tasks.map(t => (
                  <TableRow key={t.id} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>{t.title}</Typography>
                      <Typography variant="caption" color="text.secondary">{t.description?.slice(0, 60)}</Typography>
                    </TableCell>
                    <TableCell>{t.project_name || '—'}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar sx={{ width: 24, height: 24, fontSize: '0.7rem', bgcolor: 'var(--color-accent)' }}>
                          {t.assigned_to_name?.charAt(0)}
                        </Avatar>
                        <Typography variant="body2">{t.assigned_to_name || '—'}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell><Chip label={t.priority} color={priorityColor(t.priority)} size="small" /></TableCell>
                    <TableCell><Typography variant="caption">{t.due_date || '—'}</Typography></TableCell>
                    <TableCell><Chip label={t.status} color={statusColor(t.status)} size="small" /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Box>
      )}

      {/* Create Task Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Assign Task to Intern</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
          {error && <Alert severity="error">{error}</Alert>}
          <TextField label="Task Title" fullWidth value={form.title}
            onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
          <TextField label="Description" fullWidth multiline rows={2} value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
          <FormControl fullWidth>
            <InputLabel>Project</InputLabel>
            <Select value={form.project} label="Project"
              onChange={e => setForm(f => ({ ...f, project: e.target.value }))}>
              {projects.map(p => <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>)}
            </Select>
          </FormControl>
          <FormControl fullWidth>
            <InputLabel>Assign To</InputLabel>
            <Select value={form.assigned_to} label="Assign To"
              onChange={e => setForm(f => ({ ...f, assigned_to: e.target.value }))}>
              {interns.map(i => <MenuItem key={i.id} value={i.id}>{i.full_name} ({i.emp_id})</MenuItem>)}
            </Select>
          </FormControl>
          <Grid container spacing={2}>
            <Grid item="true" xs={6}>
              <FormControl fullWidth>
                <InputLabel>Priority</InputLabel>
                <Select value={form.priority} label="Priority"
                  onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}>
                  {['low', 'medium', 'high'].map(p => <MenuItem key={p} value={p}>{p}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item="true" xs={6}>
              <TextField type="date" label="Due Date" fullWidth slotProps={{ inputLabel: { shrink: true } }}
                value={form.due_date}
                onChange={e => setForm(f => ({ ...f, due_date: e.target.value }))} />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreate} disabled={saving || !form.title || !form.assigned_to}>
            {saving ? <CircularProgress size={20} /> : 'Assign Task'}
          </Button>
        </DialogActions>
      </Dialog>
    </motion.div>
  );
}

// ── Interns sub-view ─────────────────────────────────────────────────────────
function InternsMentorView() {
  const [interns, setInterns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/Sims/interns/')
      .then(res => setInterns(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <Box className="page-header">
        <Typography variant="h4" fontWeight={800}>My Interns</Typography>
        <Typography variant="body2" color="text.secondary">Interns assigned to your teams in your domain</Typography>
      </Box>
      {loading ? <LoadingSpinner text="Loading interns..." /> : (
        <Box className="glass-card" sx={{ p: 3 }}>
          {interns.length === 0 ? (
            <Alert severity="info">No interns assigned to your teams yet.</Alert>
          ) : (
            <Grid container spacing={2}>
              {interns.map(intern => (
                <Grid item="true" xs={12} sm={6} md={4} key={intern.emp_id}>
                  <Box sx={{ p: 2, border: '1px solid var(--border-subtle)', borderRadius: 2, display: 'flex', gap: 2 }}>
                    <Avatar sx={{ bgcolor: 'var(--color-primary)', width: 44, height: 44 }}>
                      {intern.full_name?.charAt(0)}
                    </Avatar>
                    <Box>
                      <Typography variant="body2" fontWeight={600}>{intern.full_name}</Typography>
                      <Typography variant="caption" color="text.secondary">{intern.emp_id}</Typography>
                      <Box sx={{ mt: 0.5 }}>
                        <Chip label={intern.user_status || 'active'} size="small" color="success" />
                      </Box>
                    </Box>
                  </Box>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      )}
    </motion.div>
  );
}

// ── Projects sub-view ─────────────────────────────────────────────────────────
function ProjectsMentorView() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    api.get('/Sims/projects/')
      .then(res => setProjects(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const statusColor = (s) => ({ active: 'success', completed: 'primary', planning: 'warning', on_hold: 'default' }[s] || 'default');

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <Box className="page-header">
        <Typography variant="h4" fontWeight={800}>Assigned Projects</Typography>
        <Typography variant="body2" color="text.secondary">Projects assigned to your teams</Typography>
      </Box>
      {loading ? <LoadingSpinner text="Loading projects..." /> : (
        <Box className="glass-card" sx={{ p: 3 }}>
          {projects.length === 0 ? (
            <Alert severity="info">No projects assigned to your teams yet.</Alert>
          ) : (
            <Grid container spacing={2}>
              {projects.map(p => (
                <Grid item="true" xs={12} sm={6} key={p.id}>
                  <Box sx={{ p: 2.5, border: '1px solid var(--border-subtle)', borderRadius: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography fontWeight={700}>{p.name}</Typography>
                      <Chip label={p.status} color={statusColor(p.status)} size="small" />
                    </Box>
                    <Typography variant="body2" color="text.secondary">{p.description || 'No description'}</Typography>
                    <Divider sx={{ my: 1 }} />
                    <Typography variant="caption" color="text.secondary">
                      Team: {p.team_name || 'Unassigned'} · Domain: {p.domain_name || '—'}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      )}
    </motion.div>
  );
}

// ── Mentor Overview ──────────────────────────────────────────────────────────
function MentorOverview() {
  const [stats, setStats]     = useState({ teams: 0, interns: 0, pendingLeaves: 0, tasks: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/Sims/teams/'),
      api.get('/Sims/attendances/leave_approval/'),
      api.get('/Sims/tasks/'),
    ])
      .then(([teamsRes, leaveRes, taskRes]) => {
        const myInterns = teamsRes.data.reduce((acc, t) => acc + (t.intern_count || 0), 0);
        setStats({
          teams:        teamsRes.data.length,
          interns:      myInterns,
          pendingLeaves:leaveRes.data.length,
          tasks:        taskRes.data.length,
        });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
      <Box className="page-header">
        <Box>
          <Typography variant="h4" fontWeight={800}>Mentor Dashboard</Typography>
          <Typography variant="body2" color="text.secondary">
            Team management · Task assignment · Leave approvals
          </Typography>
        </Box>
      </Box>

      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        {[
          { label: 'My Teams',       value: stats.teams,         color: '#6366f1', icon: <Workspaces /> },
          { label: 'My Interns',     value: stats.interns,       color: '#22c55e', icon: <People /> },
          { label: 'Pending Leaves', value: stats.pendingLeaves, color: '#f59e0b', icon: <CalendarMonth /> },
          { label: 'Active Tasks',   value: stats.tasks,         color: '#3b82f6', icon: <Task /> },
        ].map((s, i) => (
          <Grid item="true" xs={6} sm={3} key={i}>
            <StatCard {...s} delay={i * 0.05} />
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={2.5}>
        {[
          { icon: <Workspaces sx={{ fontSize: 40 }} />, title: 'My Team',
            desc: 'Create teams and assign team leads from your interns', color: '#6366f1' },
          { icon: <Task sx={{ fontSize: 40 }} />, title: 'Task Assignment',
            desc: 'Assign tasks from your assigned projects to team members', color: '#3b82f6' },
          { icon: <CalendarMonth sx={{ fontSize: 40 }} />, title: 'Leave Approvals',
            desc: 'Review and approve leave requests from your team interns', color: '#f59e0b' },
          { icon: <People sx={{ fontSize: 40 }} />, title: 'My Interns',
            desc: 'View interns assigned to your team in your domain', color: '#22c55e' },
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

// ── Main router ───────────────────────────────────────────────────────────────
export default function MentorContent({ activeItem }) {
  switch (activeItem) {
    case 'dashboard': return <MentorOverview />;
    case 'teams':     return <TeamManagement />;
    case 'tasks':     return <TaskAssignmentPanel />;
    case 'leaves':    return <LeaveApprovalsPanel />;
    case 'leave-approvals': return <LeaveApprovalsPanel />;
    case 'feedback':        return <PerformanceFeedbackPage />;
    case 'profile':         return <UserProfile />;
    case 'audit-log':       return <MentorOverview />;
    case 'interns':   return <InternsMentorView />;
    case 'projects':  return <ProjectsMentorView />;
    default:          return <MentorOverview />;
  }
}
