import React, { useState } from 'react';
import { Box, List, ListItem, ListItemText, ListItemIcon, Divider, IconButton } from '@mui/material';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Dashboard, Person, AccountBalance, Payment, ExitToApp } from '@mui/icons-material';
import './Sidebar.css';

interface SidebarProps {
  onCollapse: (isCollapsed: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onCollapse }) => {
  const [collapsed, setCollapsed] = useState(false);

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
    onCollapse(!collapsed); // Notify parent component about collapse state
  };

  return (
    <Box
      className={`sidebar-container ${collapsed ? 'collapsed' : ''}`}
      sx={{
        width: collapsed ? '60px' : '250px',
        transition: 'all 0.3s ease',
      }}
    >
      <Box display="flex" justifyContent="flex-end" p={1}>
        <IconButton onClick={toggleSidebar} sx={{ color: 'white' }} aria-label={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}>
          {collapsed ? <ChevronRight /> : <ChevronLeft />}
        </IconButton>
      </Box>
      <List>
        <ListItem component={Link} to="/dashboard">
          <ListItemIcon sx={{ color: 'white' }}>
            <Dashboard />
          </ListItemIcon>
          <ListItemText primary={collapsed ? '' : 'Dashboard'} />
        </ListItem>
        <Divider sx={{ backgroundColor: 'white' }} />
        <ListItem component={Link} to="/profile">
          <ListItemIcon sx={{ color: 'white' }}>
            <Person />
          </ListItemIcon>
          <ListItemText primary={collapsed ? '' : 'Profile'} />
        </ListItem>
        <Divider sx={{ backgroundColor: 'white' }} />
        <ListItem component={Link} to="/account">
          <ListItemIcon sx={{ color: 'white' }}>
            <AccountBalance />
          </ListItemIcon>
          <ListItemText primary={collapsed ? '' : 'Account'} />
        </ListItem>
        <Divider sx={{ backgroundColor: 'white' }} />
        <ListItem component={Link} to="/transactions">
          <ListItemIcon sx={{ color: 'white' }}>
            <Payment />
          </ListItemIcon>
          <ListItemText primary={collapsed ? '' : 'Transactions'} />
        </ListItem>
        <Divider sx={{ backgroundColor: 'white' }} />
        <ListItem component={Link} to="/logout">
          <ListItemIcon sx={{ color: 'white' }}>
            <ExitToApp />
          </ListItemIcon>
          <ListItemText primary={collapsed ? '' : 'Logout'} />
        </ListItem>
      </List>
    </Box>
  );
};

export default Sidebar;
