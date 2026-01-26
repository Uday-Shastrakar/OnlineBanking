import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Card, CardContent, Grid, Button, CircularProgress,
  FormControl, InputLabel, Select, MenuItem, TextField,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Alert, IconButton, Tooltip, Chip, LinearProgress
} from '@mui/material';
import {
  Download, Assessment, Timeline, TrendingUp, AccountBalance,
  Description, DateRange, FilterList, Refresh, PictureAsPdf,
  TableChart, BarChart
} from '@mui/icons-material';
import { ReportRequest, ReportData, FinancialSummary, AccountAnalytics } from '../../services/reportingService';
import reportingService from '../../services/reportingService';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

const Reporting: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reportData, setReportData] = useState<ReportData[]>([]);
  const [financialSummary, setFinancialSummary] = useState<FinancialSummary | null>(null);
  const [accountAnalytics, setAccountAnalytics] = useState<AccountAnalytics[]>([]);
  const [selectedReport, setSelectedReport] = useState<string>('account-statement');
  const [reportRequest, setReportRequest] = useState<ReportRequest>({
    reportType: 'account-statement',
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    format: 'PDF'
  });

  useEffect(() => {
    fetchFinancialSummary();
    fetchAccountAnalytics();
    fetchReportHistory();
  }, []);

  const fetchFinancialSummary = async () => {
    try {
      const userDetails = JSON.parse(localStorage.getItem('userDetails') || '[]');
      const userId = userDetails[0]?.userId;
      
      if (userId) {
        const summary = await reportingService.getFinancialSummary(userId, 'monthly');
        setFinancialSummary(summary);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch financial summary');
    }
  };

  const fetchAccountAnalytics = async () => {
    try {
      const userDetails = JSON.parse(localStorage.getItem('userDetails') || '[]');
      const userId = userDetails[0]?.userId;
      
      if (userId) {
        const analytics = await reportingService.getAccountAnalytics(userId);
        setAccountAnalytics(analytics);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch account analytics');
    }
  };

  const fetchReportHistory = async () => {
    try {
      const userDetails = JSON.parse(localStorage.getItem('userDetails') || '[]');
      const userId = userDetails[0]?.userId;
      
      if (userId) {
        const history = await reportingService.getReportHistory(userId);
        setReportData(history);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch report history');
    }
  };

  const handleGenerateReport = async () => {
    try {
      setLoading(true);
      const userDetails = JSON.parse(localStorage.getItem('userDetails') || '[]');
      const userId = userDetails[0]?.userId;
      
      if (userId) {
        const report = await reportingService.generateAccountStatement({
          ...reportRequest,
          userId
        });
        
        // Download the report
        const blob = await reportingService.downloadReport(report.reportId);
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${report.reportName}.${report.format.toLowerCase()}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        // Refresh report history
        fetchReportHistory();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getReportIcon = (reportType: string) => {
    switch (reportType) {
      case 'account-statement': return <AccountBalance />;
      case 'transaction-report': return <Timeline />;
      case 'tax-report': return <Description />;
      case 'annual-summary': return <Assessment />;
      default: return <TableChart />;
    }
  };

  const getReportColor = (reportType: string) => {
    switch (reportType) {
      case 'account-statement': return 'primary';
      case 'transaction-report': return 'success';
      case 'tax-report': return 'warning';
      case 'annual-summary': return 'info';
      default: return 'default';
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box p={3}>
        <Typography variant="h4" fontWeight="bold" color="primary" gutterBottom>
          Reports & Analytics
        </Typography>
        <Typography variant="body1" color="textSecondary" mb={4}>
          Generate reports, view financial summaries, and analyze your account activity
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

        {/* Financial Summary Cards */}
        {financialSummary && (
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ 
                background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)', 
                color: 'white',
                borderRadius: 3,
                boxShadow: 3
              }}>
                <CardContent>
                  <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                    <Typography variant="h6" sx={{ opacity: 0.9 }}>
                      Total Deposits
                    </Typography>
                    <TrendingUp />
                  </Box>
                  <Typography variant="h4" fontWeight="bold">
                    {formatCurrency(financialSummary.totalDeposits)}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8, mt: 1 }}>
                    {financialSummary.period}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ 
                background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)', 
                color: 'white',
                borderRadius: 3,
                boxShadow: 3
              }}>
                <CardContent>
                  <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                    <Typography variant="h6" sx={{ opacity: 0.9 }}>
                      Total Withdrawals
                    </Typography>
                    <AccountBalance />
                  </Box>
                  <Typography variant="h4" fontWeight="bold">
                    {formatCurrency(financialSummary.totalWithdrawals)}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8, mt: 1 }}>
                    {financialSummary.period}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ 
                background: 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)', 
                color: 'white',
                borderRadius: 3,
                boxShadow: 3
              }}>
                <CardContent>
                  <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                    <Typography variant="h6" sx={{ opacity: 0.9 }}>
                      Net Balance
                    </Typography>
                    <BarChart />
                  </Box>
                  <Typography variant="h4" fontWeight="bold">
                    {formatCurrency(financialSummary.netBalance)}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8, mt: 1 }}>
                    {financialSummary.period}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ 
                background: 'linear-gradient(135deg, #7c3aed 0%, #8b5cf6 100%)', 
                color: 'white',
                borderRadius: 3,
                boxShadow: 3
              }}>
                <CardContent>
                  <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                    <Typography variant="h6" sx={{ opacity: 0.9 }}>
                      Transactions
                    </Typography>
                    <Timeline />
                  </Box>
                  <Typography variant="h4" fontWeight="bold">
                    {financialSummary.transactionCount}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8, mt: 1 }}>
                    {financialSummary.period}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* Report Generation Section */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={8}>
            <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" mb={3}>
                  Generate Report
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={3}>
                    <FormControl fullWidth>
                      <InputLabel>Report Type</InputLabel>
                      <Select
                        value={selectedReport}
                        onChange={(e) => {
                          setSelectedReport(e.target.value);
                          setReportRequest({ ...reportRequest, reportType: e.target.value });
                        }}
                      >
                        <MenuItem value="account-statement">Account Statement</MenuItem>
                        <MenuItem value="transaction-report">Transaction Report</MenuItem>
                        <MenuItem value="tax-report">Tax Report</MenuItem>
                        <MenuItem value="annual-summary">Annual Summary</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <FormControl fullWidth>
                      <InputLabel>Format</InputLabel>
                      <Select
                        value={reportRequest.format}
                        onChange={(e) => setReportRequest({ ...reportRequest, format: e.target.value as 'PDF' | 'EXCEL' | 'CSV' })}
                      >
                        <MenuItem value="PDF">PDF</MenuItem>
                        <MenuItem value="EXCEL">Excel</MenuItem>
                        <MenuItem value="CSV">CSV</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <TextField
                      fullWidth
                      label="Start Date"
                      type="date"
                      value={reportRequest.startDate}
                      onChange={(e) => setReportRequest({ ...reportRequest, startDate: e.target.value })}
                    />
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <TextField
                      fullWidth
                      label="End Date"
                      type="date"
                      value={reportRequest.endDate}
                      onChange={(e) => setReportRequest({ ...reportRequest, endDate: e.target.value })}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Button
                      variant="contained"
                      startIcon={<Download />}
                      onClick={handleGenerateReport}
                      disabled={loading}
                      sx={{ mr: 2 }}
                    >
                      {loading ? 'Generating...' : 'Generate Report'}
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<Refresh />}
                      onClick={fetchReportHistory}
                    >
                      Refresh
                    </Button>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" mb={3}>
                  Quick Actions
                </Typography>
                <Box display="flex" flexDirection="column" gap={2}>
                  <Button
                    variant="outlined"
                    startIcon={<PictureAsPdf />}
                    onClick={() => {
                      setReportRequest({ ...reportRequest, reportType: 'account-statement', format: 'PDF' });
                      setSelectedReport('account-statement');
                    }}
                  >
                    Download Statement
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<TableChart />}
                    onClick={() => {
                      setReportRequest({ ...reportRequest, reportType: 'transaction-report', format: 'EXCEL' });
                      setSelectedReport('transaction-report');
                    }}
                  >
                    Transaction Report
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<Description />}
                    onClick={() => {
                      setReportRequest({ ...reportRequest, reportType: 'tax-report', format: 'PDF' });
                      setSelectedReport('tax-report');
                    }}
                  >
                    Tax Report
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Account Analytics */}
        {accountAnalytics.length > 0 && (
          <Card sx={{ borderRadius: 3, boxShadow: 3, mb: 4 }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" mb={3}>
                Account Analytics
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Account Number</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell>Balance</TableCell>
                      <TableCell>Transactions</TableCell>
                      <TableCell>Monthly Growth</TableCell>
                      <TableCell>Risk Score</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {accountAnalytics.map((account) => (
                      <TableRow key={account.accountId}>
                        <TableCell>{account.accountNumber}</TableCell>
                        <TableCell>
                          <Chip 
                            label={account.accountType} 
                            size="small" 
                            color="primary" 
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>{formatCurrency(account.balance)}</TableCell>
                        <TableCell>{account.transactionCount}</TableCell>
                        <TableCell>
                          <Box display="flex" alignItems="center">
                            <TrendingUp sx={{ mr: 1, color: 'green' }} />
                            {account.monthlyGrowth.toFixed(1)}%
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={account.riskScore} 
                            size="small" 
                            color={account.riskScore < 30 ? 'success' : account.riskScore < 70 ? 'warning' : 'error'}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        )}

        {/* Report History */}
        {reportData.length > 0 && (
          <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" mb={3}>
                Recent Reports
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Report Name</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell>Format</TableCell>
                      <TableCell>Generated</TableCell>
                      <TableCell>Size</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {reportData.map((report) => (
                      <TableRow key={report.reportId}>
                        <TableCell>{report.reportName}</TableCell>
                        <TableCell>
                          <Chip 
                            label={report.reportType} 
                            size="small" 
                            color={getReportColor(report.reportType)}
                          />
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={report.format} 
                            size="small" 
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>{formatDate(report.generatedAt)}</TableCell>
                        <TableCell>{(report.fileSize / 1024).toFixed(1)} KB</TableCell>
                        <TableCell>
                          <IconButton
                            size="small"
                            onClick={async () => {
                              try {
                                const blob = await reportingService.downloadReport(report.reportId);
                                const url = window.URL.createObjectURL(blob);
                                const a = document.createElement('a');
                                a.href = url;
                                a.download = `${report.reportName}.${report.format.toLowerCase()}`;
                                document.body.appendChild(a);
                                a.click();
                                document.body.removeChild(a);
                                window.URL.revokeObjectURL(url);
                              } catch (err: any) {
                                setError(err.message || 'Failed to download report');
                              }
                            }}
                          >
                            <Download />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        )}
      </Box>
    </LocalizationProvider>
  );
};

export default Reporting;
