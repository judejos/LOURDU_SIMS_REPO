import { useState, useEffect } from 'react';
import { 
  Box, Typography, Paper, Grid, TextField, Button, Avatar, Chip, Dialog, DialogTitle, DialogContent
} from '@mui/material';
import { Add, AssignmentTurnedIn, BugReport } from '@mui/icons-material';
import { tasksAPI } from '../../services/api';
import { LoadingSpinner, PriorityBadge } from '../../components/common';
import { motion } from 'framer-motion';

export default function InternTasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const res = await tasksAPI.list();
      setTasks(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  if (loading) return <LoadingSpinner text="Loading your tasks..." />;

  const getStatusColor = (status) => {
    switch(status) {
      case 'todo': return 'error.main';
      case 'in-progress': return 'warning.main';
      case 'completed': return 'success.main';
      case 'under-review': return 'info.main';
      default: return 'text.secondary';
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <Box className="page-header" sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" fontWeight={800}>My Tasks</Typography>
          <Typography variant="body2" color="text.secondary">View and manage your assigned tasks.</Typography>
        </Box>
        <Button variant="outlined" startIcon={<AssignmentTurnedIn />}>Task History</Button>
      </Box>

      {/* Kanban-style simple columns */}
      <Grid container spacing={3}>
        {['todo', 'in-progress', 'completed'].map(column => {
          const colTasks = tasks.filter(t => t.status === column);
          return (
            <Grid item="true" xs={12} md={4} key={column}>
              <Box className="glass-card" sx={{ p: 2, height: '100%', bgcolor: 'background.default' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="subtitle1" fontWeight={700} sx={{ textTransform: 'capitalize', color: getStatusColor(column) }}>
                    {column.replace('-', ' ')}
                  </Typography>
                  <Chip size="small" label={colTasks.length} />
                </Box>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {colTasks.map(task => (
                    <Paper key={task.id} elevation={0} sx={{ p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider', cursor: 'pointer', transition: 'all 0.2s', '&:hover': { borderColor: 'primary.main', transform: 'translateY(-2px)' } }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Chip size="small" label={task.task_type} sx={{ height: 20, fontSize: '0.7rem' }} />
                        <PriorityBadge priority={task.priority} />
                      </Box>
                      <Typography fontWeight={700} variant="body2" mb={1}>{task.title}</Typography>
                      <Typography variant="caption" color="text.secondary" display="block" mb={2}>
                        Due: {task.deadline ? new Date(task.deadline).toLocaleDateString() : 'N/A'}
                      </Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="caption" fontWeight={600} color={task.progress === 100 ? 'success.main' : 'primary.main'}>
                          {task.progress}%
                        </Typography>
                        <Avatar sx={{ width: 24, height: 24, fontSize: '0.7rem', bgcolor: 'secondary.main' }}>
                          {task.assigned_to_name?.charAt(0) || 'I'}
                        </Avatar>
                      </Box>
                    </Paper>
                  ))}
                  {colTasks.length === 0 && (
                    <Box sx={{ p: 3, textAlign: 'center', border: '1px dashed', borderColor: 'divider', borderRadius: 2 }}>
                      <Typography variant="caption" color="text.secondary">No tasks in this column</Typography>
                    </Box>
                  )}
                </Box>
              </Box>
            </Grid>
          );
        })}
      </Grid>
    </motion.div>
  );
}
