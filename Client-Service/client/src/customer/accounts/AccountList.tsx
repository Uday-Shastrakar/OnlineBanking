import React, { useEffect, useState } from 'react';
import { Box, Typography, Card, CardContent, Grid, Chip, CircularProgress, Alert } from '@mui/material';
import { AccountBalanceWallet, Lock, CheckCircle } from '@mui/icons-material';
import api from '../../services/api';
import { BankAccount } from '../../types/banking';

/**
 * AccountList Component
 * Displays all accounts for the logged-in customer.
 * Enforces masking of account numbers and reflects backend status.
 */
const AccountList: React.FC = () => {
    const [accounts, setAccounts] = useState<BankAccount[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchAccounts = async () => {
            try {
                const userDetails = JSON.parse(localStorage.getItem('userDetails') || '{}');
                const userId = userDetails?.userId;

                if (!userId) throw new Error("Session expired. Please log in.");

                // Note: Using existing controller path mapping
                const response = await api.get(`/account/getall?userId=${userId}`);
                setAccounts(Array.isArray(response.data) ? response.data : [response.data]);
            } catch (err: any) {
                setError(err.message || "Failed to load accounts.");
            } finally {
                setLoading(false);
            }
        };

        fetchAccounts();
    }, []);

    const maskAccountNumber = (num: string | number) => {
        if (!num) return 'XXXX-XXXX';
        const strNum = num.toString();
        return `XXXX-XXXX-${strNum.slice(-4)}`;
    };

    if (loading) return <Box display="flex" justifyContent="center" mt={4}><CircularProgress /></Box>;

    return (
        <Box p={3}>
            <Typography variant="h4" gutterBottom fontWeight="bold" color="primary">
                My Accounts
            </Typography>
            <Typography variant="body1" color="textSecondary" mb={4}>
                View and manage your personal and business banking accounts.
            </Typography>

            {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

            <Grid container spacing={3}>
                {accounts.map((acc) => (
                    <Grid item xs={12} md={6} lg={4} key={acc.id}>
                        <Card sx={{
                            borderRadius: 4,
                            boxShadow: 3,
                            opacity: acc.status === 'BLOCKED' ? 0.7 : 1,
                            borderLeft: `6px solid ${acc.status === 'ACTIVE' ? '#4caf50' : '#f44336'}`
                        }}>
                            <CardContent>
                                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                                    <AccountBalanceWallet color="primary" sx={{ fontSize: 40 }} />
                                    <Chip
                                        label={acc.status}
                                        color={acc.status === 'ACTIVE' ? 'success' : 'error'}
                                        size="small"
                                        icon={acc.status === 'ACTIVE' ? <CheckCircle /> : <Lock />}
                                    />
                                </Box>

                                <Typography variant="h6" color="textSecondary">
                                    {acc.accountType} Account
                                </Typography>
                                <Typography variant="h5" fontWeight="bold" mt={1}>
                                    ₹{acc.balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                </Typography>

                                <Box mt={3} p={1.5} bgcolor="#f8f9fa" borderRadius={2} display="flex" justifyContent="space-between">
                                    <Typography variant="caption" color="textSecondary">ACCOUNT NUMBER</Typography>
                                    <Typography variant="body2" fontWeight="medium">{maskAccountNumber(acc.accountNumber)}</Typography>
                                </Box>

                                {acc.status === 'BLOCKED' && (
                                    <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
                                        This account is currently blocked. Please contact support.
                                    </Typography>
                                )}
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            {accounts.length === 0 && !error && (
                <Alert severity="info">No accounts found. If you just registered, your account creation might be in progress.</Alert>
            )}
        </Box>
    );
};

export default AccountList;
