import React from 'react';
import { Box } from '@mui/material';
import Coursel from './main-container/Coursel';
import Cards from './cards/Cards';
import Footer from '../Footer/Footer';

const HomePage: React.FC = () => {
  return (
    <Box>
      <Coursel />
      <Cards />
      <Footer/>
    </Box>
  );
};

export default HomePage;
