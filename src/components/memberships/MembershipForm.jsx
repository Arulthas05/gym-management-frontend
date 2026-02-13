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
} from '@mui/material';
import { toast } from 'react-toastify';
import api from '../../services/api';
import memberService from '../../services/memberService';

const MembershipForm = ({ open, onClose, membership }) => {
  const [formData, setFormData] = useState({
    memberId: '',
    planId: '',
    startDate: '',
    endDate: '',
    status: 'active',
  });
  const [members, setMembers] = useState([]);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      fetchMembers();
      fetchPlans();
      if (membership) {
        setFormData({
          memberId: membership.memberId || '',
          planId: membership.planId || '',
          startDate: membership.startDate?.split('T')[0] || '',
          endDate: membership.endDate?.split('T')[0] || '',
          status: membership.status || 'active',
        });
      } else {
        setFormData({
          memberId: '',
          planId: '',
          startDate: '',
          endDate: '',
          status: 'active',
        });
      }
    }
  }, [open, membership]);

  const fetchMembers = async () => {
    try {
      const response = await memberService.getAll();
      setMembers(response.members || []);
    } catch (error) {
      console.error('Failed to load members');
    }
  };

  const fetchPlans = async () => {
    try {
      const response = await api.get('/memberships/plans');
      setPlans(response.data.data || []);
    } catch (error) {
      console.error('Failed to load plans');
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (membership) {
        await api.put(`/memberships/${membership.id}`, formData);
        toast.success('Membership updated successfully');
      } else {
        await api.post('/memberships', formData);
        toast.success('Membership created successfully');
      }
      onClose(true);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={() => onClose(false)} maxWidth="sm" fullWidth>
      <DialogTitle>{membership ? 'Edit Membership' : 'Add Membership'}</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                select
                label="Member"
                name="memberId"
                value={formData.memberId}
                onChange={handleChange}
                required
                disabled={!!membership}
              >
                <MenuItem value="">Select Member</MenuItem>
                {members.map((member) => (
                  <MenuItem key={member.id} value={member.id}>
                    {member.first_name} {member.last_name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                select
                label="Plan"
                name="planId"
                value={formData.planId}
                onChange={handleChange}
                required
              >
                <MenuItem value="">Select Plan</MenuItem>
                {plans.map((plan) => (
                  <MenuItem key={plan.id} value={plan.id}>
                    {plan.name} - ${plan.price}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Start Date"
                name="startDate"
                type="date"
                value={formData.startDate}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="End Date"
                name="endDate"
                type="date"
                value={formData.endDate}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                select
                label="Status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                required
              >
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="expired">Expired</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="cancelled">Cancelled</MenuItem>
              </TextField>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => onClose(false)}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={loading}>
            {loading ? 'Saving...' : membership ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default MembershipForm;