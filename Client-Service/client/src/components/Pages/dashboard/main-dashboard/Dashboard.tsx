import React, { useEffect, useState } from 'react';
import { 
  Box, 
  Typography, 
  Container, 
  Paper, 
  Divider, 
  CircularProgress, 
  Alert,
  Grid,
  Card,
  CardContent,
  Avatar,
  Chip,
  Button,
  IconButton,
  Tooltip,
  LinearProgress,
  Fab
} from '@mui/material';
import { 
  AccountBalance,
  AccountBalanceWallet,
  TrendingUp,
  CreditCard,
  ArrowUpward,
  ArrowDownward,
  SwapHoriz,
  Visibility,
  Refresh,
  Add,
  QrCode,
  Notifications,
  Person,
  Home,
  AccountCircle,
  Settings,
  Logout
} from '@mui/icons-material';
import { useSidebar } from '../../../../contexts/SidebarContext';
import { customerService } from '../../../../services/customerService';
import { accountService, AccountQueryDto } from '../../../../services/api/accountService';
import { GetCustomer } from '../../../../Types';
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
  const [customerData, setCustomerData] = useState<GetCustomer | null>(null);
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

        // Get customer data directly by userId
        const customer = await customerService.getCustomer(userData.userId);
        if (!customer) {
          setError('No customer account found for this user');
          return;
        }
        
        setCustomerData(customer);

        // Fetch customer accounts using userId (not customerId)
        const customerAccounts = await accountService.getAccountsByUserId(userData.userId);
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

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <Box textAlign="center">
          <CircularProgress size={60} thickness={4} />
          <Typography variant="h6" sx={{ mt: 2, color: 'text.secondary' }}>
            Loading your banking dashboard...
          </Typography>
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error" variant="filled">
          {error}
        </Alert>
      </Container>
    );
  }

  // Calculate total balance
  const totalBalance = accounts.reduce((sum, account) => sum + (account.balance || 0), 0);

  return (
    <Box className="banking-dashboard">
      {/* Top Navigation Bar */}
      <Paper className="top-nav" elevation={3}>
        <Container maxWidth="xl">
          <Box display="flex" justifyContent="space-between" alignItems="center" py={2}>
            <Box display="flex" alignItems="center">
              <AccountBalance sx={{ fontSize: 32, color: 'primary.main', mr: 2 }} />
              <Typography variant="h5" fontWeight="bold" color="primary">
                NUMS Digital Banking
              </Typography>
            </Box>
            
            <Box display="flex" alignItems="center" gap={2}>
              <Tooltip title="Notifications">
                <IconButton>
                  <Notifications />
                </IconButton>
              </Tooltip>
              <Tooltip title="Refresh">
                <IconButton onClick={() => window.location.reload()}>
                  <Refresh />
                </IconButton>
              </Tooltip>
              <Chip 
                avatar={<Avatar sx={{ bgcolor: 'primary.main' }}>{customerData?.firstName?.charAt(0)}</Avatar>}
                label={`${customerData?.firstName} ${customerData?.lastName}`}
                variant="outlined"
              />
            </Box>
          </Box>
        </Container>
      </Paper>

      {/* Welcome Section */}
      <Container maxWidth="xl" sx={{ mt: 3 }}>
        <Box className="welcome-section" mb={4}>
          <Typography variant="h3" fontWeight="bold" gutterBottom>
            Welcome back, {customerData?.firstName}! 👋
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Manage your finances with confidence and security
          </Typography>
        </Box>

        {/* Quick Stats Cards */}
        <Grid container spacing={3} mb={4}>
          <Grid item xs={12} md={4}>
            <Card className="stat-card total-balance">
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                      Total Balance
                    </Typography>
                    <Typography variant="h4" fontWeight="bold" color="primary.main">
                      ${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </Typography>
                    <Chip 
                      icon={<TrendingUp />} 
                      label="+12.5% this month" 
                      color="success" 
                      size="small" 
                      sx={{ mt: 1 }}
                    />
                  </Box>
                  <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56 }}>
                    <AccountBalanceWallet />
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card className="stat-card">
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                      Active Accounts
                    </Typography>
                    <Typography variant="h4" fontWeight="bold">
                      {accounts.length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      All accounts active
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: 'success.main', width: 56, height: 56 }}>
                    <CreditCard />
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card className="stat-card">
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                      Account Status
                    </Typography>
                    <Typography variant="h4" fontWeight="bold" color="success.main">
                      Active
                    </Typography>
                    <Chip 
                      label="Verified" 
                      color="primary" 
                      size="small" 
                      sx={{ mt: 1 }}
                    />
                  </Box>
                  <Avatar sx={{ bgcolor: 'info.main', width: 56, height: 56 }}>
                    <AccountCircle />
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Accounts Section */}
        <Box mb={4}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h5" fontWeight="bold">
              Your Accounts
            </Typography>
            <Button variant="contained" startIcon={<Add />}>
              Open New Account
            </Button>
          </Box>

          <Grid container spacing={3}>
            {accounts.map((account, index) => (
              <Grid item xs={12} md={6} lg={4} key={index}>
                <Card className="account-card" elevation={3}>
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                      <Box>
                        <Typography variant="h6" fontWeight="bold" gutterBottom>
                          {account.accountType || 'Savings Account'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          ****{account.accountNumber?.toString().slice(-4)}
                        </Typography>
                      </Box>
                      <Avatar sx={{ bgcolor: 'primary.main' }}>
                        <CreditCard />
                      </Avatar>
                    </Box>
                    
                    <Divider sx={{ my: 2 }} />
                    
                    <Typography variant="h5" fontWeight="bold" color="primary.main" gutterBottom>
                      ${(account.balance || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </Typography>
                    
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Chip 
                        label={account.status || 'Active'} 
                        color="success" 
                        size="small"
                      />
                      <Box>
                        <Tooltip title="View Details">
                          <IconButton size="small">
                            <Visibility />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Transfer">
                          <IconButton size="small">
                            <SwapHoriz />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Quick Actions */}
        <Box mb={4}>
          <Typography variant="h5" fontWeight="bold" mb={3}>
            Quick Actions
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={6} md={3}>
              <Card className="action-card" sx={{ textAlign: 'center', py: 3 }}>
                <IconButton color="primary" sx={{ fontSize: 40 }}>
                  <ArrowUpward sx={{ fontSize: 40 }} />
                </IconButton>
                <Typography variant="body1" fontWeight="medium" sx={{ mt: 1 }}>
                  Send Money
                </Typography>
              </Card>
            </Grid>
            <Grid item xs={6} md={3}>
              <Card className="action-card" sx={{ textAlign: 'center', py: 3 }}>
                <IconButton color="primary" sx={{ fontSize: 40 }}>
                  <ArrowDownward sx={{ fontSize: 40 }} />
                </IconButton>
                <Typography variant="body1" fontWeight="medium" sx={{ mt: 1 }}>
                  Request Money
                </Typography>
              </Card>
            </Grid>
            <Grid item xs={6} md={3}>
              <Card className="action-card" sx={{ textAlign: 'center', py: 3 }}>
                <IconButton color="primary" sx={{ fontSize: 40 }}>
                  <QrCode sx={{ fontSize: 40 }} />
                </IconButton>
                <Typography variant="body1" fontWeight="medium" sx={{ mt: 1 }}>
                  Scan QR
                </Typography>
              </Card>
            </Grid>
            <Grid item xs={6} md={3}>
              <Card className="action-card" sx={{ textAlign: 'center', py: 3 }}>
                <IconButton color="primary" sx={{ fontSize: 40 }}>
                  <AccountBalance sx={{ fontSize: 40 }} />
                </IconButton>
                <Typography variant="body1" fontWeight="medium" sx={{ mt: 1 }}>
                  Pay Bills
                </Typography>
              </Card>
            </Grid>
          </Grid>
        </Box>
      </Container>

      {/* Floating Action Button */}
      <Fab 
        color="primary" 
        aria-label="add" 
        className="fab"
        sx={{ position: 'fixed', bottom: 24, right: 24 }}
      >
        <Add />
      </Fab>
    </Box>
  );
};

export default Dashboard;
