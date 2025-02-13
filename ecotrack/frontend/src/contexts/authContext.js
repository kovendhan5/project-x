import React, { createContext, useContext, useCallback } from 'react';
import { useAuth0 } from '@auth0/auth0-react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const {
    isAuthenticated,
    isLoading,
    user,
    getAccessTokenSilently,
    loginWithRedirect,
    logout
  } = useAuth0();

  const getToken = useCallback(async () => {
    try {
      return await getAccessTokenSilently({
        audience: process.env.REACT_APP_AUTH0_AUDIENCE,
      });
    } catch (error) {
      console.error('Error getting access token:', error);
      return null;
    }
  }, [getAccessTokenSilently]);

  const hasPermission = useCallback((requiredPermission) => {
    if (!user) return false;
    const permissions = user[`${process.env.REACT_APP_AUTH0_AUDIENCE}/permissions`] || [];
    return permissions.includes(requiredPermission);
  }, [user]);

  const hasRole = useCallback((requiredRole) => {
    if (!user) return false;
    const roles = user[`${process.env.REACT_APP_AUTH0_AUDIENCE}/roles`] || [];
    return roles.includes(requiredRole);
  }, [user]);

  const getUserRoles = useCallback(() => {
    if (!user) return [];
    return user[`${process.env.REACT_APP_AUTH0_AUDIENCE}/roles`] || [];
  }, [user]);

  const getUserPermissions = useCallback(() => {
    if (!user) return [];
    return user[`${process.env.REACT_APP_AUTH0_AUDIENCE}/permissions`] || [];
  }, [user]);

  const isAdmin = useCallback(() => {
    return hasRole('admin');
  }, [hasRole]);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        user,
        getToken,
        hasPermission,
        hasRole,
        getUserRoles,
        getUserPermissions,
        isAdmin,
        login: loginWithRedirect,
        logout: () => logout({ returnTo: window.location.origin })
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};