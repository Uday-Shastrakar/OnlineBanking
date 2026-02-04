import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Avatar,
  Container
} from '@mui/material';
import {
  Security,
  Business,
  Lock
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { staffLogin } from '../../services/authService';
import AuthStorage from '../../services/authStorage';

interface StaffLoginFormData {
  employeeId: string;
  password: string;
}

const StaffLogin: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<StaffLoginFormData>({
    employeeId: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.employeeId || !formData.password) {
      setError('Please enter both employee ID and password');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Staff authentication with BANK_STAFF role validation
      const response = await staffLogin({
        employeeId: formData.employeeId,
        password: formData.password
      });

      // Validate that user has BANK_STAFF role
      if (!response.roles.includes('BANK_STAFF')) {
        throw new Error('Access denied. Not authorized as bank staff.');
      }

      // Store staff session
      AuthStorage.setAuthData(response.token, response.user, response.roles);

      // Emit audit event (would be handled by backend)
      console.log('STAFF_LOGIN_SUCCESS', {
        staff_user_id: response.user.userId,
        timestamp: new Date().toISOString()
      });

      // Redirect to staff dashboard
      navigate('/staff/dashboard');

    } catch (err: any) {
      console.error('Staff login error:', err);
      setError(err.message || 'Staff login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          py: 4
        }}
      >
        <Card sx={{ width: '100%', maxWidth: 450, boxShadow: 24 }}>
          <CardContent sx={{ p: 4 }}>
            {/* Header */}
            <Box textAlign="center" mb={4}>
              <Avatar sx={{ 
                bgcolor: 'primary.main', 
                width: 64, 
                height: 64, 
                mx: 'auto', 
                mb: 2 
              }}>
                <Business fontSize="large" />
              </Avatar>
              <Typography variant="h4" fontWeight="bold" gutterBottom>
                Staff Portal
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Internal Banking System - Authorized Personnel Only
              </Typography>
            </Box>

            {/* Security Notice */}
            <Alert 
              severity="info" 
              sx={{ mb: 3 }}
              icon={<Security />}
            >
              <Typography variant="body2">
                This is a secure internal system. Unauthorized access is prohibited and will be prosecuted.
              </Typography>
            </Alert>

            {/* Login Form */}
            <form onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="Employee ID"
                name="employeeId"
                value={formData.employeeId}
                onChange={handleInputChange}
                margin="normal"
                required
                placeholder="Enter your employee ID"
                disabled={loading}
                InputProps={{
                  startAdornment: <Security sx={{ mr: 1, color: 'text.secondary' }} />
                }}
              />

              <TextField
                fullWidth
                label="Password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                margin="normal"
                required
                placeholder="Enter your password"
                disabled={loading}
                InputProps={{
                  startAdornment: <Lock sx={{ mr: 1, color: 'text.secondary' }} />
                }}
              />

              {error && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {error}
                </Alert>
              )}

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                sx={{ mt: 3, py: 1.5 }}
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} /> : <Security />}
              >
                {loading ? 'Authenticating...' : 'Login as Staff'}
              </Button>
            </form>

            {/* Footer */}
            <Box textAlign="center" mt={3}>
              <Typography variant="caption" color="text.secondary">
                For customer access, use the customer portal.
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
};

export default StaffLogin;
