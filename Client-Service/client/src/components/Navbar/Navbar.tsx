import React, { useState } from "react";
import "./Navbar.css";
import { Link, useNavigate } from "react-router-dom";
import { Stack } from "@mui/material";
import login from "../../assets/icons/login.png";
import logout from "../../assets/icons/logout.png";
import useAuth from "../../components/hooks/UseAuth";

const NavBar: React.FC = () => {
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();

  const isAuthenticated = useAuth();

  // Retrieve roles from localStorage
  const roles = JSON.parse(localStorage.getItem("roles") || "[]");

  // Role checks
  const isCustomer = roles.includes("CUSTOMER");
  const isAdminOrUser: boolean = roles.some((role: string) => role === "ADMIN" || role === "USER");

  const handleMouseEnter = () => {
    setShowDropdown(true);
  };

  const handleMouseLeave = () => {
    setShowDropdown(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userName");
    localStorage.removeItem("roles");
    localStorage.removeItem("permissions");
    localStorage.removeItem("userDetails");
    navigate("/"); // Redirect to the home page after logout
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
          {/* Hide Home if the user is a CUSTOMER or if the role is ADMIN/USER */}
          {!isCustomer && !isAdminOrUser && (
            <li>
              <Link to="/">Home</Link>
            </li>
          )}

          {/* Hide Dashboard if the role is ADMIN/USER */}
          {!isAdminOrUser && (
            <li>
              <Link to="/dashboard">Dashboard</Link>
            </li>
          )}

          <li>
            <Link to="/services">Services</Link>
          </li>

          {/* Hide Users if the user is a CUSTOMER */}
          {!isCustomer && (
            <li
              className="dropdown"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
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

          {!isAuthenticated && (
            <li>
              <button
                onClick={() => {
                  navigate("/login"); // Redirect to login page
                }}
                style={{ border: "none", background: "none" }}
              >
                <img
                  src={login}
                  alt="Login"
                  style={{ width: "40px", height: "40px" }}
                />
              </button>
            </li>
          )}

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
