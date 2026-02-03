import React, { useEffect, useState } from 'react';
import {
    Box, Typography, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Paper,
    Chip, CircularProgress, Alert, Pagination, IconButton, Tooltip, Tabs, Tab
} from '@mui/material';
import { InfoOutlined, CheckCircle, Warning, Error as ErrorIcon, Loop, ArrowUpward, ArrowDownward } from '@mui/icons-material';
import transactionService from '../../services/transactionService';
import { accountService } from '../../services/api/accountService';
import { Transaction, TransactionStatus } from '../../types/banking';

/**
 * TransactionHistory Component - Banking-Grade Ledger View
 * Displays Credit/Debit columns with persisted balance_after from backend
 * Each row represents one ledger entry with proper post-transaction balance
 * Balance is NEVER calculated in UI - always from backend balance_after field
 */
const TransactionHistory: React.FC = () => {
    const [transactions, setTransactions] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [pagination, setPagination] = useState({
        currentPage: 0,
        totalPages: 0,
        totalElements: 0,
        size: 10
    });
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

                // Use banking-grade ledger API
                const ledgerData = await transactionService.getLedgerTransactionHistory(userId, page - 1, rowsPerPage);
                setTransactions(ledgerData.content || []);
                setPagination(ledgerData);

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
                            <TableCell><strong>Date</strong></TableCell>
                            <TableCell><strong>Description</strong></TableCell>
                            <TableCell align="right"><strong>Credit</strong></TableCell>
                            <TableCell align="right"><strong>Debit</strong></TableCell>
                            <TableCell align="right"><strong>Balance</strong></TableCell>
                            <TableCell align="center"><strong>Status</strong></TableCell>
                            <TableCell align="center"><strong>Actions</strong></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {transactions.map((tx) => (
                            <TableRow key={tx.entryId} hover>
                                <TableCell>
                                    <Typography variant="body2">
                                        {new Date(tx.timestamp).toLocaleDateString()}
                                    </Typography>
                                </TableCell>
                                <TableCell>
                                    <Typography variant="body2" fontWeight="medium">
                                        {tx.description || 'Transaction'}
                                    </Typography>
                                </TableCell>
                                <TableCell align="right">
                                    <Typography variant="body2" sx={{ color: 'success.main', fontWeight: 'bold' }}>
                                        {tx.entryType === 'CREDIT' ? `₹${tx.amount?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '–'}
                                    </Typography>
                                </TableCell>
                                <TableCell align="right">
                                    <Typography variant="body2" sx={{ color: 'error.main', fontWeight: 'bold' }}>
                                        {tx.entryType === 'DEBIT' ? `₹${tx.amount?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '–'}
                                    </Typography>
                                </TableCell>
                                <TableCell align="right">
                                    <Typography variant="body2" fontWeight="bold">
                                        ₹{tx.balanceAfter?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                    </Typography>
                                </TableCell>
                                <TableCell align="center">{getStatusChip(tx.status)}</TableCell>
                                <TableCell align="center">
                                    <Tooltip title={`Transaction ID: ${tx.transactionId || 'N/A'}`}>
                                        <IconButton size="small">
                                            <InfoOutlined fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                </TableCell>
                            </TableRow>
                        ))}
                        {transactions.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                                    No recent transactions found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <Box display="flex" justifyContent="center" mt={4}>
                {pagination && (
                    <Pagination 
                        count={pagination.totalPages} 
                        page={page} 
                        onChange={(_, v) => setPage(v)} 
                        color="primary" 
                    />
                )}
            </Box>

            <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .spin { animation: spin 2s linear infinite; }
      `}</style>
        </Box>
    );
};

export default TransactionHistory;
