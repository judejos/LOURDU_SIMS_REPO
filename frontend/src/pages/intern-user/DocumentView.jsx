import { useState } from 'react';
import { Box, Typography, Paper, Grid, Card, CardContent, IconButton, Button, Chip } from '@mui/material';
import { Description, CloudUpload, Download, MoreVert } from '@mui/icons-material';
import { motion } from 'framer-motion';

const MOCK_DOCS = [
  { id: 1, name: 'Offer Letter.pdf', type: 'Official', date: '2026-06-01', size: '2.4 MB', status: 'Verified' },
  { id: 2, name: 'ID Card.pdf', type: 'Identity', date: '2026-06-05', size: '1.1 MB', status: 'Pending Review' },
  { id: 3, name: 'NDA_Signed.docx', type: 'Legal', date: '2026-06-02', size: '540 KB', status: 'Verified' },
];

export default function DocumentView() {
  const [docs, setDocs] = useState(MOCK_DOCS);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <Box className="page-header" sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" fontWeight={800}>My Documents</Typography>
          <Typography variant="body2" color="text.secondary">
            View and manage your official documents.
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<CloudUpload />}>Upload Document</Button>
      </Box>

      <Grid container spacing={3}>
        {docs.map(doc => (
          <Grid item="true" xs={12} sm={6} md={4} key={doc.id}>
            <Card className="glass-card" sx={{ height: '100%', position: 'relative' }}>
              <IconButton size="small" sx={{ position: 'absolute', top: 8, right: 8 }}>
                <MoreVert fontSize="small" />
              </IconButton>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'primary.light', color: 'primary.main' }}>
                    <Description />
                  </Box>
                  <Box>
                    <Typography variant="subtitle1" fontWeight={700} noWrap sx={{ maxWidth: 180 }}>
                      {doc.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">{doc.size} • {doc.date}</Typography>
                  </Box>
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 3 }}>
                  <Chip 
                    label={doc.status} 
                    size="small" 
                    color={doc.status === 'Verified' ? 'success' : 'warning'} 
                  />
                  <IconButton size="small" color="primary">
                    <Download fontSize="small" />
                  </IconButton>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </motion.div>
  );
}
