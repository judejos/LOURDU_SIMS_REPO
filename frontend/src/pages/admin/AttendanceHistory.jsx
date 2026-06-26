import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Button, IconButton, TextField, InputAdornment, 
  FormControl, InputLabel, Select, MenuItem, Checkbox 
} from '@mui/material';
import { Search, Download, CalendarToday, Refresh } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { usersAPI, attendanceAPI, orgAPI } from '../../services/api';
import { LoadingSpinner, StatusChip } from '../../components/common';
import { useAuth } from '../../contexts/AuthContext';

export default function AttendanceHistory() {
  const { user } = useAuth();
  const [interns, setInterns] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [domains, setDomains] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [domainFilter, setDomainFilter] = useState('all');
  const [mentorDomain, setMentorDomain] = useState(null);
  
  // Selection state
  const [selected, setSelected] = useState([]);

  const fetchData = async () => {
    setLoading(true);
    try {
      let currentMentorDomain = mentorDomain;
      if (user?.role === 'mentor' && !currentMentorDomain) {
        const userRes = await usersAPI.userData(user.empId);
        currentMentorDomain = userRes.data.domain;
        setMentorDomain(currentMentorDomain);
      }

      const [internRes, attendanceRes, domRes] = await Promise.all([
        usersAPI.internFullList(),
        attendanceAPI.list({ start_date: selectedDate, end_date: selectedDate }),
        orgAPI.domains()
      ]);

      if (user?.role === 'mentor' && currentMentorDomain) {
        setInterns(internRes.data.filter(i => i.domain === currentMentorDomain));
      } else {
        setInterns(internRes.data);
      }

      setAttendance(attendanceRes.data);
      setDomains(domRes.data);
      setSelected([]);
    } catch (e) {
      console.error('Error fetching attendance history data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedDate]);

  // Map backend status or fallback based on record / user_status
  const getTodayStatus = (intern, record) => {
    if (record) {
      if (record.status === 'present' || record.status === 'halfday') return 'present';
      if (record.status === 'absent') return 'absent';
      if (record.status === 'onleave') return 'onleave';
      return record.status;
    }
    // Fallbacks if no record exists for the selected date
    if (intern.user_status === 'yettojoin') return 'yettojoin';
    if (intern.user_status === 'completed') return 'completed';
    if (intern.user_status === 'onleave') return 'onleave';
    if (intern.user_status === 'discontinued') return 'discontinued';
    return 'absent'; // Active but no record => Absent
  };

  const getRecordForIntern = (empId) => {
    return attendance.find(record => record.emp_id === empId);
  };

  // Selection handlers
  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelecteds = filteredInterns.map((n) => n.emp_id);
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  };

  const handleClick = (event, id) => {
    const selectedIndex = selected.indexOf(id);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1),
      );
    }
    setSelected(newSelected);
  };

  const isSelected = (id) => selected.indexOf(id) !== -1;

  // Filter interns
  const filteredInterns = interns.filter(intern => {
    const record = getRecordForIntern(intern.emp_id);
    const todayStatus = getTodayStatus(intern, record);

    const matchesSearch = 
      (intern.full_name || '').toLowerCase().includes(search.toLowerCase()) ||
      (intern.emp_id || '').toLowerCase().includes(search.toLowerCase()) ||
      (intern.domain_name || '').toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;

    const matchesDomain = domainFilter === 'all' || intern.domain === domainFilter;
    if (!matchesDomain) return false;

    if (statusFilter !== 'all') {
      if (statusFilter === 'present' && todayStatus !== 'present') return false;
      if (statusFilter === 'absent' && todayStatus !== 'absent') return false;
      if (statusFilter === 'onleave' && todayStatus !== 'onleave') return false;
      if (statusFilter === 'yettojoin' && todayStatus !== 'yettojoin') return false;
      if (statusFilter === 'completed' && todayStatus !== 'completed') return false;
      if (statusFilter === 'discontinued' && todayStatus !== 'discontinued') return false;
    }

    return true;
  });

  const renderTimeline = (record, todayStatus) => {
    if (todayStatus !== 'present') {
      return null;
    }

    if (!record) return null;

    const { check_in, break_start, break_end, check_out } = record;

    const formatTime = (isoString) => {
      if (!isoString) return null;
      return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const tCheckIn = formatTime(check_in);
    const tBreakStart = formatTime(break_start);
    const tBreakEnd = formatTime(break_end);
    const tCheckOut = formatTime(check_out);

    const steps = [
      { label: 'Check-In', time: tCheckIn, completed: !!tCheckIn },
      { label: 'Break Start', time: tBreakStart, completed: !!tBreakStart },
      { label: 'Break End', time: tBreakEnd, completed: !!tBreakEnd },
      { label: 'Check-Out', time: tCheckOut, completed: !!tCheckOut },
    ];

    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: '260px' }}>
        {steps.map((step, index) => (
          <React.Fragment key={index}>
            {index > 0 && (
              <Box
                sx={{
                  flexGrow: 1,
                  height: '2px',
                  bgcolor: steps[index].completed ? 'var(--color-primary)' : 'var(--border-subtle)',
                  minWidth: '10px',
                  maxWidth: '30px',
                }}
              />
            )}
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Box
                sx={{
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  bgcolor: step.completed ? 'var(--color-primary)' : 'transparent',
                  border: step.completed ? 'none' : '2px solid var(--text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {step.completed && <Box sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: '#fff' }} />}
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 0.2 }}>
                <Typography variant="caption" sx={{ fontSize: '0.65rem', fontWeight: 600, color: step.completed ? 'text.primary' : 'text.secondary', whiteSpace: 'nowrap' }}>
                  {step.label}
                </Typography>
                {step.time && (
                  <Typography variant="caption" sx={{ fontSize: '0.6rem', color: 'var(--color-primary)', fontWeight: 700 }}>
                    {step.time}
                  </Typography>
                )}
              </Box>
            </Box>
          </React.Fragment>
        ))}
      </Box>
    );
  };

  if (loading) return <LoadingSpinner text="Loading Attendance History..." />;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="page-head">
        <div>
          <h1 className="page-title">Attendance History</h1>
          <p className="page-sub">Track active interns, their domains, and their daily check-in, break, and check-out timelines.</p>
        </div>
      </div>

      <Box className="glass-card" sx={{ p: 0, overflow: 'hidden' }}>
        {/* Toolbar matches the exact style in the screenshot */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 3, flexWrap: 'wrap', gap: 2 }}>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
            <TextField
              size="small"
              placeholder="Search interns by name, ID, domain..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              slotProps={{
                input: {
                  startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment>,
                }
              }}
              sx={{ minWidth: 300 }}
            />
            
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Status Filter</InputLabel>
              <Select 
                value={statusFilter} 
                label="Status Filter" 
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="present">Present</MenuItem>
                <MenuItem value="absent">Absent</MenuItem>
                <MenuItem value="onleave">On Leave</MenuItem>
                <MenuItem value="yettojoin">Yet to Join</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
                <MenuItem value="discontinued">Discontinued</MenuItem>
              </Select>
            </FormControl>

            {user?.role !== 'mentor' && (
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Domain Filter</InputLabel>
                <Select 
                  value={domainFilter} 
                  label="Domain Filter" 
                  onChange={(e) => setDomainFilter(e.target.value)}
                >
                  <MenuItem value="all">All Domains</MenuItem>
                  {domains.map(d => (
                    <MenuItem key={d.id} value={d.id}>{d.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}

            <TextField
              type="date"
              size="small"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <CalendarToday fontSize="small" />
                    </InputAdornment>
                  ),
                }
              }}
              sx={{ width: 170 }}
            />

            <IconButton onClick={fetchData} color="primary" sx={{ border: '1px solid var(--border-subtle)', height: 40, width: 40 }}>
              <Refresh fontSize="small" />
            </IconButton>
          </Box>

          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button variant="outlined" startIcon={<Download />} onClick={() => alert('Exporting data to CSV...')}>Export</Button>
          </Box>
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox
                    indeterminate={selected.length > 0 && selected.length < filteredInterns.length}
                    checked={filteredInterns.length > 0 && selected.length === filteredInterns.length}
                    onChange={handleSelectAllClick}
                  />
                </TableCell>
                <TableCell>Intern</TableCell>
                <TableCell>Domain</TableCell>
                <TableCell>Timeline</TableCell>
                <TableCell>Today's Attendance</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredInterns.length > 0 ? filteredInterns.map((row) => {
                const record = getRecordForIntern(row.emp_id);
                const todayStatus = getTodayStatus(row, record);
                const isItemSelected = isSelected(row.emp_id);

                return (
                  <TableRow key={row.emp_id} hover selected={isItemSelected}>
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={isItemSelected}
                        onChange={(event) => handleClick(event, row.emp_id)}
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Box 
                          sx={{ 
                            width: 36, height: 36, borderRadius: '50%', 
                            background: 'var(--gradient-primary)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: 'white', fontWeight: 700, fontSize: '0.8rem'
                          }}
                        >
                          {row.full_name?.charAt(0) || 'I'}
                        </Box>
                        <Box>
                          <Typography fontWeight={700} variant="body2">{row.full_name}</Typography>
                          <Typography variant="caption" color="text.secondary">{row.emp_id}</Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{row.domain_name || 'N/A'}</Typography>
                      <Typography variant="caption" color="text.secondary">{row.scheme?.toUpperCase()} Scheme</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{row.start_date || '—'}</Typography>
                      <Typography variant="caption" color="text.secondary">To: {row.end_date || '—'}</Typography>
                    </TableCell>
                    <TableCell sx={{ verticalAlign: 'middle', py: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                        <StatusChip status={todayStatus} />
                        {renderTimeline(record, todayStatus)}
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              }) : (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                    <Box sx={{ color: 'text.secondary', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                      <Search sx={{ fontSize: 40, opacity: 0.5 }} />
                      <Typography>No interns found matching your criteria</Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </motion.div>
  );
}
