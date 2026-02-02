import React, { useState, useEffect } from 'react';
import {
    Box, Typography, TextField, Button, MenuItem,
    CircularProgress, Alert, Card, CardContent, Divider
} from '@mui/material';
import { Send, Cached, CheckCircle, Error } from '@mui/icons-material';
import { transactionService } from '../../services/api/transactionService';
import { useIdempotency } from '../../hooks/useIdempotency';
import api from '../../services/api';
import { BankAccount } from '../../types/banking';

type TransferState = 'IDLE' | 'SUBMITTING' | 'PENDING' | 'COMPLETED' | 'FAILED' | 'DUPLICATE';

/**
 * TransferForm Component
 * A production-grade fund transfer interface that enforces idempotency.
 * Uses the new transaction API with gateway headers and proper security.
 */
const TransferForm: React.FC = () => {
    const { idempotencyKey, rotateKey } = useIdempotency();
    const [accounts, setAccounts] = useState<BankAccount[]>([]);
    const [senderId, setSenderId] = useState<string>('');
    const [receiverAccount, setReceiverAccount] = useState<string>('');
    const [amount, setAmount] = useState<string>('');
    const [description, setDescription] = useState<string>('');

    const [status, setStatus] = useState<TransferState>('IDLE');
    const [message, setMessage] = useState<string | null>(null);
    const [cachedResult, setCachedResult] = useState<any>(null);

    useEffect(() => {
        const loadAccounts = async () => {
            try {
                const userDetails = JSON.parse(localStorage.getItem('userDetails') || '{}');
                const userId = userDetails?.userId;
                const response = await api.get(`/account/getall?userId=${userId}`);
                const activeAccounts = (Array.isArray(response.data) ? response.data : [response.data])
                    .filter((a: BankAccount) => a.status === 'ACTIVE');
                setAccounts(activeAccounts);
                if (activeAccounts.length > 0) {
                    setSenderId(activeAccounts[0].id.toString());
                }
            } catch (err) {
                setMessage("Failed to load your accounts.");
            }
        };
        loadAccounts();
    }, []);

    const handleTransfer = async (e: React.FormEvent) => {
        e.preventDefault();
        if (status === 'SUBMITTING' || status === 'PENDING') return;

        setStatus('SUBMITTING');
        setMessage(null);

        try {
            // Use the new transaction API with proper gateway headers
            const transferRequest = {
                sourceAccountId: parseInt(senderId),
                destinationAccountId: parseInt(receiverAccount),
                amount: parseFloat(amount),
                currency: 'INR',
                description: description || 'Fund Transfer (INR)'
            };

            const response = await transactionService.initiateTransfer(transferRequest, idempotencyKey);

            setStatus('COMPLETED');
            setMessage(`Transaction successful! Transaction ID: ${response.transactionId}`);
            // Rotate key after success to allow a fresh transaction
            rotateKey();
        } catch (err: any) {
            if (err.response?.status === 409) {
                setStatus('DUPLICATE');
                setMessage("This transaction was already processed. Here is the previous result.");
                setCachedResult(err.response.data);
            } else if (err.response?.status === 403) {
                setStatus('FAILED');
                setMessage("You don't have permission to perform this transfer.");
            } else {
                setStatus('FAILED');
                setMessage(err.response?.data?.message || "Transfer failed. You can safely retry this transaction.");
            }
        }
    };

    const getStatusColor = () => {
        switch (status) {
            case 'COMPLETED': return 'success.main';
            case 'FAILED': return 'error.main';
            case 'DUPLICATE': return 'warning.main';
            default: return 'text.primary';
        }
    };

    return (
        <Box p={3} maxWidth={600} mx="auto">
            <Typography variant="h4" fontWeight="bold" color="primary" gutterBottom>
                Transfer Money
            </Typography>
            <Typography variant="body2" color="textSecondary" mb={4}>
                Securely send funds using banking-grade idempotency keys.
            </Typography>

            <Card sx={{ borderRadius: 4, boxShadow: 6 }}>
                <CardContent>
                    <form onSubmit={handleTransfer}>
                        <TextField
                            select
                            fullWidth
                            label="From Account"
                            value={senderId}
                            onChange={(e) => setSenderId(e.target.value)}
                            margin="normal"
                            required
                            disabled={status === 'SUBMITTING'}
                        >
                            {accounts.map((acc) => (
                                <MenuItem key={acc.id} value={acc.id}>
                                    {acc.accountType} - XXXX-{acc.accountNumber.toString().slice(-4)} (₹{acc.balance})
                                </MenuItem>
                            ))}
                        </TextField>

                        <TextField
                            fullWidth
                            label="Recipient Account Number"
                            variant="outlined"
                            margin="normal"
                            value={receiverAccount}
                            onChange={(e) => setReceiverAccount(e.target.value)}
                            required
                            disabled={status === 'SUBMITTING'}
                        />

                        <TextField
                            fullWidth
                            label="Amount (₹)"
                            type="number"
                            variant="outlined"
                            margin="normal"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            required
                            inputProps={{ min: "1", step: "0.01" }}
                            disabled={status === 'SUBMITTING'}
                        />

                        <Box mt={4}>
                            <Button
                                type="submit"
                                variant="contained"
                                fullWidth
                                size="large"
                                startIcon={status === 'SUBMITTING' ? <CircularProgress size={20} color="inherit" /> : <Send />}
                                disabled={status === 'SUBMITTING' || !senderId || !receiverAccount || !amount}
                                sx={{ py: 1.5, borderRadius: 2 }}
                            >
                                {status === 'SUBMITTING' ? 'Processing...' : 'Schedule Transfer'}
                            </Button>
                        </Box>
                    </form>

                    {message && (
                        <Box mt={3}>
                            <Alert
                                severity={status === 'COMPLETED' ? 'success' : status === 'FAILED' ? 'error' : 'warning'}
                                action={
                                    status === 'FAILED' && (
                                        <Button color="inherit" size="small" onClick={handleTransfer} startIcon={<Cached />}>
                                            RETRY
                                        </Button>
                                    )
                                }
                            >
                                {message}
                            </Alert>
                        </Box>
                    )}

                    {status === 'DUPLICATE' && cachedResult && (
                        <Box mt={2} p={2} bgcolor="#fffde7" borderRadius={2} border="1px dashed #fbc02d">
                            <Typography variant="caption" display="block" color="warning.dark">PREVIOUS RESULT</Typography>
                            <Typography variant="body2">{JSON.stringify(cachedResult)}</Typography>
                        </Box>
                    )}
                </CardContent>
            </Card>

            <Box mt={4} textAlign="center">
                <Typography variant="caption" color="textSecondary" display="flex" alignItems="center" justifyContent="center" gap={1}>
                    <span>Idempotency Key:</span> <span>{idempotencyKey}</span>
                </Typography>
            </Box>
        </Box>
    );
};

export default TransferForm;
