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
import {
  Dashboard, People, Assignment, Schedule, Inventory,
  Payment, Description, Feedback, Group, PersonAdd,
  Settings, Assessment, BarChart, AdminPanelSettings,
  Task, CalendarMonth, SmartToy, TrendingUp,
  FolderSpecial, Workspaces, Approval, Verified,
  AccountBalance, Domain, SupervisedUserCircle,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

const MENU_CONFIG = {
  // ── Admin (superadmin) ─────────────────────────────────────────────────────
  // View-only for data + transactions; add/manage staff accounts
  admin: [
    { key: 'dashboard',   label: 'Dashboard',         icon: Dashboard },
    { key: 'interns',     label: 'All Interns',        icon: People },
    { key: 'staff',       label: 'Staff Management',   icon: SupervisedUserCircle },
    { key: 'payments',    label: 'Transactions',        icon: AccountBalance },
    { key: 'departments', label: 'Departments',         icon: AdminPanelSettings },
    { key: 'entities',    label: 'Entities',            icon: Domain },
    { key: 'teams',       label: 'Teams',               icon: Group },
    { key: 'audit-log',   label: 'Audit Log',           icon: Description },
    { key: 'profile',     label: 'Profile',             icon: Settings },
  ],

  // ── Manager ────────────────────────────────────────────────────────────────
  // Intern approval, payment history (view), certificate approval, asset view
  manager: [
    { key: 'dashboard',       label: 'Dashboard',             icon: Dashboard },
    { key: 'onboarding',      label: 'Onboarding Approvals',  icon: PersonAdd },
    { key: 'interns',         label: 'Intern List',            icon: People },
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
    { key: 'interns',       label: 'Interns (All Domains)', icon: People },
    { key: 'payment-list',  label: 'Payment Management',   icon: Payment },
    { key: 'departments',   label: 'Domains / Depts',      icon: Domain },
    { key: 'profile',       label: 'Profile',              icon: Settings },
  ],

  // ── Mentor ─────────────────────────────────────────────────────────────────
  // Single domain, create team, assign tasks from project, leave approval
  mentor: [
    { key: 'dashboard',  label: 'Dashboard',          icon: Dashboard },
    { key: 'teams',      label: 'My Team',             icon: Workspaces },
    { key: 'tasks',      label: 'Task Assignment',     icon: Task },
    { key: 'leaves',     label: 'Leave Approvals',     icon: Approval },
    { key: 'interns',    label: 'My Interns',          icon: People },
    { key: 'projects',   label: 'Assigned Projects',   icon: FolderSpecial },
    { key: 'profile',    label: 'Profile',             icon: Settings },
  ],

  // ── Intern (self-service) ──────────────────────────────────────────────────
  intern: [
    { key: 'dashboard',      label: 'Dashboard',       icon: Dashboard },
    { key: 'tasks',          label: 'Tasks',            icon: Task },
    { key: 'attendance',     label: 'Attendance',       icon: Schedule },
    { key: 'leave',          label: 'Leave',            icon: CalendarMonth },
    { key: 'documents',      label: 'Documents',        icon: Description },
    { key: 'payments',       label: 'Payments',         icon: Payment },
    { key: 'assets',         label: 'Assets',           icon: Inventory },
    { key: 'performance',    label: 'Performance',      icon: Assessment },
    { key: 'teams',          label: 'Teams',            icon: Group },
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
    { key: 'departments',      label: 'Departments',        icon: AdminPanelSettings },
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

export default function Sidebar({ type = 'admin', activeItem, onItemClick, collapsed = false, mobileOpen = false, onClose }) {
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
        <Box sx={{
          width: 36, height: 36, borderRadius: 2,
          background: 'var(--gradient-primary)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 900, color: '#fff', fontSize: '1rem', flexShrink: 0,
        }}>
          S
        </Box>
        {!collapsed && (
          <Box>
            <Typography variant="h6" sx={{
              fontWeight: 800, fontSize: '1.1rem',
              background: 'var(--gradient-primary)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>
              SIMS
            </Typography>
            <Typography variant="caption" sx={{ color: 'var(--text-secondary)', fontSize: '0.65rem' }}>
              Intern Management
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
             user.role === 'lead' ? 'SME' :
             user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'User'}
          </Typography>
        </Box>
      )}

      {/* Navigation Items */}
      <Box className="sidebar-nav">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = activeItem === item.key;

          return collapsed ? (
            <Tooltip key={item.key} title={item.label} placement="right">
              <button
                className={`sidebar-item ${isActive ? 'active' : ''}`}
                onClick={() => onItemClick(item.key)}
                style={{ justifyContent: 'center', padding: '12px' }}
              >
                <Icon className="icon" />
              </button>
            </Tooltip>
          ) : (
            <button
              key={item.key}
              className={`sidebar-item ${isActive ? 'active' : ''}`}
              onClick={() => onItemClick(item.key)}
            >
              <Icon className="icon" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </Box>

      {/* Bottom User Info */}
      {!collapsed && (
        <Box sx={{
          p: 2, borderTop: '1px solid var(--border-subtle)',
          display: 'flex', alignItems: 'center', gap: 1.5,
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
               user.role === 'lead' ? 'SME' : user.role}
            </Typography>
          </Box>
        </Box>
      )}
    </Box>
    </>
  );
}
