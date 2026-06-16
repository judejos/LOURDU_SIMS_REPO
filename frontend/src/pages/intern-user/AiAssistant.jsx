import { useState } from 'react';
import { Box, Typography, TextField, Button, Paper, Avatar, Divider, Chip } from '@mui/material';
import { Send, SmartToy, Person } from '@mui/icons-material';
import { motion } from 'framer-motion';

export default function AiAssistant() {
  const [messages, setMessages] = useState([
    { id: 1, sender: 'ai', text: 'Hello! I am your AI Assistant. How can I help you today? I can help with resume review, mock interviews, or answer questions about your internship.' }
  ]);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim()) return;

    const userMsg = { id: Date.now(), sender: 'user', text: input };
    setMessages([...messages, userMsg]);
    setInput('');

    // Simulate AI response
    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        sender: 'ai',
        text: "I'm currently a prototype in Phase 10 development. Full AI capabilities like resume generation and mock interviews are coming soon!"
      }]);
    }, 1000);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column' }}>
      <Box className="page-header" sx={{ mb: 2 }}>
        <Typography variant="h4" fontWeight={800}>AI Assistant</Typography>
        <Typography variant="body2" color="text.secondary">Get intelligent guidance and insights.</Typography>
      </Box>

      <Paper className="glass-card" sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', gap: 1 }}>
          <Chip label="Resume Builder" variant="outlined" clickable />
          <Chip label="Mock Interview" variant="outlined" clickable />
          <Chip label="Code Review" variant="outlined" clickable />
        </Box>

        <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
          {messages.map(msg => (
            <Box key={msg.id} sx={{ display: 'flex', gap: 2, alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start', maxWidth: '80%' }}>
              {msg.sender === 'ai' && (
                <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}><SmartToy fontSize="small" /></Avatar>
              )}
              <Box sx={{ 
                p: 2, borderRadius: 2, 
                bgcolor: msg.sender === 'user' ? 'primary.main' : 'action.hover',
                color: msg.sender === 'user' ? 'white' : 'text.primary',
                borderTopRightRadius: msg.sender === 'user' ? 0 : 8,
                borderTopLeftRadius: msg.sender === 'ai' ? 0 : 8,
              }}>
                <Typography variant="body2">{msg.text}</Typography>
              </Box>
              {msg.sender === 'user' && (
                <Avatar sx={{ bgcolor: 'secondary.main', width: 32, height: 32 }}><Person fontSize="small" /></Avatar>
              )}
            </Box>
          ))}
        </Box>

        <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider', display: 'flex', gap: 2, bgcolor: 'background.paper' }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Type your message..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyPress={e => e.key === 'Enter' && handleSend()}
          />
          <Button variant="contained" endIcon={<Send />} onClick={handleSend}>
            Send
          </Button>
        </Box>
      </Paper>
    </motion.div>
  );
}
