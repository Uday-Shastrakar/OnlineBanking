import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { Box, CircularProgress } from '@mui/material';
import Navbar from './components/Navbar/Navbar';
import './App.css';

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

// MUI theme configuration
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <Router>
        <Box width="400px" sx={{ width: { xl: '1488px' } }} m="auto">
          <Suspense
            fallback={
              <div className="loader-container">
                <CircularProgress color="secondary" />
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
  const isSpecialPage = location.pathname === '/login' || location.pathname === '/register' || location.pathname === '/CustomerRegistration';

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
          <Route path="/user" element={<UserDetails />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/CustomerRegistration" element={<CustomerRegistration />}/>
          <Route path="/profile" element={<Profile />}/>
          {/* Add other routes here */}
        </Routes>
      </Box>
      {/* {!isSpecialPage && <Footer />} */}
    </>
  );
};

export default App;
