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
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useThemeMode } from '../../contexts/ThemeContext';
import NotificationMenu from './NotificationMenu';
import GlobalSearch from '../common/GlobalSearch';

export default function Header({ basePath = '', onToggleSidebar }) {
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
              {user.role === 'superadmin' ? 'Super Admin' : (user.role === 'sme' ? 'SME' : (user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : ''))}
            </div>
          </div>
        </div>


        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={() => setAnchorEl(null)}
          PaperProps={{
            sx: {
              minWidth: 220,
              mt: 1.5,
              background: 'var(--glass-bg)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid var(--glass-border)',
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--glass-shadow)',
              padding: '4px 0',
              overflow: 'visible',
              '& .MuiList-root': {
                padding: 0,
              },
            }
          }}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          {/* User Info Header */}
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'flex-start', 
            py: 2, 
            px: 2.5, 
            borderBottom: '1px solid var(--glass-border)',
            background: 'rgba(255, 255, 255, 0.02)',
          }}>
            <Typography variant="subtitle2" color="var(--text-primary)" fontWeight={700} sx={{ textTransform: 'capitalize', fontSize: '14.5px', letterSpacing: '-0.01em', mb: 0.5 }}>
              {user.username}
            </Typography>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25 }}>
              <Typography variant="caption" sx={{ color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)', fontSize: '10.5px' }}>
                ID: {user.empId}
              </Typography>
              {user.email && (
                <Typography variant="caption" sx={{ color: 'var(--text-secondary)', fontSize: '11.5px', wordBreak: 'break-all' }}>
                  {user.email}
                </Typography>
              )}
            </Box>
          </Box>

          {/* Menu Items */}
          <MenuItem 
            onClick={() => { setAnchorEl(null); navigate(`${basePath}/profile`); }}
            sx={{
              py: 1.25,
              px: 2.5,
              gap: 1.5,
              color: 'var(--text-secondary)',
              fontSize: '13.5px',
              fontWeight: 500,
              transition: 'all var(--transition-fast)',
              '&:hover': {
                background: 'var(--bg-hover)',
                color: 'var(--text-primary)',
                '& svg': {
                  color: 'var(--primary-500)',
                  transform: 'scale(1.05)',
                }
              },
              '& svg': {
                color: 'var(--primary-500)',
                fontSize: '18px',
                transition: 'all var(--transition-fast)',
              }
            }}
          >
            <PersonIcon /> Profile
          </MenuItem>

          <MenuItem 
            onClick={handleLogout} 
            sx={{ 
              py: 1.25,
              px: 2.5,
              gap: 1.5,
              color: 'var(--error-500)',
              fontSize: '13.5px',
              fontWeight: 600,
              transition: 'all var(--transition-fast)',
              borderTop: '1px solid var(--glass-border)',
              '&:hover': { 
                background: 'var(--error-bg)',
                color: 'var(--error-500)',
                '& svg': {
                  transform: 'scale(1.05)',
                }
              },
              '& svg': {
                fontSize: '18px',
                transition: 'all var(--transition-fast)',
              }
            }}
          >
            <LogoutIcon /> Logout
          </MenuItem>
        </Menu>
      </div>
    </div>
  );
}
