/**
 * SIMS — Intern Management Dashboard (Staff Side)
 */
import { useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Box, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import DashboardShell from '../../components/layout/DashboardShell';

import InternLists from '../admin/InternLists';
import OnboardingList from './OnboardingList';
import InternProfile from './InternProfile';

import DocumentManagement from './DocumentManagement';
import FeedbackManagement from './FeedbackManagement';
import PerformanceEvaluations from './PerformanceEvaluations';
import CertificateGeneration from './CertificateGeneration';
import InternManagementLists from './InternManagementLists';
import DocumentView from './DocumentView';
import PerformanceFeedbackList from './PerformanceFeedbackList';
import Forms from './Forms';
import FormResponses from './FormResponses';
import FormAnalytics from './FormAnalytics';
import ApproveDashboard from './ApproveDashboard';
import CompletionList from './CompletionList';
import AIInsightsPage from './AIInsightsPage';

const MENU = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'onboarding', label: 'Onboarding Requests' },
  { key: 'interns', label: 'Intern List' },
  { key: 'documents', label: 'Documents' },
  { key: 'feedback', label: 'Feedback & Reviews' },
  { key: 'evaluations', label: 'Performance Evals' },
  { key: 'certificates', label: 'Certificates' },
  { key: 'forms', label: 'Forms' },
];

export default function InternMgmtDashboard() {
  const location = useLocation();

  // Extract the active item from the URL path.
  const pathParts = location.pathname.split('/').filter(Boolean);
  const activeItem = pathParts.length > 1 ? pathParts[1] : 'dashboard';

  const renderContent = () => {
    switch (activeItem) {
      case 'onboarding': return <OnboardingList />;
      case 'interns': return <InternLists />;
      case 'documents': return <DocumentManagement />;
      case 'feedback': return <FeedbackManagement />;
      case 'evaluations': return <PerformanceEvaluations />;
      case 'certificates': return <CertificateGeneration />;
      case 'intern-lists': return <InternManagementLists />;
      case 'doc-view': return <DocumentView />;
      case 'feedback-list': return <PerformanceFeedbackList />;
      case 'forms': return <Forms />;
      case 'form-responses': return <FormResponses />;
      case 'form-analytics': return <FormAnalytics />;
      case 'approves': return <ApproveDashboard />;
      case 'completions': return <CompletionList />;
      case 'ai-insights': return <AIInsightsPage />;
      // case 'profile': return <InternProfile />; // Profile is usually accessed via routing /intern/profile/:id, handled separately if needed
      default: return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <Box className="page-header">
            <Typography variant="h4" fontWeight={800} sx={{ textTransform: 'capitalize' }}>
              {activeItem === 'dashboard' ? 'Intern Management' : activeItem.replace(/-/g, ' ')}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Manage interns, documents, feedback, and forms.
            </Typography>
          </Box>
          <Box className="glass-card" sx={{ p: 6, textAlign: 'center' }}>
            <Typography variant="h5" fontWeight={700} sx={{
              background: 'var(--gradient-primary)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>
              {activeItem === 'dashboard' ? 'Intern Management Ready' : 'Module Scaffold Ready'}
            </Typography>
            <Typography variant="body2" color="text.secondary" mt={1}>
              Backend API is fully functional. Frontend UI coming in the next phase.
            </Typography>
          </Box>
        </motion.div>
      );
    }
  };

  return (
    <DashboardShell type="intern-mgmt" basePath="/intern">
      <Routes>
        <Route path="/" element={<Navigate to="dashboard" replace />} />
        <Route path="*" element={renderContent()} />
      </Routes>
    </DashboardShell>
  );
}
