import React from 'react';
import { Box, List, ListItem, ListItemText, ListItemIcon, Divider, IconButton } from '@mui/material';
import { Link } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  Dashboard,
  Person,
  AccountBalance,
  Payment,
  ExitToApp,
  Assessment,
  People,
  Assignment,
  History as HistoryIcon,
  CreditCard,
  MonetizationOn,
  Help
} from '@mui/icons-material';
import { useSidebar } from '../../../../contexts/SidebarContext';
import './Sidebar.css';

const Sidebar: React.FC = () => {
  const { collapsed, toggleSidebar } = useSidebar();
  const rolesRaw = localStorage.getItem('roles');
  const roles: string[] = rolesRaw ? JSON.parse(rolesRaw) : [];
  const isAdmin = roles.includes('ADMIN');
  const isCustomer = roles.includes('CUSTOMER_USER') || roles.includes('CUSTOMER'); // Support both old and new role names

  // Hide normal sidebar for admin users
  if (isAdmin) {
    return null;
  }

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
            <SidebarItem to="/cards" icon={<CreditCard />} text="Cards" collapsed={collapsed} />
            <SidebarItem to="/loans" icon={<MonetizationOn />} text="Loans" collapsed={collapsed} />
            <SidebarItem to="/transfer" icon={<Payment />} text="Transfer Money" collapsed={collapsed} />
            <SidebarItem to="/transactions" icon={<HistoryIcon />} text="Activity History" collapsed={collapsed} />
            <SidebarItem to="/support" icon={<Help />} text="Help & Support" collapsed={collapsed} />
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
