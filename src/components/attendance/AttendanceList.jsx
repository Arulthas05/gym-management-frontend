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
  Typography,
  Chip,
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
  QrCode as QrCodeIcon,
  CheckCircle as CheckInIcon,
  ExitToApp as CheckOutIcon,
  CameraAlt as ScanIcon,
} from '@mui/icons-material';
import { QRCodeSVG } from 'qrcode.react';
import { toast } from 'react-toastify';
import attendanceService from '../../services/attendanceService';
import useAuthStore from '../../store/authStore';
import { formatDate, formatTime } from '../../utils/helpers';
import QRScanner from './QRScanner';

const AttendanceList = () => {
  const { user } = useAuthStore();
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [openQRCode, setOpenQRCode] = useState(false);
  const [openScanner, setOpenScanner] = useState(false);

  useEffect(() => {
    fetchAttendance();
  }, [page, rowsPerPage, searchTerm]);

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const params = {
        page: page + 1,
        limit: rowsPerPage,
        search: searchTerm,
      };

      if (user.role === 'member') {
        params.memberId = user.memberId || user.id;
      }

      const response = await attendanceService.getAll(params);
      setAttendance(response.attendance || []);
      setTotalCount(response.pagination.totalItems || 0);
    } catch (error) {
      toast.error('Failed to load attendance records');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async () => {
    try {
      await attendanceService.checkIn(user.memberId || user.id);
      toast.success('Checked in successfully!');
      fetchAttendance();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Check-in failed');
    }
  };

  const handleCheckOut = async () => {
    try {
      await attendanceService.checkOut(user.memberId || user.id);
      toast.success('Checked out successfully!');
      fetchAttendance();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Check-out failed');
    }
  };

  const handleQRScan = async (data) => {
    try {
      await attendanceService.scanQR(data);
      toast.success('QR code scanned successfully!');
      setOpenScanner(false);
      fetchAttendance();
    } catch (error) {
      toast.error('Failed to process QR code');
    }
  };

  // Generate QR code data for member
  const qrData = JSON.stringify({
    memberId: user.memberId || user.id,
    timestamp: Date.now(),
  });

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          Attendance
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          {user.role === 'member' && (
            <>
              <Button variant="outlined" startIcon={<QrCodeIcon />} onClick={() => setOpenQRCode(true)}>
                My QR Code
              </Button>
              <Button variant="contained" startIcon={<CheckInIcon />} onClick={handleCheckIn}>
                Check In
              </Button>
              <Button variant="outlined" startIcon={<CheckOutIcon />} onClick={handleCheckOut}>
                Check Out
              </Button>
            </>
          )}
          {(user.role === 'admin' || user.role === 'trainer') && (
            <Button variant="contained" startIcon={<ScanIcon />} onClick={() => setOpenScanner(true)}>
              Scan QR Code
            </Button>
          )}
        </Box>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" variant="body2">
                Today's Check-ins
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                {attendance.filter(a => formatDate(a.check_in_time) === formatDate(new Date())).length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" variant="body2">
                This Week
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                {attendance.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" variant="body2">
                Currently In Gym
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                {attendance.filter(a => !a.check_out_time).length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Search */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <TextField
          placeholder="Search attendance..."
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

      {/* Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              {user.role !== 'member' && <TableCell>Member</TableCell>}
              <TableCell>Check In</TableCell>
              <TableCell>Check Out</TableCell>
              <TableCell>Duration</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} align="center">Loading...</TableCell>
              </TableRow>
            ) : attendance.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">No attendance records found</TableCell>
              </TableRow>
            ) : (
              attendance.map((record) => {
                const duration = record.check_out_time
                  ? Math.floor((new Date(record.check_out_time) - new Date(record.check_in_time)) / (1000 * 60))
                  : null;

                return (
                  <TableRow key={record.id} hover>
                    <TableCell>{formatDate(record.check_in_time)}</TableCell>
                    {user.role !== 'member' && (
                      <TableCell>
                        {record.first_name} {record.last_name}
                      </TableCell>
                    )}
                    <TableCell>{formatTime(record.check_in_time)}</TableCell>
                    <TableCell>{record.check_out_time ? formatTime(record.check_out_time) : '-'}</TableCell>
                    <TableCell>{duration ? `${duration} min` : '-'}</TableCell>
                    <TableCell>
                      <Chip
                        label={record.check_out_time ? 'Completed' : 'In Progress'}
                        color={record.check_out_time ? 'default' : 'success'}
                        size="small"
                      />
                    </TableCell>
                  </TableRow>
                );
              })
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

      {/* QR Code Dialog */}
      <Dialog open={openQRCode} onClose={() => setOpenQRCode(false)}>
        <DialogTitle>Your QR Code</DialogTitle>
        <DialogContent>
          <Box sx={{ textAlign: 'center', p: 3 }}>
            <QRCodeSVG value={qrData} size={256} />
            <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
              Show this QR code at the entrance to check in
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenQRCode(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* QR Scanner Dialog */}
      <QRScanner
        open={openScanner}
        onClose={() => setOpenScanner(false)}
        onScan={handleQRScan}
      />
    </Box>
  );
};

export default AttendanceList;