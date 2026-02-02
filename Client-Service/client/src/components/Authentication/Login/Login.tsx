import React, { useState } from 'react';
import { Avatar, Box, Button, Card, Container, CssBaseline, Grid, Link, TextField, Typography } from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { login } from '../../../services/authService';
import './Login.css';
import { useNavigate } from 'react-router-dom';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import AuthStorage from '../../../services/authStorage';

const Copyright = () => (
  <Typography variant="body2" color="textSecondary" align="center">
    {'Copyright © ' + new Date().getFullYear() + ' NUMS Bank. All rights reserved.'}
  </Typography>
);

const Login: React.FC = () => {
  const [username, setusername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const navigate = useNavigate();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');

    try {
      await login({ username, password });

      // Get user roles after successful login
      const userRoles = AuthStorage.getRoles();
      console.log('User roles after login:', userRoles);
      console.log('User roles type:', typeof userRoles);
      console.log('User roles includes ADMIN:', userRoles.includes('ADMIN'));
      console.log('User roles includes USER:', userRoles.includes('USER'));

      // Role-based routing
      if (userRoles.includes('ADMIN')) {
        console.log('Admin user detected, redirecting to admin dashboard');
        navigate('/admin/dashboard');
      } else if (userRoles.includes('CUSTOMER')) {
        console.log('Customer user detected, redirecting to customer dashboard');
        navigate('/dashboard');
      } else if (userRoles.includes('BANK_STAFF')) {
        console.log('Bank staff detected, redirecting to staff dashboard');
        navigate('/staff/dashboard');
      } else if (userRoles.includes('USER')) {
        console.log('USER role detected, checking if admin user...');
        // Check if this is the admin user with USER role (fallback)
        if (username === 'adminUser') {
          console.log('Admin user with USER role detected, redirecting to admin dashboard');
          navigate('/admin/dashboard');
        } else {
          console.log('Regular user with USER role, redirecting to dashboard');
          navigate('/dashboard');
        }
      } else {
        console.log('Default user, redirecting to dashboard');
        navigate('/dashboard');
      }
    } catch (err: any) {
      // Handle login errors
      setError(err.message || 'Login failed. Please try again.');
    }
  };

  return (
    <Container className='container'>
      <Card className='card'>
        <div className="tag">
          <Avatar className="avatar">
            <PersonAddIcon />
          </Avatar>
          <Typography component="h1" variant="h5">
            NUMS Bank Portal
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
            Customer, Staff & Admin Access
          </Typography>
          {error && <Typography color="error" sx={{ mt: 1 }}>{error}</Typography>}
        </div>

        {/* Login Hints */}
        <Box sx={{ mb: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
          <Typography variant="caption" display="block" gutterBottom>
            <strong>Demo Credentials:</strong>
          </Typography>
          <Typography variant="caption" display="block">
            • Admin: adminUser / password1
          </Typography>
          <Typography variant="caption" display="block">
            • Customer: regularUser / password2
          </Typography>
        </Box>
        <form className="form" onSubmit={handleSubmit} noValidate >
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            id="username"
            label="username"
            name="username"
            autoComplete="username"
            autoFocus
            value={username}
            onChange={(e) => setusername(e.target.value)}
          />
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <div className="submit-btn">
            <Button
              type="submit"
              variant="contained"
              className="submit"
            >
              Log In
            </Button>
            {error && (
              <Typography className="error-message" variant="body2">
                {error}
              </Typography>
            )}
          </div>
          <Grid container>
            <Grid item xs>
              <Link href="/forgotpassword" variant="body2">
                Forgot password?
              </Link>
            </Grid>
            <Grid item>
              <Link href="/register" variant="body2">
                {"Don't have an account? Sign Up"}
              </Link>
            </Grid>
          </Grid>
        </form>
      </Card>
    </Container>
  );
};

export default Login;
