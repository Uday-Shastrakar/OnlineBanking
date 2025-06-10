import React, { useState } from 'react';
import { Avatar, Button, Card, Container,Grid, Link, TextField, Typography } from '@mui/material';
import './ForgotPassword.css'; 
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { useNavigate } from 'react-router-dom';
import { verifyOtp } from '../../../../src/services/authService';
import { forgotPassword } from '../../../../src/services/authService'; 

const Copyright = () => (
  <Typography variant="body2" color="textSecondary" align="center">
  {'Copyright © ' + new Date().getFullYear() + ' NUMS Bank. All rights reserved.'}
</Typography>
);
const Forgotpassword: React.FC = () => {
    const [email, setEmail] = useState<string>('');
    const [error, setError] = useState<string>('');
    const [success, setSuccess] = useState<string>('');
    const [otp, setOtp] = useState<string>('');
    const [isOtpSent, setIsOtpSent] = useState<boolean>(false);
    const navigate = useNavigate(); 

    const handleForgotPassword = async (event: React.FormEvent) => {
        event.preventDefault();
    
        try {
          await forgotPassword(email); 
          setSuccess('Password reset request sent. Please check your email for instructions.');
          setError('');
          setIsOtpSent(true);
        } catch (err: any) {
          setError(err.message || 'Failed to request password reset. Please try again.');
          setSuccess('');
        }
      };
    
      const handleOtpVerfication = async (event: React.FormEvent) => {
        event.preventDefault();
    
        try {
          const response = await verifyOtp(otp);
    
          if (response.success) {
            setSuccess('OTP verified successfully. Redirecting to set a new password.');
            setError('');
            // Delay redirection to ensure success message is shown
            setTimeout(() => navigate('/resetpassword', { state: { otp } }), 1200);
          } else {
            setError('Invalid or expired OTP. Please try again.');
            setSuccess('');
          }
        } catch (err: any) {
          setError(err.message || 'Failed to verify OTP. Please try again.');
          setSuccess('');
        }
      };

  return (
     <Container className='container'>
    <Card className='card'>
    <div className="tag">
      <Avatar className="avatar">
        <PersonAddIcon />
      </Avatar>
      <Typography component="h1" variant="h5">
            {isOtpSent ? 'Verify OTP' : "Send OTP"}
          </Typography>
      </div>
      <form className="form" onSubmit={isOtpSent ? handleOtpVerfication : handleForgotPassword} noValidate>
      {!isOtpSent ? (
              <>
              <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              id="email"
              label="Enter Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
              </>
            ) : (
              <>
              <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              id="otp"
              label="Enter OTP"
              name="otp"
              autoComplete="otp"
              autoFocus
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />
              </>
            )}
            
          <div className="submit-btn">
        <Button
          type="submit"
          variant="contained"
          className="submit"
        >
          {isOtpSent ? 'Verify OTP' : 'Send OTP'}
        </Button>
        </div>
        <div>
        {error && (
            <Typography color="error" align="center" variant="body2">
              {error}
            </Typography>
          )}
        </div>
      </form>
      </Card>
  </Container>
  );
};

export default Forgotpassword;
