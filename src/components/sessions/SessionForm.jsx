import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  MenuItem,
  Typography,
} from '@mui/material';
import { toast } from 'react-toastify';
import sessionService from '../../services/sessionService';
import memberService from '../../services/memberService';
import api from '../../services/api';
import useAuthStore from '../../store/authStore';
import trainerService from '../../services/trainerService';

const SessionForm = ({ open, onClose }) => {
  const { user } = useAuthStore();
  const [formData, setFormData] = useState({
    trainerId: '',
    memberId: user.role === 'member' ? user.id : '',
    sessionDate: '',
    startTime: '',
    endTime: '',
    notes: '',
  });
  const [trainers, setTrainers] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      fetchTrainers();
      if (user.role === 'admin') {
        fetchMembers();
      }
    }
  }, [open]);

  const fetchTrainers = async () => {
    try {
      const response = await trainerService.getAll();
      setTrainers(response.trainers || []);
    } catch (error) {
      toast.error('Failed to load trainers');
    }
  };

  const fetchMembers = async () => {
    try {
      const response = await memberService.getAll();
      setMembers(response.data || []);
    } catch (error) {
      toast.error('Failed to load members');
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await sessionService.book(formData);
      toast.success('Session booked successfully');
      onClose(true);
      setFormData({
        trainerId: '',
        memberId: user.role === 'member' ? user.id : '',
        sessionDate: '',
        startTime: '',
        endTime: '',
        notes: '',
      });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to book session');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={() => onClose(false)} maxWidth="sm" fullWidth>
      <DialogTitle>Book Training Session</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Grid container spacing={2}>
            {user.role === 'admin' && (
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  select
                  label="Member"
                  name="memberId"
                  value={formData.memberId}
                  onChange={handleChange}
                  required
                >
                  <MenuItem value="">Select Member</MenuItem>
                  {members.map((member) => (
                    <MenuItem key={member.id} value={member.id}>
                      {member.firstName} {member.lastName}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            )}
            <Grid item xs={12}>
              <TextField
                fullWidth
                select
                label="Trainer"
                name="trainerId"
                value={formData.trainerId}
                onChange={handleChange}
                required
              >
                <MenuItem value="">Select Trainer</MenuItem>
                {trainers.map((trainer) => (
                  <MenuItem key={trainer.id} value={trainer.id}>
                    {trainer.firstName} {trainer.lastName} - {trainer.specialization}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Session Date"
                name="sessionDate"
                type="date"
                value={formData.sessionDate}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Start Time"
                name="startTime"
                type="time"
                value={formData.startTime}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="End Time"
                name="endTime"
                type="time"
                value={formData.endTime}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                multiline
                rows={3}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => onClose(false)}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={loading}>
            {loading ? 'Booking...' : 'Book Session'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default SessionForm;