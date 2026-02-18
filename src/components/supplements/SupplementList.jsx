import React, { useState, useEffect } from "react";
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
} from "@mui/material";
import {
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ShoppingCart as CartIcon,
} from "@mui/icons-material";
import { toast } from "react-toastify";
import api from "../../services/api";
import useAuthStore from "../../store/authStore";
import { formatCurrency } from "../../utils/helpers";
import SupplementForm from "./SupplementForm";
import SupplementPurchase from "./SupplementPurchase";
import supplementService from "../../services/supplementService";

const SupplementList = () => {
  const { user } = useAuthStore();
  const [supplements, setSupplements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [openForm, setOpenForm] = useState(false);
  const [openPurchase, setOpenPurchase] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [selectedSupplement, setSelectedSupplement] = useState(null);

  // Get API base URL
  const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5000/api";
  const SERVER_BASE = API_BASE.replace(/\/api\/?$/, "");

  // Placeholder image as data URI (gray box with text)
  const PLACEHOLDER_IMAGE =
    'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="300" height="200"%3E%3Crect width="300" height="200" fill="%23e0e0e0"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="Arial" font-size="18" fill="%23757575"%3ESupplement%3C/text%3E%3C/svg%3E';

  // Helper to construct full image URL
  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return PLACEHOLDER_IMAGE;
    if (imageUrl.startsWith("http")) return imageUrl;
    if (imageUrl.startsWith("/")) return `${SERVER_BASE}${imageUrl}`;
    return `${SERVER_BASE}/${imageUrl}`;
  };

  useEffect(() => {
    fetchSupplements();
  }, [searchTerm]);

  const fetchSupplements = async () => {
    try {
      setLoading(true);
      const response = await supplementService.getAll({
        params: { search: searchTerm },
      });
      setSupplements(response.supplements || []);
    } catch (error) {
      toast.error("Failed to load supplements");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/supplements/${selectedSupplement.id}`);
      toast.success("Supplement deleted successfully");
      setOpenDelete(false);
      fetchSupplements();
    } catch (error) {
      toast.error("Failed to delete supplement");
    }
  };

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h4" sx={{ fontWeight: "bold" }}>
          Supplements Store
        </Typography>
        {user.role === "admin" && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenForm(true)}
          >
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
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: 400,
          }}
        >
          <Typography variant="h6" color="text.secondary">
            Loading supplements...
          </Typography>
        </Box>
      ) : supplements.length === 0 ? (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            minHeight: 400,
            gap: 2,
          }}
        >
          <Typography variant="h6" color="text.secondary">
            No supplements found
          </Typography>
          {searchTerm && (
            <Typography variant="body2" color="text.secondary">
              Try adjusting your search terms
            </Typography>
          )}
        </Box>
      ) : (
        <Grid container spacing={3} justifyContent="space-between" >
          {supplements.map((supplement) => (
            <Grid
              item
              key={supplement.id}
              xs="auto" // 🔥 important
              sx={{
                display: "flex-start",
              }}
            >
              <Card
                sx={{
                  width: 280, // 🔥 fixed same width
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <CardMedia
                  component="img"
                  image={getImageUrl(
                    supplement.imageUrl || supplement.image_url,
                  )}
                  alt={supplement.name}
                  sx={{
                    height: 180,
                    objectFit: "cover",
                  }}
                />

                <CardContent
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    flexGrow: 1,
                    p: 2,
                    gap: 1,
                  }}
                >
                  <Typography
                    variant="subtitle1"
                    sx={{
                      fontWeight: 600,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {supplement.name}
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      display: "-webkit-box",
                      WebkitBoxOrient: "vertical",
                      WebkitLineClamp: 2,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      minHeight: 40,
                      lineHeight: "20px",
                    }}
                  >
                    {supplement.description || "No description available"}
                  </Typography>

                  <Box sx={{ mt: "auto" }}>
                    <Typography
                      variant="h6"
                      sx={{ fontWeight: 700, color: "primary.main" }}
                    >
                      {formatCurrency(supplement.price)}
                    </Typography>

                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mt: 0.5,
                      }}
                    >
                      <Typography variant="caption" color="text.secondary">
                        Stock: {supplement.stock}
                      </Typography>

                      <Chip
                        label={
                          supplement.stock > 0 ? "In Stock" : "Out of Stock"
                        }
                        size="small"
                        color={supplement.stock > 0 ? "success" : "error"}
                      />
                    </Box>
                  </Box>
                </CardContent>

                <CardActions
                  sx={{
                    p: 2,
                    pt: 0,
                  }}
                >
                  {user.role === "admin" ? (
                    <Box sx={{ display: "flex", gap: 2 }}>
                      <IconButton
                        size="medium"
                        onClick={() => {
                          setSelectedSupplement(supplement);
                          setOpenForm(true);
                        }}
                        color="primary"
                        sx={{
                          border: "1px solid",
                          borderColor: "primary.main",
                          "&:hover": {
                            backgroundColor: "primary.light",
                            opacity: 0.1,
                          },
                        }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="medium"
                        onClick={() => {
                          setSelectedSupplement(supplement);
                          setOpenDelete(true);
                        }}
                        color="error"
                        sx={{
                          border: "1px solid",
                          borderColor: "error.main",
                          "&:hover": {
                            backgroundColor: "error.light",
                            opacity: 0.1,
                          },
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  ) : (
                    <Button
                      variant="contained"
                      startIcon={<CartIcon />}
                      disabled={supplement.stock === 0}
                      onClick={() => {
                        setSelectedSupplement(supplement);
                        setOpenPurchase(true);
                      }}
                      sx={{
                        width: "100%",
                        maxWidth: 220,
                        textTransform: "none",
                        fontWeight: 600,
                        py: 1,
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
