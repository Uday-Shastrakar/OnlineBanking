import React from 'react';
import {
    Box,
    CircularProgress,
    Typography,
    Backdrop,
    Fade
} from '@mui/material';

interface LoadingSpinnerProps {
    size?: number;
    message?: string;
    fullScreen?: boolean;
    overlay?: boolean;
}

/**
 * Consistent loading indicator component
 * Banking-grade loading states with proper accessibility
 */
const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
    size = 40,
    message,
    fullScreen = false,
    overlay = false
}) => {
    const content = (
        <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            gap={2}
        >
            <CircularProgress
                size={size}
                thickness={4}
                sx={{
                    color: '#1a237e',
                    '& .MuiCircularProgress-circle': {
                        strokeLinecap: 'round'
                    }
                }}
            />
            {message && (
                <Typography
                    variant="body2"
                    color="textSecondary"
                    align="center"
                    sx={{ maxWidth: 200 }}
                >
                    {message}
                </Typography>
            )}
        </Box>
    );

    if (fullScreen) {
        return (
            <Backdrop
                open={true}
                sx={{
                    color: '#fff',
                    zIndex: (theme) => theme.zIndex.drawer + 1,
                    backgroundColor: 'rgba(26, 35, 126, 0.1)'
                }}
            >
                {content}
            </Backdrop>
        );
    }

    if (overlay) {
        return (
            <Fade in={true}>
                <Box
                    sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: 'rgba(255, 255, 255, 0.8)',
                        zIndex: 1000
                    }}
                >
                    {content}
                </Box>
            </Fade>
        );
    }

    return content;
};

export default LoadingSpinner;
