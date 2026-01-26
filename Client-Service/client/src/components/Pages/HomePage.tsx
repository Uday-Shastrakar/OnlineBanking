import React from 'react';
import { Box, Container, Typography, Button, Fab } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import Coursel from './main-container/Coursel';
import Cards from './cards/Cards';
import Footer from '../Footer/Footer';
import './HomePage.css';

const HomePage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Box className="home-page">
      {/* Hero Section with Carousel */}
      <Coursel />

      {/* Services Section */}
      <Container maxWidth="lg" className="services-section">
        <Cards />
      </Container>

      {/* Footer */}
      <Footer />
    </Box>
  );
};

export default HomePage;
