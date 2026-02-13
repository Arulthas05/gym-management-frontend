import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Auth Components
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import ForgotPassword from './components/auth/ForgotPassword';

// Layout
import Layout from './components/common/Layout';
import ProtectedRoute from './components/common/ProtectedRoute';

// Dashboard Components
import AdminDashboard from './components/dashboard/AdminDashboard';
import TrainerDashboard from './components/dashboard/TrainerDashboard';
import MemberDashboard from './components/dashboard/MemberDashboard';

// Feature Components
import MemberList from './components/members/MemberList';
import TrainerList from './components/trainers/TrainerList';
import SessionList from './components/sessions/SessionList';
import MembershipList from './components/memberships/MembershipList';
import PaymentHistory from './components/payments/PaymentHistory';
import SupplementList from './components/supplements/SupplementList';
import AttendanceList from './components/attendance/AttendanceList';
import Reports from './components/reports/Reports';
import Profile from './components/profile/Profile';

import useAuthStore from './store/authStore';

const theme = createTheme({
  palette: {
    primary: {
      main: '#667eea',
    },
    secondary: {
      main: '#764ba2',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
});

// Dashboard Router Component
const DashboardRouter = () => {
  const { user } = useAuthStore();

  if (user?.role === 'admin') return <AdminDashboard />;
  if (user?.role === 'trainer') return <TrainerDashboard />;
  return <MemberDashboard />;
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* Protected Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardRouter />} />
            <Route path="members" element={<MemberList />} />
            <Route path="trainers" element={<TrainerList />} />
            <Route path="sessions" element={<SessionList />} />
            <Route path="memberships" element={<MembershipList />} />
            <Route path="payments" element={<PaymentHistory />} />
            <Route path="supplements" element={<SupplementList />} />
            <Route path="attendance" element={<AttendanceList />} />
            <Route path="reports" element={<Reports />} />
            <Route path="profile" element={<Profile />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </ThemeProvider>
  );
}

export default App;