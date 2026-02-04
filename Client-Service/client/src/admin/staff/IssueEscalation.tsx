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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextareaAutosize,
  IconButton,
  Tooltip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider
} from '@mui/material';
import {
  Warning,
  Add,
  Search,
  Person,
  AccountBalanceWallet,
  Error,
  Info,
  CheckCircle,
  Pending,
  PriorityHigh,
  LowPriority,
  AccessTime,
  Visibility,
  Close,
  Send,
  Assignment,
  ReportProblem,
  Support,
  Security
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { customerService } from '../../services/customerService';

interface EscalationTicket {
  id: string;
  ticketNumber: string;
  customerId: number;
  customerName: string;
  accountId?: string;
  accountNumber?: string;
  issueType: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  subject: string;
  description: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'ESCALATED';
  correlationId?: string;
  staffId: number;
  staffName: string;
  createdDate: string;
  lastUpdated: string;
  assignedTo?: string;
  resolution?: string;
}

interface NewTicket {
  customerId: string;
  accountId: string;
  issueType: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  subject: string;
  description: string;
  correlationId: string;
}

const IssueEscalation: React.FC = () => {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState<EscalationTicket[]>([]);
  const [filteredTickets, setFilteredTickets] = useState<EscalationTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<EscalationTicket | null>(null);
  const [newTicket, setNewTicket] = useState<NewTicket>({
    customerId: '',
    accountId: '',
    issueType: '',
    priority: 'MEDIUM',
    subject: '',
    description: '',
    correlationId: ''
  });
  const [createLoading, setCreateLoading] = useState(false);

  useEffect(() => {
    fetchEscalationTickets();
  }, []);

  useEffect(() => {
    filterTickets();
  }, [tickets, searchQuery, statusFilter, priorityFilter]);

  const fetchEscalationTickets = async () => {
    try {
      setLoading(true);
      setError(null);

      // Emit audit event
      console.log('ESCALATION_PAGE_ACCESSED', {
        timestamp: new Date().toISOString()
      });

      // Generate mock escalation tickets (in real implementation, this would come from backend)
      const mockTickets: EscalationTicket[] = [
        {
          id: '1',
          ticketNumber: 'ESC-2024-001',
          customerId: 1001,
          customerName: 'John Doe',
          accountId: 'ACC001',
          accountNumber: '****1234',
          issueType: 'SUSPICIOUS_TRANSACTION',
          priority: 'HIGH',
          subject: 'Unusual transaction pattern detected',
          description: 'Customer account shows multiple high-value transactions in short period',
          status: 'OPEN',
          correlationId: 'TXN-123456',
          staffId: 2,
          staffName: 'Staff User',
          createdDate: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          lastUpdated: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString()
        },
        {
          id: '2',
          ticketNumber: 'ESC-2024-002',
          customerId: 1002,
          customerName: 'Jane Smith',
          issueType: 'CUSTOMER_COMPLAINT',
          priority: 'MEDIUM',
          subject: 'Account balance discrepancy',
          description: 'Customer reports incorrect balance after recent transaction',
          status: 'IN_PROGRESS',
          staffId: 2,
          staffName: 'Staff User',
          createdDate: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          lastUpdated: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          assignedTo: 'Admin User'
        },
        {
          id: '3',
          ticketNumber: 'ESC-2024-003',
          customerId: 1003,
          customerName: 'Bob Johnson',
          accountId: 'ACC003',
          accountNumber: '****5678',
          issueType: 'BALANCE_DISPUTE',
          priority: 'HIGH',
          subject: 'Disputed transaction amount',
          description: 'Customer claims transaction amount is incorrect',
          status: 'ESCALATED',
          correlationId: 'TXN-789012',
          staffId: 2,
          staffName: 'Staff User',
          createdDate: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
          lastUpdated: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
          assignedTo: 'Senior Admin'
        }
      ];

      setTickets(mockTickets);

    } catch (err: any) {
      console.error('Error fetching escalation tickets:', err);
      setError('Failed to load escalation tickets');
    } finally {
      setLoading(false);
    }
  };

  const filterTickets = () => {
    let filtered = tickets;

    // Filter by status
    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(ticket => ticket.status === statusFilter);
    }

    // Filter by priority
    if (priorityFilter !== 'ALL') {
      filtered = filtered.filter(ticket => ticket.priority === priorityFilter);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(ticket =>
        ticket.ticketNumber.toLowerCase().includes(query) ||
        ticket.customerName.toLowerCase().includes(query) ||
        ticket.subject.toLowerCase().includes(query) ||
        ticket.issueType.toLowerCase().includes(query)
      );
    }

    setFilteredTickets(filtered);
  };

  const handleCreateTicket = async () => {
    if (!newTicket.customerId || !newTicket.subject || !newTicket.description) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setCreateLoading(true);

      // Emit audit event
      console.log('ISSUE_ESCALATED', {
        customer_id: newTicket.customerId,
        issue_type: newTicket.issueType,
        priority: newTicket.priority,
        subject: newTicket.subject,
        timestamp: new Date().toISOString()
      });

      // Simulate API call to create ticket
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Create new ticket
      const ticket: EscalationTicket = {
        id: (tickets.length + 1).toString(),
        ticketNumber: `ESC-2024-${String(tickets.length + 1).padStart(3, '0')}`,
        customerId: parseInt(newTicket.customerId),
        customerName: `Customer ${newTicket.customerId}`,
        accountId: newTicket.accountId || undefined,
        accountNumber: newTicket.accountId ? `****${newTicket.accountId.slice(-4)}` : undefined,
        issueType: newTicket.issueType,
        priority: newTicket.priority,
        subject: newTicket.subject,
        description: newTicket.description,
        status: 'OPEN',
        correlationId: newTicket.correlationId || undefined,
        staffId: 2, // Current staff user ID
        staffName: 'Staff User',
        createdDate: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
      };

      setTickets(prev => [ticket, ...prev]);
      setCreateDialogOpen(false);
      setNewTicket({
        customerId: '',
        accountId: '',
        issueType: '',
        priority: 'MEDIUM',
        subject: '',
        description: '',
        correlationId: ''
      });

    } catch (err: any) {
      console.error('Error creating ticket:', err);
      setError('Failed to create escalation ticket');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleViewTicket = (ticket: EscalationTicket) => {
    setSelectedTicket(ticket);
    setViewDialogOpen(true);

    // Emit audit event
    console.log('ESCALATION_TICKET_VIEWED', {
      ticket_id: ticket.id,
      ticket_number: ticket.ticketNumber,
      customer_id: ticket.customerId,
      timestamp: new Date().toISOString()
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'OPEN': return 'error';
      case 'IN_PROGRESS': return 'warning';
      case 'RESOLVED': return 'success';
      case 'ESCALATED': return 'info';
      default: return 'default';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toUpperCase()) {
      case 'CRITICAL': return 'error';
      case 'HIGH': return 'warning';
      case 'MEDIUM': return 'info';
      case 'LOW': return 'success';
      default: return 'default';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority.toUpperCase()) {
      case 'CRITICAL': return <PriorityHigh />;
      case 'HIGH': return <Warning />;
      case 'MEDIUM': return <PriorityHigh />;
      case 'LOW': return <LowPriority />;
      default: return <Info />;
    }
  };

  const getIssueTypeIcon = (issueType: string) => {
    switch (issueType) {
      case 'SUSPICIOUS_TRANSACTION': return <ReportProblem />;
      case 'CUSTOMER_COMPLAINT': return <Support />;
      case 'BALANCE_DISPUTE': return <AccountBalanceWallet />;
      default: return <Assignment />;
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <Box textAlign="center">
          <CircularProgress size={60} />
          <Typography variant="h6" sx={{ mt: 2, color: 'text.secondary' }}>
            Loading escalation tickets...
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
          <Warning fontSize="large" />
        </Avatar>
        <Box flex={1}>
          <Typography variant="h4" fontWeight="bold">
            Issue Escalation
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Raise and track internal support tickets
          </Typography>
        </Box>
        <Box display="flex" gap={2}>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setCreateDialogOpen(true)}
          >
            Raise Ticket
          </Button>
          <Button variant="outlined" onClick={() => navigate('/staff/dashboard')}>
            Back to Dashboard
          </Button>
        </Box>
      </Box>

      {/* Filters */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Filter Tickets
          </Typography>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Search by ticket number, customer name, or subject"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
                }}
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={statusFilter}
                  label="Status"
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <MenuItem value="ALL">All Status</MenuItem>
                  <MenuItem value="OPEN">Open</MenuItem>
                  <MenuItem value="IN_PROGRESS">In Progress</MenuItem>
                  <MenuItem value="RESOLVED">Resolved</MenuItem>
                  <MenuItem value="ESCALATED">Escalated</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>Priority</InputLabel>
                <Select
                  value={priorityFilter}
                  label="Priority"
                  onChange={(e) => setPriorityFilter(e.target.value)}
                >
                  <MenuItem value="ALL">All Priority</MenuItem>
                  <MenuItem value="CRITICAL">Critical</MenuItem>
                  <MenuItem value="HIGH">High</MenuItem>
                  <MenuItem value="MEDIUM">Medium</MenuItem>
                  <MenuItem value="LOW">Low</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('ALL');
                  setPriorityFilter('ALL');
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
                    Open Tickets
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" color="error.main">
                    {tickets.filter(t => t.status === 'OPEN').length}
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
                    In Progress
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" color="warning.main">
                    {tickets.filter(t => t.status === 'IN_PROGRESS').length}
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
                    Critical Priority
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" color="error.main">
                    {tickets.filter(t => t.priority === 'CRITICAL').length}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'error.main', width: 56, height: 56 }}>
                  <PriorityHigh />
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
                    Resolved Today
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" color="success.main">
                    {tickets.filter(t => 
                      t.status === 'RESOLVED' && 
                      new Date(t.lastUpdated).toDateString() === new Date().toDateString()
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
      </Grid>

      {/* Tickets List */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Escalation Tickets ({filteredTickets.length})
          </Typography>
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Ticket Number</TableCell>
                  <TableCell>Customer</TableCell>
                  <TableCell>Issue Type</TableCell>
                  <TableCell>Priority</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Created</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredTickets.map((ticket) => (
                  <TableRow key={ticket.id}>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium" fontFamily="monospace">
                        {ticket.ticketNumber}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {ticket.customerName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        ID: {ticket.customerId}
                      </Typography>
                      {ticket.accountNumber && (
                        <Typography variant="caption" color="text.secondary" display="block">
                          Acc: {ticket.accountNumber}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1}>
                        {getIssueTypeIcon(ticket.issueType)}
                        <Typography variant="body2">
                          {ticket.issueType.replace('_', ' ')}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={ticket.priority} 
                        color={getPriorityColor(ticket.priority) as any}
                        size="small"
                        icon={getPriorityIcon(ticket.priority)}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={ticket.status.replace('_', ' ')} 
                        color={getStatusColor(ticket.status) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {new Date(ticket.createdDate).toLocaleDateString()}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(ticket.createdDate).toLocaleTimeString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Tooltip title="View Ticket Details">
                        <IconButton 
                          size="small" 
                          onClick={() => handleViewTicket(ticket)}
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

          {filteredTickets.length === 0 && (
            <Alert severity="info">
              No escalation tickets found matching the current filters.
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Create Ticket Dialog */}
      <Dialog 
        open={createDialogOpen} 
        onClose={() => setCreateDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h6">
            Raise Escalation Ticket
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Customer ID"
                value={newTicket.customerId}
                onChange={(e) => setNewTicket(prev => ({ ...prev, customerId: e.target.value }))}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Account ID (Optional)"
                value={newTicket.accountId}
                onChange={(e) => setNewTicket(prev => ({ ...prev, accountId: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>Issue Type</InputLabel>
                <Select
                  value={newTicket.issueType}
                  label="Issue Type"
                  onChange={(e) => setNewTicket(prev => ({ ...prev, issueType: e.target.value }))}
                >
                  <MenuItem value="SUSPICIOUS_TRANSACTION">Suspicious Transaction</MenuItem>
                  <MenuItem value="CUSTOMER_COMPLAINT">Customer Complaint</MenuItem>
                  <MenuItem value="BALANCE_DISPUTE">Balance Dispute</MenuItem>
                  <MenuItem value="ACCOUNT_ISSUE">Account Issue</MenuItem>
                  <MenuItem value="FRAUD_REPORT">Fraud Report</MenuItem>
                  <MenuItem value="OTHER">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>Priority</InputLabel>
                <Select
                  value={newTicket.priority}
                  label="Priority"
                  onChange={(e) => setNewTicket(prev => ({ ...prev, priority: e.target.value as any }))}
                >
                  <MenuItem value="LOW">Low</MenuItem>
                  <MenuItem value="MEDIUM">Medium</MenuItem>
                  <MenuItem value="HIGH">High</MenuItem>
                  <MenuItem value="CRITICAL">Critical</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Subject"
                value={newTicket.subject}
                onChange={(e) => setNewTicket(prev => ({ ...prev, subject: e.target.value }))}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Correlation ID (Optional)"
                value={newTicket.correlationId}
                onChange={(e) => setNewTicket(prev => ({ ...prev, correlationId: e.target.value }))}
                helperText="Transaction ID or reference number if applicable"
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>
                Description *
              </Typography>
              <TextareaAutosize
                minRows={4}
                placeholder="Provide detailed description of the issue..."
                value={newTicket.description}
                onChange={(e) => setNewTicket(prev => ({ ...prev, description: e.target.value }))}
                style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleCreateTicket}
            disabled={createLoading || !newTicket.customerId || !newTicket.subject || !newTicket.description}
            startIcon={createLoading ? <CircularProgress size={20} /> : <Send />}
          >
            {createLoading ? 'Creating...' : 'Raise Ticket'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Ticket Dialog */}
      <Dialog 
        open={viewDialogOpen} 
        onClose={() => setViewDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={2}>
            <Avatar sx={{ bgcolor: 'primary.main' }}>
              {getIssueTypeIcon(selectedTicket?.issueType || '')}
            </Avatar>
            <Box>
              <Typography variant="h6">
                {selectedTicket?.ticketNumber}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {selectedTicket?.subject}
              </Typography>
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedTicket && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Customer Information
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemText primary="Customer Name" secondary={selectedTicket.customerName} />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Customer ID" secondary={selectedTicket.customerId} />
                  </ListItem>
                  {selectedTicket.accountNumber && (
                    <ListItem>
                      <ListItemText primary="Account Number" secondary={selectedTicket.accountNumber} />
                    </ListItem>
                  )}
                </List>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Ticket Details
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemText primary="Issue Type" secondary={selectedTicket.issueType.replace('_', ' ')} />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Priority" secondary={selectedTicket.priority} />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Status" secondary={selectedTicket.status.replace('_', ' ')} />
                  </ListItem>
                  {selectedTicket.correlationId && (
                    <ListItem>
                      <ListItemText primary="Correlation ID" secondary={selectedTicket.correlationId} />
                    </ListItem>
                  )}
                </List>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Description
                </Typography>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="body2">
                    {selectedTicket.description}
                  </Typography>
                </Paper>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Timeline
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemIcon>
                      <AccessTime />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Created" 
                      secondary={`${new Date(selectedTicket.createdDate).toLocaleString()} by ${selectedTicket.staffName}`} 
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <AccessTime />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Last Updated" 
                      secondary={new Date(selectedTicket.lastUpdated).toLocaleString()} 
                    />
                  </ListItem>
                  {selectedTicket.assignedTo && (
                    <ListItem>
                      <ListItemIcon>
                        <Person />
                      </ListItemIcon>
                      <ListItemText primary="Assigned To" secondary={selectedTicket.assignedTo} />
                    </ListItem>
                  )}
                </List>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialogOpen(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default IssueEscalation;
