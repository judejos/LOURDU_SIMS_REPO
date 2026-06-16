import { useState } from 'react';
import { Box, Typography, Paper, Grid, Card, CardContent, IconButton, Button, Chip } from '@mui/material';
import { Domain, Group, MoreVert, Add } from '@mui/icons-material';
import { motion } from 'framer-motion';

const MOCK_DEPARTMENTS = [
  { id: 1, name: 'Engineering', head: 'Alice Smith', teamsCount: 4, internsCount: 24, status: 'Active' },
  { id: 2, name: 'Design', head: 'Bob Jones', teamsCount: 2, internsCount: 8, status: 'Active' },
  { id: 3, name: 'Marketing', head: 'Charlie Brown', teamsCount: 1, internsCount: 5, status: 'Active' },
  { id: 4, name: 'Human Resources', head: 'Diana Prince', teamsCount: 1, internsCount: 3, status: 'Active' },
];

export default function Departments() {
  const [departments, setDepartments] = useState(MOCK_DEPARTMENTS);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <Box className="page-header" sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" fontWeight={800}>Departments</Typography>
          <Typography variant="body2" color="text.secondary">
            Manage organizational departments and cross-functional groups.
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<Add />}>Add Department</Button>
      </Box>

      <Grid container spacing={3}>
        {departments.map(dept => (
          <Grid item="true" xs={12} sm={6} md={4} key={dept.id}>
            <Card className="glass-card" sx={{ height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>
              <IconButton size="small" sx={{ position: 'absolute', top: 8, right: 8 }}>
                <MoreVert fontSize="small" />
              </IconButton>
              <CardContent sx={{ p: 3, flex: 1, display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'primary.light', color: 'primary.main' }}>
                    <Domain />
                  </Box>
                  <Box>
                    <Typography variant="h6" fontWeight={700} sx={{ lineHeight: 1.2 }}>{dept.name}</Typography>
                    <Typography variant="caption" color="text.secondary">Head: {dept.head}</Typography>
                  </Box>
                </Box>
                
                <Box sx={{ display: 'flex', gap: 2, mt: 'auto', pt: 2, borderTop: '1px solid var(--border-subtle)' }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="caption" color="text.secondary">Teams</Typography>
                    <Typography variant="h6" fontWeight={700}>{dept.teamsCount}</Typography>
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="caption" color="text.secondary">Interns</Typography>
                    <Typography variant="h6" fontWeight={700}>{dept.internsCount}</Typography>
                  </Box>
                  <Box sx={{ flex: 1, textAlign: 'right' }}>
                    <Typography variant="caption" color="text.secondary">Status</Typography>
                    <Box mt={0.5}>
                      <Chip label={dept.status} size="small" color="success" sx={{ height: 20, fontSize: '0.7rem' }} />
                    </Box>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </motion.div>
  );
}
