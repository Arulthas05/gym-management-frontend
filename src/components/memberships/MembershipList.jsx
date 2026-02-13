import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Button,
  TextField,
  InputAdornment,
  IconButton,
  Chip,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Card,
  CardContent,
  CardActions,
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  CheckCircle as ActiveIcon,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import api from '../../services/api';
import useAuthStore from '../../store/authStore';
import { formatDate, formatCurrency } from '../../utils/helpers';
import MembershipForm from './MembershipForm';
import MembershipPurchase from './MembershipPurchase';

const MembershipList = () => {
  const { user } = useAuthStore();
  const [memberships, setMemberships] = useState([]);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [openForm, setOpenForm] = useState(false);
  const [openPurchase, setOpenPurchase] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [selectedMembership, setSelectedMembership] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);

  useEffect(() => {
    fetchMemberships();
    fetchPlans();
  }, [page, rowsPerPage, searchTerm]);

  const fetchMemberships = async () => {
    try {
      setLoading(true);
      const params = {
        page: page + 1,
        limit: rowsPerPage,
        search: searchTerm,
      };

      if (user.role === 'member') {
        params.memberId = user.id;
      }

      const response = await api.get('/memberships', { params });
      setMemberships(response.data.data || []);
      setTotalCount(response.data.total || 0);
    } catch (error) {
      toast.error('Failed to load memberships');
    } finally {
      setLoading(false);
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

  const handleDelete = async () => {
    try {
      await api.delete(`/memberships/${selectedMembership.id}`);
      toast.success('Membership deleted successfully');
      setOpenDelete(false);
      fetchMemberships();
    } catch (error) {
      toast.error('Failed to delete membership');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'expired':
        return 'error';
      case 'pending':
        return 'warning';
      case 'cancelled':
        return 'default';
      default:
        return 'default';
    }
  };

  // If member, show available plans as cards
  if (user.role === 'member') {
    return (
      <Box>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
          Membership Plans
        </Typography>

        {/* Current Membership */}
        {memberships.length > 0 && (
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Your Current Membership
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <Typography color="textSecondary" variant="body2">Plan</Typography>
                <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                  {memberships[0].planName}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Typography color="textSecondary" variant="body2">Status</Typography>
                <Chip
                  label={memberships[0].status}
                  color={getStatusColor(memberships[0].status)}
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Typography color="textSecondary" variant="body2">Start Date</Typography>
                <Typography variant="body1">{formatDate(memberships[0].startDate)}</Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Typography color="textSecondary" variant="body2">End Date</Typography>
                <Typography variant="body1">{formatDate(memberships[0].endDate)}</Typography>
              </Grid>
            </Grid>
          </Paper>
        )}

        {/* Available Plans */}
        <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
          Available Plans
        </Typography>
        <Grid container spacing={3}>
          {plans.map((plan) => (
            <Grid item xs={12} sm={6} md={4} key={plan.id}>
              <Card elevation={3} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                    {plan.name}
                  </Typography>
                  <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
                    {formatCurrency(plan.price)}
                    <Typography component="span" variant="body2" color="textSecondary">
                      /{plan.duration} {plan.durationType}
                    </Typography>
                  </Typography>
                  <Typography variant="body2" color="textSecondary" paragraph>
                    {plan.description}
                  </Typography>
                  <Box component="ul" sx={{ pl: 2 }}>
                    {(plan.features || []).map((feature, idx) => (
                      <Typography component="li" variant="body2" key={idx} sx={{ mb: 0.5 }}>
                        {feature}
                      </Typography>
                    ))}
                  </Box>
                </CardContent>
                <CardActions sx={{ p: 2 }}>
                  <Button
                    fullWidth
                    variant={plan.popular ? 'contained' : 'outlined'}
                    onClick={() => {
                      setSelectedPlan(plan);
                      setOpenPurchase(true);
                    }}
                  >
                    Purchase Plan
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>

        <MembershipPurchase
          open={openPurchase}
          plan={selectedPlan}
          onClose={(refresh) => {
            setOpenPurchase(false);
            if (refresh) fetchMemberships();
          }}
        />
      </Box>
    );
  }

  // Admin/Trainer view - table format
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          Memberships
        </Typography>
        {user.role === 'admin' && (
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpenForm(true)}>
            Add Membership
          </Button>
        )}
      </Box>

      <Paper sx={{ p: 2, mb: 2 }}>
        <TextField
          placeholder="Search memberships..."
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

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Member</TableCell>
              <TableCell>Plan</TableCell>
              <TableCell>Start Date</TableCell>
              <TableCell>End Date</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} align="center">Loading...</TableCell>
              </TableRow>
            ) : memberships.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">No memberships found</TableCell>
              </TableRow>
            ) : (
              memberships.map((membership) => (
                <TableRow key={membership.id} hover>
                  <TableCell>
                    {membership.member?.firstName} {membership.member?.lastName}
                  </TableCell>
                  <TableCell>{membership.planName}</TableCell>
                  <TableCell>{formatDate(membership.startDate)}</TableCell>
                  <TableCell>{formatDate(membership.endDate)}</TableCell>
                  <TableCell>{formatCurrency(membership.amount)}</TableCell>
                  <TableCell>
                    <Chip
                      label={membership.status}
                      color={getStatusColor(membership.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      onClick={() => {
                        setSelectedMembership(membership);
                        setOpenForm(true);
                      }}
                      color="primary"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => {
                        setSelectedMembership(membership);
                        setOpenDelete(true);
                      }}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={totalCount}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={[5, 10, 25]}
        />
      </TableContainer>

      <MembershipForm
        open={openForm}
        membership={selectedMembership}
        onClose={(refresh) => {
          setOpenForm(false);
          setSelectedMembership(null);
          if (refresh) fetchMemberships();
        }}
      />

      <Dialog open={openDelete} onClose={() => setOpenDelete(false)}>
        <DialogTitle>Delete Membership</DialogTitle>
        <DialogContent>
          Are you sure you want to delete this membership?
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

export default MembershipList;