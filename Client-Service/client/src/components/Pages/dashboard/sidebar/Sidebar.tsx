import React, { useState } from 'react';
import { Box, List, ListItem, ListItemText, ListItemIcon, Divider, IconButton } from '@mui/material';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Dashboard, Person, AccountBalance, Payment, ExitToApp, Assessment, People, Assignment, History as HistoryIcon } from '@mui/icons-material';
import './Sidebar.css';

interface SidebarProps {
  onCollapse: (isCollapsed: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onCollapse }) => {
  const [collapsed, setCollapsed] = useState(false);
  const rolesRaw = localStorage.getItem('roles');
  const roles: string[] = rolesRaw ? JSON.parse(rolesRaw) : [];
  const isAdmin = roles.includes('ADMIN');
  const isCustomer = roles.includes('CUSTOMER');

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
        <SidebarItem to="/dashboard" icon={<Dashboard />} text="Dashboard" collapsed={collapsed} />
        <SidebarItem to="/profile" icon={<Person />} text="Profile" collapsed={collapsed} />

        {isCustomer && (
          <>
            <Divider sx={{ backgroundColor: 'rgba(255,255,255,0.1)', my: 1 }} />
            <SidebarItem to="/accounts" icon={<AccountBalance />} text="My Accounts" collapsed={collapsed} />
            <SidebarItem to="/transfer" icon={<Payment />} text="Transfer Money" collapsed={collapsed} />
            <SidebarItem to="/transactions" icon={<HistoryIcon />} text="Activity History" collapsed={collapsed} />
          </>
        )}

        {isAdmin && (
          <>
            <Divider sx={{ backgroundColor: 'rgba(255,255,255,0.1)', my: 1 }} />
            <SidebarItem to="/admin/dashboard" icon={<Assessment />} text="System Overview" collapsed={collapsed} />
            <SidebarItem to="/admin/users" icon={<People />} text="User Management" collapsed={collapsed} />
            <SidebarItem to="/admin/audit" icon={<Assignment />} text="Audit Center" collapsed={collapsed} />
          </>
        )}

        <Divider sx={{ backgroundColor: 'rgba(255,255,255,0.1)', my: 1 }} />
        <SidebarItem to="/logout" icon={<ExitToApp />} text="Logout" collapsed={collapsed} />
      </List>
    </Box>
  );
};

interface SidebarItemProps {
  to: string;
  icon: React.ReactNode;
  text: string;
  collapsed: boolean;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ to, icon, text, collapsed }) => (
  <ListItem component={Link} to={to}>
    <ListItemIcon sx={{ color: 'white' }}>{icon}</ListItemIcon>
    {!collapsed && <ListItemText primary={text} sx={{ color: 'white' }} />}
  </ListItem>
);

export default Sidebar;
