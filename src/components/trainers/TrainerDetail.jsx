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
  Card,
  CardContent,
} from '@mui/material';
import {
  Email as EmailIcon,
  Phone as PhoneIcon,
  Star as StarIcon,
  FitnessCenter as FitnessIcon,
  WorkHistory as ExperienceIcon,
  CardMembership as CertificationIcon,
} from '@mui/icons-material';
import { getInitials, formatCurrency } from '../../utils/helpers';

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

const TrainerDetail = ({ open, onClose, trainer }) => {
  if (!trainer) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Trainer Details</DialogTitle>
      <DialogContent>
        {/* Header with Avatar */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <Avatar sx={{ width: 80, height: 80, bgcolor: 'secondary.main', fontSize: '2rem' }}>
            {getInitials(trainer.firstName, trainer.lastName)}
          </Avatar>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
              {trainer.firstName} {trainer.lastName}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
              <StarIcon sx={{ color: 'gold', fontSize: 20 }} />
              <Typography variant="body2">{trainer.rating || '5.0'} / 5.0</Typography>
              <Typography variant="caption" color="textSecondary">
                ({trainer.totalReviews || 0} reviews)
              </Typography>
            </Box>
            <Chip
              label={trainer.status || 'Active'}
              color={trainer.status === 'active' ? 'success' : 'default'}
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
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={6}>
            <InfoRow icon={<EmailIcon color="primary" />} label="Email" value={trainer.email} />
          </Grid>
          <Grid item xs={12} md={6}>
            <InfoRow icon={<PhoneIcon color="primary" />} label="Phone" value={trainer.phone} />
          </Grid>
        </Grid>

        <Divider sx={{ my: 2 }} />

        {/* Professional Information */}
        <Typography variant="h6" gutterBottom>
          Professional Information
        </Typography>
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={6}>
            <InfoRow 
              icon={<FitnessIcon color="primary" />} 
              label="Specialization" 
              value={trainer.specialization} 
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <InfoRow 
              icon={<ExperienceIcon color="primary" />} 
              label="Experience" 
              value={`${trainer.experience || 0} years`} 
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <InfoRow 
              icon={<CertificationIcon color="primary" />} 
              label="Certifications" 
              value={trainer.certifications} 
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="caption" color="textSecondary">
                Hourly Rate
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                {formatCurrency(trainer.hourlyRate || 0)}/hour
              </Typography>
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ my: 2 }} />

        {/* Bio */}
        <Typography variant="h6" gutterBottom>
          About
        </Typography>
        <Typography variant="body1" color="textSecondary" paragraph>
          {trainer.bio || 'No bio available for this trainer.'}
        </Typography>

        <Divider sx={{ my: 2 }} />

        {/* Statistics */}
        <Typography variant="h6" gutterBottom>
          Statistics
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <Card variant="outlined">
              <CardContent>
                <Typography color="textSecondary" variant="body2">
                  Total Sessions
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                  {trainer.totalSessions || 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card variant="outlined">
              <CardContent>
                <Typography color="textSecondary" variant="body2">
                  Active Clients
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                  {trainer.activeClients || 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card variant="outlined">
              <CardContent>
                <Typography color="textSecondary" variant="body2">
                  Completion Rate
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                  {trainer.completionRate || 100}%
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Available Time Slots (Optional) */}
        {trainer.availableSlots && trainer.availableSlots.length > 0 && (
          <>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" gutterBottom>
              Available Time Slots
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {trainer.availableSlots.map((slot, index) => (
                <Chip key={index} label={slot} color="primary" variant="outlined" />
              ))}
            </Box>
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
        <Button variant="contained" onClick={onClose}>
          Book Session
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TrainerDetail;