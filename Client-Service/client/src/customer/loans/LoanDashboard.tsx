import React, { useState, useEffect } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Grid,
    Button,
    LinearProgress,
    Chip,
    Paper,
    Divider,
    CircularProgress
} from '@mui/material';
import {
    AccountBalance,
    Add as AddIcon,
    Timeline,
    Payment
} from '@mui/icons-material';
import loanService, { Loan } from '../../services/loanService';
import AuthStorage from '../../services/authStorage';
import { useNavigate } from 'react-router-dom';

const LoanDashboard: React.FC = () => {
    const [loans, setLoans] = useState<Loan[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const userId = AuthStorage.getUser()?.userId;

    useEffect(() => {
        if (userId) {
            fetchLoans();
        }
    }, [userId]);

    const fetchLoans = async () => {
        try {
            setLoading(true);
            const data = await loanService.getUserLoans(userId!);
            setLoans(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const calculateProgress = (paid: number, total: number) => {
        return Math.min((paid / total) * 100, 100);
    };

    if (loading) {
        return <Box p={3}><CircularProgress /></Box>;
    }

    return (
        <Box p={3}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
                <Typography variant="h4" sx={{ color: '#1a237e', fontWeight: 'bold' }}>
                    My Loans
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => navigate('/loans/apply')}
                    sx={{ bgcolor: '#1a237e' }}
                >
                    Apply for Loan
                </Button>
            </Box>

            <Grid container spacing={3}>
                {loans.map((loan) => (
                    <Grid item xs={12} lg={6} key={loan.loanId}>
                        <Paper elevation={3} sx={{ borderRadius: 2, overflow: 'hidden' }}>
                            <Box p={3} sx={{ bgcolor: '#f5f5f5', borderBottom: '1px solid #e0e0e0' }}>
                                <Box display="flex" justifyContent="space-between" alignItems="center">
                                    <Box display="flex" alignItems="center">
                                        <AccountBalance sx={{ color: '#1a237e', mr: 2 }} />
                                        <Typography variant="h6">{loan.loanType} Loan</Typography>
                                    </Box>
                                    <Chip
                                        label={loan.status}
                                        color={loan.status === 'ACTIVE' ? 'success' : 'warning'}
                                    />
                                </Box>
                            </Box>

                            <CardContent>
                                <Grid container spacing={2} mb={3}>
                                    <Grid item xs={6}>
                                        <Typography variant="body2" color="textSecondary">Loan Amount</Typography>
                                        <Typography variant="h6">${loan.loanAmount.toLocaleString()}</Typography>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Typography variant="body2" color="textSecondary">Monthly EMI</Typography>
                                        <Typography variant="h6" color="primary">${loan.emi.toLocaleString()}</Typography>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Typography variant="body2" color="textSecondary">Interest Rate</Typography>
                                        <Typography variant="body1">{loan.interestRate}%</Typography>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Typography variant="body2" color="textSecondary">Tenure</Typography>
                                        <Typography variant="body1">{loan.tenure} Months</Typography>
                                    </Grid>
                                </Grid>

                                <Box mb={2}>
                                    <Box display="flex" justifyContent="space-between" mb={1}>
                                        <Typography variant="body2">Repayment Progress</Typography>
                                        <Typography variant="body2">{calculateProgress(loan.paidAmount, loan.totalAmount).toFixed(0)}%</Typography>
                                    </Box>
                                    <LinearProgress
                                        value={calculateProgress(loan.paidAmount, loan.totalAmount)}
                                        variant="determinate"
                                        sx={{ height: 8, borderRadius: 5 }}
                                    />
                                    <Box display="flex" justifyContent="space-between" mt={1}>
                                        <Typography variant="caption" color="textSecondary">Paid: ${loan.paidAmount.toLocaleString()}</Typography>
                                        <Typography variant="caption" color="textSecondary">Remaining: ${loan.remainingAmount.toLocaleString()}</Typography>
                                    </Box>
                                </Box>

                                <Divider sx={{ my: 2 }} />

                                <Box display="flex" justifyContent="flex-end" gap={2}>
                                    <Button startIcon={<Timeline />} onClick={() => navigate(`/loans/${loan.loanId}`)}>
                                        Details
                                    </Button>
                                    {loan.status === 'ACTIVE' && (
                                        <Button
                                            variant="contained"
                                            color="primary"
                                            startIcon={<Payment />}
                                            onClick={() => navigate(`/loans/${loan.loanId}/repay`)}
                                        >
                                            Pay EMI
                                        </Button>
                                    )}
                                </Box>
                            </CardContent>
                        </Paper>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
};

export default LoanDashboard;
