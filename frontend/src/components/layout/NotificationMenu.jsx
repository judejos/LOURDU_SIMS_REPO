import { useState, useEffect } from 'react';
import { 
  Box, Typography, Paper, IconButton, Badge, Menu, MenuItem, Divider, Button, Avatar 
} from '@mui/material';
import { 
  Notifications as NotifIcon, DoneAll, Settings, EventNote, Task, Warning, Info 
} from '@mui/icons-material';
import { notificationsAPI } from '../../services/api';

export default function NotificationMenu({ unreadCount, setUnreadCount }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await notificationsAPI.list();
      setNotifications(res.data);
      const unread = res.data.filter(n => !n.is_read).length;
      if (setUnreadCount) setUnreadCount(unread);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = (e) => {
    setAnchorEl(e.currentTarget);
    fetchNotifications();
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleMarkRead = async (id, e) => {
    e.stopPropagation();
    try {
      await notificationsAPI.markRead(id);
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationsAPI.markAllRead();
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const getIcon = (type) => {
    switch(type) {
      case 'task': return <Task sx={{ color: 'primary.main', fontSize: 20 }} />;
      case 'leave': return <EventNote sx={{ color: 'warning.main', fontSize: 20 }} />;
      case 'system': return <Warning sx={{ color: 'error.main', fontSize: 20 }} />;
      default: return <Info sx={{ color: 'info.main', fontSize: 20 }} />;
    }
  };

  return (
    <>
      <IconButton size="small" onClick={handleOpen}>
        <Badge badgeContent={unreadCount} color="error" max={99}>
          <NotifIcon fontSize="small" />
        </Badge>
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{
          sx: { width: 360, maxHeight: 500, mt: 1, borderRadius: 3, boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" fontWeight={700}>Notifications</Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <IconButton size="small" onClick={handleMarkAllRead} title="Mark all as read" disabled={unreadCount === 0}>
              <DoneAll fontSize="small" />
            </IconButton>
            <IconButton size="small" title="Notification settings">
              <Settings fontSize="small" />
            </IconButton>
          </Box>
        </Box>
        <Divider />

        <Box sx={{ maxHeight: 380, overflowY: 'auto' }}>
          {loading && notifications.length === 0 ? (
            <Box sx={{ p: 4, textAlign: 'center' }}><Typography variant="body2" color="text.secondary">Loading...</Typography></Box>
          ) : notifications.length > 0 ? (
            notifications.map((notif) => (
              <MenuItem 
                key={notif.id} 
                onClick={handleClose}
                sx={{ 
                  py: 1.5, px: 2, 
                  bgcolor: notif.is_read ? 'transparent' : 'rgba(108, 63, 224, 0.05)',
                  borderBottom: '1px solid', borderColor: 'divider',
                  whiteSpace: 'normal', display: 'flex', alignItems: 'flex-start', gap: 2
                }}
              >
                <Box sx={{ mt: 0.5, p: 1, bgcolor: 'action.hover', borderRadius: '50%' }}>
                  {getIcon(notif.notification_type)}
                </Box>
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="body2" fontWeight={notif.is_read ? 400 : 700} color={notif.is_read ? 'text.primary' : 'text.primary'}>
                    {notif.title}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
                    {notif.message}
                  </Typography>
                  <Typography variant="caption" color="text.disabled" display="block" sx={{ mt: 0.5 }}>
                    {new Date(notif.created_at).toLocaleString()}
                  </Typography>
                </Box>
                {!notif.is_read && (
                  <Box 
                    sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'primary.main', mt: 1, flexShrink: 0 }}
                    onClick={(e) => handleMarkRead(notif.id, e)}
                    title="Mark as read"
                  />
                )}
              </MenuItem>
            ))
          ) : (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">No notifications found.</Typography>
            </Box>
          )}
        </Box>
        
        <Divider />
        <Box sx={{ p: 1, textAlign: 'center' }}>
          <Button size="small" sx={{ fontWeight: 600 }} onClick={handleClose}>View All Activity</Button>
        </Box>
      </Menu>
    </>
  );
}
