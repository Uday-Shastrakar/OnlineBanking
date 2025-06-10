import React, { useEffect, useState } from 'react';
import { Box, Typography, Container, Paper, Divider } from '@mui/material';
import Sidebar from '../sidebar/Sidebar';
import './Dashboard.css';

const Dashboard: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [userData, setUserData] = useState<any | null>(null);

  // Fetch user details from localStorage
  useEffect(() => {
    const storedData = localStorage.getItem('userDetails');
    if (storedData) {
      const parsedData = JSON.parse(storedData);
      if (Array.isArray(parsedData) && parsedData.length > 0) {
        setUserData(parsedData[0]); // Assuming only the first user is needed
      }
    }
  }, []);

  return (
    <Box>
      {/* Navbar */}
      <Box className="navbar" sx={{ display: 'flex', alignItems: 'center', padding: '0 20px' }}>
        <Typography variant="h6" className="title">
          My Application
        </Typography>
      </Box>

      {/* Content */}
      <Box display="flex">
        {/* Sidebar */}
        <Sidebar onCollapse={setSidebarCollapsed} />

        {/* Main content */}
        <Box
          className={`main-content ${sidebarCollapsed ? 'collapsed' : ''}`}
          sx={{
            flexGrow: 1,
            marginLeft: sidebarCollapsed ? '60px' : '250px',
            marginTop: '64px', // Adjust for navbar height
            padding: '20px',
            transition: 'margin-left 0.3s ease',
          }}
        >
          <Container>
            <Typography variant="h4" gutterBottom>
              Dashboard
            </Typography>
            <Paper elevation={3} sx={{ padding: 2, mt: 3 }}>
              <Typography variant="h6" gutterBottom>
                User Information
              </Typography>
              <Divider sx={{ mb: 2 }} />
              {userData ? (
                <Box>
                  <Typography>
                    <strong>Name:</strong> {userData.firstName} {userData.lastName}
                  </Typography>
                  <Typography>
                    <strong>Email:</strong> {userData.email}
                  </Typography>
                  <Typography>
                    <strong>Username:</strong> {userData.userName}
                  </Typography>
                  <Typography>
                    <strong>Phone Number:</strong> {userData.phoneNumber || 'N/A'}
                  </Typography>
                </Box>
              ) : (
                <Typography>No user data found</Typography>
              )}
            </Paper>
          </Container>
        </Box>
      </Box>
    </Box>
  );
};

export default Dashboard;
