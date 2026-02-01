import React from 'react';
import { Box, Typography, Button, Container, Paper } from '@mui/material';
import { Block as BlockIcon, Home as HomeIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const Unauthorized: React.FC = () => {
    const navigate = useNavigate();

    const handleGoHome = () => {
        navigate('/dashboard');
    };

    const handleGoLogin = () => {
        navigate('/login');
    };

    return (
        <Container maxWidth="sm">
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '80vh',
                    textAlign: 'center'
                }}
            >
                <Paper
                    elevation={3}
                    sx={{
                        p: 4,
                        borderRadius: 2,
                        textAlign: 'center',
                        maxWidth: 500
                    }}
                >
                    <BlockIcon
                        sx={{
                            fontSize: 64,
                            color: '#f44336',
                            mb: 2
                        }}
                    />
                    
                    <Typography variant="h4" gutterBottom color="error">
                        Access Denied
                    </Typography>
                    
                    <Typography variant="body1" color="textSecondary" paragraph>
                        You don't have permission to access this page. Please contact your administrator if you believe this is an error.
                    </Typography>
                    
                    <Typography variant="body2" color="textSecondary" paragraph>
                        This area requires special privileges. Please log in with appropriate credentials or return to your dashboard.
                    </Typography>
                    
                    <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'center' }}>
                        <Button
                            variant="contained"
                            startIcon={<HomeIcon />}
                            onClick={handleGoHome}
                            sx={{ minWidth: 120 }}
                        >
                            Dashboard
                        </Button>
                        
                        <Button
                            variant="outlined"
                            onClick={handleGoLogin}
                            sx={{ minWidth: 120 }}
                        >
                            Login
                        </Button>
                    </Box>
                </Paper>
            </Box>
        </Container>
    );
};

export default Unauthorized;
