import React, { useState } from 'react';
import { Avatar, Box, Button, Card, Container, CssBaseline,Grid, Link, TextField, Typography } from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { login } from '../../../services/authService';
import './Login.css'; 
import { useNavigate } from 'react-router-dom';
import PersonAddIcon from '@mui/icons-material/PersonAdd';

const Copyright = () => (
  <Typography variant="body2" color="textSecondary" align="center">
  {'Copyright © ' + new Date().getFullYear() + ' NUMS Bank. All rights reserved.'}
</Typography>
);

const Login: React.FC = () => {
  const [username, setusername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const navigate = useNavigate();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      const response = await login({ username, password });
      // Redirect or update state to indicate login success
      navigate('/dashboard'); // Example redirect to home page
    } catch (err: any) {
      // Handle login errors
      setError(err.message || 'Login failed. Please try again.');
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
        LogIn
      </Typography>
      {error && <Typography color="error">{error}</Typography>}
      </div>
      <form className="form" onSubmit={handleSubmit} noValidate >
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            id="username"
            label="username"
            name="username"
            autoComplete="username"
            autoFocus
            value={username}
            onChange={(e) => setusername(e.target.value)}
          />
            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          <div className="submit-btn">
        <Button
          type="submit"
          variant="contained"
          className="submit"
        >
          Log In
        </Button>
        {error && (
            <Typography color="error" align="center" variant="body2">
              {error}
            </Typography>
          )}
        </div>
        <Grid container>
            <Grid item xs>
              <Link href="/forgotpassword" variant="body2">
                Forgot password?
              </Link>
            </Grid>
            <Grid item>
              <Link href="/register" variant="body2">
                {"Don't have an account? Sign Up"}
              </Link>
            </Grid>
          </Grid>
      </form>
      </Card>
  </Container>
  );
};

export default Login;
