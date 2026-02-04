// src/components/Footer.tsx

import React from 'react';
import { Box, Typography, Link } from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import GitHubIcon from '@mui/icons-material/GitHub';
import './Footer.css';

const Footer: React.FC = () => {
  return (
    <footer className="footer-distributed">
      <div className="footer-left">
        <h3>NUMS <span>Bank</span></h3>

        <p className="footer-links">
          <Link href="#" className="link-1" color="inherit" underline="hover">Home</Link>
          <Link href="#" color="inherit" underline="hover">About</Link>
          <Link href="#" color="inherit" underline="hover">Faq</Link>
          <Link href="#" color="inherit" underline="hover">Contact</Link>
        </p>

        <p className="footer-company-name">NUMS BANK © 2026</p>
      </div>

      <div className="footer-center">
        <div>
          <LocationOnIcon className="footer-icon" />
          <p><span>Near katraj chowk</span> Pune, Maharashtra, INDIA</p>
        </div>

        <div>
          <PhoneIcon className="footer-icon" />
          <p>+91-5479622224</p>
        </div>

        <div>
          <EmailIcon className="footer-icon" />
          <p><Link href="mailto:support@company.com" color="inherit" underline="hover">numsbank@gmail.com</Link></p>
        </div>
      </div>

      <div className="footer-right">
        <p className="footer-company-about">
          <span>About NUMS Bank: </span>
           Delivers Modern, Secure Banking Solutions with a Focus on Customer Satisfaction. We offer innovative personal and business banking services through easy-to-use digital platforms.
        </p>

        <div className="footer-icons">
          <Link href="#" color="inherit">
            <FacebookIcon className="social-icon" />
          </Link>
          <Link href="#" color="inherit">
            <TwitterIcon className="social-icon" />
          </Link>
          <Link href="#" color="inherit">
            <LinkedInIcon className="social-icon" />
          </Link>
          <Link href="#" color="inherit">
            <GitHubIcon className="social-icon" />
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
