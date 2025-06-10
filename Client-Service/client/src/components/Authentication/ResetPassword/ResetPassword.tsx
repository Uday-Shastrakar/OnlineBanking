import React, { useState, useEffect } from "react"; // <-- Added useEffect to the import
import {
  Avatar,
  Box,
  Button,
  Card,
  Container,
  CssBaseline,
  Grid,
  Link,
  TextField,
  Typography,
} from "@mui/material";
import "./ResetPassword.css";
import { useNavigate, useLocation } from 'react-router-dom';
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import { resetPassword } from '../../../../src/services/authService';
import { ApiResponse } from "../../../../src/services/api";

const ResetPassword: React.FC = () => {
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [passwordsMatch, setPasswordsMatch] = useState<boolean>(true);
  const location = useLocation();
  const navigate = useNavigate();

  const { otp } = location.state as { otp: string };

  useEffect(() => {
    // Check if passwords match
    setPasswordsMatch(newPassword === confirmPassword);
  }, [newPassword, confirmPassword]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    // Check if passwords match
    if (!passwordsMatch) {
      setError('Passwords do not match.');
      setSuccess('');
      return;
    }

    try {
      const response: ApiResponse<string> = await resetPassword(otp, newPassword);

      if (response.success) {
        setSuccess('Password reset successfully. Redirecting to login page.');
        setError('');
        setTimeout(() => navigate('/login'), 1000);
      } else {
        setError('Error resetting password. Please try again.');
        setSuccess('');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to reset password. Please try again.');
      setSuccess('');
    }
  };

  return (
    <Container className="container">
      <Card className="card">
        <div className="tag">
          <Avatar className="avatar">
            <PersonAddIcon />
          </Avatar>
          <Typography component="h1" variant="h5">
            Reset Password
          </Typography>
          {error && <Typography color="error">{error}</Typography>}
        </div>
        <form className="form" onSubmit={handleSubmit} noValidate>
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            id="new-password"
            label="New Password"
            name="new-password"
            type="password"
            autoComplete="new-password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            id="confirm-password"
            label="Confirm Password"
            name="confirm-password"
            type="password"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <div className="submit-btn">
            <Button type="submit" variant="contained" className="submit" disabled={!passwordsMatch}>
              Reset Password
            </Button>
          </div>
          {!passwordsMatch && (
            <Typography color="error" align="center" variant="body2" mt={2}>
              Passwords do not match.
            </Typography>
          )}
          {error && (
            <Typography color="error" align="center" variant="body2" mt={2}>
              {error}
            </Typography>
          )}
          {success && (
            <Typography color="success.main" align="center" variant="body2" mt={2}>
              {success}
            </Typography>
          )}
        </form>
      </Card>
    </Container>
  );
};

export default ResetPassword;
