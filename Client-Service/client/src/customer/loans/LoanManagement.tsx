import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Card, CardContent, Grid, Button, Chip, CircularProgress,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, FormControl,
  InputLabel, Select, MenuItem, LinearProgress, Alert, IconButton, Tooltip,
  Divider, Tabs, Tab, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper
} from '@mui/material';
import {
  AccountBalance, Calculate, Description, Timeline, CheckCircle,
  Warning, Error, Info, AttachMoney, TrendingUp, CalendarToday
} from '@mui/icons-material';
import { Loan, LoanApplication, LoanEligibility, LoanRepayment } from '../../services/loanService';
import loanService from '../../services/loanService';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`loan-tabpanel-${index}`}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
};

const LoanManagement: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showApplicationDialog, setShowApplicationDialog] = useState(false);
  const [showEligibilityDialog, setShowEligibilityDialog] = useState(false);
  const [showRepaymentDialog, setShowRepaymentDialog] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);

  // Loan application form state
  const [loanApplication, setLoanApplication] = useState<LoanApplication>({
    userId: 0,
    accountId: 0,
    loanType: 'PERSONAL',
    loanAmount: 100000,
    tenure: 12,
    purpose: '',
    income: 50000,
    employmentType: 'SALARIED',
    companyName: '',
    monthlyIncome: 50000,
    existingEMIs: 0,
    collateral: ''
  });

  // Eligibility check state
  const [eligibility, setEligibility] = useState<LoanEligibility | null>(null);
  const [eligibilityLoading, setEligibilityLoading] = useState(false);

  // EMI calculation state
  const [emiCalculation, setEmiCalculation] = useState({
    emi: 0,
    totalInterest: 0,
    totalAmount: 0
  });

  // Repayment state
  const [repaymentAmount, setRepaymentAmount] = useState('');

  useEffect(() => {
    fetchLoans();
  }, []);

  const fetchLoans = async () => {
    try {
      const userDetails = JSON.parse(localStorage.getItem('userDetails') || '[]');
      const userId = userDetails[0]?.userId;
      
      if (userId) {
        const userLoans = await loanService.getUserLoans(userId);
        setLoans(userLoans);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch loans');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyLoan = async () => {
    try {
      const userDetails = JSON.parse(localStorage.getItem('userDetails') || '[]');
      const userId = userDetails[0]?.userId;
      
      if (userId) {
        await loanService.applyForLoan({ ...loanApplication, userId });
        setShowApplicationDialog(false);
        fetchLoans();
        // Reset form
        setLoanApplication({
          userId: 0,
          accountId: 0,
          loanType: 'PERSONAL',
          loanAmount: 100000,
          tenure: 12,
          purpose: '',
          income: 50000,
          employmentType: 'SALARIED',
          companyName: '',
          monthlyIncome: 50000,
          existingEMIs: 0,
          collateral: ''
        });
      }
    } catch (err: any) {
      setError(err.message || 'Failed to apply for loan');
    }
  };

  const handleCheckEligibility = async () => {
    try {
      const userDetails = JSON.parse(localStorage.getItem('userDetails') || '[]');
      const userId = userDetails[0]?.userId;
      
      if (userId) {
        setEligibilityLoading(true);
        const result = await loanService.checkLoanEligibility(
          userId,
          loanApplication.loanType,
          loanApplication.loanAmount,
          loanApplication.tenure
        );
        setEligibility(result);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to check eligibility');
    } finally {
      setEligibilityLoading(false);
    }
  };

  const handleCalculateEMI = async () => {
    try {
      const result = await loanService.calculateEMI(
        loanApplication.loanAmount,
        10, // Assuming 10% interest rate
        loanApplication.tenure
      );
      setEmiCalculation(result);
    } catch (err: any) {
      setError(err.message || 'Failed to calculate EMI');
    }
  };

  const handleMakeRepayment = async () => {
    try {
      if (selectedLoan && repaymentAmount) {
        await loanService.makeLoanRepayment(
          selectedLoan.loanId,
          Number(repaymentAmount),
          'ONLINE'
        );
        setShowRepaymentDialog(false);
        setRepaymentAmount('');
        fetchLoans();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to make repayment');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'success';
      case 'APPROVED': return 'info';
      case 'PENDING': return 'warning';
      case 'REJECTED': return 'error';
      case 'COMPLETED': return 'success';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ACTIVE': return <CheckCircle />;
      case 'APPROVED': return <Info />;
      case 'PENDING': return <Warning />;
      case 'REJECTED': return <Error />;
      case 'COMPLETED': return <CheckCircle />;
      default: return <Info />;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Typography variant="h4" fontWeight="bold" color="primary" gutterBottom>
        Loan Management
      </Typography>
      <Typography variant="body1" color="textSecondary" mb={4}>
        Apply for loans, check eligibility, and manage your existing loans
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
          <Tab label="My Loans" />
          <Tab label="Apply for Loan" />
          <Tab label="Loan Calculator" />
        </Tabs>
      </Box>

      {/* My Loans Tab */}
      <TabPanel value={tabValue} index={0}>
        <Grid container spacing={3}>
          {loans.map((loan) => (
            <Grid item xs={12} md={6} lg={4} key={loan.loanId}>
              <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
                <CardContent>
                  {/* Loan Header */}
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                    <Box>
                      <Typography variant="h6" fontWeight="bold">
                        {loan.loanType} Loan
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Loan ID: {loan.loanId}
                      </Typography>
                    </Box>
                    <Chip
                      label={loan.status}
                      color={getStatusColor(loan.status)}
                      size="small"
                      icon={getStatusIcon(loan.status)}
                    />
                  </Box>

                  {/* Loan Details */}
                  <Box mb={2}>
                    <Box display="flex" justifyContent="space-between" mb={1}>
                      <Typography variant="body2">Loan Amount:</Typography>
                      <Typography variant="body2" fontWeight="bold">
                        {formatCurrency(loan.loanAmount)}
                      </Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between" mb={1}>
                      <Typography variant="body2">Interest Rate:</Typography>
                      <Typography variant="body2" fontWeight="bold">
                        {loan.interestRate}%
                      </Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between" mb={1}>
                      <Typography variant="body2">EMI:</Typography>
                      <Typography variant="body2" fontWeight="bold">
                        {formatCurrency(loan.emi)}
                      </Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between" mb={1}>
                      <Typography variant="body2">Tenure:</Typography>
                      <Typography variant="body2" fontWeight="bold">
                        {loan.tenure} months
                      </Typography>
                    </Box>
                  </Box>

                  {/* Progress Bar */}
                  <Box mb={2}>
                    <Box display="flex" justifyContent="space-between" mb={1}>
                      <Typography variant="body2">Progress:</Typography>
                      <Typography variant="body2">
                        {Math.round((loan.paidAmount / loan.totalAmount) * 100)}%
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={(loan.paidAmount / loan.totalAmount) * 100}
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                  </Box>

                  {/* Loan Actions */}
                  <Box display="flex" gap={1}>
                    {loan.status === 'ACTIVE' && (
                      <Button
                        size="small"
                        variant="contained"
                        startIcon={<AttachMoney />}
                        onClick={() => {
                          setSelectedLoan(loan);
                          setShowRepaymentDialog(true);
                        }}
                      >
                        Repay
                      </Button>
                    )}
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<Description />}
                    >
                      Details
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </TabPanel>

      {/* Apply for Loan Tab */}
      <TabPanel value={tabValue} index={1}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" mb={3}>
                  Apply for Loan
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <FormControl fullWidth>
                      <InputLabel>Loan Type</InputLabel>
                      <Select
                        value={loanApplication.loanType}
                        onChange={(e) => setLoanApplication({ ...loanApplication, loanType: e.target.value as any })}
                      >
                        <MenuItem value="PERSONAL">Personal Loan</MenuItem>
                        <MenuItem value="HOME">Home Loan</MenuItem>
                        <MenuItem value="CAR">Car Loan</MenuItem>
                        <MenuItem value="EDUCATION">Education Loan</MenuItem>
                        <MenuItem value="BUSINESS">Business Loan</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Loan Amount (₹)"
                      type="number"
                      value={loanApplication.loanAmount}
                      onChange={(e) => setLoanApplication({ ...loanApplication, loanAmount: Number(e.target.value) })}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Tenure (months)"
                      type="number"
                      value={loanApplication.tenure}
                      onChange={(e) => setLoanApplication({ ...loanApplication, tenure: Number(e.target.value) })}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Purpose"
                      multiline
                      rows={2}
                      value={loanApplication.purpose}
                      onChange={(e) => setLoanApplication({ ...loanApplication, purpose: e.target.value })}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <FormControl fullWidth>
                      <InputLabel>Employment Type</InputLabel>
                      <Select
                        value={loanApplication.employmentType}
                        onChange={(e) => setLoanApplication({ ...loanApplication, employmentType: e.target.value as any })}
                      >
                        <MenuItem value="SALARIED">Salaried</MenuItem>
                        <MenuItem value="SELF_EMPLOYED">Self Employed</MenuItem>
                        <MenuItem value="BUSINESS">Business</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Monthly Income (₹)"
                      type="number"
                      value={loanApplication.monthlyIncome}
                      onChange={(e) => setLoanApplication({ ...loanApplication, monthlyIncome: Number(e.target.value) })}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Existing EMIs (₹)"
                      type="number"
                      value={loanApplication.existingEMIs}
                      onChange={(e) => setLoanApplication({ ...loanApplication, existingEMIs: Number(e.target.value) })}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Box display="flex" gap={2}>
                      <Button
                        variant="outlined"
                        startIcon={<Calculate />}
                        onClick={handleCalculateEMI}
                      >
                        Calculate EMI
                      </Button>
                      <Button
                        variant="outlined"
                        startIcon={<CheckCircle />}
                        onClick={handleCheckEligibility}
                        disabled={eligibilityLoading}
                      >
                        Check Eligibility
                      </Button>
                    </Box>
                  </Grid>
                  {emiCalculation.emi > 0 && (
                    <Grid item xs={12}>
                      <Alert severity="info">
                        <Typography variant="body2">
                          <strong>EMI:</strong> {formatCurrency(emiCalculation.emi)}<br />
                          <strong>Total Interest:</strong> {formatCurrency(emiCalculation.totalInterest)}<br />
                          <strong>Total Amount:</strong> {formatCurrency(emiCalculation.totalAmount)}
                        </Typography>
                      </Alert>
                    </Grid>
                  )}
                  {eligibility && (
                    <Grid item xs={12}>
                      <Alert severity={eligibility.eligible ? "success" : "error"}>
                        <Typography variant="body2">
                          {eligibility.eligible ? (
                            <>
                              <strong>Eligible!</strong><br />
                              Max Amount: {formatCurrency(eligibility.maxLoanAmount)}<br />
                              Min Rate: {eligibility.minInterestRate}%<br />
                              Max Tenure: {eligibility.maxTenure} months
                            </>
                          ) : (
                            <>
                              <strong>Not Eligible</strong><br />
                              {eligibility.reasons?.join(', ')}
                            </>
                          )}
                        </Typography>
                      </Alert>
                    </Grid>
                  )}
                  <Grid item xs={12}>
                    <Button
                      variant="contained"
                      fullWidth
                      onClick={handleApplyLoan}
                      disabled={!eligibility?.eligible}
                    >
                      Apply for Loan
                    </Button>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" mb={3}>
                  Loan Information
                </Typography>
                <Typography variant="body2" color="textSecondary" paragraph>
                  Apply for a loan with competitive interest rates and flexible repayment options.
                </Typography>
                <Typography variant="h6" mb={2}>Features:</Typography>
                <ul>
                  <li>Quick approval process</li>
                  <li>Competitive interest rates</li>
                  <li>Flexible repayment tenure</li>
                  <li>No hidden charges</li>
                  <li>Online application</li>
                </ul>
                <Typography variant="h6" mb={2}>Documents Required:</Typography>
                <ul>
                  <li>Identity proof</li>
                  <li>Address proof</li>
                  <li>Income proof</li>
                  <li>Bank statements</li>
                  <li>Photographs</li>
                </ul>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Loan Calculator Tab */}
      <TabPanel value={tabValue} index={2}>
        <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
          <CardContent>
            <Typography variant="h6" fontWeight="bold" mb={3}>
              Loan Calculator
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Loan Amount (₹)"
                  type="number"
                  value={loanApplication.loanAmount}
                  onChange={(e) => setLoanApplication({ ...loanApplication, loanAmount: Number(e.target.value) })}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Interest Rate (%)"
                  type="number"
                  value={10}
                  disabled
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Tenure (months)"
                  type="number"
                  value={loanApplication.tenure}
                  onChange={(e) => setLoanApplication({ ...loanApplication, tenure: Number(e.target.value) })}
                />
              </Grid>
              <Grid item xs={12}>
                <Button
                  variant="contained"
                  startIcon={<Calculate />}
                  onClick={handleCalculateEMI}
                >
                  Calculate EMI
                </Button>
              </Grid>
              {emiCalculation.emi > 0 && (
                <Grid item xs={12}>
                  <Alert severity="info">
                    <Typography variant="h6" mb={2}>Calculation Results:</Typography>
                    <Typography variant="body1">
                      <strong>Monthly EMI:</strong> {formatCurrency(emiCalculation.emi)}<br />
                      <strong>Total Interest:</strong> {formatCurrency(emiCalculation.totalInterest)}<br />
                      <strong>Total Amount:</strong> {formatCurrency(emiCalculation.totalAmount)}
                    </Typography>
                  </Alert>
                </Grid>
              )}
            </Grid>
          </CardContent>
        </Card>
      </TabPanel>

      {/* Repayment Dialog */}
      <Dialog open={showRepaymentDialog} onClose={() => setShowRepaymentDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Make Loan Repayment</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Repayment Amount (₹)"
              type="number"
              value={repaymentAmount}
              onChange={(e) => setRepaymentAmount(e.target.value)}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowRepaymentDialog(false)}>Cancel</Button>
          <Button onClick={handleMakeRepayment} variant="contained">Pay Now</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default LoanManagement;
