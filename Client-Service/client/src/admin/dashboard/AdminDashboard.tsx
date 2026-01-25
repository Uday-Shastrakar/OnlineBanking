import React, { useEffect, useState } from 'react';
import {
    Box, Typography, Grid, Paper, Card,
    CardContent, CircularProgress, Alert, Divider
} from '@mui/material';
import {
    PeopleAlt, AccountBalance, ReceiptLong,
    ErrorOutline, TrendingUp, Security
} from '@mui/icons-material';
import api from '../../services/api';
import { AdminMetrics } from '../../types/banking';

/**
 * AdminDashboard Component
 * Provides a high-level system overview for administrators.
 * Displays metrics fetched from aggregated service endpoints.
 */
const AdminDashboard: React.FC = () => {
    const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchMetrics = async () => {
            try {
                // Note: Using a projected endpoint in Audit-Service for global metrics
                const response = await api.get('/audit/metrics');
                setMetrics(response.data);
            } catch (err: any) {
                // Fallback or error handled gracefully
                setError("Metrics currently unavailable. Ensure Audit-Service is running.");
                // Mocking for UI demonstration if service is down
                setMetrics({
                    totalUsers: 154,
                    totalAccounts: 210,
                    totalTransactions: 1204,
                    failedTransactions: 12
                });
            } finally {
                setLoading(false);
            }
        };
        fetchMetrics();
    }, []);

    if (loading) return <Box display="flex" justifyContent="center" mt={4}><CircularProgress /></Box>;

    return (
        <Box p={3}>
            <Box display="flex" alignItems="center" gap={2} mb={4}>
                <Security color="primary" sx={{ fontSize: 40 }} />
                <Box>
                    <Typography variant="h4" fontWeight="bold">Admin Control Center</Typography>
                    <Typography variant="body2" color="textSecondary">Global system health and oversight dashboard</Typography>
                </Box>
            </Box>

            {error && <Alert severity="info" sx={{ mb: 4 }}>{error}</Alert>}

            <Grid container spacing={4}>
                <MetricCard title="Total Users" value={metrics?.totalUsers} icon={<PeopleAlt />} color="#1976d2" />
                <MetricCard title="Total Accounts" value={metrics?.totalAccounts} icon={<AccountBalance />} color="#2e7d32" />
                <MetricCard title="Total Transactions" value={metrics?.totalTransactions} icon={<ReceiptLong />} color="#6a1b9a" />
                <MetricCard title="System Alerts" value={metrics?.failedTransactions} icon={<ErrorOutline />} color="#c62828" />
            </Grid>

            <Box mt={6}>
                <Paper sx={{ p: 4, borderRadius: 4, bgcolor: '#f1f3f4', borderLeft: '10px solid #1a237e' }}>
                    <Typography variant="h6" gutterBottom fontWeight="bold">Administrator Notice</Typography>
                    <Divider sx={{ mb: 2 }} />
                    <Typography variant="body1">
                        Welcome to the Banking Control Center. Your access is strictly audited.
                        Use the sidebar to manage users, monitor forensic audit logs, and oversee global account statuses.
                    </Typography>
                </Paper>
            </Box>
        </Box>
    );
};

interface MetricCardProps {
    title: string;
    value?: number;
    icon: React.ReactNode;
    color: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, icon, color }) => (
    <Grid item xs={12} sm={6} md={3}>
        <Card sx={{
            borderRadius: 4,
            boxShadow: 4,
            transition: 'transform 0.2s',
            '&:hover': { transform: 'translateY(-5px)' }
        }}>
            <CardContent sx={{ textAlign: 'center' }}>
                <Box sx={{ color, fontSize: 50, mb: 1 }}>{icon}</Box>
                <Typography variant="h6" color="textSecondary">{title}</Typography>
                <Typography variant="h3" fontWeight="bold">{value?.toLocaleString() || '0'}</Typography>
            </CardContent>
        </Card>
    </Grid>
);

export default AdminDashboard;
