import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Container,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  CircularProgress,
  Alert,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider
} from '@mui/material';
import {
  AccountBalanceWallet,
  TrendingUp,
  SwapHoriz,
  Receipt,
  AccountBalance,
  Payment,
  History,
  Add,
  CheckCircle,
  Pending,
  Error
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import api from '../../../../services/api';
import transactionService from '../../../../services/transactionService';
import './Dashboard.css';

interface Account {
  id: string;
  accountNumber: string;
  accountType: string;
  balance: number;
  status: string;
}

interface CustomerStats {
  totalBalance: number;
  accountCount: number;
  activeAccounts: number;
  pendingAccounts: number;
}

interface RecentTransaction {
  entryId: string;
  entryType: 'CREDIT' | 'DEBIT';
  amount: number;
  balanceAfter: number;
  description: string;
  timestamp: string;
  accountNumber: string;
}

const EnhancedCustomerDashboard: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [userData, setUserData] = useState<any | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [stats, setStats] = useState<CustomerStats>({
    totalBalance: 0,
    accountCount: 0,
    activeAccounts: 0,
    pendingAccounts: 0
  });
  const [recentTransactions, setRecentTransactions] = useState<RecentTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Fetch user data and accounts
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get user details
        const storedData = localStorage.getItem('userDetails');
        if (storedData) {
          const parsedData = JSON.parse(storedData);
          // userDetails is an object, not an array
          setUserData(parsedData);
        }

        // Get accounts
        const userDetails = JSON.parse(localStorage.getItem('userDetails') || '{}');
        const userId = userDetails.userId;

        if (userId) {
          const accountsResponse = await api.get(`/account/getall?userId=${userId}`);
          const accountsData = Array.isArray(accountsResponse.data) ? accountsResponse.data : [accountsResponse.data];
          setAccounts(accountsData);

          // Calculate stats
          const activeAccounts = accountsData.filter((acc: Account) => acc.status === 'ACTIVE').length;
          const pendingAccounts = accountsData.filter((acc: Account) => acc.status === 'PENDING').length;
          const totalBalance = accountsData.reduce((sum: number, acc: Account) => sum + acc.balance, 0);

          setStats({
            totalBalance,
            accountCount: accountsData.length,
            activeAccounts,
            pendingAccounts
          });

          // Fetch real recent transactions using banking-grade ledger API
          const ledgerData = await transactionService.getLedgerTransactionHistory(userData.userId, 0, 5);
          const rawTransactions = ledgerData.content || [];

          // Map ledger entries to dashboard format
          const mappedTransactions: RecentTransaction[] = rawTransactions.map((tx: any) => ({
            entryId: tx.entryId.toString(),
            entryType: tx.entryType,
            amount: tx.amount,
            balanceAfter: tx.balanceAfter,
            description: tx.description || (tx.entryType === 'DEBIT' ? 'Transfer Out' : 'Transfer In'),
            timestamp: new Date(tx.timestamp).toLocaleDateString(),
            accountNumber: tx.accountNumber?.toString()
          }));

          setRecentTransactions(mappedTransactions);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ACTIVE': return <CheckCircle color="success" />;
      case 'PENDING': return <Pending color="warning" />;
      case 'BLOCKED': return <Error color="error" />;
      default: return <Pending />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'success';
      case 'PENDING': return 'warning';
      case 'BLOCKED': return 'error';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Welcome Section */}
      <Box className="navbar" sx={{
        display: 'flex',
        alignItems: 'center',
        padding: '0 20px',
        background: 'linear-gradient(135deg, #1a237e 0%, #283593 100%)',
        color: 'white',
        mb: 3
      }}>
        <Box>
          <Typography variant="h4" fontWeight="bold">
            Welcome back, {userData?.firstName || 'Customer'}! 👋
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.9 }}>
            Here's your financial overview
          </Typography>
        </Box>
      </Box>

      <Box display="flex">
        {/* Sidebar */}
        <Box sx={{ width: sidebarCollapsed ? '60px' : '250px', transition: 'width 0.3s ease' }}>
          {/* Sidebar component would go here */}
        </Box>

        {/* Main Content */}
        <Box
          sx={{
            flexGrow: 1,
            marginLeft: sidebarCollapsed ? '60px' : '250px',
            transition: 'margin-left 0.3s ease',
            padding: '0 20px 20px'
          }}
        >
          {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

          {/* Stats Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ background: 'linear-gradient(135deg, #4caf50 0%, #66bb6a 100%)', color: 'white' }}>
                <CardContent>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography variant="h4" fontWeight="bold">
                        ₹{stats.totalBalance.toLocaleString('en-IN')}
                      </Typography>
                      <Typography variant="body2">Total Balance</Typography>
                    </Box>
                    <AccountBalanceWallet sx={{ fontSize: 40, opacity: 0.8 }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ background: 'linear-gradient(135deg, #2196f3 0%, #42a5f5 100%)', color: 'white' }}>
                <CardContent>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography variant="h4" fontWeight="bold">{stats.accountCount}</Typography>
                      <Typography variant="body2">Total Accounts</Typography>
                    </Box>
                    <AccountBalance sx={{ fontSize: 40, opacity: 0.8 }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ background: 'linear-gradient(135deg, #ff9800 0%, #ffa726 100%)', color: 'white' }}>
                <CardContent>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography variant="h4" fontWeight="bold">{stats.activeAccounts}</Typography>
                      <Typography variant="body2">Active Accounts</Typography>
                    </Box>
                    <TrendingUp sx={{ fontSize: 40, opacity: 0.8 }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ background: 'linear-gradient(135deg, #9c27b0 0%, #ab47bc 100%)', color: 'white' }}>
                <CardContent>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography variant="h4" fontWeight="bold">{stats.pendingAccounts}</Typography>
                      <Typography variant="body2">Pending Accounts</Typography>
                    </Box>
                    <Pending sx={{ fontSize: 40, opacity: 0.8 }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Quick Actions & Account Status */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={8}>
              <Card>
                <CardContent>
                  <Typography variant="h6" fontWeight="bold" mb={2}>
                    Quick Actions
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6} md={3}>
                      <Button
                        variant="contained"
                        fullWidth
                        startIcon={<SwapHoriz />}
                        onClick={() => navigate('/transfer')}
                        sx={{ py: 2 }}
                      >
                        Transfer Money
                      </Button>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Button
                        variant="outlined"
                        fullWidth
                        startIcon={<AccountBalance />}
                        onClick={() => navigate('/accounts')}
                        sx={{ py: 2 }}
                      >
                        View Accounts
                      </Button>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Button
                        variant="outlined"
                        fullWidth
                        startIcon={<History />}
                        onClick={() => navigate('/transactions')}
                        sx={{ py: 2 }}
                      >
                        Transaction History
                      </Button>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Button
                        variant="outlined"
                        fullWidth
                        startIcon={<Receipt />}
                        sx={{ py: 2 }}
                      >
                        Download Statement
                      </Button>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" fontWeight="bold" mb={2}>
                    Account Status
                  </Typography>
                  {accounts.length === 0 ? (
                    <Alert severity="info">
                      No accounts found. Your account creation might be in progress.
                    </Alert>
                  ) : (
                    <List dense>
                      {accounts.map((account: Account) => (
                        <ListItem key={account.id}>
                          <ListItemIcon>
                            {getStatusIcon(account.status)}
                          </ListItemIcon>
                          <ListItemText
                            primary={`${account.accountType} Account`}
                            secondary={`XXXX-XXXX-${account.accountNumber?.toString().slice(-4)}`}
                          />
                          <Chip
                            label={account.status}
                            color={getStatusColor(account.status) as any}
                            size="small"
                          />
                        </ListItem>
                      ))}
                    </List>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Recent Activity */}
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" mb={2}>
                Recent Activity
              </Typography>
              {recentTransactions.length === 0 ? (
                <Typography color="textSecondary" align="center" py={3}>
                  No recent transactions
                </Typography>
              ) : (
                <List>
                  {recentTransactions.map((transaction, index) => (
                    <React.Fragment key={transaction.entryId}>
                      <ListItem>
                        <ListItemIcon>
                          {transaction.entryType === 'CREDIT' ? (
                            <TrendingUp color="success" />
                          ) : (
                            <Payment color="error" />
                          )}
                        </ListItemIcon>
                        <ListItemText
                          primary={transaction.description}
                          secondary={`${transaction.timestamp} • A/C ****${transaction.accountNumber?.slice(-4)}`}
                        />
                        <Typography
                          variant="h6"
                          color={transaction.entryType === 'CREDIT' ? 'success.main' : 'error.main'}
                        >
                          {transaction.entryType === 'CREDIT' ? '+' : '-'}₹{transaction.amount.toLocaleString('en-IN')}
                        </Typography>
                      </ListItem>
                      {index < recentTransactions.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Box>
  );
};

export default EnhancedCustomerDashboard;
