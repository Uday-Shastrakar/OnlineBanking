import React, { useEffect, useState } from 'react';
import {
    Box, Typography, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Paper,
    Chip, TextField, Grid, Button, CircularProgress,
    Alert, Tooltip, IconButton, Pagination
} from '@mui/material';
import {
    FilterList, History, InfoOutlined,
    Search, Terminal, AssignmentTurnedIn
} from '@mui/icons-material';
import { auditService } from '../../services/api/auditService';
import { AuditEvent } from '../../services/api/auditService';
import { BankAccount } from '../../types/banking';

/**
 * AuditCenter Component
 * Forensic log viewer for security administrators.
 * Provides immutable visibility into all system-wide activities.
 * Uses the new audit API with proper gateway security.
 */
const AuditCenter: React.FC = () => {
    const [logs, setLogs] = useState<AuditEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [metrics, setMetrics] = useState<any>(null);

    // Filter states
    const [userId, setUserId] = useState('');
    const [domain, setDomain] = useState('');
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    useEffect(() => {
        const fetchLogs = async () => {
            setLoading(true);
            try {
                const response = await auditService.getAllAuditEvents({
                    page,
                    size: 50,
                    userId: userId || undefined,
                    domain: domain || undefined
                });
                setLogs(response.content);
                setTotalPages(response.totalPages);
            } catch (err: any) {
                if (err.response?.status === 403) {
                    setError("Access denied. You don't have permission to view audit logs.");
                } else {
                    setError("Audit logs could not be retrieved. Ensure Audit-Service is reachable.");
                }
                // Service will return mock data automatically on error
            } finally {
                setLoading(false);
            }
        };
        fetchLogs();
    }, [page, userId, domain]);

    useEffect(() => {
        const fetchMetrics = async () => {
            try {
                const response = await auditService.getSystemMetrics();
                setMetrics(response);
            } catch (err: any) {
                console.error('Failed to fetch metrics:', err);
            }
        };
        fetchMetrics();
    }, []);

    const getActionColor = (act: string) => {
        switch (act) {
            case 'TRANSFER_INITIATED':
            case 'TRANSFER_COMPLETED': 
            case 'TRANSFER': return 'primary';
            case 'ACCOUNT_BLOCKED':
            case 'BLOCK': return 'error';
            case 'LOGIN_SUCCESS':
            case 'LOGIN': return 'success';
            case 'TRANSFER_FAILED': return 'warning';
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
                            fullWidth size="small" label="Domain (e.g. TRANSACTION)"
                            value={domain} onChange={(e) => setDomain(e.target.value)}
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
                            <TableCell sx={{ color: 'white' }}><strong>Event ID</strong></TableCell>
                            <TableCell sx={{ color: 'white' }} align="center"><strong>Details</strong></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {logs && logs.length > 0 ? (
                            logs.map((log) => (
                                <TableRow key={log.id} hover>
                                    <TableCell>{new Date(log.eventTimestamp || log.timestamp || new Date()).toLocaleString()}</TableCell>
                                    <TableCell><Typography variant="body2" fontWeight="bold">{log.userId}</Typography></TableCell>
                                    <TableCell>
                                        <Chip label={log.action} size="small" color={getActionColor(log.action) as any} />
                                    </TableCell>
                                    <TableCell>{log.status || 'N/A'}</TableCell>
                                    <TableCell><Typography variant="caption" fontFamily="monospace">{log.eventId}</Typography></TableCell>
                                    <TableCell align="center">
                                        <Tooltip title={log.details ? JSON.stringify(log.details) : "No extra data"}>
                                            <IconButton size="small"><InfoOutlined fontSize="small" /></IconButton>
                                        </Tooltip>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                                    <Typography variant="body2" color="textSecondary">
                                        {loading ? 'Loading audit logs...' : 'No audit logs found'}
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
};

export default AuditCenter;
