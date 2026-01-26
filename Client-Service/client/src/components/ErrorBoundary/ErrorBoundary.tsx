import React, { Component, ErrorInfo, ReactNode } from 'react';
import {
    Box,
    Typography,
    Button,
    Paper,
    Alert,
    AlertTitle,
    Collapse
} from '@mui/material';
import { Refresh, Home, BugReport } from '@mui/icons-material';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
    errorId: string;
}

/**
 * React Error Boundary Component
 * Catches JavaScript errors in child components and displays a fallback UI
 * Banking-grade error handling with detailed error reporting
 */
class ErrorBoundary extends Component<Props, State> {
    private retryCount = 0;
    private maxRetries = 3;

    constructor(props: Props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
            errorId: this.generateErrorId()
        };
    }

    static getDerivedStateFromError(error: Error): Partial<State> {
        return {
            hasError: true,
            error,
            errorId: ErrorBoundary.prototype.generateErrorId()
        };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        this.setState({
            error,
            errorInfo
        });

        // Log error to console in development
        if (process.env.NODE_ENV === 'development') {
            console.error('Error Boundary caught an error:', error, errorInfo);
        }

        // In production, send error to logging service
        this.logErrorToService(error, errorInfo);
    }

    private generateErrorId = (): string => {
        return `ERR-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    };

    private logErrorToService = (error: Error, errorInfo: ErrorInfo) => {
        // In a real banking application, this would send to a centralized logging service
        const errorData = {
            errorId: this.state.errorId,
            message: error.message,
            stack: error.stack,
            componentStack: errorInfo.componentStack,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            url: window.location.href
        };

        // Send to logging service (implementation depends on your logging infrastructure)
        console.error('Error logged:', errorData);
    };

    private handleRetry = () => {
        if (this.retryCount < this.maxRetries) {
            this.retryCount++;
            this.setState({
                hasError: false,
                error: null,
                errorInfo: null
            });
        }
    };

    private handleGoHome = () => {
        window.location.href = '/dashboard';
    };

    private handleRefresh = () => {
        window.location.reload();
    };

    private handleReportBug = () => {
        const { error, errorInfo, errorId } = this.state;
        const bugReport = `
Error ID: ${errorId}
Error: ${error?.message}
Stack Trace: ${error?.stack}
Component Stack: ${errorInfo?.componentStack}
Timestamp: ${new Date().toISOString()}
        `.trim();

        // Copy to clipboard
        navigator.clipboard.writeText(bugReport).then(() => {
            alert('Bug report copied to clipboard. Please send this to the support team.');
        });
    };

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        minHeight: '100vh',
                        bgcolor: '#f5f5f5',
                        p: 3
                    }}
                >
                    <Paper
                        elevation={3}
                        sx={{
                            p: 4,
                            maxWidth: 600,
                            width: '100%'
                        }}
                    >
                        <Alert severity="error" sx={{ mb: 3 }}>
                            <AlertTitle>Application Error</AlertTitle>
                            An unexpected error occurred. Our team has been notified.
                        </Alert>

                        <Typography variant="h6" sx={{ mb: 2, color: '#1a237e' }}>
                            Something went wrong
                        </Typography>

                        <Typography variant="body2" sx={{ mb: 3, color: '#666' }}>
                            Error ID: <strong>{this.state.errorId}</strong>
                        </Typography>

                        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                            {this.retryCount < this.maxRetries && (
                                <Button
                                    variant="contained"
                                    startIcon={<Refresh />}
                                    onClick={this.handleRetry}
                                    sx={{ bgcolor: '#1a237e' }}
                                >
                                    Try Again ({this.maxRetries - this.retryCount} attempts left)
                                </Button>
                            )}

                            <Button
                                variant="outlined"
                                startIcon={<Home />}
                                onClick={this.handleGoHome}
                                sx={{ borderColor: '#1a237e', color: '#1a237e' }}
                            >
                                Go to Dashboard
                            </Button>

                            <Button
                                variant="outlined"
                                startIcon={<Refresh />}
                                onClick={this.handleRefresh}
                                sx={{ borderColor: '#1a237e', color: '#1a237e' }}
                            >
                                Refresh Page
                            </Button>

                            <Button
                                variant="text"
                                startIcon={<BugReport />}
                                onClick={this.handleReportBug}
                                sx={{ color: '#c62828' }}
                            >
                                Report Bug
                            </Button>
                        </Box>

                        {process.env.NODE_ENV === 'development' && (
                            <Collapse in={true} sx={{ mt: 3 }}>
                                <Box sx={{ mt: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                                    <Typography variant="subtitle2" sx={{ mb: 1 }}>
                                        Development Details:
                                    </Typography>
                                    <Typography variant="body2" component="pre" sx={{ fontSize: '12px' }}>
                                        {this.state.error?.message}
                                        {this.state.error?.stack}
                                    </Typography>
                                </Box>
                            </Collapse>
                        )}
                    </Paper>
                </Box>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
