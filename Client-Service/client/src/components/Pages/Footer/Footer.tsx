// src/components/Footer.tsx
import React from 'react';
import './Footer.css';

// Import your logo images
import facebookLogo from '../assets/images/facebook-logo.png';
import twitterLogo from '../assets/images/twitter-logo.png';
import linkedinLogo from '../assets/images/linkedin-logo.png';
import githubLogo from '../assets/images/github-logo.png';

const Footer: React.FC = () => {
  return (
    <footer className="footer-distributed">
      <div className="footer-left">
        <h3>NUMS<span>Bank</span></h3>
        <p className="footer-links">
          <a href="#" className="link-1">Home</a>
          <a href="#">About</a>
          <a href="#">Faq</a>
          <a href="#">Contact</a>
        </p>
        <p className="footer-company-name">NUMS BANK © 2024</p>
      </div>

      <div className="footer-center">
        <div>
          <i className="fa fa-map-marker"></i>
          <p><span>Near Katraj Chowk</span> Pune, Maharashtra, INDIA</p>
        </div>
        <div>
          <i className="fa fa-phone"></i>
          <p>+91-5479622224</p>
        </div>
        <div>
          <i className="fa fa-envelope"></i>
          <p><a href="mailto:numsbank@gmail.com">numsbank@gmail.com</a></p>
        </div>
      </div>

      <div className="footer-right">
        <p className="footer-company-about">
          <span>About NUMS Bank</span>
          NUMS Bank delivers modern, secure banking solutions with a focus on customer satisfaction. We offer innovative personal and business banking services through easy-to-use digital platforms.
        </p>
        <div className="footer-icons">
          <a href="#"><img src={facebookLogo} alt="Facebook" className="social-icon" /></a>
          <a href="#"><img src={twitterLogo} alt="Twitter" className="social-icon" /></a>
          <a href="#"><img src={linkedinLogo} alt="LinkedIn" className="social-icon" /></a>
          <a href="#"><img src={githubLogo} alt="GitHub" className="social-icon" /></a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
