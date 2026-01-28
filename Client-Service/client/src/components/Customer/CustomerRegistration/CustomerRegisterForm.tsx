import React, { useState } from "react";

import { Avatar, Box, Button, Card, Container, Step, StepLabel, Stepper, TextField, Typography, Modal, Fade, Backdrop, LinearProgress, Chip, Alert } from "@mui/material";

import PersonAddIcon from "@mui/icons-material/PersonAdd";

import CloudUploadIcon from "@mui/icons-material/CloudUpload";

import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';

import ErrorIcon from '@mui/icons-material/Error';

import { useNavigate } from "react-router-dom";

import { customerService } from "../../../services/customerService";

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

  const [fileError, setFileError] = useState<string>("");

  const [uploadProgress, setUploadProgress] = useState<number>(0);

  const [activeStep, setActiveStep] = useState(0);

  const [showModal, setShowModal] = useState<boolean>(false);
  const [documentUploaded, setDocumentUploaded] = useState<boolean>(false);

  const navigate = useNavigate();



  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    
    // Clear errors when user starts typing
    setError("");
    
    setRegisterForm((prevForm) => {
      const updatedForm = { ...prevForm, [name]: value };
      
      // Sync firstName, lastName, email, phoneNumber to createCustomerDto
      if (name === 'firstName' || name === 'lastName' || name === 'email' || name === 'phoneNumber') {
        updatedForm.createCustomerDto = {
          ...prevForm.createCustomerDto,
          [name]: value,
        };
      }
      
      return updatedForm;
    });
  };



  const handleDtoChange = (event: React.ChangeEvent<HTMLInputElement>) => {

    const { name, value } = event.target;
    
    // Clear errors when user starts typing
    setError("");

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

      const file = event.target.files[0];

      setFileError("");

      

      // File validation

      const maxSize = 10 * 1024 * 1024; // 10MB

      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/bmp', 'application/pdf'];

      

      if (file.size > maxSize) {

        setFileError("File size exceeds 10MB limit");

        setSelectedFile(null);

        return;

      }

      

      if (!allowedTypes.includes(file.type)) {

        setFileError("Only images (JPG, PNG, GIF, BMP) and PDF files are allowed");

        setSelectedFile(null);

        return;

      }

      

      setSelectedFile(file);

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

    setUploadProgress(0);

    setDocumentUploaded(false);



    try {

      // Create API request data with proper date formatting and remove IDs

      const apiRequestData = {

        username: registerForm.username,

        password: registerForm.password,

        email: registerForm.email,

        firstName: registerForm.firstName,

        lastName: registerForm.lastName,

        phoneNumber: registerForm.phoneNumber,

        roleNames: registerForm.roleNames,

        permissionNames: registerForm.permissionNames,

        createCustomerDto: {

          firstName: registerForm.createCustomerDto.firstName,

          lastName: registerForm.createCustomerDto.lastName,

          phoneNumber: registerForm.createCustomerDto.phoneNumber,

          email: registerForm.createCustomerDto.email,

          gender: registerForm.createCustomerDto.gender,

          address: registerForm.createCustomerDto.address,

          dateOfBirth: registerForm.createCustomerDto.dateOfBirth.format('YYYY-MM-DD'),

          status: registerForm.createCustomerDto.status,

          accountType: registerForm.createCustomerDto.accountType,

        }

      };



      // Step 1: Register Customer

      const response: any = await customerService.register(apiRequestData as any);

      console.log("Registration Response:", response);



      // Step 2: Extract User ID from response

      const userId = response.userId;



      if (!userId) {

        throw new Error("Registration successful but User ID not returned. Cannot upload document.");

      }



      // Step 3: Upload Document if selected

      if (selectedFile) {

        setUploadProgress(25);

        await customerService.uploadDocument(userId, selectedFile);

        setUploadProgress(100);

        setDocumentUploaded(true);

        console.log("Document uploaded successfully");

      }



      setShowModal(true);
      setTimeout(() => {
        setShowModal(false);
        navigate("/login");
      }, 3000);

    } catch (err: any) {

      console.error(err);

      setUploadProgress(0);

      // Handle specific error cases
      if (err.response?.status === 409) {
        setError("Username already exists. Please choose a different username.");
      } else if (err.response?.status === 422) {
        setError(err.response?.data?.message || "Invalid data provided. Please check your input.");
      } else {
        setError(err.message || "Registration failed. Please try again.");
      }

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

                    Please upload a valid proof of address (ID Card, Utility Bill, Passport, etc.)

                  </Typography>



                  <div className="file-upload-area" onClick={() => document.getElementById('file-upload')?.click()}>

                    <CloudUploadIcon style={{ fontSize: 60, color: '#bdbdbd' }} />

                    <Typography variant="body1" mt={2} color="textSecondary">

                      Click to select a file

                    </Typography>

                    <Typography variant="caption" color="textSecondary">

                      Supported: Images (JPG, PNG, GIF, BMP) and PDFs (Max 10MB)

                    </Typography>

                    <input

                      type="file"

                      id="file-upload"

                      style={{ display: "none" }}

                      onChange={handleFileChange}

                      accept="image/*,.pdf"

                    />

                  </div>



                  {fileError && (

                    <Alert severity="error" sx={{ mt: 2, mb: 2 }}>

                      <ErrorIcon fontSize="small" sx={{ mr: 1 }} />

                      {fileError}

                    </Alert>

                  )}

                  {error && (

                    <Alert severity="warning" sx={{ mt: 2, mb: 2 }}>

                      <ErrorIcon fontSize="small" sx={{ mr: 1 }} />

                      {error}

                    </Alert>

                  )}



                  {selectedFile && (

                    <Box className="selected-file" sx={{ mt: 2, p: 2, border: '1px solid #e0e0e0', borderRadius: 2 }}>

                      <Box display="flex" alignItems="center" justifyContent="space-between">

                        <Box display="flex" alignItems="center">

                          <InsertDriveFileIcon color="primary" />

                          <Box ml={2} textAlign="left">

                            <Typography variant="body2" fontWeight="medium">

                              {selectedFile.name}

                            </Typography>

                            <Typography variant="caption" color="textSecondary">

                              {(selectedFile.size / 1024 / 1024).toFixed(2)} MB • {selectedFile.type}

                            </Typography>

                          </Box>

                        </Box>

                        <Chip 

                          label={selectedFile.type.startsWith('image/') ? 'Image' : 'PDF'} 

                          size="small" 

                          color={selectedFile.type.startsWith('image/') ? 'primary' : 'secondary'}

                        />

                      </Box>

                    </Box>

                  )}



                  {uploadProgress > 0 && uploadProgress < 100 && (

                    <Box sx={{ mt: 2 }}>

                      <Typography variant="body2" color="textSecondary" gutterBottom>

                        Uploading document...

                      </Typography>

                      <LinearProgress 

                        variant="determinate" 

                        value={uploadProgress} 

                        sx={{ height: 8, borderRadius: 4 }}

                      />

                    </Box>

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

                  disabled={!selectedFile || uploadProgress > 0}

                >

                  {uploadProgress > 0 ? 'Creating Account...' : 'Create Account'}

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

              {documentUploaded 
                ? "Your account has been created and your proof of address document uploaded successfully."
                : "Your account has been created successfully. You can upload your proof of address document later."
              }

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

