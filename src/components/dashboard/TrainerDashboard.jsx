import React, { useState, useEffect } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Paper,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Chip,
  Button,
  LinearProgress,
} from '@mui/material';
import {
  EventNote as EventNoteIcon,
  People as PeopleIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import sessionService from '../../services/sessionService';
import useAuthStore from '../../store/authStore';
import { formatDate, formatTime } from '../../utils/helpers';
import { toast } from 'react-toastify';

const StatCard = ({ title, value, icon, color }) => (
  <Card elevation={3}>
    <CardContent>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Typography color="textSecondary" variant="body2" gutterBottom>
            {title}
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
            {value}
          </Typography>
        </Box>
        <Avatar sx={{ bgcolor: color, width: 56, height: 56 }}>
          {icon}
        </Avatar>
      </Box>
    </CardContent>
  </Card>
);

const TrainerDashboard = () => {
  const { user } = useAuthStore();
  const [sessions, setSessions] = useState([]);
  const [stats, setStats] = useState({
    todaySessions: 0,
    upcomingSessions: 0,
    totalClients: 0,
    completedThisWeek: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrainerData();
  }, []);

  const fetchTrainerData = async () => {
    try {
      setLoading(true);
      const response = await sessionService.getAll({ trainerId: user.id, limit: 10 });
      setSessions(response.sessions || []);

      
      // Calculate stats (this should come from backend)
      setStats({
        todaySessions: 3,
        upcomingSessions: 8,
        totalClients: 15,
        completedThisWeek: 12,
      });
    } catch (error) {
      toast.error('Failed to load trainer data');
    } finally {
      setLoading(false);
    }
  };

  const weeklySessionsData = [
    { day: 'Mon', sessions: 4 },
    { day: 'Tue', sessions: 5 },
    { day: 'Wed', sessions: 3 },
    { day: 'Thu', sessions: 6 },
    { day: 'Fri', sessions: 4 },
    { day: 'Sat', sessions: 7 },
    { day: 'Sun', sessions: 2 },
  ];

  if (loading) {
    return <LinearProgress />;
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          Trainer Dashboard
        </Typography>
        <Button variant="contained" startIcon={<ScheduleIcon />}>
          View Full Schedule
        </Button>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Today's Sessions"
            value={stats.todaySessions}
            icon={<EventNoteIcon />}
            color="#667eea"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Upcoming Sessions"
            value={stats.upcomingSessions}
            icon={<ScheduleIcon />}
            color="#764ba2"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Clients"
            value={stats.totalClients}
            icon={<PeopleIcon />}
            color="#f093fb"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Completed This Week"
            value={stats.completedThisWeek}
            icon={<CheckCircleIcon />}
            color="#4facfe"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Upcoming Sessions */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Upcoming Sessions
            </Typography>
            <List>
              {sessions.slice(0, 5).map((session) => (
                <ListItem key={session.id} divider>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: '#667eea' }}>
                      <PersonIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={`${session.member?.firstName} ${session.member?.lastName}`}
                    secondary={`${formatDate(session.sessionDate)} at ${formatTime(session.startTime)}`}
                  />
                  <Chip
                    label={session.status}
                    color={session.status === 'scheduled' ? 'primary' : 'default'}
                    size="small"
                  />
                </ListItem>
              ))}
            </List>
            {sessions.length === 0 && (
              <Typography color="textSecondary" align="center" sx={{ py: 3 }}>
                No upcoming sessions
              </Typography>
            )}
          </Paper>
        </Grid>

        {/* Weekly Sessions Chart */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Sessions This Week
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={weeklySessionsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="sessions" fill="#667eea" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Quick Actions
            </Typography>
            <Grid container spacing={2}>
              <Grid item>
                <Button variant="outlined" startIcon={<EventNoteIcon />}>
                  Add Session Notes
                </Button>
              </Grid>
              <Grid item>
                <Button variant="outlined" startIcon={<PeopleIcon />}>
                  View All Clients
                </Button>
              </Grid>
              <Grid item>
                <Button variant="outlined" startIcon={<ScheduleIcon />}>
                  Manage Availability
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default TrainerDashboard;