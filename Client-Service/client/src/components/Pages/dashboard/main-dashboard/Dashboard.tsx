import React, { useEffect, useState } from 'react';
import { Box, Typography, Container, Paper, Divider, CircularProgress, Alert } from '@mui/material';
import { useSidebar } from '../../../../contexts/SidebarContext';
import { customerService } from '../../../../services/customerService';
import { accountService, AccountQueryDto } from '../../../../services/api/accountService';
import { userCustomerMappingService } from '../../../../services/api/userCustomerMappingService';
import Sidebar from '../sidebar/Sidebar';
import './Dashboard.css';

interface Customer {
  customerId: number;
  fullName: string;
  email: string;
  phoneNumber: string;
  kycStatus: string;
  status: string;
}

interface Account {
  accountId: string;
  accountNumber: string;
  accountType: string;
  balance: number;
  status: string;
  customerId?: number;
}

const Dashboard: React.FC = () => {
  const { collapsed } = useSidebar();
  const [userData, setUserData] = useState<any | null>(null);
  const [customerData, setCustomerData] = useState<Customer | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch user details from localStorage
  useEffect(() => {
    const storedData = localStorage.getItem('userDetails');
    if (storedData) {
      const parsedData = JSON.parse(storedData);
      if (Array.isArray(parsedData) && parsedData.length > 0) {
        setUserData(parsedData[0]);
      }
    }
  }, []);

  // Fetch customer data and accounts
  useEffect(() => {
    const fetchCustomerDataAndAccounts = async () => {
      if (!userData) return;

      try {
        setLoading(true);
        setError(null);

        // Get customer data using user-customer mapping
        const mapping = await userCustomerMappingService.getMappingByUserId(userData.userId);
        if (!mapping) {
          setError('No customer account found for this user');
          return;
        }

        // Fetch customer details
        const customer = await customerService.getCustomer(mapping.customerId);
        setCustomerData(customer as Customer | null);

        // Fetch customer accounts
        const customerAccounts = await accountService.getAccountsByCustomerId(mapping.customerId);
        setAccounts(customerAccounts as Account[]);

      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchCustomerDataAndAccounts();
  }, [userData]);

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
        <Sidebar />

        {/* Main content */}
        <Box
          className={`main-content ${collapsed ? 'collapsed' : ''}`}
          sx={{
            flexGrow: 1,
            marginLeft: collapsed ? '60px' : '250px',
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
