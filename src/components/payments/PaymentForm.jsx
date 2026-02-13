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
  Box,
  Alert,
  CircularProgress,
} from '@mui/material';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { toast } from 'react-toastify';
import api from '../../services/api';
import paymentService from '../../services/paymentService';
import useAuthStore from '../../store/authStore';
import { formatCurrency } from '../../utils/helpers';
import memberService from '../../services/memberService';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY || 'pk_test_dummy');

const CheckoutForm = ({ formData, onSuccess, onCancel }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      toast.error('Stripe not loaded yet. Please wait.');
      return;
    }

    // Validate member is selected
    if (!formData.memberId) {
      toast.error('Please select a member');
      return;
    }

    // Validate amount
    if (!formData.amount || formData.amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    setLoading(true);
    setError('');

    try {
      console.log('=== PAYMENT FLOW START ===');
      console.log('1. Form Data:', formData);

      // Step 1: Create payment intent
      console.log('2. Creating payment intent...');
      const intentResponse = await paymentService.createIntent({
        memberId: formData.memberId,
        amount: formData.amount,
        paymentType: formData.paymentType,
        description: formData.description,
      });

      console.log('3. Payment intent created:', intentResponse);

      if (!intentResponse.clientSecret) {
        throw new Error('No client secret received from server');
      }

      // Step 2: Confirm card payment with Stripe
      console.log('4. Confirming card payment with Stripe...');
      const cardElement = elements.getElement(CardElement);

      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
        intentResponse.clientSecret,
        {
          payment_method: {
            card: cardElement,
          },
        }
      );

      console.log('5. Stripe confirmation result:', { stripeError, paymentIntent });

      if (stripeError) {
        console.error('Stripe error:', stripeError);
        setError(stripeError.message);
        toast.error(stripeError.message);
        return;
      }

      if (paymentIntent.status === 'succeeded') {
        console.log('6. Payment succeeded, confirming in backend...');
        
        // Step 3: Confirm payment in backend
        const confirmResponse = await paymentService.confirmPayment({
          memberId: formData.memberId,
          paymentIntentId: paymentIntent.id,
          amount: formData.amount,
          paymentType: formData.paymentType,
          description: formData.description,
        });

        console.log('7. Backend confirmation response:', confirmResponse);
        console.log('=== PAYMENT FLOW SUCCESS ===');

        toast.success('Payment successful!');
        onSuccess();
      } else {
        throw new Error(`Payment status: ${paymentIntent.status}`);
      }
    } catch (err) {
      console.error('=== PAYMENT FLOW ERROR ===');
      console.error('Error details:', err);
      console.error('Error response:', err.response?.data);
      
      const message = err.response?.data?.message || err.message || 'Payment failed';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" gutterBottom>
          Payment Summary
        </Typography>
        <Box sx={{ p: 2, bgcolor: '#f5f5f5', borderRadius: 1, mb: 2 }}>
          <Grid container spacing={1}>
            <Grid item xs={6}>
              <Typography variant="body2" color="textSecondary">Type:</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                {formData.paymentType}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2" color="textSecondary">Amount:</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                {formatCurrency(formData.amount)}
              </Typography>
            </Grid>
          </Grid>
        </Box>

        <Typography variant="subtitle2" gutterBottom>
          Card Details
        </Typography>
        <Box
          sx={{
            p: 2,
            border: '1px solid #ccc',
            borderRadius: 1,
            bgcolor: '#f9f9f9',
          }}
        >
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#424770',
                  '::placeholder': {
                    color: '#aab7c4',
                  },
                },
                invalid: {
                  color: '#9e2146',
                },
              },
            }}
          />
        </Box>
        <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
          Test card: 4242 4242 4242 4242, Exp: any future date, CVC: any 3 digits
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <DialogActions>
        <Button onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button 
          type="submit" 
          variant="contained" 
          disabled={!stripe || loading}
          startIcon={loading && <CircularProgress size={20} />}
        >
          {loading ? 'Processing...' : `Pay ${formatCurrency(formData.amount)}`}
        </Button>
      </DialogActions>
    </form>
  );
};

const PaymentForm = ({ open, onClose }) => {
  const { user } = useAuthStore();
  const [members, setMembers] = useState([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  
  const [formData, setFormData] = useState({
    memberId: '',
    paymentType: 'membership',
    amount: '',
    description: '',
  });

  useEffect(() => {
    if (open) {
      fetchMembers();
      
      // If logged-in user is a member, auto-select them
      if (user.role === 'member') {
        getMemberIdForUser();
      }
    }
  }, [open]);

  const fetchMembers = async () => {
    try {
      setLoadingMembers(true);
       const response = await memberService.getAll();
      setMembers(response.members || []);
    } catch (error) {
      console.error('Failed to load members:', error);
      toast.error('Failed to load members');
    } finally {
      setLoadingMembers(false);
    }
  };

  const getMemberIdForUser = async () => {
    try {
      const response = await memberService.getById({ params: { userId: user.id } });
      if (response.members && response.members.length > 0) {
        setFormData(prev => ({ ...prev, memberId: response.members[0].id }));
      }
    } catch (error) {
      console.error('Failed to get member ID:', error);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSuccess = () => {
    onClose(true);
    setFormData({
      memberId: '',
      paymentType: 'membership',
      amount: '',
      description: '',
    });
  };

  return (
    <Dialog open={open} onClose={() => onClose(false)} maxWidth="sm" fullWidth>
      <DialogTitle>Make Payment</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          {/* Member Dropdown */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              select
              label="Select Member"
              name="memberId"
              value={formData.memberId}
              onChange={handleChange}
              required
              disabled={user.role === 'member' || loadingMembers}
              helperText={user.role === 'member' ? 'Auto-selected (You)' : 'Select member for payment'}
            >
              <MenuItem value="">
                {loadingMembers ? 'Loading members...' : 'Select Member'}
              </MenuItem>
              {members.map((member) => (
                <MenuItem key={member.id} value={member.id}>
                  {member.firstName} {member.lastName} ({member.email})
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          {/* Payment Type */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              select
              label="Payment Type"
              name="paymentType"
              value={formData.paymentType}
              onChange={handleChange}
              required
            >
              <MenuItem value="membership">Membership</MenuItem>
              <MenuItem value="training_session">Training Session</MenuItem>
              <MenuItem value="supplement">Supplement</MenuItem>
            </TextField>
          </Grid>

          {/* Amount */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Amount"
              name="amount"
              type="number"
              value={formData.amount}
              onChange={handleChange}
              required
              inputProps={{ min: 1, step: 0.01 }}
            />
          </Grid>

          {/* Description */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Description (Optional)"
              name="description"
              value={formData.description}
              onChange={handleChange}
              multiline
              rows={2}
              placeholder="e.g., Monthly membership fee"
            />
          </Grid>
        </Grid>

        {/* Stripe Payment Form */}
        <Box sx={{ mt: 3 }}>
          <Elements stripe={stripePromise}>
            <CheckoutForm
              formData={formData}
              onSuccess={handleSuccess}
              onCancel={() => onClose(false)}
            />
          </Elements>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentForm;