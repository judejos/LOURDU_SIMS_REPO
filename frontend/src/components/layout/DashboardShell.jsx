/**
 * SIMS — Dashboard Shell
 * Reusable layout wrapper: Sidebar + Header + scrollable content area.
 */

import { useState, useEffect } from 'react';
import { Box } from '@mui/material';
import Header from './Header';
import Sidebar from './Sidebar';
import AIChatWidget from '../common/AIChatWidget';

export default function DashboardShell({ type, activeItem, onItemClick, children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  // Close sidebar on route change for mobile
  useEffect(() => {
    setSidebarOpen(false);
  }, [activeItem]);

  return (
    <Box className="dashboard-layout">
      <Sidebar
        type={type}
        activeItem={activeItem}
        onItemClick={(key) => {
          onItemClick(key);
        }}
        collapsed={collapsed}
        mobileOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <Box className="dashboard-content">
        {children}
      </Box>
      <AIChatWidget />
    </Box>
  );
}
