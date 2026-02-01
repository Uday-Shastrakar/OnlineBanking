# 🎯 UI Quick Reference Guide

## 📱 Customer Portal UI Components

### **1. Navigation Structure**
```
🏠 Online Banking
├── 🏠 Dashboard
├── 💳 Accounts
│   ├── View All Accounts
│   ├── Account Details
│   └── Account Statement
├── 💸 Transactions
│   ├── Transfer Money
│   ├── Transaction History
│   └── Transaction Details
├── 👤 Profile
│   ├── Personal Information
│   ├── Security Settings
│   └── Preferences
├── 📊 Reports
│   ├── Account Statements
│   ├── Transaction Reports
│   └── Tax Documents
└── 🚪 Logout
```

### **2. Dashboard Components**

#### **Account Summary Cards**
```tsx
<AccountSummaryCard
  title="Total Balance"
  amount="$25,750.00"
  change="+2.5%"
  icon={<AccountBalanceIcon />}
  color="success"
/>

<AccountSummaryCard
  title="Active Accounts"
  amount="3"
  icon={<AccountIcon />}
  color="primary"
/>
```

#### **Quick Actions**
```tsx
<QuickActions>
  <Button variant="contained" startIcon={<TransferIcon />}>
    Transfer Money
  </Button>
  <Button variant="outlined" startIcon={<StatementIcon />}>
    View Statement
  </Button>
  <Button variant="outlined" startIcon={<HistoryIcon />}>
    Transaction History
  </Button>
</QuickActions>
```

### **3. Transfer Money Component**

#### **Transfer Form**
```tsx
<TransferForm>
  <FormControl fullWidth margin="normal">
    <InputLabel>From Account</InputLabel>
    <Select value={fromAccount} onChange={handleFromAccountChange}>
      {accounts.map(account => (
        <MenuItem key={account.id} value={account.id}>
          {account.type} - {account.accountNumber} (${account.balance})
        </MenuItem>
      ))}
    </Select>
  </FormControl>

  <FormControl fullWidth margin="normal">
    <InputLabel>To Account Number</InputLabel>
    <TextField
      value={toAccountNumber}
      onChange={handleToAccountNumberChange}
      placeholder="Enter account number"
    />
  </FormControl>

  <FormControl fullWidth margin="normal">
    <InputLabel>Amount</InputLabel>
    <TextField
      type="number"
      value={amount}
      onChange={handleAmountChange}
      placeholder="0.00"
      InputProps={{ startAdornment: '$' }}
    />
  </FormControl>

  <FormControl fullWidth margin="normal">
    <InputLabel>Description (Optional)</InputLabel>
    <TextField
      value={description}
      onChange={handleDescriptionChange}
      placeholder="Add a note"
      multiline
      rows={2}
    />
  </FormControl>

  <Button
    variant="contained"
    color="primary"
    fullWidth
    onClick={handleTransfer}
    disabled={!fromAccount || !toAccountNumber || !amount || isTransferring}
  >
    {isTransferring ? 'Transferring...' : 'Transfer Money'}
  </Button>
</TransferForm>
```

### **4. Transaction History Component**

#### **Transaction List**
```tsx
<TransactionList>
  <Box sx={{ mb: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
    <TextField
      label="From Date"
      type="date"
      value={filter.fromDate}
      onChange={(e) => setFilter({...filter, fromDate: e.target.value})}
      size="small"
    />
    <TextField
      label="To Date"
      type="date"
      value={filter.toDate}
      onChange={(e) => setFilter({...filter, toDate: e.target.value})}
      size="small"
    />
    <FormControl size="small">
      <InputLabel>Status</InputLabel>
      <Select
        value={filter.status}
        onChange={(e) => setFilter({...filter, status: e.target.value})}
        size="small"
      >
        <MenuItem value="">All</MenuItem>
        <MenuItem value="COMPLETED">Completed</MenuItem>
        <MenuItem value="PENDING">Pending</MenuItem>
        <MenuItem value="FAILED">Failed</MenuItem>
      </Select>
    </FormControl>
  </Box>

  <TableContainer component={Paper}>
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>Date</TableCell>
          <TableCell>Description</TableCell>
          <TableCell>Amount</TableCell>
          <TableCell>Status</TableCell>
          <TableCell>Actions</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {transactions.map((transaction) => (
          <TableRow key={transaction.id}>
            <TableCell>{formatDate(transaction.date)}</TableCell>
            <TableCell>{transaction.description}</TableCell>
            <TableCell>${transaction.amount}</TableCell>
            <TableCell>
              <Chip
                label={transaction.status}
                color={getStatusColor(transaction.status)}
                size="small"
              />
            </TableCell>
            <TableCell>
              <IconButton size="small" onClick={() => viewDetails(transaction.id)}>
                <VisibilityIcon />
              </IconButton>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </TableContainer>
</TransactionList>
```

