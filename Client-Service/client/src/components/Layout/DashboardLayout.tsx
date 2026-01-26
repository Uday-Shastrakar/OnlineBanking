import React from 'react';
import { Box } from '@mui/material';
import { useSidebar } from '../../contexts/SidebarContext';
import Sidebar from '../Pages/dashboard/sidebar/Sidebar';

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, title, subtitle }) => {
  const { collapsed } = useSidebar();

  return (
    <Box className="dashboard-layout">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main Content */}
      <Box className={`dashboard-content ${collapsed ? 'collapsed' : ''}`}>
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
};

export default DashboardLayout;
