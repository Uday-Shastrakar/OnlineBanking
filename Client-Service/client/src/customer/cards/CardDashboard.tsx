import React, { useState, useEffect } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Grid,
    Button,
    Chip,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    CircularProgress,
    Alert
} from '@mui/material';
import {
    CreditCard,
    Add as AddIcon,
    Block as BlockIcon,
    CheckCircle as ActivateIcon,
    Settings as SettingsIcon,
    Visibility
} from '@mui/icons-material';
import cardService, { BankCard } from '../../services/cardService';
import AuthStorage from '../../services/authStorage';
import { useNavigate } from 'react-router-dom';

const CardDashboard: React.FC = () => {
    const [cards, setCards] = useState<BankCard[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();
    const userId = AuthStorage.getUser()?.userId;

    useEffect(() => {
        if (userId) {
            fetchCards();
        }
    }, [userId]);

    const fetchCards = async () => {
        try {
            setLoading(true);
            const data = await cardService.getUserCards(userId!);
            setCards(data);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch cards');
        } finally {
            setLoading(false);
        }
    };

    const handleBlockCard = async (cardId: string) => {
        if (window.confirm('Are you sure you want to block this card?')) {
            try {
                await cardService.blockCard(cardId, 'User requested block');
                fetchCards();
            } catch (err: any) {
                alert(err.message);
            }
        }
    };

    const handleUnblockCard = async (cardId: string) => {
        try {
            await cardService.unblockCard(cardId);
            fetchCards();
        } catch (err: any) {
            alert(err.message);
        }
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box p={3}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h4" component="h1" gutterBottom sx={{ color: '#1a237e', fontWeight: 'bold' }}>
                    My Cards
                </Typography>
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AddIcon />}
                    onClick={() => navigate('/cards/new')}
                >
                    Request New Card
                </Button>
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                </Alert>
            )}

            <Grid container spacing={3}>
                {cards.map((card) => (
                    <Grid item xs={12} md={6} lg={4} key={card.cardId}>
                        <Card sx={{
                            background: 'linear-gradient(135deg, #1a237e 0%, #0d47a1 100%)',
                            color: 'white',
                            borderRadius: '16px',
                            position: 'relative',
                            overflow: 'hidden',
                            minHeight: '220px'
                        }}>
                            <Box sx={{
                                position: 'absolute',
                                top: '-20px',
                                right: '-20px',
                                width: '150px',
                                height: '150px',
                                background: 'rgba(255,255,255,0.1)',
                                borderRadius: '50%',
                            }} />

                            <CardContent>
                                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                                    <Chip
                                        label={card.cardType}
                                        size="small"
                                        sx={{ bg: 'rgba(255,255,255,0.2)', color: 'white' }}
                                    />
                                    <CreditCard sx={{ fontSize: 40, opacity: 0.8 }} />
                                </Box>

                                <Typography variant="h5" sx={{ letterSpacing: '2px', my: 3, fontFamily: 'monospace' }}>
                                    {card.cardNumber.replace(/(\d{4})/g, '$1 ').trim()}
                                </Typography>

                                <Box display="flex" justifyContent="space-between" alignItems="flex-end">
                                    <Box>
                                        <Typography variant="caption" sx={{ opacity: 0.7 }}>Card Holder</Typography>
                                        <Typography variant="subtitle1">{card.cardHolderName}</Typography>
                                    </Box>
                                    <Box>
                                        <Typography variant="caption" sx={{ opacity: 0.7 }}>Expires</Typography>
                                        <Typography variant="subtitle1">{card.expiryDate}</Typography>
                                    </Box>
                                </Box>

                                <Box sx={{
                                    mt: 2,
                                    pt: 2,
                                    borderTop: '1px solid rgba(255,255,255,0.2)',
                                    display: 'flex',
                                    justifyContent: 'space-between'
                                }}>
                                    <Chip
                                        label={card.status}
                                        color={card.status === 'ACTIVE' ? 'success' : 'error'}
                                        size="small"
                                    />
                                    <Box>
                                        <IconButton size="small" sx={{ color: 'white' }} onClick={() => navigate(`/cards/${card.cardId}`)}>
                                            <SettingsIcon />
                                        </IconButton>
                                        {card.status === 'ACTIVE' ? (
                                            <IconButton size="small" sx={{ color: '#ffcdd2' }} onClick={() => handleBlockCard(card.cardId)}>
                                                <BlockIcon />
                                            </IconButton>
                                        ) : (
                                            <IconButton size="small" sx={{ color: '#c8e6c9' }} onClick={() => handleUnblockCard(card.cardId)}>
                                                <ActivateIcon />
                                            </IconButton>
                                        )}
                                    </Box>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
};

export default CardDashboard;
