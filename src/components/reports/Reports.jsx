import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Download as DownloadIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { toast } from 'react-toastify';
import reportService from '../../services/reportService';
import { formatCurrency } from '../../utils/helpers';

const COLORS = ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#43e97b'];

const Reports = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [period, setPeriod] = useState('month');
  const [loading, setLoading] = useState(false);
  const [membershipData, setMembershipData] = useState(null);
  const [revenueData, setRevenueData] = useState(null);
  const [attendanceData, setAttendanceData] = useState(null);

  useEffect(() => {
    fetchReportData();
  }, [period, activeTab]);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      const params = { period };

      switch (activeTab) {
        case 0:
          const membershipRes = await reportService.getMembershipReport(params);
          setMembershipData(membershipRes.data);
          break;
        case 1:
          const revenueRes = await reportService.getRevenueReport(params);
          setRevenueData(revenueRes.data);
          break;
        case 2:
          const attendanceRes = await reportService.getAttendanceReport(params);
          setAttendanceData(attendanceRes.data);
          break;
        default:
          break;
      }
    } catch (error) {
      toast.error('Failed to load report data');
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = async () => {
    try {
      const reportTypes = ['membership', 'revenue', 'attendance'];
      const blob = await reportService.exportPDF(reportTypes[activeTab], { period });
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${reportTypes[activeTab]}-report-${period}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
      
      toast.success('Report exported successfully');
    } catch (error) {
      toast.error('Failed to export report');
    }
  };

  // Sample data for charts
  const membershipChartData = [
    { name: 'Active', value: 150, color: '#667eea' },
    { name: 'Expired', value: 30, color: '#764ba2' },
    { name: 'Pending', value: 20, color: '#f093fb' },
  ];

  const revenueChartData = [
    { month: 'Jan', revenue: 12000, expenses: 5000 },
    { month: 'Feb', revenue: 15000, expenses: 5500 },
    { month: 'Mar', revenue: 18000, expenses: 6000 },
    { month: 'Apr', revenue: 16000, expenses: 5800 },
    { month: 'May', revenue: 20000, expenses: 6200 },
    { month: 'Jun', revenue: 22000, expenses: 6500 },
  ];

  const attendanceChartData = [
    { day: 'Mon', count: 45 },
    { day: 'Tue', count: 52 },
    { day: 'Wed', count: 48 },
    { day: 'Thu', count: 61 },
    { day: 'Fri', count: 55 },
    { day: 'Sat', count: 67 },
    { day: 'Sun', count: 42 },
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          Reports & Analytics
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>Period</InputLabel>
            <Select value={period} onChange={(e) => setPeriod(e.target.value)} label="Period">
              <MenuItem value="week">This Week</MenuItem>
              <MenuItem value="month">This Month</MenuItem>
              <MenuItem value="quarter">This Quarter</MenuItem>
              <MenuItem value="year">This Year</MenuItem>
            </Select>
          </FormControl>
          <Button variant="outlined" startIcon={<RefreshIcon />} onClick={fetchReportData}>
            Refresh
          </Button>
          <Button variant="contained" startIcon={<DownloadIcon />} onClick={handleExportPDF}>
            Export PDF
          </Button>
        </Box>
      </Box>

      <Paper sx={{ mb: 3 }}>
        <Tabs value={activeTab} onChange={(e, val) => setActiveTab(val)}>
          <Tab label="Membership Report" />
          <Tab label="Revenue Report" />
          <Tab label="Attendance Report" />
        </Tabs>
      </Paper>

      {/* Membership Report */}
      {activeTab === 0 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" variant="body2">
                  Total Members
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                  200
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" variant="body2">
                  Active Memberships
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                  150
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" variant="body2">
                  Expiring Soon
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                  12
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Membership Distribution
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={membershipChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => `${entry.name}: ${entry.value}`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {membershipChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Membership Growth
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={revenueChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="revenue" stroke="#667eea" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* Revenue Report */}
      {activeTab === 1 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" variant="body2">
                  Total Revenue
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                  {formatCurrency(103000)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" variant="body2">
                  Total Expenses
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                  {formatCurrency(35000)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" variant="body2">
                  Net Profit
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                  {formatCurrency(68000)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Revenue vs Expenses
              </Typography>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={revenueChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="revenue" fill="#667eea" />
                  <Bar dataKey="expenses" fill="#764ba2" />
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* Attendance Report */}
      {activeTab === 2 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" variant="body2">
                  Today's Attendance
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                  67
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" variant="body2">
                  Average Daily
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                  53
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" variant="body2">
                  Peak Hours
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                  6-8 PM
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Weekly Attendance
              </Typography>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={attendanceChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#667eea" />
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default Reports;