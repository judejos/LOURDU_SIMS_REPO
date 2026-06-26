/**
 * SIMS — Sidebar Component
 * Role-based navigation with collapsible mobile support.
 *
 * Role → Sidebar type mapping:
 *   superadmin → 'admin'      : View all data + transactions, add staff
 *   manager    → 'manager'    : Intern approval, payment history, certs, assets
 *   lead       → 'sme'        : Projects, domains, payment management
 *   mentor     → 'mentor'     : Team, tasks, leave approvals
 *   intern     → 'intern'     : Self-service dashboard
 */

import { useState, useEffect } from 'react';
import { 
  Box, Typography, Tooltip, Dialog, DialogTitle, DialogContent, 
  DialogActions, Button, FormControl, InputLabel, Select, MenuItem, 
  Alert, CircularProgress, Grid 
} from '@mui/material';
import { NavLink } from 'react-router-dom';
import {
  Dashboard, People, Assignment, Schedule, Inventory,
  Payment, Description, Feedback, Group, PersonAdd,
  Settings, Assessment, BarChart, AdminPanelSettings,
  Task, CalendarMonth, SmartToy, TrendingUp,
  FolderSpecial, Workspaces, Approval, Verified,
  AccountBalance, Domain, SupervisedUserCircle, LaptopMac
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { assetsAPI, usersAPI } from '../../services/api';
import vdartLogo from '../../assets/vdart-logo.png';

const MENU_CONFIG = {
  // ── Admin (superadmin) ─────────────────────────────────────────────────────
  admin: [
    { section: 'Overview' },
    { key: 'dashboard',         label: 'Dashboard',         icon: Dashboard },
    { section: 'Management' },
    { key: 'staff',             label: 'Staff management',  icon: People },
    { key: 'intern-directory',  label: 'Intern directory',  icon: SupervisedUserCircle },
    { key: 'payments',          label: 'Transactions',      icon: Payment },
    { section: 'System' },
    { key: 'audit-log',         label: 'Audit log',         icon: Description },
    { key: 'profile',           label: 'Profile',           icon: Settings },
  ],

  // ── Manager ────────────────────────────────────────────────────────────────
  manager: [
    { key: 'dashboard',       label: 'Dashboard',             icon: Dashboard },
    { key: 'attendance-history', label: 'Attendance History',  icon: Schedule },
    { key: 'intern-directory', label: 'Intern Directory',      icon: People },
    { key: 'payment-list',    label: 'Payment History',        icon: Payment },
    { key: 'certificates',    label: 'Certificate Approvals',  icon: Verified },
    { key: 'assets',          label: 'Asset Overview',         icon: Inventory },
    { key: 'performance-feedback', label: 'Performance Review', icon: Assessment },
    { key: 'profile',         label: 'Profile',                icon: Settings },
  ],

  // ── SME (lead) ─────────────────────────────────────────────────────────────
  sme: [
    { key: 'dashboard',     label: 'Dashboard',           icon: Dashboard },
    { key: 'attendance-history', label: 'Attendance History',  icon: Schedule },
    { key: 'projects',      label: 'Projects',             icon: FolderSpecial },
    { key: 'teams',         label: 'Teams',                icon: Group },
    { key: 'interns',       label: 'Intern Directory', icon: People },
    { key: 'payment-list',  label: 'Payment Management',   icon: Payment },
    { key: 'domains',     label: 'Domains',            icon: Domain },
    { key: 'profile',       label: 'Profile',              icon: Settings },
  ],

  // ── Mentor ─────────────────────────────────────────────────────────────────
  mentor: [
    { key: 'dashboard',  label: 'Dashboard',          icon: Dashboard },
    { key: 'attendance-history', label: 'Attendance History',  icon: Schedule },
    { key: 'projects',   label: 'Assigned Projects',   icon: FolderSpecial },
    { key: 'interns',    label: 'My Interns',          icon: People },
    { key: 'tasks',      label: 'Task Assignment',     icon: Task },
    { key: 'leaves',     label: 'Leave Approvals',     icon: Approval },
    { key: 'profile',    label: 'Profile',             icon: Settings },
  ],

  // ── Intern (self-service) ──────────────────────────────────────────────────
  intern: [
    { key: 'dashboard',      label: 'Dashboard',       icon: Dashboard },
    { key: 'my-projects',    label: 'My Projects & Mentor', icon: FolderSpecial },
    { key: 'tasks',          label: 'Tasks',            icon: Task },
    { key: 'attendance',     label: 'Attendance',       icon: Schedule },
    { key: 'leave',          label: 'Leave',            icon: CalendarMonth },
    { key: 'documents',      label: 'Documents',        icon: Description },
    { key: 'payments',       label: 'Payments',         icon: Payment },
    { key: 'assets',         label: 'Assets',           icon: Inventory },
    { key: 'performance',    label: 'Performance',      icon: Assessment },
    { key: 'ai-assistant',   label: 'AI Assistant',     icon: SmartToy },
    { key: 'mock-interview', label: 'AI Interview',     icon: SmartToy },
    { key: 'resume-builder', label: 'Resume Builder',   icon: Assignment },
    { key: 'exit-summary',   label: 'Exit Summary',     icon: TrendingUp },
    { key: 'learning',       label: 'Learning Path',    icon: Dashboard },
    { key: 'calendar',       label: 'Calendar',         icon: CalendarMonth },
    { key: 'profile',        label: 'Profile',          icon: Settings },
  ],

  // ── Legacy dashboard sidebars Kept for backward compatibility ──────────────
  task: [
    { key: 'dashboard',        label: 'Tasks Dashboard',   icon: Dashboard },
    { key: 'tasks',            label: 'Task List',          icon: Task },
    { key: 'projects',         label: 'Projects',           icon: FolderSpecial },
    { key: 'project-status',   label: 'Project Status',     icon: BarChart },
    { key: 'completion-review',label: 'Completion Review',  icon: Assignment },
    { key: 'teams',            label: 'Teams',              icon: Group },
  ],
  attendance: [
    { key: 'dashboard', label: 'Dashboard',        icon: Dashboard },
    { key: 'daily',     label: 'Daily Attendance', icon: Schedule },
    { key: 'log',       label: 'Attendance Log',   icon: Description },
    { key: 'leaves',    label: 'Leave Requests',   icon: CalendarMonth },
    { key: 'claims',    label: 'Attendance Claims', icon: Feedback },
    { key: 'profile',   label: 'Profile',          icon: Settings },
  ],
  asset: [
    { key: 'dashboard',    label: 'Dashboard',        icon: Dashboard },
    { key: 'management',   label: 'Asset Management', icon: Inventory },
    { key: 'intern-status',label: 'Intern Status',    icon: People },
    { key: 'reports',      label: 'Reports',          icon: BarChart },
  ],
  payroll: [
    { key: 'dashboard',  label: 'Dashboard',           icon: Dashboard },
    { key: 'management', label: 'Payment Management',  icon: Payment },
  ],
  'intern-mgmt': [
    { key: 'dashboard',   label: 'Dashboard',            icon: Dashboard },
    { key: 'assets',      label: 'Asset Management',     icon: Inventory },
    { key: 'laptops',     label: 'Assigned Laptops',     icon: LaptopMac },
    { key: 'interns',     label: 'Intern List',           icon: People },
    { key: 'documents',   label: 'Documents',             icon: Description },
    { key: 'feedback',    label: 'Feedback & Reviews',    icon: Feedback },
    { key: 'evaluations', label: 'Performance Evals',     icon: Assessment },
    { key: 'certificates',label: 'Certificates',          icon: Task },
    { key: 'forms',       label: 'Forms',                 icon: Assignment },
  ],
};

import { Block } from '@mui/icons-material';

export default function Sidebar({ type = 'admin', basePath = '', collapsed = false, mobileOpen = false, onClose }) {
  const { user } = useAuth();
  const rawItems = MENU_CONFIG[type] || MENU_CONFIG.admin;
  const items = (type === 'intern-mgmt' && user?.role !== 'staff' && user?.role !== 'superadmin')
    ? rawItems.filter(item => item.key !== 'laptops' && item.key !== 'assets')
    : rawItems;

  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [interns, setInterns] = useState([]);
  const [availableLaptops, setAvailableLaptops] = useState([]);
  const [selectedIntern, setSelectedIntern] = useState('');
  const [selectedLaptop, setSelectedLaptop] = useState('');
  const [dialogError, setDialogError] = useState('');
  const [dialogLoading, setDialogLoading] = useState(false);
  const [dialogActionLoading, setDialogActionLoading] = useState(false);

  const handleOpenAssign = async () => {
    setDialogError('');
    setSelectedIntern('');
    setSelectedLaptop('');
    setAssignDialogOpen(true);
    setDialogLoading(true);
    try {
      const [internRes, assetRes] = await Promise.all([
        usersAPI.internFullList(),
        assetsAPI.list()
      ]);
      setInterns(internRes.data || []);
      
      // Filter for available laptops
      const laptops = (assetRes.data || []).filter(a => 
        a.asset_type && 
        a.asset_type.toLowerCase().includes('laptop') && 
        a.status === 'available' &&
        !a.is_deleted
      );
      setAvailableLaptops(laptops);
    } catch (err) {
      console.error(err);
      setDialogError('Failed to fetch interns or available laptops.');
    } finally {
      setDialogLoading(false);
    }
  };

  const handleAssignSubmit = async () => {
    if (!selectedIntern || !selectedLaptop) {
      setDialogError('Please select both an intern and a laptop.');
      return;
    }
    setDialogError('');
    setDialogActionLoading(true);
    try {
      await assetsAPI.update(selectedLaptop, {
        assigned_to: selectedIntern,
        status: 'assigned',
        issue_date: new Date().toISOString().slice(0, 10)
      });
      setAssignDialogOpen(false);
      window.location.reload();
    } catch (err) {
      console.error(err);
      setDialogError('Failed to assign laptop. Please try again.');
    } finally {
      setDialogActionLoading(false);
    }
  };

  const renderIcon = (icon) => {
    if (!icon) return null;
    if (typeof icon === 'string') {
      return <i className={icon} />;
    }
    const IconComponent = icon;
    return <IconComponent className="icon" />;
  };

  return (
    <>
      {mobileOpen && (
        <Box
          sx={{ position: 'fixed', inset: 0, bgcolor: 'rgba(0,0,0,0.5)', zIndex: 90, display: { md: 'none' } }}
          onClick={onClose}
        />
      )}
      <aside className={`dashboard-sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'open' : ''}`}>
        <div 
          className="brand" 
          style={!collapsed ? { 
            flexDirection: 'column', 
            alignItems: 'center', 
            gap: '12px', 
            padding: '16px 8px 24px' 
          } : {}}
        >
          <img 
            src={vdartLogo} 
            alt="VDart Academy Logo" 
            className="brand-mark" 
            style={{ 
              width: !collapsed ? '64px' : '38px',
              height: !collapsed ? '64px' : '38px',
              borderRadius: '50%',
              objectFit: 'contain', 
              background: '#fff', 
              backgroundImage: 'none',
              padding: '4px',
              boxSizing: 'border-box',
            }} 
          />
          {!collapsed && (
            <div className="brand-text" style={{ textAlign: 'center' }}>
              <div className="brand-name" style={{ fontSize: '15.5px', fontWeight: 800, letterSpacing: '-0.01em' }}>
                VDart Academy
              </div>
            </div>
          )}
        </div>

        {/* Navigation Items */}
        <div className="sidebar-nav">
          {items.map((item, idx) => {
            if (item.section) {
              return !collapsed ? (
                <div key={`sec-${idx}`} className="nav-section-label">
                  {item.section}
                </div>
              ) : null;
            }

            const linkPath = `${basePath}/${item.key}`;

            if (item.disabled) {
              return collapsed ? (
                <Tooltip key={item.key} title={`${item.label} (Coming Soon)`} placement="right">
                  <div
                    style={{ justifyContent: 'center', padding: '12px', display: 'flex', opacity: 0.6, cursor: 'not-allowed' }}
                  >
                    {renderIcon(item.icon)}
                  </div>
                </Tooltip>
              ) : (
                <div
                  key={item.key}
                  className="sidebar-item"
                  style={{ display: 'flex', opacity: 0.6, cursor: 'not-allowed' }}
                >
                  {renderIcon(item.icon)}
                  <span>{item.label}</span>
                  {item.badge && <span className="sidebar-badge">{item.badge}</span>}
                </div>
              );
            }

            return collapsed ? (
              <Tooltip key={item.key} title={item.label} placement="right">
                <NavLink
                  to={linkPath}
                  className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
                  onClick={onClose}
                  style={{ justifyContent: 'center', padding: '12px', display: 'flex', textDecoration: 'none' }}
                >
                  {renderIcon(item.icon)}
                </NavLink>
              </Tooltip>
            ) : (
              <NavLink
                key={item.key}
                to={linkPath}
                className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
                onClick={onClose}
                style={{ display: 'flex', textDecoration: 'none' }}
              >
                {renderIcon(item.icon)}
                <span>{item.label}</span>
                {item.badge && <span className="sidebar-badge">{item.badge}</span>}
              </NavLink>
            );
          })}
        </div>

        {/* Bottom User Info matching prototype */}
        {!collapsed && (
          <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%', mt: 'auto' }}>
            <div className="sidebar-footer" style={{ marginTop: 0 }}>
              <div className="avatar-sm">
                {user?.fullName?.charAt(0) || user?.username?.charAt(0) || '?'}
              </div>
              <div className="sidebar-footer-text">
                <div className="sidebar-footer-name">{user?.fullName || user?.username}</div>
                <div className="sidebar-footer-role">
                  {user?.role === 'superadmin' ? 'Superadmin' : user?.role}
                </div>
              </div>
            </div>
            
            {/* New Option for Assigning Laptop */}
            {(user?.role === 'staff' || user?.role === 'superadmin') && (
              <Box sx={{ px: 2, pb: 2, pt: 0.5 }}>
                <Button
                  variant="outlined"
                  size="small"
                  fullWidth
                  startIcon={<LaptopMac fontSize="small" />}
                  onClick={handleOpenAssign}
                  sx={{
                    borderColor: 'rgba(109, 40, 217, 0.4)',
                    color: '#7f56da',
                    fontWeight: 700,
                    textTransform: 'none',
                    borderRadius: '8px',
                    py: 0.75,
                    '&:hover': {
                      borderColor: '#7f56da',
                      background: 'rgba(109, 40, 217, 0.08)',
                    }
                  }}
                >
                  Assign Laptop
                </Button>
              </Box>
            )}
          </Box>
        )}
      </aside>

      {/* ASSIGN LAPTOP DIALOG */}
      <Dialog
        open={assignDialogOpen}
        onClose={() => !dialogActionLoading && setAssignDialogOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            background: 'var(--glass-bg)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid var(--glass-border)',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--glass-shadow)',
          }
        }}
      >
        <DialogTitle sx={{ fontWeight: 800, color: 'var(--text-primary)' }}>
          Assign Laptop to Intern
        </DialogTitle>
        <DialogContent>
          {dialogError && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: 'var(--radius-sm)' }}>
              {dialogError}
            </Alert>
          )}
          {dialogLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress size={30} />
            </Box>
          ) : (
            <Grid container spacing={2.5} sx={{ mt: 0.5 }}>
              <Grid item xs={12}>
                <FormControl fullWidth size="small">
                  <InputLabel id="assign-intern-label">Select Intern</InputLabel>
                  <Select
                    labelId="assign-intern-label"
                    value={selectedIntern}
                    label="Select Intern"
                    onChange={(e) => setSelectedIntern(e.target.value)}
                    disabled={dialogActionLoading}
                  >
                    {interns.map(i => (
                      <MenuItem key={i.id} value={i.id}>
                        {i.full_name} ({i.emp_id} - {i.domain_name || 'No Domain'})
                      </MenuItem>
                    ))}
                    {interns.length === 0 && (
                      <MenuItem disabled>No interns found</MenuItem>
                    )}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth size="small">
                  <InputLabel id="assign-laptop-label">Select Available Laptop</InputLabel>
                  <Select
                    labelId="assign-laptop-label"
                    value={selectedLaptop}
                    label="Select Available Laptop"
                    onChange={(e) => setSelectedLaptop(e.target.value)}
                    disabled={dialogActionLoading}
                  >
                    {availableLaptops.map(l => (
                      <MenuItem key={l.id} value={l.id}>
                        {l.asset_code} - {l.name || 'Generic Laptop'}
                      </MenuItem>
                    ))}
                    {availableLaptops.length === 0 && (
                      <MenuItem disabled>No available laptops in stock</MenuItem>
                    )}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button 
            onClick={() => setAssignDialogOpen(false)} 
            disabled={dialogActionLoading} 
            sx={{ color: 'var(--text-secondary)' }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleAssignSubmit}
            variant="contained"
            disabled={!selectedIntern || !selectedLaptop || dialogActionLoading || dialogLoading}
            startIcon={dialogActionLoading && <CircularProgress size={16} color="inherit" />}
            sx={{
              fontWeight: 700,
              background: 'linear-gradient(135deg, var(--primary-500), var(--primary-700))',
            }}
          >
            Assign Laptop
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}