---

## 👨‍💼 Admin Portal UI Components

### **1. Admin Navigation Structure**
```
🏦 Admin Portal
├── 📊 Dashboard
│   ├── System Overview
│   ├── User Statistics
│   ├── Transaction Volume
│   └── System Health
├── 👥 User Management
│   ├── All Users
│   ├── Add User
│   ├── Edit User
│   ├── Lock/Unlock User
│   └── Delete User
├── 🏦 Account Management
│   ├── All Accounts
│   ├── Account Details
│   ├── Create Account
│   └── Account Statements
├── 💸 Transaction Monitoring
│   ├── All Transactions
│   ├── Transaction Details
│   ├── Flagged Transactions
│   └── Transaction Reports
├── 🔍 Audit Center
│   ├── Audit Logs
│   ├── Compliance Reports
│   ├── Security Events
│   └── System Logs
├── ⚙️ System Administration
│   ├── Service Health
│   ├── Configuration
│   ├── Metrics
│   └── Logs
└── 🚪 Logout
```

### **2. Admin Dashboard**

#### **System Statistics Cards**
```tsx
<Grid container spacing={3}>
  <Grid item xs={12} sm={6} md={3}>
    <StatCard
      title="Total Users"
      value={stats.totalUsers}
      change="+12%"
      icon={<PeopleIcon />}
      color="primary"
    />
  </Grid>
  <Grid item xs={12} sm={6} md={3}>
    <StatCard
      title="Total Accounts"
      value={stats.totalAccounts}
      change="+8%"
      icon={<AccountIcon />}
      color="success"
    />
  </Grid>
  <Grid item xs={12} sm={6} md={3}>
    <StatCard
      title="Total Transactions"
      value={stats.totalTransactions}
      change="+15%"
      icon={<TransactionIcon />}
      color="info"
    />
  </Grid>
  <Grid item xs={12} sm={6} md={3}>
    <StatCard
      title="System Health"
      value="98%"
      change="-2%"
      icon={<HealthIcon />}
      color="warning"
    />
  </Grid>
</Grid>
```

### **3. User Management Table**

#### **Users List**
```tsx
<UsersTable>
  <Box sx={{ mb: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
    <TextField
      label="Search Users"
      value={searchTerm}
      onChange={handleSearch}
      placeholder="Search by name, email, or username"
      size="small"
    />
    <FormControl size="small">
      <InputLabel>Role Filter</InputLabel>
      <Select
        value={roleFilter}
        onChange={(e) => setRoleFilter(e.target.value)}
        size="small"
      >
        <MenuItem value="">All Roles</MenuItem>
        <MenuItem value="CUSTOMER_USER">Customer</MenuItem>
        <MenuItem value="ADMIN">Admin</MenuItem>
        <MenuItem value="BANK_STAFF">Staff</MenuItem>
        <MenuItem value="AUDITOR">Auditor</MenuItem>
      </Select>
    </FormControl>
    <Button
      variant="contained"
      startIcon={<AddUserIcon />}
      onClick={handleAddUser}
    >
      Add User
    </Button>
  </Box>

  <TableContainer component={Paper}>
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>User</TableCell>
          <TableCell>Email</TableCell>
          <TableCell>Role</TableCell>
          <TableCell>Status</TableCell>
          <TableCell>Created</TableCell>
          <TableCell>Actions</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {users.map((user) => (
          <TableRow key={user.id}>
            <TableCell>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Avatar sx={{ width: 32, height: 32 }}>
                  {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                </Avatar>
                <Box>
                  <Typography variant="body2">
                    {user.firstName} {user.lastName}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    @{user.username}
                  </Typography>
                </Box>
              </Box>
            </TableCell>
            <TableCell>{user.email}</TableCell>
            <TableCell>
              <Chip
                label={user.roles[0]}
                color={getRoleColor(user.roles[0])}
                size="small"
              />
            </TableCell>
            <TableCell>
              <Chip
                label={user.status}
                color={getStatusColor(user.status)}
                size="small"
              />
            </TableCell>
            <TableCell>{formatDate(user.createdAt)}</TableCell>
            <TableCell>
              <IconButton size="small" onClick={() => handleEditUser(user)}>
                <EditIcon />
              </IconButton>
              <IconButton size="small" onClick={() => handleLockUser(user.id)}>
                <LockIcon />
              </IconButton>
              <IconButton size="small" onClick={() => handleDeleteUser(user.id)}>
                <DeleteIcon />
              </IconButton>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </TableContainer>

  <Pagination
    count={totalPages}
    page={currentPage}
    onChange={handlePageChange}
    color="primary"
    sx={{ mt: 2 }}
  />
</UsersTable>
```

