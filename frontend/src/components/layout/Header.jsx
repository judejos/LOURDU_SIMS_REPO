/**
 * SIMS — Header Component
 * Fixed top bar with search, notifications, dark mode toggle, and user avatar.
 */

import { useState, useEffect } from 'react';
import {
  Box, IconButton, Avatar, Typography,
  Menu, MenuItem, Divider, Tooltip,
} from '@mui/material';
import {
  DarkMode as DarkIcon,
  LightMode as LightIcon,
  Logout as LogoutIcon,
  Person as PersonIcon,
  Menu as MenuIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useThemeMode } from '../../contexts/ThemeContext';
import NotificationMenu from './NotificationMenu';
import GlobalSearch from '../common/GlobalSearch';

export default function Header({ onToggleSidebar }) {
  const { user, logout } = useAuth();
  const { mode, toggleTheme } = useThemeMode();
  const [anchorEl, setAnchorEl] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Initial fetch handled by NotificationMenu inside
  }, []);

  const handleLogout = async () => {
    setAnchorEl(null);
    await logout();
    window.location.href = '/loginpage';
  };

  return (
    <Box className="dashboard-header" sx={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      px: 3, gap: 2,
    }}>
      {/* Left: Menu toggle + Search */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
        <IconButton onClick={onToggleSidebar} sx={{ display: { md: 'none' } }}>
          <MenuIcon />
        </IconButton>

        <GlobalSearch />
      </Box>

      {/* Right: Actions */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Tooltip title={mode === 'dark' ? 'Light Mode' : 'Dark Mode'}>
          <IconButton onClick={toggleTheme} size="small">
            {mode === 'dark' ? <LightIcon fontSize="small" /> : <DarkIcon fontSize="small" />}
          </IconButton>
        </Tooltip>

        <Tooltip title="Notifications">
          <Box sx={{ display: 'flex' }}>
            <NotificationMenu unreadCount={unreadCount} setUnreadCount={setUnreadCount} />
          </Box>
        </Tooltip>

        <Box
          onClick={(e) => setAnchorEl(e.currentTarget)}
          sx={{
            display: 'flex', alignItems: 'center', gap: 1.5,
            cursor: 'pointer', ml: 1, px: 1.5, py: 0.5,
            borderRadius: 3, '&:hover': { bgcolor: 'action.hover' },
          }}
        >
          <Avatar sx={{
            width: 34, height: 34,
            background: 'var(--gradient-primary)',
            fontSize: '0.85rem', fontWeight: 700,
          }}>
            {user.fullName?.charAt(0) || user.username?.charAt(0) || '?'}
          </Avatar>
          <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
            <Typography variant="body2" fontWeight={600} sx={{ lineHeight: 1.2 }}>
              {user.fullName || user.username}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'capitalize' }}>
              {user.role}
            </Typography>
          </Box>
        </Box>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={() => setAnchorEl(null)}
          PaperProps={{ sx: { minWidth: 180, mt: 1 } }}
        >
          <MenuItem disabled>
            <Typography variant="caption" color="text.secondary">
              {user.empId}
            </Typography>
          </MenuItem>
          <Divider />
          <MenuItem onClick={() => setAnchorEl(null)}>
            <PersonIcon fontSize="small" sx={{ mr: 1 }} /> Profile
          </MenuItem>
          <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
            <LogoutIcon fontSize="small" sx={{ mr: 1 }} /> Logout
          </MenuItem>
        </Menu>
      </Box>
    </Box>
  );
}
