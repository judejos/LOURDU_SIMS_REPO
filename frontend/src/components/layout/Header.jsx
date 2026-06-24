/**
 * SIMS — Header Component
 * Fixed top bar with search, notifications, dark mode toggle, and user avatar.
 */

import { useState, useEffect } from 'react';
import {
  Box, IconButton, Avatar, Typography,
  Menu, MenuItem, Divider, Tooltip,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import {
  DarkMode as DarkIcon,
  LightMode as LightIcon,
  Logout as LogoutIcon,
  Person as PersonIcon,
  Menu as MenuIcon,
  Mail as MailIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useThemeMode } from '../../contexts/ThemeContext';
import NotificationMenu from './NotificationMenu';
import GlobalSearch from '../common/GlobalSearch';

export default function Header({ onToggleSidebar }) {
  const { user, logout } = useAuth();
  const { mode, toggleTheme } = useThemeMode();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Initial fetch handled by NotificationMenu inside
  }, []);

  const handleLogout = async () => {
    setAnchorEl(null);
    await logout();
    window.location.href = '/';
  };

  return (
    <div className="dashboard-header">
      {/* Left: Menu toggle + Search */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1 }}>
        <IconButton onClick={onToggleSidebar} sx={{ display: { md: 'none' }, color: 'var(--text-primary)' }}>
          <MenuIcon />
        </IconButton>

        <GlobalSearch />
      </div>

      {/* Right: Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div className="icon-btn">
          <MailIcon style={{ fontSize: '18px' }} />
        </div>

        <NotificationMenu unreadCount={unreadCount} setUnreadCount={setUnreadCount} />

        <div
          className="topbar-user"
          onClick={(e) => setAnchorEl(e.currentTarget)}
        >
          <div className="avatar-topbar">
            {user.fullName?.charAt(0) || user.username?.charAt(0) || '?'}
          </div>
          <div className="topbar-user-text">
            <div className="topbar-user-name">{user.fullName || user.username}</div>
            <div className="topbar-user-role">
              {user.role === 'superadmin' ? 'Superadmin' : user.role}
            </div>
          </div>
        </div>


        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={() => setAnchorEl(null)}
          PaperProps={{ sx: { minWidth: 180, mt: 1 } }}
        >
          <MenuItem disabled sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', opacity: '1 !important', py: 1, borderBottom: '1px solid var(--border-subtle)' }}>
            <Typography variant="subtitle2" color="text.primary" fontWeight="bold">
              {user.username}
            </Typography>
            <Typography variant="caption" color="text.primary">
              ID: {user.empId}
            </Typography>
            {user.email && (
              <Typography variant="caption" color="text.secondary">
                {user.email}
              </Typography>
            )}
          </MenuItem>
          <MenuItem onClick={() => { setAnchorEl(null); navigate('profile'); }}>
            <PersonIcon fontSize="small" sx={{ mr: 1 }} /> Profile
          </MenuItem>
          <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
            <LogoutIcon fontSize="small" sx={{ mr: 1 }} /> Logout
          </MenuItem>
        </Menu>
      </div>
    </div>
  );
}