### **4. Add User Modal**

#### **User Creation Form**
```tsx
<Dialog open={isAddUserOpen} onClose={handleCloseAddUser} maxWidth="md" fullWidth>
  <DialogTitle>Add New User</DialogTitle>
  <DialogContent>
    <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
      <TextField
        label="Username"
        value={newUser.username}
        onChange={(e) => setNewUser({...newUser, username: e.target.value})}
        fullWidth
        required
      />
      <TextField
        label="Email"
        type="email"
        value={newUser.email}
        onChange={(e) => setNewUser({...newUser, email: e.target.value})}
        fullWidth
        required
      />
      <TextField
        label="Password"
        type="password"
        value={newUser.password}
        onChange={(e) => setNewUser({...newUser, password: e.target.value})}
        fullWidth
        required
      />
      <TextField
        label="First Name"
        value={newUser.firstName}
        onChange={(e) => setNewUser({...newUser, firstName: e.target.value})}
        fullWidth
        required
      />
      <TextField
        label="Last Name"
        value={newUser.lastName}
        onChange={(e) => setNewUser({...newUser, lastName: e.target.value})}
        fullWidth
        required
      />
      <TextField
        label="Phone Number"
        value={newUser.phoneNumber}
        onChange={(e) => setNewUser({...newUser, phoneNumber: e.target.value})}
        fullWidth
      />
      
      <FormControl fullWidth>
        <InputLabel>Roles</InputLabel>
        <Select
          multiple
          value={newUser.roles}
          onChange={(e) => setNewUser({...newUser, roles: e.target.value})}
          renderValue={(selected) => (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {selected.map((value) => (
                <Chip key={value} label={value} size="small" />
              ))}
            </Box>
          )}
        >
          <MenuItem value="CUSTOMER_USER">Customer User</MenuItem>
          <MenuItem value="ADMIN">Admin</MenuItem>
          <MenuItem value="BANK_STAFF">Bank Staff</MenuItem>
          <MenuItem value="AUDITOR">Auditor</MenuItem>
        </Select>
      </FormControl>
    </Box>
  </DialogContent>
  <DialogActions>
    <Button onClick={handleCloseAddUser}>Cancel</Button>
    <Button onClick={handleCreateUser} variant="contained">
      Create User
    </Button>
  </DialogActions>
</Dialog>
```

### **5. Transaction Monitoring Dashboard**

#### **Transaction Analytics**
```tsx
<TransactionDashboard>
  <Grid container spacing={3}>
    <Grid item xs={12} md={4}>
      <Card>
        <CardContent>
          <Typography variant="h6">Transaction Volume</Typography>
          <LineChart data={transactionVolumeData} />
        </CardContent>
      </Card>
    </Grid>
    <Grid item xs={12} md={4}>
      <Card>
        <CardContent>
          <Typography variant="h6">Transaction Status</Typography>
        <PieChart data={transactionStatusData} />
        </CardContent>
      </Card>
    </Grid>
    <Grid item xs={12} md={4}>
      <Card>
        <CardContent>
          <Typography variant="h6">Daily Transactions</Typography>
          <BarChart data={dailyTransactionData} />
        </CardContent>
      </Card>
    </Grid>
  </Grid>
  
  <Card sx={{ mt: 3 }}>
    <CardHeader>
      <Typography variant="h6">Recent Transactions</Typography>
    </CardHeader>
    <CardContent>
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>User</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {recentTransactions.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell>{formatDate(transaction.date)}</TableCell>
                <TableCell>{transaction.user}</TableCell>
                <TableCell>{transaction.type}</TableCell>
                <TableCell>${transaction.amount}</TableCell>
                <TableCell>
                  <Chip
                    label={transaction.status}
                    color={getStatusColor(transaction.status)}
                    size="small"
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </CardContent>
  </Card>
</TransactionDashboard>
```

