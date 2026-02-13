import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Typography,
  Box,
  Avatar,
  Divider,
  Chip,
} from '@mui/material';
import {
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  Cake as CakeIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { formatDate, getInitials } from '../../utils/helpers';

const InfoRow = ({ icon, label, value }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
    {icon}
    <Box>
      <Typography variant="caption" color="textSecondary">
        {label}
      </Typography>
      <Typography variant="body1">{value || 'N/A'}</Typography>
    </Box>
  </Box>
);

const MemberDetail = ({ open, onClose, member }) => {
  if (!member) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Member Details</DialogTitle>
      <DialogContent>
        {/* Header with Avatar */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <Avatar sx={{ width: 80, height: 80, bgcolor: 'primary.main', fontSize: '2rem' }}>
            {getInitials(member.firstName, member.lastName)}
          </Avatar>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
              {member.firstName} {member.lastName}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Member ID: {member.id}
            </Typography>
            <Chip
              label={member.status || 'Active'}
              color="success"
              size="small"
              sx={{ mt: 1 }}
            />
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Contact Information */}
        <Typography variant="h6" gutterBottom>
          Contact Information
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <InfoRow icon={<EmailIcon color="primary" />} label="Email" value={member.email} />
            <InfoRow icon={<PhoneIcon color="primary" />} label="Phone" value={member.phone} />
          </Grid>
          <Grid item xs={12} md={6}>
            <InfoRow icon={<CakeIcon color="primary" />} label="Date of Birth" value={formatDate(member.dateOfBirth)} />
            <InfoRow icon={<PersonIcon color="primary" />} label="Gender" value={member.gender} />
          </Grid>
          <Grid item xs={12}>
            <InfoRow icon={<LocationIcon color="primary" />} label="Address" value={member.address} />
          </Grid>
        </Grid>

        <Divider sx={{ my: 2 }} />

        {/* Emergency Contact */}
        <Typography variant="h6" gutterBottom>
          Emergency Contact
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <InfoRow icon={<PersonIcon color="primary" />} label="Contact Name" value={member.emergencyContact} />
          </Grid>
          <Grid item xs={12} md={6}>
            <InfoRow icon={<PhoneIcon color="primary" />} label="Contact Phone" value={member.emergencyPhone} />
          </Grid>
        </Grid>

        <Divider sx={{ my: 2 }} />

        {/* Membership Information */}
        <Typography variant="h6" gutterBottom>
          Membership Information
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="caption" color="textSecondary">
              Membership Type
            </Typography>
            <Typography variant="body1">{member.membershipType || 'None'}</Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="caption" color="textSecondary">
              Member Since
            </Typography>
            <Typography variant="body1">{formatDate(member.createdAt)}</Typography>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default MemberDetail;