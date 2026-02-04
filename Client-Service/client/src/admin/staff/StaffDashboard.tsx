import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Avatar,
  Chip,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Alert,
  CircularProgress,
  TextField,
  InputAdornment,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton
} from '@mui/material';
import {
  AccountBalance,
  People,
  TrendingUp,
  Security,
  Support,
  Assessment,
  AccountBalanceWallet,
  TransferWithinAStation,
  VerifiedUser,
  Search,
  Visibility,
  Lock,
  Warning,
  CheckCircle,
  Pending,
  Business
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { customerService } from '../../services/customerService';
import { accountService } from '../../services/api/accountService';
import transactionService from '../../services/transactionService';

interface StaffStats {
  totalCustomers: number;
  pendingKYC: number;
  lockedAccounts: number;
  todayTransactions: number;
}

interface CustomerSearchResult {
  id: number;
  userId: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  status: string;
  kycStatus: string;
  accountCount: number;
}

const StaffDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<StaffStats>({
    totalCustomers: 0,
    pendingKYC: 0,
    lockedAccounts: 0,
    todayTransactions: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<CustomerSearchResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);

  useEffect(() => {
    const fetchStaffDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch real data from backend services
        const [allCustomers, recentTransactions] = await Promise.all([
          customerService.getAllCustomers().catch(() => []),
          transactionService.getLedgerTransactionHistory(0, 0, 50).catch(() => ({ content: [] }))
        ]);

        // Calculate real statistics
        const customersData = Array.isArray(allCustomers) ? allCustomers : [];
        const transactionsData = recentTransactions.content || [];

        // Calculate today's transactions
        const today = new Date().toDateString();
        const todayTransactions = transactionsData.filter((tx: any) => 
          new Date(tx.timestamp).toDateString() === today
        ).length;

        // Calculate pending KYC verifications
        const pendingKYC = customersData.filter((customer: any) => 
          customer.status === 'PENDING' || customer.kycStatus === 'PENDING'
        ).length;

        // For locked accounts, we'll need to aggregate from customer data
        let lockedAccounts = 0;
        try {
          for (const customer of customersData.slice(0, 10)) {
            try {
              const customerAccounts = await accountService.getAccountsByUserId(customer.userId);
              lockedAccounts += customerAccounts.filter((account: any) => 
                account.status === 'BLOCKED' || account.status === 'LOCKED'
              ).length;
            } catch (err) {
              // Skip if we can't get accounts for a customer
            }
          }
        } catch (err) {
          console.error('Error fetching account data:', err);
        }

        setStats({
          totalCustomers: customersData.length,
          pendingKYC,
          lockedAccounts,
          todayTransactions
        });

        // Emit audit event
        console.log('STAFF_DASHBOARD_VIEWED', {
          timestamp: new Date().toISOString()
        });

      } catch (err: any) {
        console.error('Error fetching staff dashboard data:', err);
        setError('Failed to load dashboard data. Please try again.');
        
        setStats({
          totalCustomers: 0,
          pendingKYC: 0,
          lockedAccounts: 0,
          todayTransactions: 0
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStaffDashboardData();
  }, []);

  const handleCustomerSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setSearchLoading(true);
    try {
      const customers = await customerService.getAllCustomers();
      const filtered = customers.filter((customer: any) => 
        customer.firstName?.toLowerCase().includes(query.toLowerCase()) ||
        customer.lastName?.toLowerCase().includes(query.toLowerCase()) ||
        customer.email?.toLowerCase().includes(query.toLowerCase()) ||
        customer.phoneNumber?.includes(query) ||
        customer.userId?.toString().includes(query)
      ).slice(0, 5); // Limit to 5 results

      const results: CustomerSearchResult[] = filtered.map((customer: any) => ({
        id: customer.id || customer.userId,
        userId: customer.userId,
        firstName: customer.firstName || 'N/A',
        lastName: customer.lastName || 'N/A',
        email: customer.email || 'N/A',
        phoneNumber: customer.phoneNumber || 'N/A',
        status: customer.status || 'UNKNOWN',
        kycStatus: customer.kycStatus || 'PENDING',
        accountCount: 0 // Would be populated from account service
      }));

      setSearchResults(results);

      // Emit audit event
      console.log('CUSTOMER_SEARCH_PERFORMED', {
        search_query: query,
        results_count: results.length,
        timestamp: new Date().toISOString()
      });

    } catch (err: any) {
      console.error('Error searching customers:', err);
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    handleCustomerSearch(query);
  };

  const handleViewCustomer = (customerId: number) => {
    // Emit audit event
    console.log('CUSTOMER_VIEWED', {
      customer_id: customerId,
      timestamp: new Date().toISOString()
    });
    
    navigate(`/staff/customers/${customerId}`);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <Box textAlign="center">
          <CircularProgress size={60} />
          <Typography variant="h6" sx={{ mt: 2, color: 'text.secondary' }}>
            Loading staff dashboard...
          </Typography>
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
        <Button variant="contained" onClick={() => window.location.reload()}>
          Retry
        </Button>
      </Box>
    );
  }

  return (
    <Box p={3}>
      {/* Header */}
      <Box display="flex" alignItems="center" gap={3} mb={4}>
        <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56 }}>
          <Security fontSize="large" />
        </Avatar>
        <Box>
          <Typography variant="h4" fontWeight="bold">
            Staff Dashboard
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Banking Operations Portal - Read Only Access
          </Typography>
        </Box>
      </Box>

      {/* Customer Search Bar */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Customer Lookup
          </Typography>
          <TextField
            fullWidth
            placeholder="Search by Customer ID, Account No, Phone, or Email"
            value={searchQuery}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
              endAdornment: searchLoading && (
                <InputAdornment position="end">
                  <CircularProgress size={20} />
                </InputAdornment>
              )
            }}
          />
          
          {/* Search Results */}
          {searchResults.length > 0 && (
            <Box mt={2}>
              <Typography variant="subtitle2" gutterBottom>
                Search Results ({searchResults.length})
              </Typography>
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Customer ID</TableCell>
                      <TableCell>Name</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>KYC Status</TableCell>
                      <TableCell>Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {searchResults.map((customer) => (
                      <TableRow key={customer.id}>
                        <TableCell>{customer.userId}</TableCell>
                        <TableCell>{`${customer.firstName} ${customer.lastName}`}</TableCell>
                        <TableCell>
                          <Chip 
                            label={customer.status} 
                            size="small"
                            color={customer.status === 'ACTIVE' ? 'success' : 'warning'}
                          />
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={customer.kycStatus} 
                            size="small"
                            color={
                              customer.kycStatus === 'VERIFIED' ? 'success' : 
                              customer.kycStatus === 'PENDING' ? 'warning' : 'error'
                            }
                            icon={customer.kycStatus === 'VERIFIED' ? <CheckCircle /> : <Pending />}
                          />
                        </TableCell>
                        <TableCell>
                          <IconButton 
                            size="small" 
                            onClick={() => handleViewCustomer(customer.id)}
                            title="View Customer Details"
                          >
                            <Visibility />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Statistics Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    Total Customers
                  </Typography>
                  <Typography variant="h4" fontWeight="bold">
                    {stats.totalCustomers}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Registered customers
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'info.main', width: 56, height: 56 }}>
                  <People />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    Pending KYC
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" color="warning.main">
                    {stats.pendingKYC}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Awaiting verification
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'warning.main', width: 56, height: 56 }}>
                  <Pending />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    Locked Accounts
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" color="error.main">
                    {stats.lockedAccounts}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    View only
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'error.main', width: 56, height: 56 }}>
                  <Lock />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    Today's Transactions
                  </Typography>
                  <Typography variant="h4" fontWeight="bold">
                    {stats.todayTransactions}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Transaction count
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'success.main', width: 56, height: 56 }}>
                  <TrendingUp />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Quick Actions */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Quick Actions
              </Typography>
              <List>
                <ListItem onClick={() => navigate('/staff/customers')}>
                  <ListItemIcon>
                    <People />
                  </ListItemIcon>
                  <ListItemText primary="Customer Management" secondary="View customer profiles" />
                </ListItem>
                <ListItem onClick={() => navigate('/staff/kyc')}>
                  <ListItemIcon>
                    <VerifiedUser />
                  </ListItemIcon>
                  <ListItemText primary="KYC Verification" secondary="Process pending verifications" />
                </ListItem>
                <ListItem onClick={() => navigate('/staff/accounts')}>
                  <ListItemIcon>
                    <AccountBalanceWallet />
                  </ListItemIcon>
                  <ListItemText primary="Account Support" secondary="View account metadata" />
                </ListItem>
                <ListItem onClick={() => navigate('/staff/escalations')}>
                  <ListItemIcon>
                    <Warning />
                  </ListItemIcon>
                  <ListItemText primary="Issue Escalation" secondary="Raise support tickets" />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default StaffDashboard;
