import React, { useEffect, useState } from "react";
import { Box, Typography, Divider } from "@mui/material";
import { getCustomer } from "../../../../services/customerService";
import { GetCustomer } from "../../../../Types";

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
        const data = await getCustomer(userId); // Fetch customer data
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

  if (loading) return <Typography>Loading...</Typography>;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <Box p={3} className="profile-container">
      {profileData ? (
        <Box>
          <Typography variant="h5" gutterBottom>
            User Profile
          </Typography>
          <Divider sx={{ marginBottom: 2 }} />
          <Typography>
            <strong>First Name:</strong> {profileData.firstName}
          </Typography>
          <Typography>
            <strong>Last Name:</strong> {profileData.lastName}
          </Typography>
          <Typography>
            <strong>Email:</strong> {profileData.email}
          </Typography>
          <Typography>
            <strong>Username:</strong> {profileData.userName}
          </Typography>
          <Typography>
            <strong>Phone Number:</strong> {profileData.phoneNumber}
          </Typography>
          <Typography>
            <strong>Gender:</strong> {profileData.gender || "N/A"}
          </Typography>
          <Typography>
            <strong>Address:</strong> {profileData.address || "N/A"}
          </Typography>
          <Typography>
            <strong>Date of Birth:</strong> {profileData.dateOfBirth || "N/A"}
          </Typography>
        </Box>
      ) : (
        <Typography>No customer data found</Typography>
      )}
    </Box>
  );
};

export default Profile;
