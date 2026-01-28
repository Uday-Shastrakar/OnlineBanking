import React, { useEffect, useState } from "react";
import { 
  Box, 
  Typography, 
  Divider, 
  Card, 
  CardContent, 
  Avatar, 
  Grid,
  Paper,
  CircularProgress,
  Alert
} from "@mui/material";
import { 
  Person, 
  Email, 
  Phone, 
  Cake, 
  Home, 
  Transgender 
} from "@mui/icons-material";
import { customerService } from "../../../../services/customerService";
import { GetCustomer } from "../../../../Types";
import "./Profile.css";

const Profile: React.FC = () => {
  const [profileData, setProfileData] = useState<GetCustomer | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const userDetails = localStorage.getItem("userDetails");

    if (!userDetails) {
      setError("User not authenticated. Please log in.");
      setLoading(false);
      return;
    }

    // Parse the userDetails and get userId
    const parsedUserDetails = JSON.parse(userDetails);
    const userId = parsedUserDetails?.[0]?.userId;

    if (!userId) {
      setError("User ID not found in local storage.");
      setLoading(false);
      return;
    }

    // Fetch user data using the userId
    const fetchCustomerData = async () => {
      try {
        const data = await customerService.getCustomer(userId); // Fetch customer data
        setProfileData(data);
      } catch (err) {
        setError("Error fetching customer data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomerData();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress size={60} />
      </Box>
    );
  }
  
  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box p={3} className="profile-container">
      {profileData ? (
        <Card elevation={3}>
          <CardContent>
            {/* Profile Header */}
            <Box display="flex" alignItems="center" mb={3}>
              <Avatar 
                sx={{ 
                  width: 80, 
                  height: 80, 
                  bgcolor: 'primary.main',
                  fontSize: '2rem',
                  mr: 3
                }}
              >
                {profileData.firstName?.charAt(0)}{profileData.lastName?.charAt(0)}
              </Avatar>
              <Box>
                <Typography variant="h4" fontWeight="bold" color="primary">
                  {profileData.firstName} {profileData.lastName}
                </Typography>
                <Typography variant="body1" color="textSecondary">
                  @{profileData.userName}
                </Typography>
                <Typography variant="body2" color="success.main" sx={{ mt: 1 }}>
                  Status: {profileData.status || 'ACTIVE'}
                </Typography>
              </Box>
            </Box>

            <Divider sx={{ mb: 3 }} />

            {/* Profile Information Grid */}
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Paper elevation={1} sx={{ p: 2, height: '100%' }}>
                  <Box display="flex" alignItems="center" mb={2}>
                    <Email color="primary" sx={{ mr: 2 }} />
                    <Typography variant="h6" fontWeight="medium">
                      Contact Information
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    <strong>Email:</strong> {profileData.email}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    <strong>Phone:</strong> {profileData.phoneNumber || "Not provided"}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    <strong>Username:</strong> {profileData.userName}
                  </Typography>
                </Paper>
              </Grid>

              <Grid item xs={12} md={6}>
                <Paper elevation={1} sx={{ p: 2, height: '100%' }}>
                  <Box display="flex" alignItems="center" mb={2}>
                    <Person color="primary" sx={{ mr: 2 }} />
                    <Typography variant="h6" fontWeight="medium">
                      Personal Details
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    <strong>Gender:</strong> {profileData.gender || "Not specified"}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    <strong>Date of Birth:</strong> {profileData.dateOfBirth || "Not provided"}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    <strong>Customer ID:</strong> {profileData.id}
                  </Typography>
                </Paper>
              </Grid>

              <Grid item xs={12}>
                <Paper elevation={1} sx={{ p: 2 }}>
                  <Box display="flex" alignItems="center" mb={2}>
                    <Home color="primary" sx={{ mr: 2 }} />
                    <Typography variant="h6" fontWeight="medium">
                      Address Information
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="textSecondary">
                    {profileData.address || "No address provided"}
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      ) : (
        <Alert severity="info">
          No customer data found. Please complete your profile.
        </Alert>
      )}
    </Box>
  );
};

export default Profile;
