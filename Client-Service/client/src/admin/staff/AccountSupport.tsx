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
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  Search,
  AccountBalanceWallet,
  Visibility,
  Lock,
  Info,
  Warning,
  Security,
  Business,
  CreditCard,
  Savings,
  TrendingUp,
  Block,
  CheckCircle,
  Error,
  Help
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { customerService } from '../../services/customerService';
import { accountService } from '../../services/api/accountService';

interface AccountDetails {
  accountId: string;
  accountNumber: string;
  accountType: string;
  status: string;
  customerId: number;
  customerName: string;
  openDate: string;
  lastActivity: string;
  branchCode: string;
}

interface AccountMetadata {
  accountId: string;
  accountType: string;
  status: string;
  openDate: string;
  branchCode: string;
  accountManager: string;
  productType: string;
  interestRate?: number;
  minimumBalance?: number;
  overdraftLimit?: number;
  lastMaintenanceDate: string;
  complianceFlags: string[];
}

const AccountSupport: React.FC = () => {
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState<AccountDetails[]>([]);
  const [filteredAccounts, setFilteredAccounts] = useState<AccountDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedAccount, setSelectedAccount] = useState<AccountDetails | null>(null);
  const [metadataDialogOpen, setMetadataDialogOpen] = useState(false);
  const [accountMetadata, setAccountMetadata] = useState<AccountMetadata | null>(null);

  useEffect(() => {
    fetchAccountData();
  }, []);

  useEffect(() => {
    filterAccounts();
  }, [accounts, searchQuery, statusFilter]);

  const fetchAccountData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Emit audit event
      console.log('ACCOUNT_SUPPORT_PAGE_ACCESSED', {
        timestamp: new Date().toISOString()
      });

      // Fetch customers first to get their accounts
      const customers = await customerService.getAllCustomers();
      const allAccounts: AccountDetails[] = [];

      // For each customer, fetch their accounts
      for (const customer of customers.slice(0, 20)) { // Limit for performance
        try {
          const customerAccounts = await accountService.getAccountsByUserId(customer.userId);
          
          customerAccounts.forEach((account: any) => {
            allAccounts.push({
              accountId: account.accountId || 'N/A',
              accountNumber: account.accountNumber || 'N/A',
              accountType: account.accountType || 'UNKNOWN',
              status: account.status || 'UNKNOWN',
              customerId: customer.userId,
              customerName: `${customer.firstName || 'N/A'} ${customer.lastName || 'N/A'}`,
              openDate: account.openDate || new Date().toISOString(),
              lastActivity: account.lastActivity || 'N/A',
              branchCode: account.branchCode || 'MAIN'
            });
          });
        } catch (err) {
          // Skip if we can't get accounts for a customer
        }
      }

      setAccounts(allAccounts);

    } catch (err: any) {
      console.error('Error fetching account data:', err);
      setError('Failed to load account support data');
    } finally {
      setLoading(false);
    }
  };

  const filterAccounts = () => {
    let filtered = accounts;

    // Filter by status
    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(account => account.status === statusFilter);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(account =>
        account.accountNumber.toLowerCase().includes(query) ||
        account.customerName.toLowerCase().includes(query) ||
        account.accountType.toLowerCase().includes(query) ||
        account.customerId.toString().includes(query)
      );
    }

    setFilteredAccounts(filtered);
  };

  const maskAccountNumber = (accountNumber: string): string => {
    if (!accountNumber || accountNumber === 'N/A') return 'N/A';
    if (accountNumber.length <= 4) return accountNumber;
    return `****${accountNumber.slice(-4)}`;
  };

  const handleViewMetadata = async (account: AccountDetails) => {
    setSelectedAccount(account);

    // Generate mock metadata (in real implementation, this would come from backend)
    const metadata: AccountMetadata = {
      accountId: account.accountId,
      accountType: account.accountType,
      status: account.status,
      openDate: account.openDate,
      branchCode: account.branchCode,
      accountManager: 'John Smith',
      productType: account.accountType === 'SAVINGS' ? 'Premium Savings' : 'Current Account',
      interestRate: account.accountType === 'SAVINGS' ? 3.5 : undefined,
      minimumBalance: account.accountType === 'SAVINGS' ? 1000 : 500,
      overdraftLimit: account.accountType === 'CURRENT' ? 10000 : undefined,
      lastMaintenanceDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      complianceFlags: account.status === 'BLOCKED' ? ['SUSPICIOUS_ACTIVITY'] : []
    };

    setAccountMetadata(metadata);
    setMetadataDialogOpen(true);

    // Emit audit event
    console.log('ACCOUNT_METADATA_VIEWED', {
      account_id: account.accountId,
      account_number: maskAccountNumber(account.accountNumber),
      customer_id: account.customerId,
      timestamp: new Date().toISOString()
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'ACTIVE': return 'success';
      case 'BLOCKED': case 'LOCKED': return 'error';
      case 'DORMANT': return 'warning';
      case 'PENDING': return 'info';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toUpperCase()) {
      case 'ACTIVE': return <CheckCircle />;
      case 'BLOCKED': case 'LOCKED': return <Block />;
      case 'DORMANT': return <Warning />;
      case 'PENDING': return <Help />;
      default: return <Info />;
    }
  };

  const getAccountTypeIcon = (accountType: string) => {
    switch (accountType.toUpperCase()) {
      case 'SAVINGS': return <Savings />;
      case 'CURRENT': return <CreditCard />;
      case 'LOAN': return <TrendingUp />;
      default: return <AccountBalanceWallet />;
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <Box textAlign="center">
          <CircularProgress size={60} />
          <Typography variant="h6" sx={{ mt: 2, color: 'text.secondary' }}>
            Loading account support data...
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
          <AccountBalanceWallet fontSize="large" />
        </Avatar>
        <Box flex={1}>
          <Typography variant="h4" fontWeight="bold">
            Account Support
          </Typography>
          <Typography variant="body2" color="text.secondary">
            View account metadata - Read Only Access
          </Typography>
        </Box>
        <Button variant="outlined" onClick={() => navigate('/staff/dashboard')}>
          Back to Dashboard
        </Button>
      </Box>

      {/* Search and Filters */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Search Accounts
          </Typography>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={5}>
              <TextField
                fullWidth
                placeholder="Search by account number, customer name, or ID"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
                }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                select
                label="Account Status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="ALL">All Status</MenuItem>
                <MenuItem value="ACTIVE">Active</MenuItem>
                <MenuItem value="BLOCKED">Blocked</MenuItem>
                <MenuItem value="LOCKED">Locked</MenuItem>
                <MenuItem value="DORMANT">Dormant</MenuItem>
                <MenuItem value="PENDING">Pending</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} md={2}>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('ALL');
                }}
              >
                Clear Filters
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

      {/* Statistics */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    Total Accounts
                  </Typography>
                  <Typography variant="h4" fontWeight="bold">
                    {accounts.length}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'info.main', width: 56, height: 56 }}>
                  <AccountBalanceWallet />
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
                    Active Accounts
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" color="success.main">
                    {accounts.filter(a => a.status === 'ACTIVE').length}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'success.main', width: 56, height: 56 }}>
                  <CheckCircle />
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
                    Blocked/Locked
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" color="error.main">
                    {accounts.filter(a => a.status === 'BLOCKED' || a.status === 'LOCKED').length}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'error.main', width: 56, height: 56 }}>
                  <Block />
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
                    Dormant
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" color="warning.main">
                    {accounts.filter(a => a.status === 'DORMANT').length}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'warning.main', width: 56, height: 56 }}>
                  <Warning />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Account List */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Account List ({filteredAccounts.length})
          </Typography>
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Account Number</TableCell>
                  <TableCell>Account Type</TableCell>
                  <TableCell>Customer Name</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Branch</TableCell>
                  <TableCell>Open Date</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredAccounts.map((account) => (
                  <TableRow key={account.accountId}>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography variant="body2" fontFamily="monospace">
                          {maskAccountNumber(account.accountNumber)}
                        </Typography>
                        <Tooltip title="Account number masked for security">
                          <Lock fontSize="small" color="action" />
                        </Tooltip>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1}>
                        {getAccountTypeIcon(account.accountType)}
                        <Typography variant="body2">
                          {account.accountType}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {account.customerName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        ID: {account.customerId}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={account.status} 
                        color={getStatusColor(account.status) as any}
                        size="small"
                        icon={getStatusIcon(account.status)}
                      />
                    </TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Business fontSize="small" color="action" />
                        <Typography variant="body2">
                          {account.branchCode}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      {new Date(account.openDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Tooltip title="View Account Metadata">
                        <IconButton 
                          size="small" 
                          onClick={() => handleViewMetadata(account)}
                        >
                          <Visibility />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {filteredAccounts.length === 0 && (
            <Alert severity="info">
              No accounts found matching the current filters.
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Security Notice */}
      <Alert 
        severity="warning" 
        icon={<Security />}
        sx={{ mt: 3 }}
      >
        <Typography variant="body2" fontWeight="bold" gutterBottom>
          Account Support Restrictions
        </Typography>
        <Typography variant="body2">
          ❌ Cannot view account balances
        </Typography>
        <Typography variant="body2">
          ❌ Cannot view transaction history
        </Typography>
        <Typography variant="body2">
          ❌ Cannot modify account details
        </Typography>
        <Typography variant="body2">
          ❌ Cannot block/unblock accounts
        </Typography>
        <Typography variant="body2">
          ✅ Can view account metadata
        </Typography>
        <Typography variant="body2">
          ✅ Can escalate account issues
        </Typography>
      </Alert>

      {/* Account Metadata Dialog */}
      <Dialog 
        open={metadataDialogOpen} 
        onClose={() => setMetadataDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={2}>
            <Avatar sx={{ bgcolor: 'primary.main' }}>
              {getAccountTypeIcon(selectedAccount?.accountType || '')}
            </Avatar>
            <Box>
              <Typography variant="h6">
                Account Metadata
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {maskAccountNumber(selectedAccount?.accountNumber || '')}
              </Typography>
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent>
          {accountMetadata && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Account Information
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemText primary="Account Type" secondary={accountMetadata.accountType} />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Status" secondary={accountMetadata.status} />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Product Type" secondary={accountMetadata.productType} />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Branch Code" secondary={accountMetadata.branchCode} />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Account Manager" secondary={accountMetadata.accountManager} />
                  </ListItem>
                </List>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Account Details
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemText 
                      primary="Open Date" 
                      secondary={new Date(accountMetadata.openDate).toLocaleDateString()} 
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Last Maintenance" 
                      secondary={new Date(accountMetadata.lastMaintenanceDate).toLocaleDateString()} 
                    />
                  </ListItem>
                  {accountMetadata.interestRate && (
                    <ListItem>
                      <ListItemText primary="Interest Rate" secondary={`${accountMetadata.interestRate}%`} />
                    </ListItem>
                  )}
                  {accountMetadata.minimumBalance && (
                    <ListItem>
                      <ListItemText 
                        primary="Minimum Balance" 
                        secondary={`$${accountMetadata.minimumBalance.toLocaleString()}`} 
                      />
                    </ListItem>
                  )}
                  {accountMetadata.overdraftLimit && (
                    <ListItem>
                      <ListItemText 
                        primary="Overdraft Limit" 
                        secondary={`$${accountMetadata.overdraftLimit.toLocaleString()}`} 
                      />
                    </ListItem>
                  )}
                </List>
              </Grid>

              {accountMetadata.complianceFlags.length > 0 && (
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Compliance Flags
                  </Typography>
                  <Box display="flex" gap={1} flexWrap="wrap">
                    {accountMetadata.complianceFlags.map((flag, index) => (
                      <Chip 
                        key={index}
                        label={flag} 
                        color="error" 
                        size="small"
                        icon={<Warning />}
                      />
                    ))}
                  </Box>
                </Grid>
              )}
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMetadataDialogOpen(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AccountSupport;
