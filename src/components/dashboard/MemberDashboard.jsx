import React, { useState, useEffect } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Paper,
  Avatar,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Chip,
  LinearProgress,
  Divider,
} from '@mui/material';
import {
  CardMembership as MembershipIcon,
  EventNote as EventNoteIcon,
  FitnessCenter as FitnessIcon,
  TrendingUp as TrendingUpIcon,
  Schedule as ScheduleIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import sessionService from '../../services/sessionService';
import useAuthStore from '../../store/authStore';
import { formatDate, formatTime, calculateBMI, getBMICategory } from '../../utils/helpers';
import { toast } from 'react-toastify';

const StatCard = ({ title, value, subtitle, icon, color, action }) => (
  <Card elevation={3}>
    <CardContent>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
        <Box>
          <Typography color="textSecondary" variant="body2" gutterBottom>
            {title}
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 0.5 }}>
            {value}
          </Typography>
          {subtitle && (
            <Typography variant="caption" color="textSecondary">
              {subtitle}
            </Typography>
          )}
        </Box>
        <Avatar sx={{ bgcolor: color, width: 50, height: 50 }}>
          {icon}
        </Avatar>
      </Box>
      {action && (
        <>
          <Divider sx={{ my: 1 }} />
          {action}
        </>
      )}
    </CardContent>
  </Card>
);

const MemberDashboard = () => {
  const { user } = useAuthStore();
  const [sessions, setSessions] = useState([]);
  const [memberData, setMemberData] = useState({
    membershipStatus: 'Active',
    membershipExpiry: '2024-12-31',
    upcomingSessions: 0,
    completedSessions: 0,
    bmi: null,
    height: 175,
    weight: 70,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMemberData();
  }, []);

  const fetchMemberData = async () => {
    try {
      setLoading(true);
      const response = await sessionService.getAll({ memberId: user.id, limit: 5 });
      setSessions(response.sessions || []);
      
      // Calculate BMI if height and weight available
      if (memberData.height && memberData.weight) {
        const bmi = calculateBMI(memberData.height, memberData.weight);
        setMemberData(prev => ({ ...prev, bmi }));
      }
    } catch (error) {
      toast.error('Failed to load member data');
    } finally {
      setLoading(false);
    }
  };

  const progressData = [
    { week: 'Week 1', weight: 72 },
    { week: 'Week 2', weight: 71.5 },
    { week: 'Week 3', weight: 71 },
    { week: 'Week 4', weight: 70.5 },
    { week: 'Week 5', weight: 70 },
  ];

  if (loading) {
    return <LinearProgress />;
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
        Welcome back, {user?.firstName}!
      </Typography>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Membership Status"
            value={memberData.membershipStatus}
            subtitle={`Expires: ${formatDate(memberData.membershipExpiry)}`}
            icon={<MembershipIcon />}
            color="#667eea"
            action={
              <Button size="small" fullWidth variant="outlined">
                Renew Membership
              </Button>
            }
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Upcoming Sessions"
            value={sessions.filter(s => s.status === 'scheduled').length}
            subtitle="Next 7 days"
            icon={<EventNoteIcon />}
            color="#764ba2"
            action={
              <Button size="small" fullWidth variant="outlined">
                Book Session
              </Button>
            }
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="BMI"
            value={memberData.bmi || 'N/A'}
            subtitle={memberData.bmi ? getBMICategory(memberData.bmi) : 'Update your stats'}
            icon={<FitnessIcon />}
            color="#f093fb"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Sessions Completed"
            value={memberData.completedSessions}
            subtitle="This month"
            icon={<TrendingUpIcon />}
            color="#4facfe"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Upcoming Sessions */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Upcoming Sessions
              </Typography>
              <Button size="small" startIcon={<ScheduleIcon />}>
                View All
              </Button>
            </Box>
            <List>
              {sessions.slice(0, 3).map((session) => (
                <ListItem key={session.id} divider>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: '#667eea' }}>
                      <PersonIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={`Session with ${session.trainer?.firstName} ${session.trainer?.lastName}`}
                    secondary={`${formatDate(session.sessionDate)} at ${formatTime(session.startTime)}`}
                  />
                  <Chip
                    label={session.status}
                    color="primary"
                    size="small"
                  />
                </ListItem>
              ))}
            </List>
            {sessions.length === 0 && (
              <Box sx={{ textAlign: 'center', py: 3 }}>
                <Typography color="textSecondary" gutterBottom>
                  No upcoming sessions
                </Typography>
                <Button variant="contained" sx={{ mt: 2 }}>
                  Book Your First Session
                </Button>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Progress Chart */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Weight Progress
            </Typography>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={progressData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" />
                <YAxis domain={['dataMin - 2', 'dataMax + 2']} />
                <Tooltip />
                <Line type="monotone" dataKey="weight" stroke="#667eea" strokeWidth={2} />
              </LineChart>
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
                  Book Training Session
                </Button>
              </Grid>
              <Grid item>
                <Button variant="outlined" startIcon={<MembershipIcon />}>
                  View Membership Details
                </Button>
              </Grid>
              <Grid item>
                <Button variant="outlined" startIcon={<FitnessIcon />}>
                  Update Body Stats
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default MemberDashboard;