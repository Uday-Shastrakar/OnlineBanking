import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  TextField,
  Button,
  Chip,
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Alert,
  CircularProgress,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  IconButton
} from '@mui/material';
import {
  Search,
  Person,
  Email,
  Phone,
  Home,
  AccountBalanceWallet,
  Visibility,
  Security,
  CheckCircle,
  Pending,
  Error,
  Lock
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { customerService } from '../../services/customerService';
import { accountService } from '../../services/api/accountService';

interface CustomerDetails {
  id: number;
  userId: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  address: string;
  dateOfBirth: string;
  gender: string;
  status: string;
  kycStatus: string;
  registrationDate: string;
  lastLogin: string;
}

interface AccountDetails {
  accountId: string;
  accountNumber: string;
  accountType: string;
  status: string;
  balance: number;
  openDate: string;
}

const CustomerLookup: React.FC = () => {
  const { customerId } = useParams<{ customerId: string }>();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState<CustomerDetails | null>(null);
  const [accounts, setAccounts] = useState<AccountDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState(customerId || '');

  // Function to mask sensitive data
  const maskEmail = (email: string): string => {
    if (!email) return 'N/A';
    const [username, domain] = email.split('@');
    if (username.length <= 3) return `${username[0]}***@${domain}`;
    return `${username.slice(0, 3)}***@${domain}`;
  };

  const maskPhoneNumber = (phone: string): string => {
    if (!phone) return 'N/A';
    if (phone.length <= 4) return phone.replace(/.(?=.{4})/g, '*');
    return phone.replace(/.(?=.{4})/g, '*');
  };

  const maskAddress = (address: string): string => {
    if (!address) return 'N/A';
    const parts = address.split(',');
    if (parts.length < 2) return address.replace(/.(?=.{8})/g, '*');
    // Show only first part, mask the rest
    return `${parts[0].trim()}, *****`;
  };

  const maskAccountNumber = (accountNumber: string): string => {
    if (!accountNumber) return 'N/A';
    if (accountNumber.length <= 4) return accountNumber;
    return `****${accountNumber.slice(-4)}`;
  };

  const fetchCustomerDetails = async (id: string) => {
    if (!id.trim()) return;

    try {
      setLoading(true);
      setError(null);

      // Emit audit event
      console.log('CUSTOMER_LOOKUP_INITIATED', {
        customer_id: id,
        timestamp: new Date().toISOString()
      });

      // Fetch customer details
      const customerData = await customerService.getCustomer(parseInt(id));
      
      if (!customerData) {
        setError('Customer not found');
        return;
      }

      const customerDetails: CustomerDetails = {
        id: customerData.id || customerData.userId,
        userId: customerData.userId,
        firstName: customerData.firstName || 'N/A',
        lastName: customerData.lastName || 'N/A',
        email: customerData.email || 'N/A',
        phoneNumber: customerData.phoneNumber || 'N/A',
        address: customerData.address || 'N/A',
        dateOfBirth: customerData.dateOfBirth || 'N/A',
        gender: customerData.gender || 'N/A',
        status: customerData.status || 'UNKNOWN',
        kycStatus: customerData.status || 'PENDING', // Use status as fallback for kycStatus
        registrationDate: new Date().toISOString(), // Use current date as fallback
        lastLogin: 'Never' // Use default value
      };

      setCustomer(customerDetails);

      // Fetch customer accounts
      try {
        const customerAccounts = await accountService.getAccountsByUserId(customerData.userId);
        const accountDetails: AccountDetails[] = customerAccounts.map((account: any) => ({
          accountId: account.accountId || 'N/A',
          accountNumber: account.accountNumber || 'N/A',
          accountType: account.accountType || 'UNKNOWN',
          status: account.status || 'UNKNOWN',
          balance: 0, // Staff cannot view balances
          openDate: account.openDate || 'N/A'
        }));
        setAccounts(accountDetails);
      } catch (err) {
        console.error('Error fetching accounts:', err);
        setAccounts([]);
      }

      // Emit audit event
      console.log('CUSTOMER_VIEWED', {
        customer_id: customerDetails.userId,
        customer_name: `${customerDetails.firstName} ${customerDetails.lastName}`,
        timestamp: new Date().toISOString()
      });

    } catch (err: any) {
      console.error('Error fetching customer details:', err);
      setError(err.message || 'Failed to load customer details');
      setCustomer(null);
      setAccounts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (customerId) {
      fetchCustomerDetails(customerId);
    }
  }, [customerId]);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate(`/staff/customers/${searchQuery.trim()}`);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'ACTIVE': return 'success';
      case 'PENDING': return 'warning';
      case 'BLOCKED': case 'LOCKED': return 'error';
      default: return 'default';
    }
  };

  const getKycColor = (kycStatus: string) => {
    switch (kycStatus.toUpperCase()) {
      case 'VERIFIED': return 'success';
      case 'PENDING': return 'warning';
      case 'REJECTED': return 'error';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <Box textAlign="center">
          <CircularProgress size={60} />
          <Typography variant="h6" sx={{ mt: 2, color: 'text.secondary' }}>
            Loading customer details...
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box p={3}>
      {/* Header */}
      <Box display="flex" alignItems="center" gap={3} mb={4}>
        <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56 }}>
          <Person fontSize="large" />
        </Avatar>
        <Box flex={1}>
          <Typography variant="h4" fontWeight="bold">
            Customer Lookup
          </Typography>
          <Typography variant="body2" color="text.secondary">
            View customer profile - Read Only Access
          </Typography>
        </Box>
        <Button variant="outlined" onClick={() => navigate('/staff/dashboard')}>
          Back to Dashboard
        </Button>
      </Box>

      {/* Search Bar */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Search Customer
          </Typography>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={8}>
              <TextField
                fullWidth
                placeholder="Enter Customer ID, Phone, or Email"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                InputProps={{
                  startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
                }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <Button
                fullWidth
                variant="contained"
                onClick={handleSearch}
                startIcon={<Search />}
                disabled={!searchQuery.trim()}
              >
                Search
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {customer && (
        <>
          {/* Customer Details */}
          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2} mb={3}>
                <Person color="primary" />
                <Typography variant="h6" fontWeight="bold">
                  Customer Profile
                </Typography>
                <Chip 
                  label={customer.status} 
                  color={getStatusColor(customer.status) as any}
                  size="small"
                />
                <Chip 
                  label={`KYC: ${customer.kycStatus}`} 
                  color={getKycColor(customer.kycStatus) as any}
                  size="small"
                  icon={customer.kycStatus === 'VERIFIED' ? <CheckCircle /> : <Pending />}
                />
              </Box>

              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Customer ID
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {customer.userId}
                  </Typography>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Full Name
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {`${customer.firstName} ${customer.lastName}`}
                  </Typography>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Email
                  </Typography>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Email fontSize="small" color="action" />
                    <Typography variant="body1">
                      {maskEmail(customer.email)}
                    </Typography>
                    <Tooltip title="Email masked for security">
                      <Lock fontSize="small" color="action" />
                    </Tooltip>
                  </Box>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Phone Number
                  </Typography>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Phone fontSize="small" color="action" />
                    <Typography variant="body1">
                      {maskPhoneNumber(customer.phoneNumber)}
                    </Typography>
                    <Tooltip title="Phone number masked for security">
                      <Lock fontSize="small" color="action" />
                    </Tooltip>
                  </Box>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Address
                  </Typography>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Home fontSize="small" color="action" />
                    <Typography variant="body1">
                      {maskAddress(customer.address)}
                    </Typography>
                    <Tooltip title="Address masked for security">
                      <Lock fontSize="small" color="action" />
                    </Tooltip>
                  </Box>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Date of Birth
                  </Typography>
                  <Typography variant="body1">
                    {customer.dateOfBirth}
                  </Typography>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Gender
                  </Typography>
                  <Typography variant="body1">
                    {customer.gender}
                  </Typography>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Registration Date
                  </Typography>
                  <Typography variant="body1">
                    {new Date(customer.registrationDate).toLocaleDateString()}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Accounts */}
          <Card sx={{ mb: 4}}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2} mb={3}>
                <AccountBalanceWallet color="primary" />
                <Typography variant="h6" fontWeight="bold">
                  Account Information
                </Typography>
                <Chip 
                  label="View Only" 
                  size="small" 
                  color="info"
                  icon={<Visibility />}
                />
              </Box>

              {accounts.length > 0 ? (
                <TableContainer component={Paper} variant="outlined">
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Account Number</TableCell>
                        <TableCell>Account Type</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Open Date</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {accounts.map((account) => (
                        <TableRow key={account.accountId}>
                          <TableCell>
                            <Box display="flex" alignItems="center" gap={1}>
                              <Typography variant="body1" fontFamily="monospace">
                                {maskAccountNumber(account.accountNumber)}
                              </Typography>
                              <Tooltip title="Account number masked for security">
                                <Lock fontSize="small" color="action" />
                              </Tooltip>
                            </Box>
                          </TableCell>
                          <TableCell>{account.accountType}</TableCell>
                          <TableCell>
                            <Chip 
                              label={account.status} 
                              color={getStatusColor(account.status) as any}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            {account.openDate !== 'N/A' 
                              ? new Date(account.openDate).toLocaleDateString() 
                              : 'N/A'
                            }
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Alert severity="info">
                  No accounts found for this customer.
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Security Notice */}
          <Alert 
            severity="warning" 
            icon={<Security />}
            sx={{ mb: 3 }}
          >
            <Typography variant="body2" fontWeight="bold" gutterBottom>
              Staff Access Restrictions
            </Typography>
            <Typography variant="body2">
              ❌ Cannot view full account balances
            </Typography>
            <Typography variant="body2">
              ❌ Cannot view full transaction history
            </Typography>
            <Typography variant="body2">
              ❌ Cannot modify customer information
            </Typography>
            <Typography variant="body2">
              ❌ Cannot perform transactions
            </Typography>
            <Typography variant="body2">
              ✅ Can verify KYC documents
            </Typography>
            <Typography variant="body2">
              ✅ Can escalate issues to admin
            </Typography>
          </Alert>
        </>
      )}
    </Box>
  );
};

export default CustomerLookup;
