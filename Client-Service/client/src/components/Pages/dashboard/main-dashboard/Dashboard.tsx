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
  Fab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
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
import transactionService from '../../../../services/transactionService';
import { GetCustomer } from '../../../../Types';
import AuthStorage from '../../../../services/authStorage';
import { Transaction } from '../../../../types/banking';
import { useNavigate } from 'react-router-dom';
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
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
  const [showFullAccountNumbers, setShowFullAccountNumbers] = useState<{[key: string]: boolean}>({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const userRoles = AuthStorage.getRoles();

  // Toggle account number visibility
  const toggleAccountNumberVisibility = (accountId: string) => {
    setShowFullAccountNumbers(prev => ({
      ...prev,
      [accountId]: !prev[accountId]
    }));
  };

  // Get display account number (masked or full)
  const getDisplayAccountNumber = (account: Account) => {
    const isShowing = showFullAccountNumbers[account.accountId];
    return isShowing ? account.accountNumber : `****${account.accountNumber?.toString().slice(-4)}`;
  };

  // Fetch user details from localStorage
  useEffect(() => {
    const storedData = localStorage.getItem('userDetails');
    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData);
        // userDetails is an object, not an array
        setUserData(parsedData);
      } catch (err) {
        console.error('Error parsing user details:', err);
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

        // Check if user is staff or admin and redirect them
        const isStaffOrAdmin = userRoles.includes('BANK_STAFF') || userRoles.includes('ADMIN');
        
        if (isStaffOrAdmin) {
          // Redirect staff to staff dashboard
          if (userRoles.includes('BANK_STAFF')) {
            navigate('/staff/dashboard');
            return;
          }
          
          // Redirect admin to admin dashboard
          if (userRoles.includes('ADMIN')) {
            navigate('/admin/dashboard');
            return;
          }
        }

        // For regular customers, fetch real data
        const customer = await customerService.getCustomer(userData.userId);
        if (!customer) {
          setError('No customer account found for this user');
          return;
        }

        setCustomerData(customer);

        // Fetch customer accounts using userId (not customerId)
        const customerAccounts = await accountService.getAccountsByUserId(userData.userId);
        setAccounts(customerAccounts as Account[]);

        // Fetch recent transactions using banking-grade ledger API
        const ledgerData = await transactionService.getLedgerTransactionHistory(userData.userId, 0, 5);
        setRecentTransactions(ledgerData.content || []);

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
      {/* Welcome Section */}
      <Container maxWidth="xl">
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
                      ₹{totalBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
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
                        <Box display="flex" alignItems="center" gap={1}>
                          <Typography 
                            variant="body2" 
                            color="text.secondary"
                            sx={{ 
                              fontFamily: 'monospace',
                              userSelect: 'none'
                            }}
                          >
                            {getDisplayAccountNumber(account)}
                          </Typography>
                          <IconButton
                            size="small"
                            onClick={() => toggleAccountNumberVisibility(account.accountId)}
                            title={showFullAccountNumbers[account.accountId] ? "Click to hide" : "Click to show full account number"}
                            sx={{ 
                              padding: 0.5,
                              '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' }
                            }}
                          >
                            <Visibility 
                              fontSize="small" 
                              sx={{ 
                                color: showFullAccountNumbers[account.accountId] ? 'primary.main' : 'text.secondary',
                                fontSize: '1rem'
                              }} 
                            />
                          </IconButton>
                        </Box>
                      </Box>
                      <Avatar sx={{ bgcolor: 'primary.main' }}>
                        <CreditCard />
                      </Avatar>
                    </Box>

                    <Divider sx={{ my: 2 }} />

                    <Typography variant="h5" fontWeight="bold" color="primary.main" gutterBottom>
                      ₹{(account.balance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </Typography>

                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Chip
                        label={account.status || 'Active'}
                        color="success"
                        size="small"
                      />
                      <Box>
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

        {/* Recent Activity Section */}
        <Box mb={4}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h5" fontWeight="bold">
              Recent Activity
            </Typography>
            <Button variant="text" onClick={() => navigate('/transactions')}>
              View All
            </Button>
          </Box>
          <Card elevation={3} sx={{ borderRadius: 4 }}>
            <CardContent sx={{ p: '0 !important' }}>
              {recentTransactions.length === 0 ? (
                <Box p={4} textAlign="center">
                  <Typography color="text.secondary">No recent transactions found.</Typography>
                </Box>
              ) : (
                <TableContainer>
                  <Table>
                    <TableBody>
                      {recentTransactions.map((tx) => (
                        <TableRow key={tx.entryId} hover>
                          <TableCell sx={{ borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                            <Box display="flex" alignItems="center">
                              <Avatar
                                sx={{
                                  bgcolor: tx.entryType === 'DEBIT' ? 'error.light' : 'success.light',
                                  color: tx.entryType === 'DEBIT' ? 'error.main' : 'success.main',
                                  mr: 2, width: 40, height: 40
                                }}
                              >
                                {tx.entryType === 'DEBIT' ? <ArrowUpward fontSize="small" /> : <ArrowDownward fontSize="small" />}
                              </Avatar>
                              <Box>
                                <Typography variant="subtitle1" fontWeight="bold">
                                  {tx.description || (tx.entryType === 'DEBIT' ? 'Transfer Out' : 'Transfer In')}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {new Date(tx.timestamp).toLocaleDateString()}
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell align="right" sx={{ borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                            <Typography
                              variant="subtitle1"
                              fontWeight="bold"
                              sx={{ color: tx.entryType === 'DEBIT' ? 'error.main' : 'success.main' }}
                            >
                              {tx.entryType === 'DEBIT' ? '-' : '+'}
                              ₹{tx.amount?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" display="block">
                              Balance: ₹{tx.balanceAfter?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>
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