### **6. Audit Center**

#### **Audit Logs Table**
```tsx
<AuditLogsTable>
  <Box sx={{ mb: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
    <TextField
      label="Search Events"
      value={searchTerm}
      onChange={handleSearch}
      placeholder="Search by user, action, or event"
      size="small"
    />
    <FormControl size="small">
      <InputLabel>Event Type</InputLabel>
      <Select
        value={eventTypeFilter}
        onChange={(e) => setEventTypeFilter(e.target.value)}
        size="small"
      >
        <MenuItem value="">All Events</MenuItem>
        <MenuItem value="USER_REGISTERED">User Registered</MenuItem>
        <MenuItem value="TRANSACTION_COMPLETED">Transaction Completed</MenuItem>
        <MenuItem value="USER_LOGIN">User Login</MenuItem>
        <MenuItem value="USER_LOGOUT">User Logout</MenuItem>
        <MenuItem value="ACCOUNT_CREATED">Account Created</MenuItem>
      </Select>
    </FormControl>
    <TextField
      label="Date Range"
      type="date"
      value={dateRange}
      onChange={handleDateRangeChange}
      size="small"
      sx={{ width: 200 }}
    />
  </Box>

  <TableContainer component={Paper}>
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>Timestamp</TableCell>
          <TableCell>User</TableCell>
          <TableCell>Action</TableCell>
          <TableCell>Service</TableCell>
          <TableCell>IP Address</TableCell>
          <TableCell>Details</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {auditLogs.map((log) => (
          <TableRow key={log.id}>
            <TableCell>{formatDateTime(log.timestamp)}</TableCell>
            <TableCell>{log.user}</TableCell>
            <TableCell>{log.action}</TableCell>
            <TableCell>{log.service}</TableCell>
            <TableCell>{log.ipAddress}</TableCell>
            <TableCell>
              <Button size="small" onClick={() => viewAuditDetails(log)}>
                <VisibilityIcon />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </TableContainer>

  <Pagination
    count={totalPages}
    page={currentPage}
    onChange={handlePageChange}
    color="primary"
    sx={{ mt: 2 }}
  />
</AuditLogsTable>
```

---

## 🎨 Component Usage Tips

### **1. Responsive Design**
```tsx
// Use Grid for responsive layouts
<Grid container spacing={2}>
  <Grid item xs={12} sm={6} md={4}>
    <Card>Content</Card>
  </Grid>
  <Grid item xs={12} sm={6} md={8}>
    <Card>Content</Card>
  </Grid>
</Grid>
```

### **2. Loading States**
```tsx
{loading ? (
  <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
      <CircularProgress />
      <Typography variant="body1" sx={{ mt: 2 }}>
        Loading...
      </Typography>
    </Box>
) : (
  <Content />
)}
```

### **3. Error Handling**
```tsx
{error && (
  <Alert severity="error" onClose={() => setError(null)}>
    {error}
  </Alert>
)}
```

### **4. Form Validation**
```tsx
<TextField
  error={!!errors.username}
  helperText={errors.username}
  label="Username"
  value={formData.username}
  onChange={handleInputChange}
  required
/>
```

### **5. Data Formatting**
```tsx
// Currency formatting
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

// Date formatting
const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString();
};

// DateTime formatting
const formatDateTime = (date: string) => {
  return new Date(date).toLocaleString();
};
```

---

## 🚀 Quick Implementation Tips

### **1. State Management**
```tsx
// Use React hooks for state management
const [formData, setFormData] = useState({
  username: '',
  email: '',
  // ... other fields
});

// Use useEffect for side effects
useEffect(() => {
  // Load data on component mount
  loadData();
}, []);
```

### **2. API Integration**
```tsx
// Use async/await for API calls
const handleSubmit = async () => {
  try {
    const result = await api.post('/api/endpoint', data);
    setSuccess(true);
  } catch (error) {
    setError(error.message);
  }
};
```

### **3. Navigation**
```tsx
// Use React Router for navigation
import { useNavigate } from 'react-router-dom';

const navigate = useNavigate();

const handleNavigation = (path: string) => {
  navigate(path);
};
```

This comprehensive UI reference guide covers all major components and their usage patterns for both Customer and Admin portals! 🎯
