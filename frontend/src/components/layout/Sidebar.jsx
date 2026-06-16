/**
 * SIMS — Sidebar Component
 * Role-based navigation with collapsible mobile support.
 */

import { Box, Typography, Tooltip } from '@mui/material';
import {
  Dashboard, People, Assignment, Schedule, Inventory,
  Payment, Description, Feedback, Group, PersonAdd,
  Settings, Assessment, BarChart, AdminPanelSettings,
  Home, Task, CalendarMonth, SmartToy, TrendingUp,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

const MENU_CONFIG = {
  admin: [
    { key: 'dashboard', label: 'Dashboard', icon: Dashboard },
    { key: 'staff', label: 'Staff', icon: People },
    { key: 'interns', label: 'Interns', icon: People },
    { key: 'payments', label: 'Payments', icon: Payment },
    { key: 'departments', label: 'Departments', icon: AdminPanelSettings },
    { key: 'entities', label: 'Entities', icon: AdminPanelSettings },
    { key: 'feedback', label: 'Feedback', icon: Feedback },
    { key: 'teams', label: 'Teams', icon: Group },
    { key: 'register', label: 'Register', icon: PersonAdd },
    { key: 'audit-log', label: 'Audit Log', icon: Description },
    { key: 'delegation', label: 'Delegation', icon: Group },
    { key: 'webhooks', label: 'Webhooks', icon: Settings },
    { key: 'ai-reports', label: 'AI Reports', icon: SmartToy },
    { key: 'profile', label: 'Profile', icon: Settings },
  ],
  intern: [
    { key: 'dashboard', label: 'Dashboard', icon: Dashboard },
    { key: 'tasks', label: 'Tasks', icon: Task },
    { key: 'attendance', label: 'Attendance', icon: Schedule },
    { key: 'leave', label: 'Leave', icon: CalendarMonth },
    { key: 'documents', label: 'Documents', icon: Description },
    { key: 'payments', label: 'Payments', icon: Payment },
    { key: 'assets', label: 'Assets', icon: Inventory },
    { key: 'performance', label: 'Performance', icon: Assessment },
    { key: 'teams', label: 'Teams', icon: Group },
    { key: 'ai-assistant', label: 'AI Assistant', icon: SmartToy },
    { key: 'mock-interview', label: 'AI Interview', icon: SmartToy },
    { key: 'resume-builder', label: 'Resume Builder', icon: Assignment },
    { key: 'exit-summary', label: 'Exit Summary', icon: TrendingUp },
    { key: 'learning', label: 'Learning Path', icon: Dashboard },
    { key: 'calendar', label: 'Calendar', icon: CalendarMonth },
    { key: 'profile', label: 'Profile', icon: Settings },
  ],
  task: [
    { key: 'dashboard', label: 'Tasks Dashboard', icon: Dashboard },
    { key: 'tasks', label: 'Task List', icon: Task },
    { key: 'projects', label: 'Projects', icon: Assignment },
    { key: 'project-status', label: 'Project Status', icon: BarChart },
    { key: 'completion-review', label: 'Completion Review', icon: Assignment },
    { key: 'teams', label: 'Teams', icon: Group },
    { key: 'departments', label: 'Departments', icon: AdminPanelSettings },
  ],
  attendance: [
    { key: 'dashboard', label: 'Dashboard', icon: Dashboard },
    { key: 'daily', label: 'Daily Attendance', icon: Schedule },
    { key: 'log', label: 'Attendance Log', icon: Description },
    { key: 'leaves', label: 'Leave Requests', icon: CalendarMonth },
    { key: 'claims', label: 'Attendance Claims', icon: Feedback },
    { key: 'profile', label: 'Profile', icon: Settings },
  ],
  asset: [
    { key: 'dashboard', label: 'Dashboard', icon: Dashboard },
    { key: 'management', label: 'Asset Management', icon: Inventory },
    { key: 'intern-status', label: 'Intern Status', icon: People },
    { key: 'reports', label: 'Reports', icon: BarChart },
  ],
  payroll: [
    { key: 'dashboard', label: 'Dashboard', icon: Dashboard },
    { key: 'management', label: 'Payment Management', icon: Payment },
  ],
  'intern-mgmt': [
    { key: 'dashboard', label: 'Dashboard', icon: Dashboard },
    { key: 'onboarding', label: 'Onboarding Requests', icon: PersonAdd },
    { key: 'interns', label: 'Intern List', icon: People },
    { key: 'documents', label: 'Documents', icon: Description },
    { key: 'feedback', label: 'Feedback & Reviews', icon: Feedback },
    { key: 'evaluations', label: 'Performance Evals', icon: Assessment },
    { key: 'certificates', label: 'Certificates', icon: Task },
    { key: 'forms', label: 'Forms', icon: Assignment },
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
              {user.role}
            </Typography>
          </Box>
        </Box>
      )}
    </Box>
    </>
  );
}
