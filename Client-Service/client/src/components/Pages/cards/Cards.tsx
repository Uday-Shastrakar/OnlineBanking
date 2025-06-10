import React from 'react';
import { Card, CardContent, CardMedia, Typography } from '@mui/material';
import './Cards.css';

const cardData = [
  {
    title: 'Account Management',
    description: 'Manage your accounts with ease and efficiency.',
    imageUrl: 'https://img.freepik.com/free-photo/accountant-calculating-profit-with-financial-analysis-graphs_74855-4937.jpg?ga=GA1.1.595991084.1722157993&semt=ais_user',
  },
  {
    title: 'Personal Loans',
    description: 'Flexible loans to meet your personal financial needs.',
    imageUrl: 'https://img.freepik.com/free-vector/indian-rupee-money-bag_23-2148019024.jpg?ga=GA1.1.595991084.1722157993&semt=ais_user',
  },
  {
    title: 'Mobile Banking',
    description: 'Bank on-the-go with our comprehensive mobile solutions.',
    imageUrl: 'https://img.freepik.com/free-vector/shopping-paying-with-smartphone_23-2147675598.jpg?ga=GA1.1.595991084.1722157993&semt=ais_user',
  },
  {
    title: 'Credit Cards',
    description: 'Flexible credit solutions to cater to all your spending needs.',
    imageUrl: 'https://img.freepik.com/free-vector/realistic-credit-card-design_23-2149126090.jpg?ga=GA1.1.595991084.1722157993&semt=ais_user',
  },
  {
    title: 'Card Title 5',
    description: 'This is a description for card 5.',
    imageUrl: 'https://via.placeholder.com/150',
  },
  {
    title: 'Card Title 6',
    description: 'This is a description for card 6.',
    imageUrl: 'https://via.placeholder.com/150',
  },
];

const Cards: React.FC = () => {
  return (
    <div id="services" className="section">
      <h2>Our Services</h2>
    <div className='cards'>
      {cardData.map((card, index) => (
        <Card className='card' key={index}>
          <CardMedia
            component='img'
            height='140'
            image={card.imageUrl}
            alt={card.title}
          />
          <CardContent>
            <Typography gutterBottom variant='h5' component='div'>
              {card.title}
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              {card.description}
            </Typography>
          </CardContent>
        </Card>
      ))}
    </div>
    </div>
  );
}

export default Cards;
