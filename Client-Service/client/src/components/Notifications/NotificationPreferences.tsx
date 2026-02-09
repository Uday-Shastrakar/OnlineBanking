import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Switch,
  FormControlLabel,
  Divider,
  Button,
  Alert,
  Snackbar,
  Grid,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  ListItemIcon,
  Chip,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Settings,
  Email,
  Sms,
  NotificationsActive,
  Smartphone,
  AccountBalance,
  Security,
  Campaign,
  SystemUpdate,
  Person,
  Schedule,
  Save,
  Restore,
  Info
} from '@mui/icons-material';
import notificationService, { NotificationPreference, NotificationCategory } from '../../services/notificationService';

interface NotificationPreferencesProps {
  onBack?: () => void;
}

const NotificationPreferences: React.FC<NotificationPreferencesProps> = ({ onBack }) => {
  const [preferences, setPreferences] = useState<NotificationPreference | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success'
  });

  const userEmail = localStorage.getItem('userEmail') || '';

  useEffect(() => {
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    try {
      setLoading(true);
      setError(null);
      const prefs = await notificationService.getNotificationPreferences(userEmail);
      setPreferences(prefs);
    } catch (err) {
      setError('Failed to load notification preferences');
      console.error('Error fetching preferences:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!preferences) return;

    try {
      setSaving(true);
      setError(null);
      await notificationService.updateNotificationPreferences(preferences);
      showSnackbar('Preferences saved successfully', 'success');
    } catch (err) {
      setError('Failed to save preferences');
      showSnackbar('Failed to save preferences', 'error');
      console.error('Error saving preferences:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    try {
      setLoading(true);
      setError(null);
      await notificationService.deleteNotificationPreferences(userEmail);
      await fetchPreferences(); // This will create default preferences
      showSnackbar('Preferences reset to defaults', 'success');
    } catch (err) {
      setError('Failed to reset preferences');
      showSnackbar('Failed to reset preferences', 'error');
      console.error('Error resetting preferences:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChannelChange = (channel: keyof NotificationPreference, value: boolean) => {
    if (!preferences) return;
    setPreferences({ ...preferences, [channel]: value });
  };

  const handleCategoryChange = (category: string, value: boolean) => {
    if (!preferences) return;
    setPreferences({ ...preferences, [category]: value });
  };

  const handleFrequencyChange = (frequency: 'INSTANT' | 'DAILY' | 'WEEKLY') => {
    if (!preferences) return;
    setPreferences({ ...preferences, frequency });
  };

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'transactionAlerts':
        return <AccountBalance />;
      case 'securityAlerts':
        return <Security />;
      case 'marketingAlerts':
        return <Campaign />;
      case 'systemAlerts':
        return <SystemUpdate />;
      case 'accountAlerts':
        return <Person />;
      default:
        return <NotificationsActive />;
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'transactionAlerts':
        return 'Transaction Alerts';
      case 'securityAlerts':
        return 'Security Alerts';
      case 'marketingAlerts':
        return 'Marketing & Promotions';
      case 'systemAlerts':
        return 'System Updates';
      case 'accountAlerts':
        return 'Account Updates';
      default:
        return category;
    }
  };

  const getFrequencyLabel = (frequency: string) => {
    switch (frequency) {
      case 'INSTANT':
        return 'Instant';
      case 'DAILY':
        return 'Daily Digest';
      case 'WEEKLY':
        return 'Weekly Summary';
      default:
        return frequency;
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
        <Typography>Loading preferences...</Typography>
      </Box>
    );
  }

  if (!preferences) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
        <Typography>No preferences found</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', maxWidth: 800, mx: 'auto', p: 2 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" fontWeight="bold" display="flex" alignItems="center" gap={1}>
          <Settings />
          Notification Preferences
        </Typography>
        {onBack && (
          <Button onClick={onBack} variant="outlined">
            Back to Notifications
          </Button>
        )}
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Channel Preferences */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Notification Channels
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={2}>
                Choose how you want to receive notifications
              </Typography>

              <List dense>
                <ListItem>
                  <ListItemIcon>
                    <Email />
                  </ListItemIcon>
                  <ListItemText
                    primary="Email Notifications"
                    secondary="Receive notifications via email"
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      checked={preferences.emailEnabled}
                      onChange={(e) => handleChannelChange('emailEnabled', e.target.checked)}
                    />
                  </ListItemSecondaryAction>
                </ListItem>

                <ListItem>
                  <ListItemIcon>
                    <Sms />
                  </ListItemIcon>
                  <ListItemText
                    primary="SMS Notifications"
                    secondary="Receive important alerts via SMS"
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      checked={preferences.smsEnabled}
                      onChange={(e) => handleChannelChange('smsEnabled', e.target.checked)}
                    />
                  </ListItemSecondaryAction>
                </ListItem>

                <ListItem>
                  <ListItemIcon>
                    <NotificationsActive />
                  </ListItemIcon>
                  <ListItemText
                    primary="Push Notifications"
                    secondary="Receive notifications in your browser/app"
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      checked={preferences.pushEnabled}
                      onChange={(e) => handleChannelChange('pushEnabled', e.target.checked)}
                    />
                  </ListItemSecondaryAction>
                </ListItem>

                <ListItem>
                  <ListItemIcon>
                    <Smartphone />
                  </ListItemIcon>
                  <ListItemText
                    primary="In-App Notifications"
                    secondary="See notifications within the application"
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      checked={preferences.inAppEnabled}
                      onChange={(e) => handleChannelChange('inAppEnabled', e.target.checked)}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Category Preferences */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Notification Categories
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={2}>
                Choose which types of notifications you want to receive
              </Typography>

              <List dense>
                {[
                  { key: 'transactionAlerts', label: 'Transaction Alerts', description: 'Money transfers, payments, deposits' },
                  { key: 'securityAlerts', label: 'Security Alerts', description: 'Login attempts, password changes' },
                  { key: 'marketingAlerts', label: 'Marketing & Promotions', description: 'Special offers, new features' },
                  { key: 'systemAlerts', label: 'System Updates', description: 'Maintenance, downtime, updates' },
                  { key: 'accountAlerts', label: 'Account Updates', description: 'Profile changes, account status' }
                ].map((category) => (
                  <ListItem key={category.key}>
                    <ListItemIcon>
                      {getCategoryIcon(category.key)}
                    </ListItemIcon>
                    <ListItemText
                      primary={category.label}
                      secondary={category.description}
                    />
                    <ListItemSecondaryAction>
                      <Switch
                        checked={preferences[category.key as keyof NotificationPreference] as boolean}
                        onChange={(e) => handleCategoryChange(category.key, e.target.checked)}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Frequency Settings */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Delivery Frequency
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={2}>
                How often you want to receive non-urgent notifications
              </Typography>

              <Box display="flex" gap={2} flexWrap="wrap">
                {(['INSTANT', 'DAILY', 'WEEKLY'] as const).map((freq) => (
                  <Chip
                    key={freq}
                    label={getFrequencyLabel(freq)}
                    clickable
                    color={preferences.frequency === freq ? 'primary' : 'default'}
                    variant={preferences.frequency === freq ? 'filled' : 'outlined'}
                    onClick={() => handleFrequencyChange(freq)}
                    icon={<Schedule />}
                  />
                ))}
              </Box>

              <Box mt={2}>
                <Typography variant="body2" color="text.secondary">
                  <Tooltip title="Security and urgent notifications will always be sent instantly regardless of this setting">
                    <IconButton size="small">
                      <Info fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  Note: Security and urgent notifications are always sent instantly
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Summary */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
            <Typography variant="h6" gutterBottom>
              Current Settings Summary
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6} sm={4} md={2}>
                <Typography variant="body2" color="text.secondary">
                  Email
                </Typography>
                <Chip
                  label={preferences.emailEnabled ? 'Enabled' : 'Disabled'}
                  color={preferences.emailEnabled ? 'success' : 'default'}
                  size="small"
                />
              </Grid>
              <Grid item xs={6} sm={4} md={2}>
                <Typography variant="body2" color="text.secondary">
                  SMS
                </Typography>
                <Chip
                  label={preferences.smsEnabled ? 'Enabled' : 'Disabled'}
                  color={preferences.smsEnabled ? 'success' : 'default'}
                  size="small"
                />
              </Grid>
              <Grid item xs={6} sm={4} md={2}>
                <Typography variant="body2" color="text.secondary">
                  Push
                </Typography>
                <Chip
                  label={preferences.pushEnabled ? 'Enabled' : 'Disabled'}
                  color={preferences.pushEnabled ? 'success' : 'default'}
                  size="small"
                />
              </Grid>
              <Grid item xs={6} sm={4} md={2}>
                <Typography variant="body2" color="text.secondary">
                  In-App
                </Typography>
                <Chip
                  label={preferences.inAppEnabled ? 'Enabled' : 'Disabled'}
                  color={preferences.inAppEnabled ? 'success' : 'default'}
                  size="small"
                />
              </Grid>
              <Grid item xs={6} sm={4} md={2}>
                <Typography variant="body2" color="text.secondary">
                  Frequency
                </Typography>
                <Chip
                  label={getFrequencyLabel(preferences.frequency)}
                  color="primary"
                  size="small"
                />
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Actions */}
        <Grid item xs={12}>
          <Box display="flex" gap={2} justifyContent="flex-end">
            <Button
              variant="outlined"
              startIcon={<Restore />}
              onClick={handleReset}
              disabled={loading || saving}
            >
              Reset to Defaults
            </Button>
            <Button
              variant="contained"
              startIcon={<Save />}
              onClick={handleSave}
              disabled={loading || saving}
            >
              {saving ? 'Saving...' : 'Save Preferences'}
            </Button>
          </Box>
        </Grid>
      </Grid>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default NotificationPreferences;
