import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
} from '@mui/material';
import { toast } from 'react-toastify';
import api from '../../services/api';

const SupplementForm = ({ open, onClose, supplement }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stockQuantity: '',
    category: '',
    brand: '',
  });
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [loading, setLoading] = useState(false);

  // Get API base URL for image preview
  const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
  const SERVER_BASE = API_BASE.replace(/\/api\/?$/, '');

  // Placeholder image as data URI
  const PLACEHOLDER_IMAGE = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="300" height="200"%3E%3Crect width="300" height="200" fill="%23e0e0e0"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="Arial" font-size="18" fill="%23757575"%3ESupplement%3C/text%3E%3C/svg%3E';

  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return '';
    if (imageUrl.startsWith('http') || imageUrl.startsWith('blob:')) return imageUrl;
    if (imageUrl.startsWith('/')) return `${SERVER_BASE}${imageUrl}`;
    return `${SERVER_BASE}/${imageUrl}`;
  };

  useEffect(() => {
    if (supplement) {
      setFormData({
        name: supplement.name || '',
        description: supplement.description || '',
        price: supplement.price || '',
        stockQuantity: supplement.stock || supplement.stock_quantity || '',
        category: supplement.category || '',
        brand: supplement.brand || '',
      });
      setPreviewUrl(getImageUrl(supplement.image_url || supplement.imageUrl));
    } else {
      setFormData({
        name: '',
        description: '',
        price: '',
        stockQuantity: '',
        category: '',
        brand: '',
      });
      setPreviewUrl('');
      setImageFile(null);
    }
  }, [supplement, open]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);

      const payload = new FormData();
      payload.append('name', formData.name);
      payload.append('description', formData.description);
      payload.append('price', formData.price);
      payload.append('stockQuantity', formData.stockQuantity);
      payload.append('category', formData.category);
      payload.append('brand', formData.brand);
      if (imageFile) payload.append('supplementImage', imageFile);

      if (supplement) {
        await api.put(`/supplements/${supplement.id}`, payload);
        toast.success('Supplement updated successfully');
      } else {
        await api.post('/supplements', payload);
        toast.success('Supplement created successfully');
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
      <DialogTitle>{supplement ? 'Edit Supplement' : 'Add Supplement'}</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                multiline
                rows={3}
                required
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Price"
                name="price"
                type="number"
                value={formData.price}
                onChange={handleChange}
                inputProps={{ min: 0, step: 0.01 }}
                required
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Stock"
                name="stockQuantity"
                type="number"
                value={formData.stockQuantity}
                onChange={handleChange}
                inputProps={{ min: 0 }}
                required
              />
            </Grid>

            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Category"
                name="category"
                value={formData.category}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Brand"
                name="brand"
                value={formData.brand}
                onChange={handleChange}
              />
            </Grid>

            {/* Image upload */}
            <Grid item xs={12}>
              <input
                accept="image/*"
                style={{ display: 'none' }}
                id="supplement-image-input"
                type="file"
                onChange={handleFileChange}
              />
              <label htmlFor="supplement-image-input">
                <Button variant="outlined" component="span">
                  {previewUrl ? 'Change Image' : 'Upload Image'}
                </Button>
              </label>
              {previewUrl && (
                <img
                  src={previewUrl}
                  alt="preview"
                  style={{ maxHeight: 80, marginLeft: 12, borderRadius: 4 }}
                />
              )}
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => onClose(false)}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={loading}>
            {loading ? 'Saving...' : supplement ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default SupplementForm;