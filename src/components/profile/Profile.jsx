import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Grid,
  Avatar,
  Typography,
  Button,
  Tabs,
  Tab,
  Card,
  CardContent,
  Divider,
  Chip,
  LinearProgress,
} from '@mui/material';
import {
  Edit as EditIcon,
  Person as PersonIcon,
  Lock as LockIcon,
  Settings as SettingsIcon,
  PhotoCamera as PhotoIcon,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import useAuthStore from '../../store/authStore';
import api from '../../services/api';
import { formatDate, getInitials, calculateBMI, getBMICategory } from '../../utils/helpers';
import ProfileEditForm from './ProfileEditForm';
import PasswordChangeForm from './PasswordChangeForm';
import BodyStatsForm from './BodyStatsForm';

const Profile = () => {
  const { user, updateUser } = useAuthStore();
  const [activeTab, setActiveTab] = useState(0);
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openEditForm, setOpenEditForm] = useState(false);
  const [openPasswordForm, setOpenPasswordForm] = useState(false);
  const [openBodyStatsForm, setOpenBodyStatsForm] = useState(false);

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/users/profile`);
      const data = response.data.data;
      
      // Normalize the data structure - combine user data with details
      const normalizedData = {
        ...data,
        firstName: data.details?.first_name || '',
        lastName: data.details?.last_name || '',
        phone: data.details?.phone || '',
        address: data.details?.address || '',
        dateOfBirth: data.details?.date_of_birth || '',
        gender: data.details?.gender || '',
        emergencyContact: data.details?.emergency_contact || '',
        emergencyPhone: data.details?.emergency_phone || '',
        profileImage: data.details?.profile_image || '',
        // Member specific
        height: data.details?.height || '',
        weight: data.details?.weight || '',
        // Trainer specific
        specialization: data.details?.specialization || '',
        experience: data.details?.experience || '',
        hourlyRate: data.details?.hourly_rate || '',
        certifications: data.details?.certifications || '',
        bio: data.details?.bio || '',
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };
      
      setProfileData(normalizedData);
    } catch (error) {
      toast.error('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('profileImage', file);

    try {
      const response = await api.post('/users/profile/upload-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Profile image updated successfully');
      updateUser({ profileImage: response.data.data.imageUrl });
      fetchProfileData();
    } catch (error) {
      toast.error('Failed to upload image');
    }
  };

  if (loading) {
    return <LinearProgress />;
  }

  const bmi = profileData?.height && profileData?.weight
    ? calculateBMI(profileData.height, profileData.weight)
    : null;

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
        My Profile
      </Typography>

      <Grid container spacing={3}>
        {/* Profile Header */}
        <Grid item xs={12}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap' }}>
              <Box sx={{ position: 'relative' }}>
                <Avatar
                  sx={{
                    width: 120,
                    height: 120,
                    bgcolor: 'primary.main',
                    fontSize: '3rem',
                  }}
                  src={profileData?.profileImage}
                >
                  {getInitials(user?.firstName, user?.lastName)}
                </Avatar>
                <input
                  accept="image/*"
                  style={{ display: 'none' }}
                  id="profile-image-upload"
                  type="file"
                  onChange={handleImageUpload}
                />
                <label htmlFor="profile-image-upload">
                  <Button
                    component="span"
                    size="small"
                    variant="contained"
                    sx={{
                      position: 'absolute',
                      bottom: 0,
                      right: 0,
                      minWidth: 'auto',
                      borderRadius: '50%',
                      p: 1,
                    }}
                  >
                    <PhotoIcon fontSize="small" />
                  </Button>
                </label>
              </Box>

              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                  {user?.firstName} {user?.lastName}
                </Typography>
                <Typography variant="body1" color="textSecondary">
                  {user?.email}
                </Typography>
                <Chip
                  label={user?.role?.toUpperCase()}
                  color="primary"
                  size="small"
                  sx={{ mt: 1 }}
                />
              </Box>

              <Button
                variant="outlined"
                startIcon={<EditIcon />}
                onClick={() => setOpenEditForm(true)}
              >
                Edit Profile
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* Tabs */}
        <Grid item xs={12}>
          <Paper elevation={3}>
            <Tabs value={activeTab} onChange={(e, val) => setActiveTab(val)}>
              <Tab icon={<PersonIcon />} label="Personal Info" />
              {user?.role === 'member' && <Tab icon={<PersonIcon />} label="Body Stats" />}
              <Tab icon={<LockIcon />} label="Security" />
              <Tab icon={<SettingsIcon />} label="Settings" />
            </Tabs>
            <Divider />

            {/* Personal Info Tab */}
            {activeTab === 0 && (
              <Box sx={{ p: 3 }}>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" color="textSecondary">
                      First Name
                    </Typography>
                    <Typography variant="body1">{profileData?.firstName}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" color="textSecondary">
                      Last Name
                    </Typography>
                    <Typography variant="body1">{profileData?.lastName}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" color="textSecondary">
                      Email
                    </Typography>
                    <Typography variant="body1">{profileData?.email}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" color="textSecondary">
                      Phone
                    </Typography>
                    <Typography variant="body1">{profileData?.phone || 'N/A'}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" color="textSecondary">
                      Date of Birth
                    </Typography>
                    <Typography variant="body1">
                      {profileData?.dateOfBirth ? formatDate(profileData.dateOfBirth) : 'N/A'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" color="textSecondary">
                      Gender
                    </Typography>
                    <Typography variant="body1">{profileData?.gender || 'N/A'}</Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="caption" color="textSecondary">
                      Address
                    </Typography>
                    <Typography variant="body1">{profileData?.address || 'N/A'}</Typography>
                  </Grid>

                  {user?.role === 'member' && (
                    <>
                      <Grid item xs={12}>
                        <Divider sx={{ my: 1 }} />
                        <Typography variant="h6" gutterBottom>
                          Emergency Contact
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="caption" color="textSecondary">
                          Contact Name
                        </Typography>
                        <Typography variant="body1">
                          {profileData?.emergencyContact || 'N/A'}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="caption" color="textSecondary">
                          Contact Phone
                        </Typography>
                        <Typography variant="body1">
                          {profileData?.emergencyPhone || 'N/A'}
                        </Typography>
                      </Grid>
                    </>
                  )}

                  {user?.role === 'trainer' && (
                    <>
                      <Grid item xs={12}>
                        <Divider sx={{ my: 1 }} />
                        <Typography variant="h6" gutterBottom>
                          Professional Info
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="caption" color="textSecondary">
                          Specialization
                        </Typography>
                        <Typography variant="body1">
                          {profileData?.specialization || 'N/A'}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="caption" color="textSecondary">
                          Experience
                        </Typography>
                        <Typography variant="body1">
                          {profileData?.experience || 0} years
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="caption" color="textSecondary">
                          Hourly Rate
                        </Typography>
                        <Typography variant="body1">
                          ${profileData?.hourlyRate || 0}/hour
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="caption" color="textSecondary">
                          Certifications
                        </Typography>
                        <Typography variant="body1">
                          {profileData?.certifications || 'N/A'}
                        </Typography>
                      </Grid>
                      <Grid item xs={12}>
                        <Typography variant="caption" color="textSecondary">
                          Bio
                        </Typography>
                        <Typography variant="body1">
                          {profileData?.bio || 'No bio available'}
                        </Typography>
                      </Grid>
                    </>
                  )}
                </Grid>
              </Box>
            )}

            {/* Body Stats Tab (Member Only) */}
            {activeTab === 1 && user?.role === 'member' && (
              <Box sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h6">Body Statistics</Typography>
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => setOpenBodyStatsForm(true)}
                  >
                    Update Stats
                  </Button>
                </Box>

                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6} md={3}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography color="textSecondary" variant="body2">
                          Height
                        </Typography>
                        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                          {profileData?.height || 0} cm
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography color="textSecondary" variant="body2">
                          Weight
                        </Typography>
                        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                          {profileData?.weight || 0} kg
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography color="textSecondary" variant="body2">
                          BMI
                        </Typography>
                        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                          {bmi || 'N/A'}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography color="textSecondary" variant="body2">
                          Category
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                          {bmi ? getBMICategory(bmi) : 'N/A'}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </Box>
            )}

            {/* Security Tab */}
            {activeTab === (user?.role === 'member' ? 2 : 1) && (
              <Box sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Change Password
                </Typography>
                <Typography variant="body2" color="textSecondary" paragraph>
                  Keep your account secure by using a strong password
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<LockIcon />}
                  onClick={() => setOpenPasswordForm(true)}
                >
                  Change Password
                </Button>

                <Divider sx={{ my: 3 }} />

                <Typography variant="h6" gutterBottom>
                  Account Information
                </Typography>
                <Grid container spacing={2} sx={{ mt: 1 }}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" color="textSecondary">
                      Account Created
                    </Typography>
                    <Typography variant="body1">
                      {formatDate(profileData?.createdAt)}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" color="textSecondary">
                      Last Updated
                    </Typography>
                    <Typography variant="body1">
                      {formatDate(profileData?.updatedAt)}
                    </Typography>
                  </Grid>
                </Grid>
              </Box>
            )}

            {/* Settings Tab */}
            {activeTab === (user?.role === 'member' ? 3 : 2) && (
              <Box sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Notification Settings
                </Typography>
                <Typography variant="body2" color="textSecondary" paragraph>
                  Manage your notification preferences (Coming Soon)
                </Typography>

                <Divider sx={{ my: 3 }} />

                <Typography variant="h6" gutterBottom>
                  Privacy Settings
                </Typography>
                <Typography variant="body2" color="textSecondary" paragraph>
                  Control who can see your information (Coming Soon)
                </Typography>

                <Divider sx={{ my: 3 }} />

                <Typography variant="h6" gutterBottom color="error">
                  Danger Zone
                </Typography>
                <Typography variant="body2" color="textSecondary" paragraph>
                  Permanently delete your account and all associated data
                </Typography>
                <Button variant="outlined" color="error">
                  Delete Account
                </Button>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Dialogs */}
      <ProfileEditForm
        open={openEditForm}
        profileData={profileData}
        onClose={(refresh) => {
          setOpenEditForm(false);
          if (refresh) fetchProfileData();
        }}
      />

      <PasswordChangeForm
        open={openPasswordForm}
        onClose={() => setOpenPasswordForm(false)}
      />

      <BodyStatsForm
        open={openBodyStatsForm}
        profileData={profileData}
        onClose={(refresh) => {
          setOpenBodyStatsForm(false);
          if (refresh) fetchProfileData();
        }}
      />
    </Box>
  );
};

export default Profile;