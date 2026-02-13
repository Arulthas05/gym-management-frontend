import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Button,
  TextField,
  InputAdornment,
  IconButton,
  Chip,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Cancel as CancelIcon,
  CheckCircle as CompleteIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import sessionService from '../../services/sessionService';
import useAuthStore from '../../store/authStore';
import { formatDate, formatTime } from '../../utils/helpers';
import SessionForm from './SessionForm';

const SessionList = () => {
  const { user } = useAuthStore();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  const [openForm, setOpenForm] = useState(false);
  const [openCancel, setOpenCancel] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);

  useEffect(() => {
    fetchSessions();
  }, [page, rowsPerPage, searchTerm, statusFilter]);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const params = {
        page: page + 1,
        limit: rowsPerPage,
        search: searchTerm,
        status: statusFilter !== 'all' ? statusFilter : undefined,
      };

      // Filter by user role
      if (user.role === 'trainer') {
        params.trainerId = user.id;
      } else if (user.role === 'member') {
        params.memberId = user.id;
      }

      const response = await sessionService.getAll(params);
      setSessions(response.sessions || []);
      setTotalCount(response.pagination.totalItems || 0);
    } catch (error) {
      toast.error('Failed to load sessions');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSession = async () => {
    try {
      await sessionService.cancel(selectedSession.id);
      toast.success('Session cancelled successfully');
      setOpenCancel(false);
      fetchSessions();
    } catch (error) {
      toast.error('Failed to cancel session');
    }
  };

  const handleCompleteSession = async (sessionId) => {
    try {
      await sessionService.complete(sessionId);
      toast.success('Session marked as completed');
      fetchSessions();
    } catch (error) {
      toast.error('Failed to complete session');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled':
        return 'primary';
      case 'completed':
        return 'success';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          Training Sessions
        </Typography>
        {user.role !== 'trainer' && (
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpenForm(true)}>
            Book Session
          </Button>
        )}
      </Box>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <TextField
            placeholder="Search sessions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ flexGrow: 1, minWidth: 250 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              label="Status"
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="scheduled">Scheduled</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
              <MenuItem value="cancelled">Cancelled</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Paper>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date & Time</TableCell>
              {user.role !== 'member' && <TableCell>Member</TableCell>}
              {user.role !== 'trainer' && <TableCell>Trainer</TableCell>}
              <TableCell>Duration</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Notes</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} align="center">Loading...</TableCell>
              </TableRow>
            ) : sessions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">No sessions found</TableCell>
              </TableRow>
            ) : (
              sessions.map((session) => (
                <TableRow key={session.id} hover>
                  <TableCell>
                    <Typography variant="body2">{formatDate(session.session_date)}</Typography>
                    <Typography variant="caption" color="textSecondary">
                      {formatTime(session.start_time)} - {formatTime(session.end_time)}
                    </Typography>
                  </TableCell>
                  {user.role !== 'member' && (
                    <TableCell>
                      {session.member_first_name} {session.member_last_name}
                    </TableCell>
                  )}
                  {user.role !== 'trainer' && (
                    <TableCell>
                      {session.trainer_first_name} {session.trainer_last_name}
                    </TableCell>
                  )}
                  <TableCell>{session.duration || '60'} min</TableCell>
                  <TableCell>
                    <Chip
                      label={session.status}
                      color={getStatusColor(session.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{session.notes || '-'}</TableCell>
                  <TableCell align="right">
                    {session.status === 'scheduled' && (
                      <>
                        {user.role === 'trainer' && (
                          <IconButton
                            size="small"
                            onClick={() => handleCompleteSession(session.id)}
                            color="success"
                          >
                            <CompleteIcon />
                          </IconButton>
                        )}
                        <IconButton
                          size="small"
                          onClick={() => {
                            setSelectedSession(session);
                            setOpenCancel(true);
                          }}
                          color="error"
                        >
                          <CancelIcon />
                        </IconButton>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={totalCount}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={[5, 10, 25]}
        />
      </TableContainer>

      <SessionForm
        open={openForm}
        onClose={(refresh) => {
          setOpenForm(false);
          if (refresh) fetchSessions();
        }}
      />

      <Dialog open={openCancel} onClose={() => setOpenCancel(false)}>
        <DialogTitle>Cancel Session</DialogTitle>
        <DialogContent>
          Are you sure you want to cancel this session?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCancel(false)}>No</Button>
          <Button onClick={handleCancelSession} color="error" variant="contained">
            Yes, Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SessionList;