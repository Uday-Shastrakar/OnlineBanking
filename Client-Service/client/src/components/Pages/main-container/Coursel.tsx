import React from "react";
import { Box, Fab } from "@mui/material";
import { Link } from "react-router-dom";
import "./Coursel.css";

const Coursel: React.FC = () => {
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
            onClick={() => {
              window.location.href = "/CustomerRegistration";
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
