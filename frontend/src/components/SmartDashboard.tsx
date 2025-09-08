import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Box, CircularProgress } from '@mui/material';

const SmartDashboard: React.FC = () => {
  const { user, loading } = useAuth();

  useEffect(() => {
    console.log('SmartDashboard - User:', user);
    console.log('SmartDashboard - UserType:', user?.userType);
    console.log('SmartDashboard - Loading:', loading);
  }, [user, loading]);

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '50vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // Redirect based on user type
  if (user?.userType === 'builder') {
    console.log('SmartDashboard - Redirecting to builder dashboard');
    return <Navigate to="/app/builder/dashboard" replace />;
  }

  // Default to homeowner dashboard
  console.log('SmartDashboard - Redirecting to homeowner projects');
  return <Navigate to="/app/projects" replace />;
};

export default SmartDashboard;
