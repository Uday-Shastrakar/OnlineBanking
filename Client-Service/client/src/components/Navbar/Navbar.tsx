import React, { useState, useEffect } from "react";
import "./Navbar.css";
import { Link, useNavigate } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Avatar,
  Menu,
  MenuItem,
  Box,
  IconButton,
  Tooltip,
  Badge,
  Chip,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent
} from "@mui/material";
import {
  AccountCircle,
  Logout,
  Settings,
  Notifications,
  Home,
  Person,
  Menu as MenuIcon,
  AccountBalance
} from "@mui/icons-material";
import AuthStorage from "../../services/authStorage";
import { logout } from "../../services/authService";
import NotificationDropdown from "../Notifications/NotificationDropdown";
import NotificationCenter from "../Notifications/NotificationCenter";
import NotificationPreferences from "../Notifications/NotificationPreferences";

const NavBar: React.FC = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [mobileMenuAnchor, setMobileMenuAnchor] = useState<null | HTMLElement>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [notificationDialogOpen, setNotificationDialogOpen] = useState(false);
  const [preferencesDialogOpen, setPreferencesDialogOpen] = useState(false);
  const navigate = useNavigate();

  // Check authentication status
  const isAuthenticated = AuthStorage.isAuthenticated();
  const userRoles = AuthStorage.getRoles();
  const userName = AuthStorage.getUser()?.userName || "User";

  // Role checks
  const isCustomer = userRoles.includes("CUSTOMER");
  const isAdmin = userRoles.includes("ADMIN");

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleMobileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMobileMenuAnchor(event.currentTarget);
  };

  const handleMobileMenuClose = () => {
    setMobileMenuAnchor(null);
  };



  const handleLogout = () => {
    logout();
    handleMenuClose();
    navigate("/");
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    handleMenuClose();
    handleMobileMenuClose();
  };

  return (
    <AppBar
      position="fixed"
      className={`navbar ${isScrolled ? 'scrolled' : ''}`}
      elevation={isScrolled ? 4 : 0}
    >
      <Toolbar className="navbar-toolbar">
        {/* Logo and Brand - Leftmost Position */}
        <Box className="navbar-brand">
          <Link to="/" className="brand-link">
            <AccountBalance className="brand-logo" />
            <Typography variant="h6" className="brand-text">
              <span className="nums">NUMS</span> Bank
            </Typography>
          </Link>
        </Box>

        {/* Right Side Actions - Only Home and Login */}
        <Box className="navbar-actions">
          {isAuthenticated ? (
            <>
              {/* Notifications */}
              <NotificationDropdown
                onOpenNotificationCenter={() => setNotificationDialogOpen(true)}
                onOpenPreferences={() => setPreferencesDialogOpen(true)}
              />

              {/* User Menu */}
              <Button
                onClick={handleMenuOpen}
                className="user-menu-button"
                startIcon={
                  <Avatar className="user-avatar">
                    {userName.charAt(0).toUpperCase()}
                  </Avatar>
                }
              >
                <Box className="user-info">
                  <Typography variant="body2" className="user-name">
                    {userName}
                  </Typography>
                  <Chip
                    label={isCustomer ? "Customer" : isAdmin ? "Admin" : "Staff"}
                    size="small"
                    className="role-chip"
                  />
                </Box>
              </Button>

              {/* User Dropdown Menu */}
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                className="user-menu"
                PaperProps={{
                  elevation: 8,
                  sx: { mt: 1, minWidth: 200 }
                }}
              >
                <MenuItem onClick={() => handleNavigation("/profile")}>
                  <Person sx={{ mr: 2 }} />
                  Profile
                </MenuItem>
                <MenuItem onClick={() => handleNavigation("/settings")}>
                  <Settings sx={{ mr: 2 }} />
                  Settings
                </MenuItem>
                <Divider />
                <MenuItem onClick={handleLogout}>
                  <Logout sx={{ mr: 2 }} />
                  Logout
                </MenuItem>
              </Menu>
            </>
          ) : (
            /* Only Home and Login Buttons */
            <>
              {/* Home Button */}
              <Button
                variant="outlined"
                onClick={() => navigate("/")}
                className="home-button"
                startIcon={<Home />}
              >
                Home
              </Button>

              {/* Login Button */}
              <Button
                variant="outlined"
                onClick={() => navigate("/login")}
                className="login-button"
                startIcon={<AccountCircle />}
              >
                Login
              </Button>
            </>
          )}

          {/* Mobile Menu */}
          <IconButton
            className="mobile-menu-button mobile-only"
            onClick={handleMobileMenuOpen}
          >
            <MenuIcon />
          </IconButton>
        </Box>

        {/* Mobile Menu */}
        <Menu
          anchorEl={mobileMenuAnchor}
          open={Boolean(mobileMenuAnchor)}
          onClose={handleMobileMenuClose}
          className="mobile-menu"
          PaperProps={{
            elevation: 8,
            sx: { mt: 1, minWidth: 250 }
          }}
        >
          {!isAuthenticated ? [
            <MenuItem key="home" onClick={() => handleNavigation("/")}>
              <Home sx={{ mr: 2 }} />
              Home
            </MenuItem>,
            <MenuItem key="login" onClick={() => handleNavigation("/login")}>
              <AccountCircle sx={{ mr: 2 }} />
              Login
            </MenuItem>
          ] : [
            <MenuItem key="profile" onClick={() => handleNavigation("/profile")}>
              <Person sx={{ mr: 2 }} />
              Profile
            </MenuItem>,
            <MenuItem key="settings" onClick={() => handleNavigation("/settings")}>
              <Settings sx={{ mr: 2 }} />
              Settings
            </MenuItem>,
            <Divider key="divider" />,
            <MenuItem key="logout" onClick={handleLogout}>
              <Logout sx={{ mr: 2 }} />
              Logout
            </MenuItem>
          ]}
        </Menu>
      </Toolbar>

      {/* Notification Center Dialog */}
      <Dialog
        open={notificationDialogOpen}
        onClose={() => setNotificationDialogOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { height: '80vh', maxHeight: 600 }
        }}
      >
        <DialogTitle>Notifications</DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          <NotificationCenter
            onPreferencesClick={() => {
              setNotificationDialogOpen(false);
              setPreferencesDialogOpen(true);
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Notification Preferences Dialog */}
      <Dialog
        open={preferencesDialogOpen}
        onClose={() => setPreferencesDialogOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { height: '80vh', maxHeight: 600 }
        }}
      >
        <DialogTitle>Notification Preferences</DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          <NotificationPreferences
            onBack={() => {
              setPreferencesDialogOpen(false);
              setNotificationDialogOpen(true);
            }}
          />
        </DialogContent>
      </Dialog>
    </AppBar>
  );
};

export default NavBar;
