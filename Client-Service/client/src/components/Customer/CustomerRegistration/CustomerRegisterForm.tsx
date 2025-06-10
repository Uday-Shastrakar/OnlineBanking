import React, { useState } from "react";
import { Avatar, Box, Button, Card, Container, Step, StepLabel, Stepper, TextField, Typography } from "@mui/material";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import { useNavigate } from "react-router-dom";
import { register } from "../../../services/customerService";
import { CustomerRegisterForm } from "../../../Types";
import "./CustomerRegisterForm.css";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { RadioGroup, FormControlLabel, Radio, FormControl, FormLabel } from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import dayjs, { Dayjs } from "dayjs";

const steps = ["User Information", "Contact Information", "Document"];

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
      gender: "",
      address: "",
      dateOfBirth: dayjs(),
      status: "Active",
      accountType: "",
    },
  });
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [activeStep, setActiveStep] = useState(0);
  const [skipped, setSkipped] = useState<Set<number>>(new Set());
  const navigate = useNavigate();
  const [showCard, setShowCard] = useState<boolean>(false);
  const [showButton, setShowButton] = useState<boolean>(false);

  const isStepOptional = (step: number) => step === 1;

  const isStepSkipped = (step: number) => skipped.has(step);

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
  

  const handleNext = () => {
    console.log("handle next called");

    let newSkipped = skipped;
    if (isStepSkipped(activeStep)) {
      newSkipped = new Set(newSkipped.values());
      newSkipped.delete(activeStep);
    }
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
    setSkipped(newSkipped);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    console.log("handle submit called");

    // if (registerForm.password !== confirmPassword) {
    //   setError('Passwords do not match');
    //   return;
    // }
    try {
      const response = await register(registerForm);
      console.log(response);
      setShowCard(true);
      setTimeout(() => {
        setShowCard(false);
        // navigate("/login"); // Redirect to the desired page
      }, 5000);
    } catch (err: any) {
      setError(err.message || "Registration failed. Please try again.");
    }
  };

  return (
    <Container className="container">
      <Card className="card">
        <div className="tag">
          <Avatar className="avatar">
            <PersonAddIcon />
          </Avatar>
          <Typography component="h1" variant="h5">
            Register
          </Typography>
          {error && <Typography color="error">{error}</Typography>}
        </div>
        <form className="form" onSubmit={handleSubmit} noValidate>
          <Stepper activeStep={activeStep} orientation="horizontal">
            {steps.map((label, index) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
          <div className="step-content">
            {activeStep === 0 && (
              <div>
                <div style={{ display: "flex", gap: "16px" }}>
                  <TextField
                    variant="outlined"
                    margin="normal"
                    required
                    id="firstName"
                    label="First Name"
                    name="firstName"
                    autoComplete="firstName"
                    value={registerForm.firstName}
                    onChange={handleInputChange}
                    fullWidth
                  />
                  <TextField
                    variant="outlined"
                    margin="normal"
                    required
                    id="lastName"
                    label="Last Name"
                    name="lastName"
                    autoComplete="lastName"
                    value={registerForm.lastName}
                    onChange={handleInputChange}
                    fullWidth
                  />
                </div>
                <div style={{ display: "flex", gap: "16px" }}>
                  <TextField
                    variant="outlined"
                    margin="normal"
                    required
                    id="email"
                    label="Email Address"
                    name="email"
                    autoComplete="email"
                    value={registerForm.email}
                    onChange={handleInputChange}
                    fullWidth
                  />
                  <TextField
                    variant="outlined"
                    margin="normal"
                    required
                    id="phoneNumber"
                    label="Phone Number"
                    name="phoneNumber"
                    autoComplete="phoneNumber"
                    value={registerForm.phoneNumber}
                    onChange={handleInputChange}
                    fullWidth
                  />
                </div>
                <div style={{ display: "flex", gap: "16px" }}>
                  <TextField
                    variant="outlined"
                    margin="normal"
                    required
                    id="username"
                    label="Username"
                    name="username"
                    autoComplete="username"
                    value={registerForm.username}
                    onChange={handleInputChange}
                    fullWidth
                  />
                  <TextField
                    variant="outlined"
                    margin="normal"
                    required
                    name="password"
                    label="Password"
                    type="password"
                    id="password"
                    autoComplete="current-password"
                    value={registerForm.password}
                    onChange={handleInputChange}
                    fullWidth
                  />
                </div>
              </div>
            )}
            {activeStep === 1 && (
              <div>
                <div
                  style={{ display: "flex", gap: "16px", marginTop: "10px" }}
                >
                  <FormControl component="fieldset" fullWidth>
                    <FormLabel>Gender</FormLabel>
                    <RadioGroup
                      aria-label="gender"
                      name="gender"
                      value={registerForm.createCustomerDto.gender}
                      onChange={handleDtoChange}
                    >
                      <div style={{ display: "flex" }}>
                        <FormControlLabel
                          value="Male"
                          control={<Radio />}
                          label="Male"
                        />
                        <FormControlLabel
                          value="Female"
                          control={<Radio />}
                          label="Female"
                        />
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormControl component="fieldset" fullWidth>
                    <FormLabel>Account Type</FormLabel>
                    <RadioGroup
                      aria-label="accounttype"
                      name="accountType"
                      value={registerForm.createCustomerDto.accountType}
                      onChange={handleDtoChange}
                    >
                      <div style={{ display: "flex" }}>
                        <FormControlLabel
                          value="SAVING"
                          control={<Radio />}
                          label="SAVING"
                        />
                        <FormControlLabel
                          value="CURRENT"
                          control={<Radio />}
                          label="CURRENT"
                        />
                      </div>
                    </RadioGroup>
                  </FormControl>
                </div>
                <div style={{ display: "flex", gap: "16px" }}>
                  <TextField
                    variant="outlined"
                    margin="normal"
                    required
                    id="address"
                    label="Address"
                    name="address"
                    autoComplete="address"
                    value={registerForm.createCustomerDto.address}
                    onChange={handleDtoChange}
                    fullWidth
                  />

 <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DatePicker
        label="Date of Birth"
        value={registerForm.createCustomerDto.dateOfBirth}
        onChange={handleDateChange}
        slots={{
          // Customize the input component used in the DatePicker
          textField: TextField
        }}
        slotProps={{
          textField: {
            fullWidth: true,
            variant: 'outlined',
            margin: 'normal',
            required: true
          }
        }}
      />
    </LocalizationProvider>

                </div>
              </div>
            )}
            {activeStep === 2 && (
              <div>
                <div style={{ marginTop: "20px", marginBottom: "20px" }}>
                  <Button
                    component="label"
                    role={undefined}
                    variant="contained"
                    style={{
                      marginTop: "20px",
                      display: "flex",
                      justifyContent: "center",
                    }}
                    tabIndex={-1}
                    startIcon={<CloudUploadIcon />}
                  >
                    Upload files
                    <input
                      type="file"
                      // onClick={uploadDoc}
                      style={{ display: "none" }}
                      multiple
                    />
                  </Button>
                </div>
              </div>
            )}
            {showCard && (
              <Card
                className="notification-card"
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  zIndex: 10,
                  width: "300px",
                  padding: "16px",
                  boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
                }}
              >
                <Box sx={{ p: 2 }}>
                  <Typography variant="h6">Success</Typography>
                  <Typography>Your registration was successful!</Typography>
                </Box>
              </Card>
            )}
            <div className="navigation-buttons">
              <Button
                disabled={activeStep === 0}
                onClick={handleBack}
                style={{ float: "left" }}
                variant="outlined"
              >
                Back
              </Button>

              {activeStep === steps.length - 1 ? (
                <Button type="submit" variant="contained" className="next">
                  Submit
                </Button>
              ) : (
                <Button
                  variant="contained"
                  className="next"
                  onClick={handleNext}
                  disabled={activeStep === steps.length - 1}
                  style={{ float: "right" }}
                  type="button"
                >
                  {activeStep === steps.length - 2 ? "Submit" : "Next"}
                </Button>
              )}
            </div>
          </div>
        </form>
      </Card>
    </Container>
  );
};

export default CustomerRegister;
