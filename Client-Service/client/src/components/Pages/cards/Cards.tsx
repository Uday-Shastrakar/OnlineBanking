import React from 'react';
import { Card, CardContent, CardMedia, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import './Cards.css';

const cardData = [
  {
    title: 'Account Management',
    description: 'Manage your accounts with ease and efficiency.',
    imageUrl: 'https://img.freepik.com/free-photo/accountant-calculating-profit-with-financial-analysis-graphs_74855-4937.jpg?ga=GA1.1.595991084.1722157993&semt=ais_user',
    action: 'Manage Accounts',
    route: '/login'
  },
  {
    title: 'Personal Loans',
    description: 'Flexible loans to meet your personal financial needs.',
    imageUrl: 'https://img.freepik.com/free-vector/indian-rupee-money-bag_23-2148019024.jpg?ga=GA1.1.595991084.1722157993&semt=ais_user',
    action: 'Apply Now',
    route: '/login'
  },
  {
    title: 'Mobile Banking',
    description: 'Bank on-the-go with our comprehensive mobile solutions.',
    imageUrl: 'https://img.freepik.com/free-vector/shopping-paying-with-smartphone_23-2147675598.jpg?ga=GA1.1.595991084.1722157993&semt=ais_user',
    action: 'Learn More',
    route: '/login'
  },
  {
    title: 'Credit Cards',
    description: 'Flexible credit solutions to cater to all your spending needs.',
    imageUrl: 'https://img.freepik.com/free-vector/realistic-credit-card-design_23-2149126090.jpg?ga=GA1.1.595991084.1722157993&semt=ais_user',
    action: 'Apply Now',
    route: '/login'
  }
];

const Cards: React.FC = () => {
  const navigate = useNavigate();

  const handleCardClick = (route: string) => {
    navigate(route);
  };

  return (
    <div className="cards-container">
      <div className="cards-grid">
        {cardData.map((card, index) => (
          <Card key={index} className="card">
            <CardMedia
              component="img"
              height="140"
              image={card.imageUrl}
              alt={card.title}
              className="card-media"
            />
            <CardContent className="card-content">
              <Typography variant="h6" component="div" className="card-title">
                {card.title}
              </Typography>
              <Typography variant="body2" color="text.secondary" className="card-description">
                {card.description}
              </Typography>
              <Button
                variant="contained"
                color="primary"
                className="card-button"
                onClick={() => handleCardClick(card.route)}
                sx={{ 
                  mt: 2, 
                  bgcolor: 'rgba(26, 188, 156, 0.7) !important',
                  color: '#ffffff !important',
                  fontWeight: 'bold',
                  '&:hover': { 
                    bgcolor: 'rgba(26, 188, 156, 0.9) !important',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 12px rgba(26, 188, 156, 0.3)'
                  }
                }}
              >
                {card.action}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Cards;
