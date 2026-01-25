import React, { useEffect, useState } from 'react';
import {
    Box, Typography, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Paper,
    Chip, Button, IconButton, TextField, InputAdornment,
    CircularProgress, Alert, Tooltip
} from '@mui/material';
import { Search, LockOpen, Lock, PersonSearch, Block } from '@mui/icons-material';
import api from '../../services/api';
import { UserSummary } from '../../types/banking';

/**
 * UserManagement Component
 * Allows administrators to oversee all user profiles.
 * Provides controls for locking/unlocking accounts based on security audits.
 */
const UserManagement: React.FC = () => {
    const [users, setUsers] = useState<UserSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await api.get('/users/get'); // Existing Authentication-Service endpoint
                setUsers(response.data.data || []);
            } catch (err: any) {
                setError("Failed to fetch user directory.");
            } finally {
                setLoading(false);
            }
        };
        fetchUsers();
    }, []);

    const handleToggleLock = async (userId: number, currentStatus: string) => {
        // Note: This would call an endpoint in Auth-Service to toggle status
        console.log(`Toggling lock for user ${userId}. Current: ${currentStatus}`);
        // Optimistic update for UI demo
        setUsers(users.map(u => u.userId === userId ? { ...u, status: currentStatus === 'ACTIVE' ? 'LOCKED' : 'ACTIVE' } : u));
    };

    const filteredUsers = users.filter(u =>
        u.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <Box display="flex" justifyContent="center" mt={4}><CircularProgress /></Box>;

    return (
        <Box p={3}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
                <Box>
                    <Typography variant="h4" fontWeight="bold">User Management</Typography>
                    <Typography variant="body2" color="textSecondary">Oversee and secure all customer and administrator profiles</Typography>
                </Box>
                <TextField
                    placeholder="Search by name or email..."
                    variant="outlined"
                    size="small"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    sx={{ width: 300 }}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <Search />
                            </InputAdornment>
                        ),
                    }}
                />
            </Box>

            {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

            <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: 2 }}>
                <Table>
                    <TableHead sx={{ bgcolor: '#f1f3f4' }}>
                        <TableRow>
                            <TableCell><strong>User ID</strong></TableCell>
                            <TableCell><strong>Username</strong></TableCell>
                            <TableCell><strong>Email</strong></TableCell>
                            <TableCell><strong>Role</strong></TableCell>
                            <TableCell align="center"><strong>Status</strong></TableCell>
                            <TableCell align="center"><strong>Security Actions</strong></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredUsers.map((user) => (
                            <TableRow key={user.userId} hover>
                                <TableCell>{user.userId}</TableCell>
                                <TableCell sx={{ fontWeight: 'medium' }}>{user.userName}</TableCell>
                                <TableCell>{user.email}</TableCell>
                                <TableCell>
                                    <Chip
                                        label={user.role}
                                        size="small"
                                        variant="outlined"
                                        color={user.role === 'ADMIN' ? 'secondary' : 'default'}
                                    />
                                </TableCell>
                                <TableCell align="center">
                                    <Chip
                                        label={user.status}
                                        size="small"
                                        color={user.status === 'ACTIVE' ? 'success' : 'error'}
                                    />
                                </TableCell>
                                <TableCell align="center">
                                    <Tooltip title={user.status === 'ACTIVE' ? "Lock User Account" : "Unlock User Account"}>
                                        <Button
                                            variant="contained"
                                            size="small"
                                            color={user.status === 'ACTIVE' ? 'error' : 'success'}
                                            onClick={() => handleToggleLock(user.userId, user.status)}
                                            startIcon={user.status === 'ACTIVE' ? <Lock /> : <LockOpen />}
                                        >
                                            {user.status === 'ACTIVE' ? 'LOCK' : 'UNLOCK'}
                                        </Button>
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

export default UserManagement;
