import React, { useState } from 'react';
import { Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Typography, Divider, IconButton, Toolbar } from '@mui/material';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
    Dashboard as DashboardIcon,
    People as PeopleIcon,
    Assessment as AssessmentIcon,
    Menu as MenuIcon,
    ChevronLeft as ChevronLeftIcon,
    ExitToApp as ExitToAppIcon,
    Security
} from '@mui/icons-material';

import AuthStorage from '../../services/authStorage';

const drawerWidth = 260;

interface AdminLayoutProps {
    children?: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
    const [open, setOpen] = useState(true);
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        AuthStorage.clearAuthData();
        navigate('/login');
    };

    const handleDrawerToggle = () => {
        setOpen(!open);
    };

    const menuItems: Array<{ text: string; icon: React.ReactNode; path?: string; action?: () => void }> = [
        { text: 'Dashboard', icon: <DashboardIcon />, path: '/admin/dashboard' },
        { text: 'User Management', icon: <PeopleIcon />, path: '/admin/users' },
        { text: 'Audit Center', icon: <AssessmentIcon />, path: '/admin/audit' },
        { text: 'Logout', icon: <ExitToAppIcon />, action: handleLogout },
    ];

    const isActive = (path: string) => location.pathname === path;

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh' }}>
            {/* Sidebar Drawer */}
            <Drawer
                variant="permanent"
                open={open}
                sx={{
                    width: open ? drawerWidth : 70,
                    flexShrink: 0,
                    '& .MuiDrawer-paper': {
                        width: open ? drawerWidth : 70,
                        boxSizing: 'border-box',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white',
                        transition: 'width 0.3s ease',
                        overflowX: 'hidden',
                        borderRight: 'none',
                        boxShadow: '4px 0 12px rgba(0,0,0,0.1)'
                    },
                }}
            >
                {/* Header */}
                <Toolbar sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2, py: 3 }}>
                    {open && (
                        <Box display="flex" alignItems="center" gap={1}>
                            <Security sx={{ fontSize: 32 }} />
                            <Typography variant="h6" fontWeight="bold">
                                Admin Panel
                            </Typography>
                        </Box>
                    )}
                    <IconButton onClick={handleDrawerToggle} sx={{ color: 'white' }}>
                        {open ? <ChevronLeftIcon /> : <MenuIcon />}
                    </IconButton>
                </Toolbar>

                <Divider sx={{ bgcolor: 'rgba(255,255,255,0.2)' }} />

                {/* Navigation Menu */}
                <List sx={{ px: 1, pt: 2 }}>
                    {menuItems.map((item) => (
                        <ListItem key={item.text} disablePadding sx={{ mb: 1 }}>
                            <ListItemButton
                                onClick={() => (item.action ? item.action() : item.path ? navigate(item.path) : undefined)}
                                sx={{
                                    borderRadius: 2,
                                    bgcolor: item.path && isActive(item.path) ? 'rgba(255,255,255,0.2)' : 'transparent',
                                    '&:hover': {
                                        bgcolor: 'rgba(255,255,255,0.15)',
                                    },
                                    transition: 'all 0.2s ease',
                                    py: 1.5,
                                }}
                            >
                                <ListItemIcon sx={{ color: 'white', minWidth: open ? 40 : 'auto' }}>
                                    {item.icon}
                                </ListItemIcon>
                                {open && (
                                    <ListItemText
                                        primary={item.text}
                                        primaryTypographyProps={{
                                            fontWeight: item.path && isActive(item.path) ? 'bold' : 'normal',
                                        }}
                                    />
                                )}
                            </ListItemButton>
                        </ListItem>
                    ))}
                </List>

                {/* Footer */}
                {open && (
                    <Box sx={{ mt: 'auto', p: 2, borderTop: '1px solid rgba(255,255,255,0.2)' }}>
                        <Typography variant="caption" sx={{ opacity: 0.8 }}>
                            Version 2.1.0
                        </Typography>
                        <Typography variant="caption" display="block" sx={{ opacity: 0.8 }}>
                            © 2026 NUMS Bank
                        </Typography>
                    </Box>
                )}
            </Drawer>

            {/* Main Content Area */}
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    bgcolor: '#f5f5f5',
                    transition: 'margin-left 0.3s ease',
                    minHeight: '100vh',
                    overflow: 'auto'
                }}
            >
                {children || <Outlet />}
            </Box>
        </Box>
    );
};

export default AdminLayout;
