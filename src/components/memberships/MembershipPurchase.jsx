import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Divider,
  Alert,
} from '@mui/material';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { toast } from 'react-toastify';
import api from '../../services/api';
import paymentService from '../../services/paymentService';
import useAuthStore from '../../store/authStore';
import { formatCurrency } from '../../utils/helpers';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY || 'pk_test_dummy');

const CheckoutForm = ({ plan, onSuccess, onCancel }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) return;

    setLoading(true);
    setError('');

    try {
      // Create payment intent
      const { clientSecret } = await paymentService.createIntent({
        amount: plan.price,
        paymentType: 'membership',
        description: `${plan.name} Membership`,
        planId: plan.id,
      });

      // Confirm card payment
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
        },
      });

      if (stripeError) {
        setError(stripeError.message);
        toast.error(stripeError.message);
      } else if (paymentIntent.status === 'succeeded') {
        // Create membership after successful payment
        await api.post('/memberships/purchase', {
          planId: plan.id,
          paymentIntentId: paymentIntent.id,
        });

        toast.success('Membership purchased successfully!');
        onSuccess();
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Purchase failed';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          {plan.name}
        </Typography>
        <Typography variant="body2" color="textSecondary" paragraph>
          {plan.description}
        </Typography>
        <Divider sx={{ my: 2 }} />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography>Duration:</Typography>
          <Typography sx={{ fontWeight: 'bold' }}>
            {plan.duration} {plan.durationType}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography>Price:</Typography>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            {formatCurrency(plan.price)}
          </Typography>
        </Box>
        <Divider sx={{ my: 2 }} />
      </Box>

      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" gutterBottom>
          Payment Details
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
        <Button type="submit" variant="contained" disabled={!stripe || loading}>
          {loading ? 'Processing...' : `Pay ${formatCurrency(plan.price)}`}
        </Button>
      </DialogActions>
    </form>
  );
};

const MembershipPurchase = ({ open, plan, onClose }) => {
  if (!plan) return null;

  return (
    <Dialog open={open} onClose={() => onClose(false)} maxWidth="sm" fullWidth>
      <DialogTitle>Purchase Membership</DialogTitle>
      <DialogContent>
        <Elements stripe={stripePromise}>
          <CheckoutForm
            plan={plan}
            onSuccess={() => onClose(true)}
            onCancel={() => onClose(false)}
          />
        </Elements>
      </DialogContent>
    </Dialog>
  );
};

export default MembershipPurchase;