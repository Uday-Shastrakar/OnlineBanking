import React, { useState } from "react";
import { Avatar, Box, Button, Card, Container, Step, StepLabel, Stepper, TextField, Typography, Modal, Fade, Backdrop } from "@mui/material";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import { useNavigate } from "react-router-dom";
import { register, uploadDocument } from "../../../services/customerService";
import { CustomerRegisterForm } from "../../../Types";
import "./CustomerRegisterForm.css";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { RadioGroup, FormControlLabel, Radio, FormControl, FormLabel } from "@mui/material";
import dayjs, { Dayjs } from "dayjs";

const steps = ["User Details", "Personal Info", "Documents"];

const CustomerRegister: React.FC = () => {
  const [registerForm, setRegisterForm] = useState<CustomerRegisterForm>({
    username: "",
    password: "",
    email: "",
    firstName: "",
    lastName: "",
    phoneNumber: "",
    roleNames: ["CUSTOMER"],
    permissionNames: ["PERMISSION_WRITE"],
    createCustomerDto: {
      id: 0,
      userId: 0,
      firstName: "",
      lastName: "",
      phoneNumber: "",
      email: "",
      gender: "Male",
      address: "",
      dateOfBirth: dayjs(),
      status: "Active",
      accountType: "SAVING",
    },
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string>("");
  const [activeStep, setActiveStep] = useState(0);
  const [showModal, setShowModal] = useState<boolean>(false);
  const navigate = useNavigate();

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setRegisterForm((prevForm) => ({ ...prevForm, [name]: value }));
  };

  const handleDtoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setRegisterForm((prevForm) => ({
      ...prevForm,
      createCustomerDto: {
        ...prevForm.createCustomerDto,
        [name]: value,
      },
    }));
  };

  const handleDateChange = (date: Dayjs | null) => {
    setRegisterForm(prevForm => ({
      ...prevForm,
      createCustomerDto: {
        ...prevForm.createCustomerDto,
        dateOfBirth: date ?? dayjs()
      }
    }));
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");

    try {
      // Step 1: Register Customer
      const response: any = await register(registerForm);
      console.log("Registration Response:", response);

      // Step 2: Extract User ID from response
      // Assuming the response matches UserDetailDto structure or similar returning the created user/customer
      // Based on controller, it returns UserDetailDto. We need the userId.
      const userId = response.userId;

      if (!userId) {
        throw new Error("Registration successful but User ID not returned. Cannot upload document.");
      }

      // Step 3: Upload Document if selected
      if (selectedFile) {
        await uploadDocument(userId, selectedFile);
        console.log("Document uploaded successfully");
      }

      setShowModal(true);
      setTimeout(() => {
        setShowModal(false);
        navigate("/login");
      }, 3000);

    } catch (err: any) {
      console.error(err);
      setError(err.message || "Registration failed. Please try again.");
    }
  };

  return (
    <Container className="container">
      <Card className="card">
        <div className="tag">
          <Avatar className="avatar">
            <PersonAddIcon fontSize="large" />
          </Avatar>
          <Typography component="h1" variant="h5" fontWeight="bold">
            Customer Registration
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.8, mt: 1 }}>
            Join our premium banking experience
          </Typography>
        </div>

        <div className="form">
          {error && (
            <Box mb={2} p={2} bgcolor="#ffebee" borderRadius={2}>
              <Typography color="error" align="center">{error}</Typography>
            </Box>
          )}

          <Stepper activeStep={activeStep} alternativeLabel>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          <form onSubmit={handleSubmit} noValidate>
            <div className="step-content">
              {activeStep === 0 && (
                <Box>
                  <Typography variant="h6" gutterBottom color="textSecondary">
                    Account Credentials
                  </Typography>
                  <Box display="flex" gap={2} mb={2}>
                    <TextField
                      variant="outlined"
                      required
                      fullWidth
                      label="Username"
                      name="username"
                      value={registerForm.username}
                      onChange={handleInputChange}
                    />
                    <TextField
                      variant="outlined"
                      required
                      fullWidth
                      type="password"
                      label="Password"
                      name="password"
                      value={registerForm.password}
                      onChange={handleInputChange}
                    />
                  </Box>
                  <Typography variant="h6" gutterBottom color="textSecondary" mt={3}>
                    Contact Information
                  </Typography>
                  <Box display="flex" gap={2}>
                    <TextField
                      variant="outlined"
                      required
                      fullWidth
                      label="Email Address"
                      name="email"
                      value={registerForm.email}
                      onChange={handleInputChange}
                    />
                    <TextField
                      variant="outlined"
                      required
                      fullWidth
                      label="Phone Number"
                      name="phoneNumber"
                      value={registerForm.phoneNumber}
                      onChange={handleInputChange}
                    />
                  </Box>
                </Box>
              )}

              {activeStep === 1 && (
                <Box>
                  <Typography variant="h6" gutterBottom color="textSecondary">
                    Personal Details
                  </Typography>
                  <Box display="flex" gap={2} mb={2}>
                    <TextField
                      variant="outlined"
                      required
                      fullWidth
                      label="First Name"
                      name="firstName"
                      value={registerForm.firstName}
                      onChange={handleInputChange}
                    />
                    <TextField
                      variant="outlined"
                      required
                      fullWidth
                      label="Last Name"
                      name="lastName"
                      value={registerForm.lastName}
                      onChange={handleInputChange}
                    />
                  </Box>

                  <TextField
                    variant="outlined"
                    required
                    fullWidth
                    label="Address"
                    name="address"
                    value={registerForm.createCustomerDto.address}
                    onChange={handleDtoChange}
                    sx={{ mb: 2 }}
                  />

                  <Box display="flex" gap={4} alignItems="center" mb={2}>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <DatePicker
                        label="Date of Birth"
                        value={registerForm.createCustomerDto.dateOfBirth}
                        onChange={handleDateChange}
                        slotProps={{ textField: { fullWidth: true } }}
                      />
                    </LocalizationProvider>

                    <FormControl component="fieldset">
                      <FormLabel component="legend">Gender</FormLabel>
                      <RadioGroup row name="gender" value={registerForm.createCustomerDto.gender} onChange={handleDtoChange}>
                        <FormControlLabel value="Male" control={<Radio />} label="Male" />
                        <FormControlLabel value="Female" control={<Radio />} label="Female" />
                      </RadioGroup>
                    </FormControl>
                  </Box>

                  <FormControl component="fieldset" fullWidth sx={{ mt: 1 }}>
                    <FormLabel component="legend">Account Type</FormLabel>
                    <RadioGroup row name="accountType" value={registerForm.createCustomerDto.accountType} onChange={handleDtoChange}>
                      <FormControlLabel value="SAVING" control={<Radio />} label="Savings Account" />
                      <FormControlLabel value="CURRENT" control={<Radio />} label="Current Account" />
                    </RadioGroup>
                  </FormControl>
                </Box>
              )}

              {activeStep === 2 && (
                <Box textAlign="center">
                  <Typography variant="h6" gutterBottom color="textSecondary">
                    KYC Verification
                  </Typography>
                  <Typography variant="body2" color="textSecondary" mb={3}>
                    Please upload a valid proof of address (ID Card, Utility Bill, etc.)
                  </Typography>

                  <div className="file-upload-area" onClick={() => document.getElementById('file-upload')?.click()}>
                    <CloudUploadIcon style={{ fontSize: 60, color: '#bdbdbd' }} />
                    <Typography variant="body1" mt={2} color="textSecondary">
                      Click to select a file
                    </Typography>
                    <input
                      type="file"
                      id="file-upload"
                      style={{ display: "none" }}
                      onChange={handleFileChange}
                    />
                  </div>

                  {selectedFile && (
                    <div className="selected-file">
                      <InsertDriveFileIcon /> {selectedFile.name}
                    </div>
                  )}
                </Box>
              )}
            </div>

            <div className="navigation-buttons">
              <Button
                disabled={activeStep === 0}
                onClick={handleBack}
                variant="outlined"
                size="large"
              >
                Back
              </Button>

              {activeStep === steps.length - 1 ? (
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={!selectedFile} // Optional: force upload
                >
                  Create Account
                </Button>
              ) : (
                <Button
                  variant="contained"
                  onClick={handleNext}
                  size="large"
                >
                  Next Step
                </Button>
              )}
            </div>
          </form>
        </div>
      </Card>

      {/* Success Modal */}
      <Modal
        open={showModal}
        onClose={() => { }}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{ timeout: 500 }}
      >
        <Fade in={showModal}>
          <Box className="success-modal">
            <CheckCircleOutlineIcon style={{ fontSize: 80, color: '#4caf50', marginBottom: 16 }} />
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              Registration Successful!
            </Typography>
            <Typography color="textSecondary">
              Your account has been created and your documents uploaded.
            </Typography>
            <Typography variant="caption" display="block" sx={{ mt: 2 }}>
              Redirecting to login...
            </Typography>
          </Box>
        </Fade>
      </Modal>
    </Container>
  );
};

export default CustomerRegister;
