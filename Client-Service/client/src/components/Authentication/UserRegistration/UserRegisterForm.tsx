import React, { useState } from 'react';
import {Avatar,Button,Card,Container,TextField,Typography} from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { useNavigate } from 'react-router-dom';
import { register } from '../../../services/authService';
import { RegisterForm } from '../../../Types';
import './UserRegisterForm.css';


const Register: React.FC = () => {
  const [registerForm, setRegisterForm] = useState<RegisterForm>({
    username: '',
    email: '',
    phoneNumber: '',
    firstName: '',
    lastName: '',
    password: '',
    roleNames: ['USER'],
    permissionNames: ['PERMISSION_READ'],
  });
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [nameError, setNameError] = useState<string>('');
  const [emailError, setEmailError] = useState<string>('');
  const [passwordError, setPasswordError] = useState<string>('');
  const navigate = useNavigate();

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setRegisterForm(prevForm => ({ ...prevForm, [name]: value }));
  };

  const validateForm = () => {
    let isValid = true;
    setNameError('');
    setEmailError('');
    setPasswordError('');

    if (!registerForm.username) {
      setNameError('Username is required');
      isValid = false;
    }
    // if (!registerForm.email || !/^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/.test(registerForm.email)) {
    //   setEmailError('Valid email is required');
    //   isValid = false;
    // }
    if (!registerForm.password) {
      setPasswordError('Password is required');
      isValid = false;
    }
    if (registerForm.password !== confirmPassword) {
      setPasswordError('Passwords do not match');
      isValid = false;
    }

    return isValid;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      await register(registerForm);
      navigate('/login'); // Redirect to desired page
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
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
        Register
      </Typography>
      {error && <Typography color="error">{error}</Typography>}
      </div>
      <form className="form" onSubmit={handleSubmit} noValidate >
          <div style={{ display: 'flex', flexDirection: 'row', gap: '16px', width: '100%' }}>
            <TextField
              variant="outlined"
              margin="normal"
              required
              id="firstName"
              label="First Name"
              name="firstName"
              autoComplete="firstName"
              value={registerForm.firstName}
              onChange={handleInputChange}
              style={{ flex: 1 }}
            />
            <TextField
              variant="outlined"
              margin="normal"
              required
              id="lastName"
              label="Last Name"
              name="lastName"
              autoComplete="lastName"
              value={registerForm.lastName}
              onChange={handleInputChange}
              style={{ flex: 1 }}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'row', gap: '16px', width: '100%' }}>
            <TextField
              variant="outlined"
              margin="normal"
              required
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              value={registerForm.email}
              onChange={handleInputChange}
              style={{ flex: 1 }}
            />
            <TextField
              variant="outlined"
              margin="normal"
              required
              
              id="phoneNumber"
              label="Phone Number"
              name="phoneNumber"
              autoComplete="phoneNumber"
              value={registerForm.phoneNumber}
              onChange={handleInputChange}
              style={{ flex: 1 }}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'row', gap: '16px', width: '100%' }}>
          <TextField
            variant="outlined"
            margin="normal"
            required
            id="username"
            label="Username"
            name="username"
            autoComplete="username"
            autoFocus
            value={registerForm.username}
            onChange={handleInputChange}
            style={{ flex: 1 }}
          />
            <TextField
              variant="outlined"
              margin="normal"
              required
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              value={registerForm.password}
              onChange={handleInputChange}
              style={{ flex: 1 }}
            />
          </div>
          <div className="submit-btn">
        <Button
          type="submit"
          variant="contained"
          className="submit"
        >
          Register
        </Button>
        </div>
      </form>
      </Card>
  </Container>
  );
};

export default Register;
