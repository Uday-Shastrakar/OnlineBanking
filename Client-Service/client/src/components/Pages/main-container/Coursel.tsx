import React from "react";
import { Box, Fab } from "@mui/material";
import { useNavigate } from "react-router-dom";
import "./Coursel.css";

const Coursel: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <Box mt="30px">
      <div className="coursel-page">
        <div className="hero">
          <h1>Welcome to NUMS Bank</h1>
          <p>Your gateway to seamless banking and financial solutions.</p>
        </div>
        <div className="fab-container">
          <Fab
            variant="extended"
            className="fab-button"
            aria-label="open-account"
            onClick={() => navigate('/CustomerRegistration')}
            sx={{
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
            Open Account
          </Fab>
        </div>
      </div>
    </Box>
  );
};

export default Coursel;
