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
  Avatar,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Card,
  CardContent,
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Star as StarIcon,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import api from '../../services/api';
import { formatDate, getInitials, formatCurrency } from '../../utils/helpers';
import TrainerForm from './TrainerForm';
import TrainerDetail from './TrainerDetail';
import trainerService from '../../services/trainerService';

const TrainerList = () => {
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [openForm, setOpenForm] = useState(false);
  const [openDetail, setOpenDetail] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [selectedTrainer, setSelectedTrainer] = useState(null);

  useEffect(() => {
    fetchTrainers();
  }, [page, rowsPerPage, searchTerm]);

  const fetchTrainers = async () => {
    try {
      setLoading(true);
      const response = await trainerService.getAll( {
        params: {
          page: page + 1,
          limit: rowsPerPage,
          search: searchTerm,
        },
      });
      console.log(response.trainers);
      
      setTrainers(response.trainers || []);
      setTotalCount(response.pagination.totalItems || 0);
    } catch (error) {
      toast.error('Failed to load trainers');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/trainers/${selectedTrainer.id}`);
      toast.success('Trainer deleted successfully');
      setOpenDelete(false);
      fetchTrainers();
    } catch (error) {
      toast.error('Failed to delete trainer');
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          Trainers
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpenForm(true)}>
          Add Trainer
        </Button>
      </Box>

      {/* Stats */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" variant="body2">Total Trainers</Typography>
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>{totalCount}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" variant="body2">Active Trainers</Typography>
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                {trainers.filter(t => t.status === 'active').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" variant="body2">Specializations</Typography>
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                {new Set(trainers.map(t => t.specialization)).size}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Paper sx={{ p: 2, mb: 2 }}>
        <TextField
          placeholder="Search trainers..."
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
              <TableCell>Trainer</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Specialization</TableCell>
              <TableCell>Experience</TableCell>
              <TableCell>Hourly Rate</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} align="center">Loading...</TableCell>
              </TableRow>
            ) : trainers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center">No trainers found</TableCell>
              </TableRow>
            ) : (
              trainers.map((trainer) => (
                <TableRow key={trainer.id} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar sx={{ bgcolor: 'secondary.main' }}>
                        {getInitials(trainer.firstName, trainer.lastName)}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                          {trainer.firstName} {trainer.lastName}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <StarIcon sx={{ fontSize: 14, color: 'gold' }} />
                          <Typography variant="caption">{trainer.rating || '5.0'}</Typography>
                        </Box>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>{trainer.email}</TableCell>
                  <TableCell>{trainer.phone || 'N/A'}</TableCell>
                  <TableCell>
                    <Chip label={trainer.specialization || 'General'} size="small" />
                  </TableCell>
                  <TableCell>{trainer.experience || 0} years</TableCell>
                  <TableCell>{formatCurrency(trainer.hourlyRate || 0)}/hr</TableCell>
                  <TableCell>
                    <Chip
                      label={trainer.status || 'active'}
                      color={trainer.status === 'active' ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton size="small" onClick={() => {
                      setSelectedTrainer(trainer);
                      setOpenDetail(true);
                    }} color="primary">
                      <ViewIcon />
                    </IconButton>
                    <IconButton size="small" onClick={() => {
                      setSelectedTrainer(trainer);
                      setOpenForm(true);
                    }} color="primary">
                      <EditIcon />
                    </IconButton>
                    <IconButton size="small" onClick={() => {
                      setSelectedTrainer(trainer);
                      setOpenDelete(true);
                    }} color="error">
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

      <TrainerForm
        open={openForm}
        trainer={selectedTrainer}
        onClose={(refresh) => {
          setOpenForm(false);
          setSelectedTrainer(null);
          if (refresh) fetchTrainers();
        }}
      />

      <TrainerDetail
        open={openDetail}
        trainer={selectedTrainer}
        onClose={() => {
          setOpenDetail(false);
          setSelectedTrainer(null);
        }}
      />

      <Dialog open={openDelete} onClose={() => setOpenDelete(false)}>
        <DialogTitle>Delete Trainer</DialogTitle>
        <DialogContent>
          Are you sure you want to delete {selectedTrainer?.firstName} {selectedTrainer?.lastName}?
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

export default TrainerList;