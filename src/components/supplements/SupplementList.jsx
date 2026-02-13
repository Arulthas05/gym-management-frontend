import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Button,
  Typography,
  TextField,
  InputAdornment,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Paper,
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ShoppingCart as CartIcon,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import api from '../../services/api';
import useAuthStore from '../../store/authStore';
import { formatCurrency } from '../../utils/helpers';
import SupplementForm from './SupplementForm';
import SupplementPurchase from './SupplementPurchase';
import supplementService from '../../services/supplementService';

const SupplementList = () => {
  const { user } = useAuthStore();
  const [supplements, setSupplements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [openForm, setOpenForm] = useState(false);
  const [openPurchase, setOpenPurchase] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [selectedSupplement, setSelectedSupplement] = useState(null);

  useEffect(() => {
    fetchSupplements();
  }, [searchTerm]);

  const fetchSupplements = async () => {
    try {
      setLoading(true);
      const response = await supplementService.getAll( {
        params: { search: searchTerm },
      });
      setSupplements(response.supplements || []);
    } catch (error) {
      toast.error('Failed to load supplements');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/supplements/${selectedSupplement.id}`);
      toast.success('Supplement deleted successfully');
      setOpenDelete(false);
      fetchSupplements();
    } catch (error) {
      toast.error('Failed to delete supplement');
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          Supplements Store
        </Typography>
        {user.role === 'admin' && (
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpenForm(true)}>
            Add Supplement
          </Button>
        )}
      </Box>

      <Paper sx={{ p: 2, mb: 3 }}>
        <TextField
          placeholder="Search supplements..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          fullWidth
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Paper>

      {loading ? (
        <Typography align="center">Loading...</Typography>
      ) : supplements.length === 0 ? (
        <Typography align="center">No supplements found</Typography>
      ) : (
        <Grid container spacing={3}>
          {supplements.map((supplement) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={supplement.id}>
              <Card elevation={3} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardMedia
                  component="img"
                  height="200"
                  image={supplement.imageUrl || 'https://via.placeholder.com/300x200?text=Supplement'}
                  alt={supplement.name}
                  sx={{ objectFit: 'cover' }}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" gutterBottom>
                    {supplement.name}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" paragraph>
                    {supplement.description?.substring(0, 80)}...
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                      {formatCurrency(supplement.price)}
                    </Typography>
                    <Chip
                      label={supplement.stock > 0 ? 'In Stock' : 'Out of Stock'}
                      color={supplement.stock > 0 ? 'success' : 'error'}
                      size="small"
                    />
                  </Box>
                  <Typography variant="caption" color="textSecondary">
                    Stock: {supplement.stock} units
                  </Typography>
                </CardContent>
                <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
                  {user.role === 'admin' ? (
                    <>
                      <IconButton
                        size="small"
                        onClick={() => {
                          setSelectedSupplement(supplement);
                          setOpenForm(true);
                        }}
                        color="primary"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => {
                          setSelectedSupplement(supplement);
                          setOpenDelete(true);
                        }}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </>
                  ) : (
                    <Button
                      fullWidth
                      variant="contained"
                      startIcon={<CartIcon />}
                      disabled={supplement.stock === 0}
                      onClick={() => {
                        setSelectedSupplement(supplement);
                        setOpenPurchase(true);
                      }}
                    >
                      Purchase
                    </Button>
                  )}
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <SupplementForm
        open={openForm}
        supplement={selectedSupplement}
        onClose={(refresh) => {
          setOpenForm(false);
          setSelectedSupplement(null);
          if (refresh) fetchSupplements();
        }}
      />

      <SupplementPurchase
        open={openPurchase}
        supplement={selectedSupplement}
        onClose={(refresh) => {
          setOpenPurchase(false);
          setSelectedSupplement(null);
          if (refresh) fetchSupplements();
        }}
      />

      <Dialog open={openDelete} onClose={() => setOpenDelete(false)}>
        <DialogTitle>Delete Supplement</DialogTitle>
        <DialogContent>
          Are you sure you want to delete {selectedSupplement?.name}?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDelete(false)}>Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SupplementList;