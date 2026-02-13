import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
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
import { formatCurrency } from '../../utils/helpers';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY || 'pk_test_dummy');

const CheckoutForm = ({ supplement, quantity, onSuccess, onCancel }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const total = supplement.price * quantity;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) return;

    setLoading(true);
    setError('');

    try {
      const { clientSecret } = await paymentService.createIntent({
        amount: total,
        paymentType: 'supplement',
        description: `${supplement.name} x${quantity}`,
        supplementId: supplement.id,
        quantity,
      });

      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
        },
      });

      if (stripeError) {
        setError(stripeError.message);
        toast.error(stripeError.message);
      } else if (paymentIntent.status === 'succeeded') {
        await api.post('/supplements/purchase', {
          supplementId: supplement.id,
          quantity,
          paymentIntentId: paymentIntent.id,
        });

        toast.success('Purchase successful!');
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
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography>Unit Price:</Typography>
          <Typography>{formatCurrency(supplement.price)}</Typography>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography>Quantity:</Typography>
          <Typography sx={{ fontWeight: 'bold' }}>{quantity}</Typography>
        </Box>
        <Divider sx={{ my: 2 }} />
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="h6">Total:</Typography>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            {formatCurrency(total)}
          </Typography>
        </Box>
      </Box>

      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" gutterBottom>
          Payment Details
        </Typography>
        <Box sx={{ p: 2, border: '1px solid #ccc', borderRadius: 1, bgcolor: '#f9f9f9' }}>
          <CardElement />
        </Box>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <DialogActions>
        <Button onClick={onCancel} disabled={loading}>Cancel</Button>
        <Button type="submit" variant="contained" disabled={!stripe || loading}>
          {loading ? 'Processing...' : `Pay ${formatCurrency(total)}`}
        </Button>
      </DialogActions>
    </form>
  );
};

const SupplementPurchase = ({ open, supplement, onClose }) => {
  const [quantity, setQuantity] = useState(1);

  if (!supplement) return null;

  return (
    <Dialog open={open} onClose={() => onClose(false)} maxWidth="sm" fullWidth>
      <DialogTitle>Purchase {supplement.name}</DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" color="textSecondary" paragraph>
            {supplement.description}
          </Typography>
          <TextField
            fullWidth
            label="Quantity"
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(Math.max(1, Math.min(supplement.stock, parseInt(e.target.value) || 1)))}
            inputProps={{ min: 1, max: supplement.stock }}
            sx={{ mb: 2 }}
          />
        </Box>

        <Elements stripe={stripePromise}>
          <CheckoutForm
            supplement={supplement}
            quantity={quantity}
            onSuccess={() => onClose(true)}
            onCancel={() => onClose(false)}
          />
        </Elements>
      </DialogContent>
    </Dialog>
  );
};

export default SupplementPurchase;