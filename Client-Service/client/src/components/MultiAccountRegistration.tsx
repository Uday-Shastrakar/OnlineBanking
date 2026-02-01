import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  Alert,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Paper
} from '@mui/material';
import { enhancedRegistrationService, AccountRequest, AccountType, createRegistrationRequest } from '../services/enhancedRegistrationService';

const MultiAccountRegistration: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [accountTypes, setAccountTypes] = useState<AccountType[]>([]);
  const [selectedAccounts, setSelectedAccounts] = useState<AccountRequest[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [isRegistering, setIsRegistering] = useState(false);

  // Form data
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    email: '',
    firstName: '',
    lastName: '',
    phoneNumber: '',
    gender: '',
    address: '',
    dateOfBirth: '',
  });

  useEffect(() => {
    // Load available account types
    enhancedRegistrationService.getAccountTypes()
      .then(setAccountTypes)
      .catch(console.error);
  }, []);

  const handleAddAccount = () => {
    const newAccount: AccountRequest = {
      accountType: 'SAVING',
      initialDeposit: 1000,
      accountStatus: 'ACTIVE'
    };
    
    const validation = enhancedRegistrationService.validateAccountRequest(newAccount, accountTypes);
    if (validation.isValid) {
      setSelectedAccounts([...selectedAccounts, newAccount]);
    } else {
      setErrors(validation.errors);
    }
  };

  const handleRemoveAccount = (index: number) => {
    setSelectedAccounts(selectedAccounts.filter((_, i) => i !== index));
  };

  const handleAccountChange = (index: number, field: keyof AccountRequest, value: any) => {
    const updatedAccounts = [...selectedAccounts];
    updatedAccounts[index] = { ...updatedAccounts[index], [field]: value };
    
    const validation = enhancedRegistrationService.validateAccountRequest(updatedAccounts[index], accountTypes);
    if (validation.isValid) {
      setSelectedAccounts(updatedAccounts);
      setErrors([]);
    } else {
      setErrors(validation.errors);
    }
  };

  const handleSubmit = async () => {
    if (errors.length > 0) {
      return;
    }

    setIsRegistering(true);
    try {
      const registrationData = createRegistrationRequest(formData, selectedAccounts);
      await enhancedRegistrationService.registerWithAccounts(registrationData);
      alert('Registration successful! Check your email for confirmation.');
      // Reset form
      setFormData({
        username: '',
        password: '',
        email: '',
        firstName: '',
        lastName: '',
        phoneNumber: '',
        gender: '',
        address: '',
        dateOfBirth: '',
      });
      setSelectedAccounts([]);
      setActiveStep(0);
    } catch (error) {
      console.error('Registration failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      alert('Registration failed: ' + errorMessage);
    } finally {
      setIsRegistering(false);
    }
  };

  const steps = ['Personal Information', 'Account Selection', 'Review & Submit'];

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Multi-Account Registration
      </Typography>
      
      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {errors.length > 0 && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {errors.map((error, index) => (
            <div key={index}>{error}</div>
          ))}
        </Alert>
      )}

      {activeStep === 0 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Personal Information
          </Typography>
          <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Username"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="Password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              fullWidth
              required
            />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="First Name"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                fullWidth
                required
              />
              <TextField
                label="Last Name"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                fullWidth
                required
              />
            </Box>
            <TextField
              label="Phone Number"
              value={formData.phoneNumber}
              onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="Address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              fullWidth
              multiline
              rows={2}
            />
            <Button
              variant="contained"
              onClick={() => setActiveStep(1)}
              sx={{ alignSelf: 'flex-start' }}
            >
              Next
            </Button>
          </Box>
        </Paper>
      )}

      {activeStep === 1 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Select Account Types
          </Typography>
          
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Available Account Types:
          </Typography>
          
          {accountTypes.map((accountType) => (
            <Card key={accountType.type} sx={{ mb: 2, p: 2 }}>
              <Typography variant="subtitle1">{accountType.type}</Typography>
              <Typography variant="body2">{accountType.description}</Typography>
              <Typography variant="caption" color="text.secondary">
                Min: ${accountType.minDeposit} | Max: ${accountType.maxDeposit}
              </Typography>
            </Card>
          ))}

          <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>
            Selected Accounts ({selectedAccounts.length})
          </Typography>

          {selectedAccounts.map((account, index) => (
            <Card key={index} sx={{ mb: 2, p: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="subtitle1">{account.accountType}</Typography>
                <Button
                  color="error"
                  size="small"
                  onClick={() => handleRemoveAccount(index)}
                >
                  Remove
                </Button>
              </Box>
              
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <InputLabel>Type</InputLabel>
                  <Select
                    value={account.accountType}
                    onChange={(e) => handleAccountChange(index, 'accountType', e.target.value)}
                  >
                    {accountTypes.map((type) => (
                      <MenuItem key={type.type} value={type.type}>
                        {type.type}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                
                <TextField
                  label="Initial Deposit"
                  type="number"
                  value={account.initialDeposit}
                  onChange={(e) => handleAccountChange(index, 'initialDeposit', parseFloat(e.target.value))}
                  size="small"
                  sx={{ minWidth: 120 }}
                />
              </Box>
            </Card>
          ))}

          <Button
            variant="contained"
            onClick={handleAddAccount}
            sx={{ mb: 2 }}
          >
            Add Account
          </Button>

          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              onClick={() => setActiveStep(0)}
            >
              Back
            </Button>
            <Button
              variant="contained"
              onClick={() => setActiveStep(2)}
            >
              Next
            </Button>
          </Box>
        </Paper>
      )}

      {activeStep === 2 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Review & Submit
          </Typography>
          
          <Typography variant="body1" paragraph>
            <strong>Personal Information:</strong>
          </Typography>
          <Box sx={{ mb: 3, pl: 2 }}>
            <Typography>Name: {formData.firstName} {formData.lastName}</Typography>
            <Typography>Email: {formData.email}</Typography>
            <Typography>Phone: {formData.phoneNumber}</Typography>
          </Box>

          <Typography variant="body1" paragraph>
            <strong>Accounts to Create:</strong>
          </Typography>
          <Box sx={{ mb: 3, pl: 2 }}>
            {selectedAccounts.map((account, index) => (
              <Typography key={index}>
                • {account.accountType} - ${account.initialDeposit}
              </Typography>
            ))}
          </Box>

          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              onClick={() => setActiveStep(1)}
            >
              Back
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSubmit}
              disabled={isRegistering || selectedAccounts.length === 0}
            >
              {isRegistering ? 'Registering...' : 'Submit Registration'}
            </Button>
          </Box>
        </Paper>
      )}
    </Box>
  );
};

export default MultiAccountRegistration;
