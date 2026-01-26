// src/components/Footer.tsx
import React from 'react';
import { Box, Typography, Link, Divider } from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import GitHubIcon from '@mui/icons-material/GitHub';
import './Footer.css';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer-distributed">
      <div className="footer-left">
        <Typography variant="h3" component="h3">
          NUMS<span>Bank</span>
        </Typography>
        <Typography variant="body2" sx={{ mb: 2, color: '#e0e0e0', lineHeight: 1.6 }}>
          Your trusted partner in digital banking solutions. We provide secure, innovative, and customer-centric financial services.
        </Typography>
        <Box className="footer-links">
          <Link href="/" className="link-1" color="inherit" underline="hover">Home</Link>
          <Link href="/about" color="inherit" underline="hover">About</Link>
          <Link href="/faq" color="inherit" underline="hover">FAQ</Link>
          <Link href="/contact" color="inherit" underline="hover">Contact</Link>
        </Box>
        <Typography variant="body2" className="footer-company-name">
          © {currentYear} NUMS Bank. All rights reserved.
        </Typography>
      </div>

      <div className="footer-center">
        <Typography variant="h6" sx={{ mb: 3, color: '#ffffff', fontWeight: 600 }}>
          Contact Information
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2.5 }}>
          <LocationOnIcon />
          <Typography variant="body2">
            Near Katraj Chowk, Pune<br />
            Maharashtra, India - 411043
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2.5 }}>
          <PhoneIcon />
          <Typography variant="body2">
            +91-5479622224<br />
            Mon-Fri: 9:00 AM - 6:00 PM
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <EmailIcon />
          <Typography variant="body2">
            <Link href="mailto:support@numsbank.com" color="inherit" underline="hover">
              support@numsbank.com
            </Link>
          </Typography>
        </Box>
      </div>

      <div className="footer-right">
        <Typography variant="h6" sx={{ mb: 3, color: '#ffffff', fontWeight: 600 }}>
          About NUMS Bank
        </Typography>
        <Typography variant="body2" className="footer-company-about" sx={{ lineHeight: 1.7 }}>
          NUMS Bank is a leading digital banking institution dedicated to providing innovative financial solutions. We combine cutting-edge technology with exceptional customer service to deliver secure and convenient banking experiences for our valued customers.
        </Typography>
        
        <Typography variant="h6" sx={{ mt: 3, mb: 2, color: '#ffffff', fontWeight: 600 }}>
          Follow Us
        </Typography>
        <Box className="footer-icons" sx={{ display: 'flex', gap: 2, mt: 2 }}>
          <Link 
            href="https://linkedin.com/company/numsbank" 
            target="_blank" 
            rel="noopener noreferrer"
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              width: 40,
              height: 40,
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '50%',
              textDecoration: 'none',
              transition: 'all 0.3s ease',
              '&:hover': {
                backgroundColor: '#ff6b6b',
                transform: 'translateY(-2px)'
              }
            }}
          >
            <LinkedInIcon sx={{ color: '#ffffff', fontSize: 20 }} />
          </Link>
          <Link 
            href="https://github.com/numsbank" 
            target="_blank" 
            rel="noopener noreferrer"
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              width: 40,
              height: 40,
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '50%',
              textDecoration: 'none',
              transition: 'all 0.3s ease',
              '&:hover': {
                backgroundColor: '#ff6b6b',
                transform: 'translateY(-2px)'
              }
            }}
          >
            <GitHubIcon sx={{ color: '#ffffff', fontSize: 20 }} />
          </Link>
        </Box>
      </div>
    </footer>
  );
};

export default Footer;
