import React, { useState } from "react";
import "./Navbar.css";
import { Link, useNavigate } from "react-router-dom";
import { Stack } from "@mui/material";
import login from "../../assets/icons/login.png";
import logout from "../../assets/icons/logout.png";
import useAuth from "../../components/hooks/UseAuth";

const NavBar: React.FC = () => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showAdminDropdown, setShowAdminDropdown] = useState(false);
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const navigate = useNavigate();

  const isAuthenticated = useAuth();

  // Retrieve roles from localStorage
  const roles = JSON.parse(localStorage.getItem("roles") || "[]");
  const userName = localStorage.getItem("userName") || "User";

  // Role checks
  const isCustomer = roles.includes("CUSTOMER");
  const isAdmin = roles.some((role: string) => role === "ADMIN" || role === "USER");

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

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userName");
    localStorage.removeItem("roles");
    localStorage.removeItem("permissions");
    localStorage.removeItem("userDetails");
    navigate("/");
    window.location.reload();
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

          {/* Login Button */}
          {!isAuthenticated && (
            <li>
              <button
                onClick={() => {
                  navigate("/login");
                }}
                style={{ border: "none", background: "none", cursor: "pointer" }}
              >
                <img
                  src={login}
                  alt="Login"
                  style={{ width: "40px", height: "40px" }}
                />
              </button>
            </li>
          )}

          {/* Logout Button */}
          {isAuthenticated && (
            <li>
              <img
                src={logout}
                alt="Logout"
                style={{ width: "40px", height: "40px", cursor: "pointer" }}
                onClick={handleLogout}
              />
            </li>
          )}
        </ul>
      </div>
    </Stack>
  );
};

export default NavBar;
