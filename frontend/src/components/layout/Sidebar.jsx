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

import { Box, Typography, Tooltip } from '@mui/material';
import { NavLink } from 'react-router-dom';
import {
  Dashboard, People, Assignment, Schedule, Inventory,
  Payment, Description, Feedback, Group, PersonAdd,
  Settings, Assessment, BarChart, AdminPanelSettings,
  Task, CalendarMonth, SmartToy, TrendingUp,
  FolderSpecial, Workspaces, Approval, Verified,
  AccountBalance, Domain, SupervisedUserCircle,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import vdartLogo from '../../assets/vdart-logo.png';

const MENU_CONFIG = {
  // ── Admin (superadmin) ─────────────────────────────────────────────────────
  // View-only for data + transactions; add/manage staff accounts
  admin: [
    { key: 'dashboard',   label: 'Dashboard',         icon: Dashboard },
    { key: 'staff',       label: 'Staff Management',   icon: SupervisedUserCircle },
    { key: 'intern-directory',  label: 'Intern Directory',  icon: People },
    { key: 'payments',    label: 'Transactions',        icon: AccountBalance },
    { key: 'audit-log',   label: 'Audit Log',           icon: Description },
    { key: 'profile',     label: 'Profile',             icon: Settings },
  ],

  // ── Manager ────────────────────────────────────────────────────────────────
  // Intern approval, payment history (view), certificate approval, asset view
  manager: [
    { key: 'dashboard',       label: 'Dashboard',             icon: Dashboard },
    { key: 'intern-directory', label: 'Intern Directory',      icon: People },
    { key: 'payment-list',    label: 'Payment History',        icon: Payment },
    { key: 'certificates',    label: 'Certificate Approvals',  icon: Verified },
    { key: 'assets',          label: 'Asset Overview',         icon: Inventory },
    { key: 'performance-feedback', label: 'Performance Review', icon: Assessment },
    { key: 'profile',         label: 'Profile',                icon: Settings },
  ],

  // ── SME (lead) ─────────────────────────────────────────────────────────────
  // All domains, create & assign projects, manage payment status, finalize
  sme: [
    { key: 'dashboard',     label: 'Dashboard',           icon: Dashboard },
    { key: 'projects',      label: 'Projects',             icon: FolderSpecial },
    { key: 'teams',         label: 'Teams',                icon: Group },
    { key: 'interns',       label: 'Intern Directory', icon: People },
    { key: 'payment-list',  label: 'Payment Management',   icon: Payment },
    { key: 'domains',     label: 'Domains',            icon: Domain },
    { key: 'profile',       label: 'Profile',              icon: Settings },
  ],

  // ── Mentor ─────────────────────────────────────────────────────────────────
  // Single domain, create team, assign tasks from project, leave approval
  mentor: [
    { key: 'dashboard',  label: 'Dashboard',          icon: Dashboard },
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

  // ── Legacy dashboard sidebars (kept for task/attendance/asset shell types) ─
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
    { key: 'onboarding',  label: 'Onboarding Requests',  icon: PersonAdd },
    { key: 'interns',     label: 'Intern List',           icon: People },
    { key: 'documents',   label: 'Documents',             icon: Description },
    { key: 'feedback',    label: 'Feedback & Reviews',    icon: Feedback },
    { key: 'evaluations', label: 'Performance Evals',     icon: Assessment },
    { key: 'certificates',label: 'Certificates',          icon: Task },
    { key: 'forms',       label: 'Forms',                 icon: Assignment },
  ],
};

export default function Sidebar({ type = 'admin', basePath = '', collapsed = false, mobileOpen = false, onClose }) {
  const { user } = useAuth();
  const items = MENU_CONFIG[type] || MENU_CONFIG.admin;

  return (
    <>
      {mobileOpen && (
        <Box
          sx={{ position: 'fixed', inset: 0, bgcolor: 'rgba(0,0,0,0.5)', zIndex: 90, display: { md: 'none' } }}
          onClick={onClose}
        />
      )}
      <Box className={`dashboard-sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'open' : ''}`}>
      {/* Logo */}
      <Box className="sidebar-logo">
        <Box 
          component="img"
          src={vdartLogo}
          alt="VDart Academy Logo"
          sx={{
            width: 36, height: 36, borderRadius: 1,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0, objectFit: 'contain', background: '#fff', p: 0.5
          }}
        />
        {!collapsed && (
          <Box>
            <Typography variant="h6" sx={{
              fontWeight: 800, fontSize: '1rem',
              background: 'var(--gradient-primary)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>
              VDart Academy
            </Typography>
            <Typography variant="caption" sx={{ color: 'var(--text-secondary)', fontSize: '0.65rem' }}>
              SIMS
            </Typography>
          </Box>
        )}
      </Box>

      {/* Role Badge */}
      {!collapsed && (
        <Box sx={{
          mx: 2, mb: 1, px: 1.5, py: 0.5, borderRadius: 2,
          background: 'var(--gradient-primary)', opacity: 0.15,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Typography variant="caption" sx={{
            fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1,
            background: 'var(--gradient-primary)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            fontSize: '0.65rem',
          }}>
            {user.role === 'superadmin' ? 'Admin' :
             user.role === 'sme' ? 'SME' :
             user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'User'}
          </Typography>
        </Box>
      )}

      {/* Navigation Items */}
      <Box className="sidebar-nav">
        {items.map((item) => {
          const Icon = item.icon;
          const linkPath = `${basePath}/${item.key}`;

          return collapsed ? (
            <Tooltip key={item.key} title={item.label} placement="right">
              <NavLink
                to={linkPath}
                className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
                onClick={onClose}
                style={{ justifyContent: 'center', padding: '12px', display: 'flex', textDecoration: 'none' }}
              >
                <Icon className="icon" />
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
              <Icon className="icon" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </Box>

      {/* Bottom User Info */}
      {!collapsed && (
        <Box sx={{
          p: 2, borderTop: '1px solid var(--border-subtle)',
          display: 'flex', alignItems: 'center', gap: 1.5, flexShrink: 0
        }}>
          <Box sx={{
            width: 32, height: 32, borderRadius: '50%',
            background: 'var(--gradient-primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.75rem', color: '#fff', fontWeight: 700,
          }}>
            {user.fullName?.charAt(0) || '?'}
          </Box>
          <Box sx={{ overflow: 'hidden' }}>
            <Typography variant="body2" fontWeight={600} noWrap sx={{ color: 'var(--text-primary)', fontSize: '0.8rem' }}>
              {user.fullName || user.username}
            </Typography>
            <Typography variant="caption" sx={{ color: 'var(--text-secondary)', textTransform: 'capitalize' }}>
              {user.role === 'superadmin' ? 'Admin' :
               user.role === 'sme' ? 'SME' : user.role}
            </Typography>
          </Box>
        </Box>
      )}
    </Box>
    </>
  );
}
