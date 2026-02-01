import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Card, CardContent, Grid, Button, Chip, CircularProgress,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, FormControl,
  InputLabel, Select, MenuItem, Switch, FormControlLabel, Alert, IconButton,
  Tooltip, Divider, LinearProgress
} from '@mui/material';
import {
  CreditCard, Block, LockOpen, Settings, VisibilityOff, Visibility,
  Refresh, Download, History, TrendingUp, Warning
} from '@mui/icons-material';
import { BankCard, CardRequest, CardSettings } from '../../services/cardService';
import cardService from '../../services/cardService';

const CardManagement: React.FC = () => {
  const [cards, setCards] = useState<BankCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCard, setSelectedCard] = useState<BankCard | null>(null);
  const [showRequestDialog, setShowRequestDialog] = useState(false);
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  const [showPinDialog, setShowPinDialog] = useState(false);
  const [showCVV, setShowCVV] = useState<{ [key: string]: boolean }>({});

  // New card request form state
  const [cardRequest, setCardRequest] = useState<CardRequest>({
    accountId: 0,
    cardType: 'DEBIT',
    cardBrand: 'VISA',
    cardHolderName: '',
    dailyLimit: 50000,
    monthlyLimit: 500000,
    internationalUsage: false,
    onlineUsage: true,
    contactless: true
  });

  // Card settings state
  const [cardSettings, setCardSettings] = useState<CardSettings>({
    cardId: '',
    dailyLimit: 0,
    monthlyLimit: 0,
    internationalUsage: false,
    onlineUsage: true,
    contactless: true,
    notificationSettings: {
      transactionAlerts: true,
      dailyLimitAlerts: true,
      monthlyLimitAlerts: true,
      internationalUsageAlerts: true
    }
  });

  // PIN change state
  const [pinData, setPinData] = useState({
    currentPin: '',
    newPin: '',
    confirmPin: ''
  });

  useEffect(() => {
    fetchCards();
  }, []);

  const fetchCards = async () => {
    try {
      const userDetails = JSON.parse(localStorage.getItem('userDetails') || '{}');
      const userId = userDetails?.userId;

      if (userId) {
        const userCards = await cardService.getUserCards(userId);
        setCards(userCards);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch cards');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestCard = async () => {
    try {
      const userDetails = JSON.parse(localStorage.getItem('userDetails') || '{}');
      const userId = userDetails?.userId;

      if (userId) {
        await cardService.requestNewCard(cardRequest);
        setShowRequestDialog(false);
        fetchCards(); // Refresh cards list
      }
    } catch (err: any) {
      setError(err.message || 'Failed to request card');
    }
  };

  const handleBlockCard = async (cardId: string) => {
    try {
      await cardService.blockCard(cardId, 'User requested block');
      fetchCards();
    } catch (err: any) {
      setError(err.message || 'Failed to block card');
    }
  };

  const handleUnblockCard = async (cardId: string) => {
    try {
      await cardService.unblockCard(cardId);
      fetchCards();
    } catch (err: any) {
      setError(err.message || 'Failed to unblock card');
    }
  };

  const handleUpdateSettings = async () => {
    try {
      await cardService.updateCardSettings(cardSettings.cardId, cardSettings);
      setShowSettingsDialog(false);
      fetchCards();
    } catch (err: any) {
      setError(err.message || 'Failed to update settings');
    }
  };

  const handleChangePIN = async () => {
    if (pinData.newPin !== pinData.confirmPin) {
      setError('PINs do not match');
      return;
    }

    try {
      await cardService.changeCardPIN(
        selectedCard?.cardId || '',
        pinData.currentPin,
        pinData.newPin,
        pinData.confirmPin
      );
      setShowPinDialog(false);
      setPinData({ currentPin: '', newPin: '', confirmPin: '' });
    } catch (err: any) {
      setError(err.message || 'Failed to change PIN');
    }
  };

  const maskCardNumber = (cardNumber: string | number) => {
    const strNum = cardNumber.toString();
    return `**** **** **** ${strNum.slice(-4)}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'success';
      case 'BLOCKED': return 'error';
      case 'EXPIRED': return 'warning';
      default: return 'default';
    }
  };

  const getCardIcon = (brand: string) => {
    switch (brand) {
      case 'VISA': return '💳';
      case 'MASTERCARD': return '💳';
      case 'RUPAY': return '💳';
      default: return '💳';
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
      <Typography variant="h4" fontWeight="bold" color="primary" gutterBottom>
        Card Management
      </Typography>
      <Typography variant="body1" color="textSecondary" mb={4}>
        Manage your banking cards, set limits, and control usage preferences
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {/* Request New Card Button */}
      <Box mb={4}>
        <Button
          variant="contained"
          startIcon={<CreditCard />}
          onClick={() => setShowRequestDialog(true)}
          sx={{ mr: 2 }}
        >
          Request New Card
        </Button>
        <Button
          variant="outlined"
          startIcon={<Refresh />}
          onClick={fetchCards}
        >
          Refresh
        </Button>
      </Box>

      {/* Cards Grid */}
      <Grid container spacing={3}>
        {cards.map((card) => (
          <Grid item xs={12} md={6} lg={4} key={card.cardId}>
            <Card sx={{
              borderRadius: 3,
              boxShadow: 3,
              position: 'relative',
              overflow: 'hidden',
              background: card.status === 'ACTIVE'
                ? 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)'
                : 'linear-gradient(135deg, #6b7280 0%, #9ca3af 100%)',
              color: 'white'
            }}>
              <CardContent sx={{ position: 'relative', zIndex: 1 }}>
                {/* Card Header */}
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                  <Typography variant="h6" sx={{ fontSize: '1.2rem' }}>
                    {getCardIcon(card.cardBrand)} {card.cardBrand}
                  </Typography>
                  <Chip
                    label={card.status}
                    color={getStatusColor(card.status)}
                    size="small"
                    sx={{
                      backgroundColor: 'rgba(255,255,255,0.2)',
                      color: 'white',
                      fontWeight: 600
                    }}
                  />
                </Box>

                {/* Card Number */}
                <Typography variant="h5" sx={{ fontFamily: 'monospace', mb: 2 }}>
                  {maskCardNumber(card.cardNumber)}
                </Typography>

                {/* Card Details */}
                <Box mb={2}>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    {card.cardHolderName}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Valid Thru: {card.expiryDate}
                  </Typography>
                </Box>

                {/* Card Type */}
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    {card.cardType} CARD
                  </Typography>
                  <Box>
                    <IconButton
                      size="small"
                      onClick={() => setShowCVV({ ...showCVV, [card.cardId]: !showCVV[card.cardId] })}
                      sx={{ color: 'white' }}
                    >
                      {showCVV[card.cardId] ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                    {showCVV[card.cardId] && (
                      <Typography variant="body2" sx={{ ml: 1, fontFamily: 'monospace' }}>
                        CVV: {card.cvv}
                      </Typography>
                    )}
                  </Box>
                </Box>

                {/* Card Actions */}
                <Box display="flex" gap={1}>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<Settings />}
                    onClick={() => {
                      setSelectedCard(card);
                      setCardSettings({
                        cardId: card.cardId,
                        dailyLimit: card.dailyLimit,
                        monthlyLimit: card.monthlyLimit,
                        internationalUsage: card.internationalUsage,
                        onlineUsage: card.onlineUsage,
                        contactless: card.contactless,
                        notificationSettings: {
                          transactionAlerts: true,
                          dailyLimitAlerts: true,
                          monthlyLimitAlerts: true,
                          internationalUsageAlerts: true
                        }
                      });
                      setShowSettingsDialog(true);
                    }}
                    sx={{ color: 'white', borderColor: 'white' }}
                  >
                    Settings
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<LockOpen />}
                    onClick={() => setShowPinDialog(true)}
                    sx={{ color: 'white', borderColor: 'white' }}
                  >
                    PIN
                  </Button>
                  {card.status === 'ACTIVE' ? (
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<Block />}
                      onClick={() => handleBlockCard(card.cardId)}
                      sx={{ color: 'white', borderColor: 'white' }}
                    >
                      Block
                    </Button>
                  ) : (
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<LockOpen />}
                      onClick={() => handleUnblockCard(card.cardId)}
                      sx={{ color: 'white', borderColor: 'white' }}
                    >
                      Unblock
                    </Button>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Request New Card Dialog */}
      <Dialog open={showRequestDialog} onClose={() => setShowRequestDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Request New Card</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Card Type</InputLabel>
                <Select
                  value={cardRequest.cardType}
                  onChange={(e) => setCardRequest({ ...cardRequest, cardType: e.target.value as 'DEBIT' | 'CREDIT' })}
                >
                  <MenuItem value="DEBIT">Debit Card</MenuItem>
                  <MenuItem value="CREDIT">Credit Card</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Card Brand</InputLabel>
                <Select
                  value={cardRequest.cardBrand}
                  onChange={(e) => setCardRequest({ ...cardRequest, cardBrand: e.target.value as 'VISA' | 'MASTERCARD' | 'RUPAY' })}
                >
                  <MenuItem value="VISA">Visa</MenuItem>
                  <MenuItem value="MASTERCARD">Mastercard</MenuItem>
                  <MenuItem value="RUPAY">RuPay</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Card Holder Name"
                value={cardRequest.cardHolderName}
                onChange={(e) => setCardRequest({ ...cardRequest, cardHolderName: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Daily Limit (₹)"
                type="number"
                value={cardRequest.dailyLimit}
                onChange={(e) => setCardRequest({ ...cardRequest, dailyLimit: Number(e.target.value) })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Monthly Limit (₹)"
                type="number"
                value={cardRequest.monthlyLimit}
                onChange={(e) => setCardRequest({ ...cardRequest, monthlyLimit: Number(e.target.value) })}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={cardRequest.internationalUsage}
                    onChange={(e) => setCardRequest({ ...cardRequest, internationalUsage: e.target.checked })}
                  />
                }
                label="International Usage"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={cardRequest.onlineUsage}
                    onChange={(e) => setCardRequest({ ...cardRequest, onlineUsage: e.target.checked })}
                  />
                }
                label="Online Usage"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={cardRequest.contactless}
                    onChange={(e) => setCardRequest({ ...cardRequest, contactless: e.target.checked })}
                  />
                }
                label="Contactless Payments"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowRequestDialog(false)}>Cancel</Button>
          <Button onClick={handleRequestCard} variant="contained">Request Card</Button>
        </DialogActions>
      </Dialog>

      {/* Card Settings Dialog */}
      <Dialog open={showSettingsDialog} onClose={() => setShowSettingsDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Card Settings</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Daily Limit (₹)"
                type="number"
                value={cardSettings.dailyLimit}
                onChange={(e) => setCardSettings({ ...cardSettings, dailyLimit: Number(e.target.value) })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Monthly Limit (₹)"
                type="number"
                value={cardSettings.monthlyLimit}
                onChange={(e) => setCardSettings({ ...cardSettings, monthlyLimit: Number(e.target.value) })}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={cardSettings.internationalUsage}
                    onChange={(e) => setCardSettings({ ...cardSettings, internationalUsage: e.target.checked })}
                  />
                }
                label="International Usage"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={cardSettings.onlineUsage}
                    onChange={(e) => setCardSettings({ ...cardSettings, onlineUsage: e.target.checked })}
                  />
                }
                label="Online Usage"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={cardSettings.contactless}
                    onChange={(e) => setCardSettings({ ...cardSettings, contactless: e.target.checked })}
                  />
                }
                label="Contactless Payments"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowSettingsDialog(false)}>Cancel</Button>
          <Button onClick={handleUpdateSettings} variant="contained">Update Settings</Button>
        </DialogActions>
      </Dialog>

      {/* PIN Change Dialog */}
      <Dialog open={showPinDialog} onClose={() => setShowPinDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Change Card PIN</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Current PIN"
              type="password"
              value={pinData.currentPin}
              onChange={(e) => setPinData({ ...pinData, currentPin: e.target.value })}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="New PIN"
              type="password"
              value={pinData.newPin}
              onChange={(e) => setPinData({ ...pinData, newPin: e.target.value })}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Confirm New PIN"
              type="password"
              value={pinData.confirmPin}
              onChange={(e) => setPinData({ ...pinData, confirmPin: e.target.value })}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowPinDialog(false)}>Cancel</Button>
          <Button onClick={handleChangePIN} variant="contained">Change PIN</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CardManagement;
