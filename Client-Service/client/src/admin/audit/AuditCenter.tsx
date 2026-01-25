import React, { useEffect, useState } from 'react';
import {
    Box, Typography, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Paper,
    Chip, TextField, Grid, Button, CircularProgress,
    Alert, Tooltip, IconButton
} from '@mui/material';
import {
    FilterList, History, InfoOutlined,
    Search, Terminal, AssignmentTurnedIn
} from '@mui/icons-material';
import api from '../../services/api';
import { AuditLog } from '../../types/banking';

/**
 * AuditCenter Component
 * Forensic log viewer for security administrators.
 * Provides immutable visibility into all system-wide activities.
 */
const AuditCenter: React.FC = () => {
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Filter states
    const [userId, setUserId] = useState('');
    const [action, setAction] = useState('');

    useEffect(() => {
        const fetchLogs = async () => {
            setLoading(true);
            try {
                const response = await api.get('/audit/all');
                setLogs(response.data);
            } catch (err: any) {
                setError("Audit logs could not be retrieved. Ensure Audit-Service is reachable.");
                // Mock data for UI demonstration
                setLogs([
                    { id: 1, timestamp: new Date().toISOString(), userId: "admin", action: "LOGIN", status: "SUCCESS", correlationId: "tx-9988-aa" },
                    { id: 2, timestamp: new Date().toISOString(), userId: "uday", action: "TRANSFER", status: "COMPLETED", correlationId: "tx-1122-bb", details: "Transfer to 123456" },
                    { id: 3, timestamp: new Date().toISOString(), userId: "sys", action: "BLOCK", status: "TRIGGERED", correlationId: "tx-4433-cc", details: "Account 9988 blocked due to risk" },
                ]);
            } finally {
                setLoading(false);
            }
        };
        fetchLogs();
    }, []);

    const getActionColor = (act: string) => {
        switch (act) {
            case 'TRANSFER': return 'primary';
            case 'BLOCK': return 'error';
            case 'LOGIN': return 'success';
            default: return 'default';
        }
    };

    return (
        <Box p={3}>
            <Box display="flex" alignItems="center" gap={2} mb={4}>
                <Terminal color="action" sx={{ fontSize: 40 }} />
                <Box>
                    <Typography variant="h4" fontWeight="bold">Audit Center</Typography>
                    <Typography variant="body2" color="textSecondary">Immutable forensic logs for compliance and security oversight</Typography>
                </Box>
            </Box>

            {/* Filters */}
            <Paper sx={{ p: 2, mb: 4, borderRadius: 3 }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={4}>
                        <TextField
                            fullWidth size="small" label="Search User ID"
                            value={userId} onChange={(e) => setUserId(e.target.value)}
                        />
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <TextField
                            fullWidth size="small" label="Action Type (e.g. TRANSFER)"
                            value={action} onChange={(e) => setAction(e.target.value)}
                        />
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Button variant="outlined" startIcon={<FilterList />} fullWidth>Apply Filters</Button>
                    </Grid>
                </Grid>
            </Paper>

            {error && <Alert severity="info" sx={{ mb: 3 }}>{error}</Alert>}

            <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: 3 }}>
                <Table size="small">
                    <TableHead sx={{ bgcolor: '#263238' }}>
                        <TableRow>
                            <TableCell sx={{ color: 'white' }}><strong>Timestamp</strong></TableCell>
                            <TableCell sx={{ color: 'white' }}><strong>User</strong></TableCell>
                            <TableCell sx={{ color: 'white' }}><strong>Action</strong></TableCell>
                            <TableCell sx={{ color: 'white' }}><strong>Status</strong></TableCell>
                            <TableCell sx={{ color: 'white' }}><strong>Correlation ID</strong></TableCell>
                            <TableCell sx={{ color: 'white' }} align="center"><strong>Details</strong></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {logs.map((log) => (
                            <TableRow key={log.id} hover>
                                <TableCell>{new Date(log.timestamp).toLocaleString()}</TableCell>
                                <TableCell><Typography variant="body2" fontWeight="bold">{log.userId}</Typography></TableCell>
                                <TableCell>
                                    <Chip label={log.action} size="small" color={getActionColor(log.action) as any} />
                                </TableCell>
                                <TableCell>{log.status}</TableCell>
                                <TableCell><Typography variant="caption" fontFamily="monospace">{log.correlationId}</Typography></TableCell>
                                <TableCell align="center">
                                    <Tooltip title={log.details || "No extra data"}>
                                        <IconButton size="small"><InfoOutlined fontSize="small" /></IconButton>
                                    </Tooltip>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
};

export default AuditCenter;
