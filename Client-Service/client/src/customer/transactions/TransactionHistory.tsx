import React, { useEffect, useState } from 'react';
import {
    Box, Typography, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Paper,
    Chip, CircularProgress, Alert, Pagination, IconButton, Tooltip
} from '@mui/material';
import { InfoOutlined, CheckCircle, Warning, Error as ErrorIcon, Loop } from '@mui/icons-material';
import { transactionService } from '../../services/api/transactionService';
import { accountService } from '../../services/api/accountService';
import { Transaction, TransactionStatus } from '../../types/banking';

/**
 * TransactionHistory Component
 * Paginated list reflecting the current Saga state of each transaction.
 * Maps backend states (PENDING/COMPLETED/FAILED/COMPENSATED) to intuitive UX.
 */
const TransactionHistory: React.FC = () => {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [userAccounts, setUserAccounts] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const rowsPerPage = 10;

    useEffect(() => {
        const fetchHistory = async () => {
            setLoading(true);
            try {
                const userDetailsStr = localStorage.getItem('userDetails');
                if (!userDetailsStr) {
                    setError("User not authenticated.");
                    setLoading(false);
                    return;
                }

                const userDetails = JSON.parse(userDetailsStr);
                const userId = userDetails?.userId || userDetails?.id;

                if (!userId) {
                    setError("User identifier not found.");
                    setLoading(false);
                    return;
                }

                const data = await transactionService.getTransactionHistoryByUserId(userId);
                setTransactions(Array.isArray(data) ? data : []);

                // Fetch user accounts to differentiate debit/credit
                const accounts = await accountService.getAccountsByUserId(userId);
                setUserAccounts(Array.isArray(accounts) ? accounts.map(a => a.accountNumber.toString()) : []);
            } catch (err: any) {
                setError("Failed to load transaction history. Please try again later.");
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, [page]);

    const getStatusChip = (status: TransactionStatus) => {
        switch (status) {
            case 'COMPLETED':
                return <Chip label="Success" color="success" icon={<CheckCircle />} size="small" />;
            case 'PENDING':
                return <Chip label="In Progress" color="primary" icon={<Loop className="spin" />} size="small" />;
            case 'COMPENSATED':
                return <Chip label="Reversed" color="warning" icon={<Warning />} size="small" />;
            case 'FAILED':
                return <Chip label="Failed" color="error" icon={<ErrorIcon />} size="small" />;
            default:
                return <Chip label={status} size="small" />;
        }
    };

    if (loading) return <Box display="flex" justifyContent="center" mt={4}><CircularProgress /></Box>;

    return (
        <Box p={3}>
            <Typography variant="h4" fontWeight="bold" color="primary" gutterBottom>
                Activity History
            </Typography>
            <Typography variant="body1" color="textSecondary" mb={4}>
                Track your money movements and saga-orchestrated transaction states.
            </Typography>

            {error && <Alert severity="warning" sx={{ mb: 3 }}>{error} - Showing local history cache.</Alert>}

            <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: 2 }}>
                <Table sx={{ minWidth: 650 }}>
                    <TableHead sx={{ bgcolor: '#f8f9fa' }}>
                        <TableRow>
                            <TableCell><strong>Transaction ID</strong></TableCell>
                            <TableCell><strong>Date & Time</strong></TableCell>
                            <TableCell><strong>Recipient</strong></TableCell>
                            <TableCell align="right"><strong>Amount</strong></TableCell>
                            <TableCell align="center"><strong>Status</strong></TableCell>
                            <TableCell align="center"><strong>Actions</strong></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {transactions.map((tx) => (
                            <TableRow key={tx.id} hover>
                                <TableCell><Typography variant="body2" fontFamily="monospace">{tx.id}</Typography></TableCell>
                                <TableCell>{new Date(tx.transactionDateTime).toLocaleString()}</TableCell>
                                <TableCell>{tx.receiverAccountNumber}</TableCell>
                                <TableCell align="right" sx={{
                                    fontWeight: 'bold',
                                    color: userAccounts.includes(tx.senderAccountNumber?.toString()) ? 'error.main' : 'success.main'
                                }}>
                                    {userAccounts.includes(tx.senderAccountNumber?.toString()) ? `-$${tx.debitAmount}` : `+$${tx.creditAmount}`}
                                </TableCell>
                                <TableCell align="center">{getStatusChip(tx.status)}</TableCell>
                                <TableCell align="center">
                                    <Tooltip title={`Correlation ID: ${tx.correlationId || 'N/A'}`}>
                                        <IconButton size="small"><span><InfoOutlined fontSize="small" /></span></IconButton>
                                    </Tooltip>
                                </TableCell>
                            </TableRow>
                        ))}
                        {transactions.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                                    No recent transactions found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <Box display="flex" justifyContent="center" mt={4}>
                <Pagination count={5} page={page} onChange={(_, v) => setPage(v)} color="primary" />
            </Box>

            <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .spin { animation: spin 2s linear infinite; }
      `}</style>
        </Box>
    );
};

export default TransactionHistory;
