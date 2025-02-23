import { useAuth0 } from '@auth0/auth0-react';
import DashboardIcon from '@mui/icons-material/Dashboard';
import HomeIcon from '@mui/icons-material/Home';
import NewspaperIcon from '@mui/icons-material/Newspaper';
import PersonIcon from '@mui/icons-material/Person';
import { AppBar, Box, Button, Container, IconButton, Menu, MenuItem, Toolbar, Typography } from '@mui/material';
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
  const location = useLocation();
  const [mobileMenu, setMobileMenu] = useState(null);
  const { isAuthenticated, loginWithRedirect, logout, user } = useAuth0();

  const menuItems = [
    { text: 'Home', path: '/', icon: <HomeIcon /> },
    { text: 'Dashboard', path: '/dashboard', icon: <DashboardIcon />, protected: true },
    { text: 'News', path: '/news', icon: <NewspaperIcon /> },
  ];

  const handleLogout = () => {
    logout({ returnTo: window.location.origin });
  };

  return (
    <AppBar position="sticky" elevation={0} sx={{ backgroundColor: 'background.paper' }}>
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          <Typography
            variant="h6"
            component={Link}
            to="/"
            sx={{
              mr: 4,
              display: 'flex',
              fontWeight: 700,
              color: 'primary.main',
              textDecoration: 'none',
              alignItems: 'center',
              '&:hover': {
                color: 'primary.dark',
              },
            }}
          >
            🌱 EcoTrack
          </Typography>

          {/* Desktop Menu */}
          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
            {menuItems.map((item) => (
              (!item.protected || isAuthenticated) && (
                <Button
                  key={item.text}
                  component={Link}
                  to={item.path}
                  startIcon={item.icon}
                  sx={{
                    mx: 1,
                    color: location.pathname === item.path ? 'primary.main' : 'text.primary',
                    '&:hover': {
                      backgroundColor: 'rgba(46, 125, 50, 0.08)',
                    },
                  }}
                >
                  {item.text}
                </Button>
              )
            ))}
          </Box>

          {/* Auth Buttons */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 2 }}>
            {isAuthenticated ? (
              <>
                <Typography variant="body2" color="text.secondary">
                  {user?.name}
                </Typography>
                <Button
                  onClick={handleLogout}
                  variant="outlined"
                  color="primary"
                >
                  Logout
                </Button>
              </>
            ) : (
              <Button
                onClick={() => loginWithRedirect()}
                variant="contained"
                color="primary"
                startIcon={<PersonIcon />}
              >
                Sign In
              </Button>
            )}
          </Box>

          {/* Mobile Menu */}
          <Box sx={{ display: { xs: 'flex', md: 'none' } }}>
            <IconButton
              size="large"
              onClick={(e) => setMobileMenu(e.currentTarget)}
              color="inherit"
            >
              <svg width="24" height="24" viewBox="0 0 24 24">
                <path fill="currentColor" d="M3,6H21V8H3V6M3,11H21V13H3V11M3,16H21V18H3V16Z" />
              </svg>
            </IconButton>
            <Menu
              anchorEl={mobileMenu}
              open={Boolean(mobileMenu)}
              onClose={() => setMobileMenu(null)}
              sx={{
                display: { xs: 'block', md: 'none' },
              }}
            >
              {menuItems.map((item) => (
                (!item.protected || isAuthenticated) && (
                  <MenuItem
                    key={item.text}
                    component={Link}
                    to={item.path}
                    onClick={() => setMobileMenu(null)}
                    sx={{
                      color: location.pathname === item.path ? 'primary.main' : 'text.primary',
                    }}
                  >
                    <Box sx={{ mr: 1 }}>{item.icon}</Box>
                    {item.text}
                  </MenuItem>
                )
              ))}
              {isAuthenticated ? (
                <MenuItem onClick={handleLogout}>
                  <Box sx={{ mr: 1 }}><PersonIcon /></Box>
                  Logout
                </MenuItem>
              ) : (
                <MenuItem onClick={() => loginWithRedirect()}>
                  <Box sx={{ mr: 1 }}><PersonIcon /></Box>
                  Sign In
                </MenuItem>
              )}
            </Menu>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navbar;