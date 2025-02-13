import { useAuth0 } from '@auth0/auth0-react';
import { Navigate } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';

const ProtectedRoute = ({ children, requiredRole }) => {
  const { isAuthenticated, isLoading, user } = useAuth0();

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" />;
  }

  // Check for required role if specified
  if (requiredRole && user) {
    const userRoles = user[`${process.env.REACT_APP_AUTH0_AUDIENCE}/roles`] || [];
    if (!userRoles.includes(requiredRole)) {
      return <Navigate to="/" />;
    }
  }

  return children;
};