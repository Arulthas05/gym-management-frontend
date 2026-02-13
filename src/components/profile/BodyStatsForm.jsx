import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  Typography,
  Box,
} from '@mui/material';
import { toast } from 'react-toastify';
import api from '../../services/api';
import { calculateBMI, getBMICategory } from '../../utils/helpers';

const BodyStatsForm = ({ open, onClose, profileData }) => {
  const [formData, setFormData] = useState({
    height: '',
    weight: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (profileData && open) {
      setFormData({
        height: profileData.height || '',
        weight: profileData.weight || '',
      });
    }
  }, [profileData, open]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await api.put('/users/body-stats', formData);
      toast.success('Body stats updated successfully');
      onClose(true);
    } catch (error) {
      toast.error('Failed to update body stats');
    } finally {
      setLoading(false);
    }
  };

  const bmi = formData.height && formData.weight
    ? calculateBMI(formData.height, formData.weight)
    : null;

  return (
    <Dialog open={open} onClose={() => onClose(false)} maxWidth="sm" fullWidth>
      <DialogTitle>Update Body Statistics</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Height (cm)"
                name="height"
                type="number"
                value={formData.height}
                onChange={handleChange}
                inputProps={{ min: 50, max: 300 }}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Weight (kg)"
                name="weight"
                type="number"
                value={formData.weight}
                onChange={handleChange}
                inputProps={{ min: 20, max: 500, step: 0.1 }}
                required
              />
            </Grid>
          </Grid>

          {bmi && (
            <Box sx={{ mt: 3, p: 2, bgcolor: 'primary.light', borderRadius: 1 }}>
              <Typography variant="body2" color="primary.dark">
                Your BMI: <strong>{bmi}</strong>
              </Typography>
              <Typography variant="body2" color="primary.dark">
                Category: <strong>{getBMICategory(bmi)}</strong>
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => onClose(false)}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={loading}>
            {loading ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default BodyStatsForm;