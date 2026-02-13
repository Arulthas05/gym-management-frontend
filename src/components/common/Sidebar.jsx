import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Box,
  Typography,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  FitnessCenter as FitnessCenterIcon,
  EventNote as EventNoteIcon,
  CardMembership as CardMembershipIcon,
  Payment as PaymentIcon,
  LocalMall as LocalMallIcon,
  CheckCircle as CheckCircleIcon,
  Assessment as AssessmentIcon,
} from '@mui/icons-material';
import useAuthStore from '../../store/authStore';

const Sidebar = ({ open, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthStore();

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard', roles: ['admin', 'trainer', 'member'] },
    { text: 'Members', icon: <PeopleIcon />, path: '/members', roles: ['admin', 'trainer'] },
    { text: 'Trainers', icon: <FitnessCenterIcon />, path: '/trainers', roles: ['admin'] },
    { text: 'Sessions', icon: <EventNoteIcon />, path: '/sessions', roles: ['admin', 'trainer', 'member'] },
    { text: 'Memberships', icon: <CardMembershipIcon />, path: '/memberships', roles: ['admin', 'member'] },
    { text: 'Payments', icon: <PaymentIcon />, path: '/payments', roles: ['admin', 'member'] },
    { text: 'Supplements', icon: <LocalMallIcon />, path: '/supplements', roles: ['admin', 'member'] },
    { text: 'Attendance', icon: <CheckCircleIcon />, path: '/attendance', roles: ['admin', 'trainer', 'member'] },
    { text: 'Reports', icon: <AssessmentIcon />, path: '/reports', roles: ['admin'] },
  ];

  const filteredMenuItems = menuItems.filter(item => item.roles.includes(user?.role));

  const handleNavigation = (path) => {
    navigate(path);
    onClose();
  };

  return (
    <Drawer anchor="left" open={open} onClose={onClose}>
      <Box sx={{ width: 260, pt: 2 }}>
        <Box sx={{ px: 2, pb: 2 }}>
          <Typography variant="h6" color="primary" sx={{ fontWeight: 'bold' }}>
            GYM MGMT
          </Typography>
          <Typography variant="caption" color="textSecondary">
            {user?.role?.toUpperCase()} PANEL
          </Typography>
        </Box>
        <Divider />
        <List>
          {filteredMenuItems.map((item) => (
            <ListItemButton
              key={item.path}
              selected={location.pathname === item.path}
              onClick={() => handleNavigation(item.path)}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          ))}
        </List>
      </Box>
    </Drawer>
  );
};

export default Sidebar;