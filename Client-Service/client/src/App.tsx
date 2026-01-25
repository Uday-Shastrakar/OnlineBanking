import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { Box, CircularProgress } from '@mui/material';
import Navbar from './components/Navbar/Navbar';
import './App.css';
import ProtectedRoute from './routes/ProtectedRoute';

// Lazy loading of components
const HomePage = lazy(() => import('./components/Pages/HomePage'));
const Login = lazy(() => import('./components/Authentication/Login/Login'));
const UserRegister = lazy(() => import('./components/Authentication/UserRegistration/UserRegisterForm'));
const Forgotpassword = lazy(() => import('./components/Authentication/ForgotPassword/ForgotPassword'));
const ResetPassword = lazy(() => import('./components/Authentication/ResetPassword/ResetPassword'));
const UserDetails = lazy(() => import('./components/Pages/UserDetails/UserDetails'));
const Dashboard = lazy(() => import('./components/Pages/dashboard/main-dashboard/Dashboard'));
const CustomerRegistration = lazy(() => import('./components/Customer/CustomerRegistration/CustomerRegisterForm'));
const Profile = lazy(() => import('./components/Pages/dashboard/profile/Profile'));

// Phase 1: Customer Portal
const AccountList = lazy(() => import('./customer/accounts/AccountList'));
const TransferForm = lazy(() => import('./customer/transfer/TransferForm'));
const TransactionHistory = lazy(() => import('./customer/transactions/TransactionHistory'));

// Phase 2: Admin Portal
const AdminDashboard = lazy(() => import('./admin/dashboard/EnhancedAdminDashboard'));
const AuditCenter = lazy(() => import('./admin/audit/AuditCenter'));
const UserManagement = lazy(() => import('./admin/users/UserManagement'));
const AdminLayout = lazy(() => import('./admin/layout/AdminLayout'));

// MUI theme configuration
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1a237e', // Deep Navy for banking trust
    },
    secondary: {
      main: '#c62828', // Error-first red
    },
  },
});

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <Router>
        <Box width="100%" sx={{ minHeight: '100vh', bgcolor: '#f5f5f5' }}>
          <Suspense
            fallback={
              <div className="loader-container">
                <CircularProgress color="primary" />
              </div>
            }
          >
            <PageLayout />
          </Suspense>
        </Box>
      </Router>
    </ThemeProvider>
  );
};

const PageLayout: React.FC = () => {
  const location = useLocation();
  const isSpecialPage = location.pathname === '/login' ||
    location.pathname === '/register' ||
    location.pathname === '/CustomerRegistration' ||
    location.pathname.startsWith('/admin');

  return (
    <>
      {!isSpecialPage && <Navbar />}
      <Box sx={{ width: '100%' }}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<UserRegister />} />
          <Route path="/forgotpassword" element={<Forgotpassword />} />
          <Route path="/resetpassword" element={<ResetPassword />} />

          {/* Protected Customer Routes */}
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/accounts" element={<ProtectedRoute allowedRoles={['CUSTOMER']}><AccountList /></ProtectedRoute>} />
          <Route path="/transfer" element={<ProtectedRoute allowedRoles={['CUSTOMER']}><TransferForm /></ProtectedRoute>} />
          <Route path="/transactions" element={<ProtectedRoute allowedRoles={['CUSTOMER']}><TransactionHistory /></ProtectedRoute>} />

          {/* Protected Admin Routes with Layout */}
          <Route path="/admin" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminLayout /></ProtectedRoute>}>
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="audit" element={<AuditCenter />} />
            <Route path="users" element={<UserManagement />} />
          </Route>

          <Route path="/CustomerRegistration" element={<CustomerRegistration />} />
        </Routes>
      </Box>
    </>
  );
};

export default App;
