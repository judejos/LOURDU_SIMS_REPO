import { useState, useRef, useEffect } from 'react';
import { Box, InputBase, Popper, Paper, List, ListItem, ListItemText, Typography, InputAdornment } from '@mui/material';
import { Search as SearchIcon, Description, Task, Person } from '@mui/icons-material';

const MOCK_RESULTS = [
  { id: 1, type: 'Task', title: 'Update Dashboard UI', desc: 'Assigned to Frontend Team', icon: <Task /> },
  { id: 2, type: 'User', title: 'Alice Smith', desc: 'Frontend Developer Intern', icon: <Person /> },
  { id: 3, type: 'Document', title: 'Q3 Onboarding Guide', desc: 'PDF Document', icon: <Description /> },
];

export default function GlobalSearch() {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [results, setResults] = useState([]);
  const anchorRef = useRef(null);

  useEffect(() => {
    if (query.length > 1) {
      // Mock search logic
      const filtered = MOCK_RESULTS.filter(r => 
        r.title.toLowerCase().includes(query.toLowerCase()) || 
        r.type.toLowerCase().includes(query.toLowerCase())
      );
      setResults(filtered);
      setOpen(true);
    } else {
      setOpen(false);
    }
  }, [query]);

  return (
    <Box sx={{ flex: 1, maxWidth: 400, position: 'relative' }} ref={anchorRef}>
      <Box sx={{
        display: 'flex', alignItems: 'center', gap: 1,
        bgcolor: 'action.hover', borderRadius: 3, px: 2, py: 0.5,
        width: '100%', border: open ? '1px solid var(--color-primary)' : '1px solid transparent',
        transition: 'all 0.2s'
      }}>
        <SearchIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
        <InputBase
          placeholder="Search anything (tasks, users, docs)..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => { if (query.length > 1) setOpen(true); }}
          onBlur={() => setTimeout(() => setOpen(false), 200)}
          sx={{ flex: 1, fontSize: '0.875rem' }}
        />
      </Box>

      <Popper 
        open={open} 
        anchorEl={anchorRef.current} 
        placement="bottom-start" 
        style={{ zIndex: 1300, width: anchorRef.current?.offsetWidth }}
      >
        <Paper elevation={8} sx={{ mt: 1, borderRadius: 2, maxHeight: 300, overflow: 'auto', bgcolor: 'var(--bg-card)' }}>
          {results.length > 0 ? (
            <List disablePadding>
              {results.map((res, idx) => (
                <ListItem 
                  button 
                  key={res.id} 
                  sx={{ 
                    borderBottom: idx !== results.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                    py: 1.5
                  }}
                  onClick={() => {
                    console.log('Navigating to', res);
                    setOpen(false);
                    setQuery('');
                  }}
                >
                  <Box sx={{ p: 1, borderRadius: 2, bgcolor: 'action.hover', mr: 2, color: 'primary.main' }}>
                    {res.icon}
                  </Box>
                  <ListItemText 
                    primary={<Typography variant="body2" fontWeight={600}>{res.title}</Typography>}
                    secondary={<Typography variant="caption" color="text.secondary">{res.desc} • {res.type}</Typography>}
                  />
                </ListItem>
              ))}
            </List>
          ) : (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">No results found for "{query}"</Typography>
            </Box>
          )}
        </Paper>
      </Popper>
    </Box>
  );
}
