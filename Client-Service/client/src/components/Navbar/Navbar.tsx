import React, { useState } from "react";
import "./Navbar.css";
import { Link, useNavigate } from "react-router-dom";
import { Stack, Button, Avatar, Typography, Menu, MenuItem } from "@mui/material";
import { AccountCircle, Logout, Settings, Dashboard } from "@mui/icons-material";
import { useAuth } from "../../hooks/useAuth";

const NavBar: React.FC = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showAdminDropdown, setShowAdminDropdown] = useState(false);
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const navigate = useNavigate();

  const { logout: handleLogout, isAuthenticated, remainingTime } = useAuth();

  // Retrieve roles from localStorage
  const roles = JSON.parse(localStorage.getItem("roles") || "[]");
  const userName = localStorage.getItem("userName") || "User";

  // Role checks
  const isCustomer = roles.includes("CUSTOMER") || roles.includes("CUSTOMER_USER");
  const isAdmin = roles.some((role: string) => role === "ADMIN" || role === "USER");
  const isBankStaff = roles.includes("BANK_STAFF");
  const isAuditor = roles.includes("AUDITOR");

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogoutClick = () => {
    handleLogout();
    handleMenuClose();
  };

  const handleMouseEnter = (dropdown: string) => {
    if (dropdown === "users") setShowDropdown(true);
    if (dropdown === "admin") setShowAdminDropdown(true);
    if (dropdown === "customer") setShowCustomerDropdown(true);
  };

  const handleMouseLeave = (dropdown: string) => {
    if (dropdown === "users") setShowDropdown(false);
    if (dropdown === "admin") setShowAdminDropdown(false);
    if (dropdown === "customer") setShowCustomerDropdown(false);
  };

  // Format remaining time for display
  const formatTime = (ms: number): string => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <Stack
      direction="row"
      justifyContent="space-around"
      sx={{ gap: { lg: "122px", xs: "40px" }, mt: { sm: "32px", xs: "20px" } }}
    >
      <div className="nav-bar">
        <div className="logo">
          <Link to="/">
            <span className="nums">NUMS</span> Bank
          </Link>
        </div>
        <ul>
          {/* Home - Show for non-authenticated users */}
          {!isAuthenticated && (
            <li>
              <Link to="/">Home</Link>
            </li>
          )}

          {/* Customer Portal Dropdown */}
          {isCustomer && (
            <li
              className="dropdown"
              onMouseEnter={() => handleMouseEnter("customer")}
              onMouseLeave={() => handleMouseLeave("customer")}
            >
              <Link to="#">Customer Portal</Link>
              {showCustomerDropdown && (
                <ul className="dropdown-menu">
                  <li>
                    <Link to="/dashboard">Dashboard</Link>
                  </li>
                  <li>
                    <Link to="/accounts">My Accounts</Link>
                  </li>
                  <li>
                    <Link to="/transfer">Transfer Funds</Link>
                  </li>
                  <li>
                    <Link to="/transactions">Transaction History</Link>
                  </li>
                  <li>
                    <Link to="/profile">Profile</Link>
                  </li>
                </ul>
              )}
            </li>
          )}

          {/* Admin Portal Dropdown */}
          {isAdmin && (
            <li
              className="dropdown"
              onMouseEnter={() => handleMouseEnter("admin")}
              onMouseLeave={() => handleMouseLeave("admin")}
            >
              <Link to="#">Admin Panel</Link>
              {showAdminDropdown && (
                <ul className="dropdown-menu">
                  <li>
                    <Link to="/admin/dashboard">Dashboard</Link>
                  </li>
                  <li>
                    <Link to="/admin/users">User Management</Link>
                  </li>
                  <li>
                    <Link to="/admin/audit">Audit Center</Link>
                  </li>
                </ul>
              )}
            </li>
          )}

          {/* Services - Always visible */}
          <li>
            <Link to="/services">Services</Link>
          </li>

          {/* Users Dropdown - Hide for customers */}
          {!isCustomer && !isAdmin && (
            <li
              className="dropdown"
              onMouseEnter={() => handleMouseEnter("users")}
              onMouseLeave={() => handleMouseLeave("users")}
            >
              <Link to="#">Users</Link>
              {showDropdown && (
                <ul className="dropdown-menu">
                  <li>
                    <Link to="/user">User Details</Link>
                  </li>
                </ul>
              )}
            </li>
          )}

          {/* Welcome Message for authenticated users */}
          {isAuthenticated && (
            <li style={{ color: "#1a237e", fontWeight: "bold", padding: "0 10px" }}>
              Welcome, {userName}
            </li>
          )}

          {/* Session Timer for authenticated users */}
          {isAuthenticated && remainingTime > 0 && (
            <li style={{ 
              color: remainingTime < 300000 ? "#c62828" : "#1a237e", 
              fontWeight: "bold", 
              padding: "0 10px",
              fontSize: "12px"
            }}>
              Session: {formatTime(remainingTime)}
            </li>
          )}

          {/* Login Button */}
          {!isAuthenticated && (
            <li>
              <Button
                variant="outlined"
                startIcon={<AccountCircle />}
                onClick={() => navigate("/login")}
                sx={{ color: "#1a237e", borderColor: "#1a237e" }}
              >
                Login
              </Button>
            </li>
          )}

          {/* User Menu for authenticated users */}
          {isAuthenticated && (
            <li>
              <Button
                onClick={handleMenuOpen}
                startIcon={<Avatar sx={{ width: 32, height: 32, bgcolor: "#1a237e" }}>
                  {userName.charAt(0).toUpperCase()}
                </Avatar>}
                sx={{ color: "#1a237e" }}
              >
                {userName}
              </Button>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                PaperProps={{
                  elevation: 3,
                  sx: { mt: 1 }
                }}
              >
                <MenuItem onClick={() => { navigate("/dashboard"); handleMenuClose(); }}>
                  <Dashboard sx={{ mr: 2 }} />
                  Dashboard
                </MenuItem>
                <MenuItem onClick={() => { navigate("/profile"); handleMenuClose(); }}>
                  <Settings sx={{ mr: 2 }} />
                  Profile
                </MenuItem>
                <MenuItem onClick={handleLogoutClick}>
                  <Logout sx={{ mr: 2 }} />
                  Logout
                </MenuItem>
              </Menu>
            </li>
          )}
        </ul>
      </div>
    </Stack>
  );
};

export default NavBar;
