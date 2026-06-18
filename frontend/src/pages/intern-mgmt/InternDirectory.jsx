import { useState } from 'react';
import { Box, Tabs, Tab } from '@mui/material';
import { motion } from 'framer-motion';

import InternLists from '../admin/InternLists';
import OnboardingList from './OnboardingList';

export default function InternDirectory() {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange} 
          indicatorColor="primary" 
          textColor="primary"
          sx={{ '& .MuiTab-root': { fontWeight: 600, fontSize: '1rem', textTransform: 'none' } }}
        >
          <Tab label="Active Interns" />
          <Tab label="Onboarding Approvals" />
        </Tabs>
      </Box>

      <Box>
        {tabValue === 0 && <InternLists isCombined={true} />}
        {tabValue === 1 && <OnboardingList isCombined={true} />}
      </Box>
    </motion.div>
  );
}
