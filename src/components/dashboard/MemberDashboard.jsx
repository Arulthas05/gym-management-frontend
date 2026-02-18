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
import membershipService from '../../services/membershipService';
import attendanceService from '../../services/attendanceService';
import api from '../../services/api';
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
  const [profile, setProfile] = useState(null);
  const [memberData, setMemberData] = useState({
    membershipStatus: 'Loading...',
    membershipExpiry: null,
    membershipPlan: 'Loading...',
    daysRemaining: 0,
    upcomingSessions: 0,
    completedSessions: 0,
    bmi: null,
    height: null,
    weight: null,
    attendanceThisMonth: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMemberData();
  }, []);

  const fetchMemberData = async () => {
    try {
      setLoading(true);
      const memberId = user.memberId || user.id;

      // Fetch user profile
      const profileResponse = await api.get('/users/profile');
      const profileData = profileResponse.data.data || profileResponse.data;
      setProfile(profileData);

      // Fetch sessions
      const sessionsResponse = await sessionService.getAll({ memberId, limit: 5 });
      setSessions(sessionsResponse.sessions || []);

      // Fetch active membership
      const membershipResponse = await membershipService.getAll({ memberId, status: 'active' });
      console.log('Membership Response:', membershipResponse);
      
      // Handle different response structures
      let memberships = [];
      if (Array.isArray(membershipResponse)) {
        memberships = membershipResponse;
      } else if (membershipResponse.data && Array.isArray(membershipResponse.data)) {
        memberships = membershipResponse.data;
      } else if (membershipResponse.memberships && Array.isArray(membershipResponse.memberships)) {
        memberships = membershipResponse.memberships;
      }
      
      console.log('Parsed Memberships:', memberships);
      
      // Get the membership with the latest expiry date
      let activeMembership = null;
      if (memberships.length > 0) {
        activeMembership = memberships.reduce((latest, current) => {
          const latestDate = new Date(latest.endDate || latest.end_date);
          const currentDate = new Date(current.endDate || current.end_date);
          return currentDate > latestDate ? current : latest;
        });
      }

      console.log('Active Membership:', activeMembership);

      // Calculate membership status based on expiry
      let membershipStatusText = 'Inactive';
      let daysRemaining = 0;
      if (activeMembership) {
        const expiryDate = new Date(activeMembership.endDate || activeMembership.end_date);
        const today = new Date();
        daysRemaining = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
        
        console.log('Expiry Date:', expiryDate);
        console.log('Days Remaining:', daysRemaining);
        
        if (daysRemaining < 0) {
          membershipStatusText = 'Expired';
          daysRemaining = 0;
        } else if (daysRemaining <= 7) {
          membershipStatusText = 'Expiring Soon';
        } else if (daysRemaining <= 30) {
          membershipStatusText = 'Active';
        } else {
          membershipStatusText = 'Active';
        }
      }

      // Fetch attendance for this month
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      const attendanceResponse = await attendanceService.getAll({
        memberId,
        startDate: startOfMonth.toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
      });

      // Calculate BMI if height and weight available
      let bmi = null;
      if (profileData.details?.height && profileData.details?.weight) {
        bmi = Number(calculateBMI(profileData.details.height, profileData.details.weight));
      }

      // Count completed sessions this month
      const completedSessionsCount = (sessionsResponse.sessions || []).filter(
        s => s.status === 'completed' && 
        new Date(s.sessionDate) >= startOfMonth
      ).length;

      setMemberData({
        membershipStatus: membershipStatusText,
        membershipExpiry: activeMembership?.endDate || activeMembership?.end_date || null,
        membershipPlan: activeMembership?.planName || activeMembership?.plan_name || 'No Plan',
        daysRemaining,
        upcomingSessions: (sessionsResponse.sessions || []).filter(s => s.status === 'scheduled').length,
        completedSessions: completedSessionsCount,
        bmi,
        height: profileData.details?.height || null,
        weight: profileData.details?.weight || null,
        attendanceThisMonth: attendanceResponse.attendance?.length || 0,
      });
    } catch (error) {
      console.error('Failed to load member data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const progressData = memberData.weight ? [
    { week: 'Current', weight: memberData.weight },
  ] : [
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
        Welcome back, {profile?.details?.firstName || user?.email?.split('@')[0]}!
      </Typography>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Membership Status"
            value={memberData.membershipStatus}
            subtitle={
              memberData.membershipExpiry 
                ? `${memberData.membershipPlan} - ${memberData.daysRemaining} days left`
                : memberData.membershipPlan
            }
            icon={<MembershipIcon />}
            color={
              memberData.membershipStatus === 'Active' ? '#667eea' :
              memberData.membershipStatus === 'Expiring Soon' ? '#f093fb' :
              memberData.membershipStatus === 'Expired' ? '#ff6b6b' : '#95a5a6'
            }
            action={
              <Button size="small" fullWidth variant="outlined">
                {memberData.membershipStatus === 'Inactive' ? 'Purchase Membership' : 'Renew Membership'}
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
            value={memberData.bmi ? Number(memberData.bmi).toFixed(1) : 'N/A'}
            subtitle={memberData.bmi ? getBMICategory(Number(memberData.bmi)) : 'Update your stats'}
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
                    primary={`Session with ${session.trainerFirstName || session.trainer_first_name || 'Trainer'} ${session.trainerLastName || session.trainer_last_name || ''}`}
                    secondary={`${formatDate(session.sessionDate || session.session_date)} at ${formatTime(session.startTime || session.start_time)}`}
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