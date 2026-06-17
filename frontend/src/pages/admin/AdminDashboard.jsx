/**
 * SIMS — Admin Dashboard (role-aware shell)
 *
 * Routes the logged-in staff user to their role-specific content:
 *   superadmin → AdminContent   (view all, add staff)
 *   manager    → ManagerContent (onboarding, payment history, certs, assets)
 *   lead (SME) → SMEContent     (projects, domains, payment management)
 *   mentor     → MentorContent  (team, tasks, leave approvals)
 */

import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import DashboardShell from '../../components/layout/DashboardShell';

// Role-specific dashboard content
import AdminContent   from './role-dashboards/AdminContent';
import ManagerContent from './role-dashboards/ManagerContent';
import SMEContent     from './role-dashboards/SMEContent';
import MentorContent  from './role-dashboards/MentorContent';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [activeItem, setActiveItem] = useState('dashboard');

  // Resolve which content component + active-item handler to use
  const renderContent = () => {
    switch (user?.role) {
      case 'superadmin': return <AdminContent   activeItem={activeItem} />;
      case 'manager':    return <ManagerContent activeItem={activeItem} />;
      case 'lead':       return <SMEContent     activeItem={activeItem} />;
      case 'mentor':     return <MentorContent  activeItem={activeItem} />;
      default:           return <AdminContent   activeItem={activeItem} />;
    }
  };

  return (
    <DashboardShell type="admin" activeItem={activeItem} onItemClick={setActiveItem}>
      {renderContent()}
    </DashboardShell>
  );
}
