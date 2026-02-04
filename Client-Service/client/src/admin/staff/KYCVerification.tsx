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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tooltip,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextareaAutosize,
  List,
  ListItem,
  ListItemText,
  ListItemIcon
} from '@mui/material';
import {
  Search,
  Person,
  VerifiedUser,
  Pending,
  Error,
  CheckCircle,
  Visibility,
  Security,
  Description,
  Image,
  Assignment,
  Info,
  Warning,
  Close,
  Upload,
  FilterList,
  Home
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { customerService } from '../../services/customerService';

interface KYCCustomer {
  id: number;
  userId: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  kycStatus: string;
  kycSubmittedDate: string;
  lastUpdated: string;
  documents: KYCDocument[];
}

interface KYCDocument {
  id: string;
  documentType: string;
  fileName: string;
  uploadDate: string;
  status: string;
  url?: string;
}

interface KYCAction {
  customerId: number;
  action: 'VERIFIED' | 'REJECTED';
  remarks: string;
}

const KYCVerification: React.FC = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<KYCCustomer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<KYCCustomer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedCustomer, setSelectedCustomer] = useState<KYCCustomer | null>(null);
  const [documentDialogOpen, setDocumentDialogOpen] = useState(false);
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<KYCDocument | null>(null);
  const [kycAction, setKycAction] = useState<KYCAction>({
    customerId: 0,
    action: 'VERIFIED',
    remarks: ''
  });
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchPendingKYCCustomers();
  }, []);

  useEffect(() => {
    filterCustomers();
  }, [customers, searchQuery, statusFilter]);

  const fetchPendingKYCCustomers = async () => {
    try {
      setLoading(true);
      setError(null);

      // Emit audit event
      console.log('KYC_VERIFICATION_PAGE_ACCESSED', {
        timestamp: new Date().toISOString()
      });

      const allCustomers = await customerService.getAllCustomers();
      
      // Filter customers with pending KYC or mock document data
      const kycCustomers: KYCCustomer[] = allCustomers.map((customer: any) => ({
        id: customer.id || customer.userId,
        userId: customer.userId,
        firstName: customer.firstName || 'N/A',
        lastName: customer.lastName || 'N/A',
        email: customer.email || 'N/A',
        phoneNumber: customer.phoneNumber || 'N/A',
        kycStatus: customer.kycStatus || 'PENDING',
        kycSubmittedDate: customer.kycSubmittedDate || new Date().toISOString(),
        lastUpdated: customer.lastUpdated || new Date().toISOString(),
        documents: generateMockDocuments(customer.userId)
      }));

      setCustomers(kycCustomers);

    } catch (err: any) {
      console.error('Error fetching KYC customers:', err);
      setError('Failed to load KYC verification data');
    } finally {
      setLoading(false);
    }
  };

  const generateMockDocuments = (userId: number): KYCDocument[] => {
    return [
      {
        id: `doc_${userId}_1`,
        documentType: 'IDENTITY_PROOF',
        fileName: `identity_${userId}.pdf`,
        uploadDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'UPLOADED'
      },
      {
        id: `doc_${userId}_2`,
        documentType: 'ADDRESS_PROOF',
        fileName: `address_${userId}.pdf`,
        uploadDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'UPLOADED'
      },
      {
        id: `doc_${userId}_3`,
        documentType: 'PAN_CARD',
        fileName: `pan_${userId}.pdf`,
        uploadDate: new Date().toISOString(),
        status: 'UPLOADED'
      }
    ];
  };

  const filterCustomers = () => {
    let filtered = customers;

    // Filter by status
    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(customer => customer.kycStatus === statusFilter);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(customer =>
        customer.firstName.toLowerCase().includes(query) ||
        customer.lastName.toLowerCase().includes(query) ||
        customer.email.toLowerCase().includes(query) ||
        customer.phoneNumber.includes(query) ||
        customer.userId.toString().includes(query)
      );
    }

    setFilteredCustomers(filtered);
  };

  const handleViewDocuments = (customer: KYCCustomer) => {
    setSelectedCustomer(customer);
    setDocumentDialogOpen(true);

    // Emit audit event
    console.log('KYC_DOCUMENTS_VIEWED', {
      customer_id: customer.userId,
      customer_name: `${customer.firstName} ${customer.lastName}`,
      timestamp: new Date().toISOString()
    });
  };

  const handleViewDocument = (document: KYCDocument) => {
    setSelectedDocument(document);

    // Emit audit event
    console.log('KYC_DOCUMENT_OPENED', {
      document_id: document.id,
      document_type: document.documentType,
      timestamp: new Date().toISOString()
    });

    // In a real implementation, this would open the document viewer
    alert(`Document viewer for ${document.fileName}\n\nIn a real implementation, this would display the actual document with zoom, rotate, and download capabilities.`);
  };

  const handleOpenActionDialog = (customer: KYCCustomer, action: 'VERIFIED' | 'REJECTED') => {
    setSelectedCustomer(customer);
    setKycAction({
      customerId: customer.userId,
      action,
      remarks: ''
    });
    setActionDialogOpen(true);
  };

  const handleKYCAction = async () => {
    if (!selectedCustomer) return;

    try {
      setActionLoading(true);

      // Simulate API call to update KYC status
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Update local state
      setCustomers(prev => prev.map(customer => 
        customer.userId === selectedCustomer.userId
          ? { ...customer, kycStatus: kycAction.action, lastUpdated: new Date().toISOString() }
          : customer
      ));

      // Emit audit event
      console.log('KYC_STATUS_UPDATED', {
        customer_id: selectedCustomer.userId,
        customer_name: `${selectedCustomer.firstName} ${selectedCustomer.lastName}`,
        action: kycAction.action,
        remarks: kycAction.remarks,
        timestamp: new Date().toISOString()
      });

      setActionDialogOpen(false);
      setSelectedCustomer(null);
      setKycAction({ customerId: 0, action: 'VERIFIED', remarks: '' });

    } catch (err: any) {
      console.error('Error updating KYC status:', err);
      setError('Failed to update KYC status');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'VERIFIED': return 'success';
      case 'PENDING': return 'warning';
      case 'REJECTED': return 'error';
      default: return 'default';
    }
  };

  const getDocumentIcon = (documentType: string) => {
    switch (documentType) {
      case 'IDENTITY_PROOF': return <Person />;
      case 'ADDRESS_PROOF': return <Home />;
      case 'PAN_CARD': return <Assignment />;
      default: return <Description />;
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <Box textAlign="center">
          <CircularProgress size={60} />
          <Typography variant="h6" sx={{ mt: 2, color: 'text.secondary' }}>
            Loading KYC verification data...
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
          <VerifiedUser fontSize="large" />
        </Avatar>
        <Box flex={1}>
          <Typography variant="h4" fontWeight="bold">
            KYC Verification
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Process customer identity verification requests
          </Typography>
        </Box>
        <Button variant="outlined" onClick={() => navigate('/staff/dashboard')}>
          Back to Dashboard
        </Button>
      </Box>

      {/* Filters */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Filters
          </Typography>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Search by name, email, phone, or ID"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
                }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>KYC Status</InputLabel>
                <Select
                  value={statusFilter}
                  label="KYC Status"
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <MenuItem value="ALL">All Status</MenuItem>
                  <MenuItem value="PENDING">Pending</MenuItem>
                  <MenuItem value="VERIFIED">Verified</MenuItem>
                  <MenuItem value="REJECTED">Rejected</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<FilterList />}
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
                    Total Pending
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" color="warning.main">
                    {customers.filter(c => c.kycStatus === 'PENDING').length}
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
                    Verified Today
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" color="success.main">
                    {customers.filter(c => 
                      c.kycStatus === 'VERIFIED' && 
                      new Date(c.lastUpdated).toDateString() === new Date().toDateString()
                    ).length}
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
                    Rejected
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" color="error.main">
                    {customers.filter(c => c.kycStatus === 'REJECTED').length}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'error.main', width: 56, height: 56 }}>
                  <Error />
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
                    Total Processed
                  </Typography>
                  <Typography variant="h4" fontWeight="bold">
                    {customers.filter(c => c.kycStatus !== 'PENDING').length}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'info.main', width: 56, height: 56 }}>
                  <Assignment />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Customer List */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Customer KYC Requests ({filteredCustomers.length})
          </Typography>
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Customer ID</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Contact</TableCell>
                  <TableCell>KYC Status</TableCell>
                  <TableCell>Submitted Date</TableCell>
                  <TableCell>Documents</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredCustomers.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell>{customer.userId}</TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        {`${customer.firstName} ${customer.lastName}`}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {customer.email}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {customer.phoneNumber}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={customer.kycStatus} 
                        color={getStatusColor(customer.kycStatus) as any}
                        size="small"
                        icon={
                          customer.kycStatus === 'VERIFIED' ? <CheckCircle /> :
                          customer.kycStatus === 'PENDING' ? <Pending /> : <Error />
                        }
                      />
                    </TableCell>
                    <TableCell>
                      {new Date(customer.kycSubmittedDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={`${customer.documents.length} docs`} 
                        size="small"
                        variant="outlined"
                        icon={<Description />}
                      />
                    </TableCell>
                    <TableCell>
                      <Box display="flex" gap={1}>
                        <Tooltip title="View Documents">
                          <IconButton 
                            size="small" 
                            onClick={() => handleViewDocuments(customer)}
                          >
                            <Visibility />
                          </IconButton>
                        </Tooltip>
                        {customer.kycStatus === 'PENDING' && (
                          <>
                            <Tooltip title="Approve KYC">
                              <IconButton 
                                size="small" 
                                color="success"
                                onClick={() => handleOpenActionDialog(customer, 'VERIFIED')}
                              >
                                <CheckCircle />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Reject KYC">
                              <IconButton 
                                size="small" 
                                color="error"
                                onClick={() => handleOpenActionDialog(customer, 'REJECTED')}
                              >
                                <Error />
                              </IconButton>
                            </Tooltip>
                          </>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {filteredCustomers.length === 0 && (
            <Alert severity="info">
              No KYC requests found matching the current filters.
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Documents Dialog */}
      <Dialog 
        open={documentDialogOpen} 
        onClose={() => setDocumentDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Typography variant="h6">
              KYC Documents - {selectedCustomer?.firstName} {selectedCustomer?.lastName}
            </Typography>
            <IconButton onClick={() => setDocumentDialogOpen(false)}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedCustomer && (
            <List>
              {selectedCustomer.documents.map((document) => (
                <ListItem key={document.id}>
                  <ListItemIcon>
                    {getDocumentIcon(document.documentType)}
                  </ListItemIcon>
                  <ListItemText
                    primary={document.fileName}
                    secondary={
                      <>
                        <Typography variant="body2" color="text.secondary">
                          Type: {document.documentType}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Uploaded: {new Date(document.uploadDate).toLocaleString()}
                        </Typography>
                      </>
                    }
                  />
                  <Button
                    variant="outlined"
                    startIcon={<Visibility />}
                    onClick={() => handleViewDocument(document)}
                  >
                    View
                  </Button>
                </ListItem>
              ))}
            </List>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDocumentDialogOpen(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* KYC Action Dialog */}
      <Dialog 
        open={actionDialogOpen} 
        onClose={() => setActionDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h6">
            {kycAction.action === 'VERIFIED' ? 'Approve' : 'Reject'} KYC
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Customer: {selectedCustomer?.firstName} {selectedCustomer?.lastName} (ID: {selectedCustomer?.userId})
          </Typography>
          
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Remarks</InputLabel>
            <TextareaAutosize
              minRows={4}
              placeholder="Enter remarks for this action..."
              value={kycAction.remarks}
              onChange={(e) => setKycAction(prev => ({ ...prev, remarks: e.target.value }))}
              style={{ width: '100%', padding: '8px', marginTop: '8px' }}
            />
          </FormControl>

          {kycAction.action === 'REJECTED' && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              <Typography variant="body2">
                Rejecting KYC will require the customer to resubmit all documents.
              </Typography>
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setActionDialogOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color={kycAction.action === 'VERIFIED' ? 'success' : 'error'}
            onClick={handleKYCAction}
            disabled={actionLoading || !kycAction.remarks.trim()}
            startIcon={actionLoading ? <CircularProgress size={20} /> : 
                     kycAction.action === 'VERIFIED' ? <CheckCircle /> : <Error />}
          >
            {actionLoading ? 'Processing...' : kycAction.action === 'VERIFIED' ? 'Approve' : 'Reject'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default KYCVerification;
