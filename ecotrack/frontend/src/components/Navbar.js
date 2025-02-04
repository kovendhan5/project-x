import EcoIcon from '@mui/icons-material/Eco';
import { AppBar, Button, IconButton, Toolbar, Typography } from '@mui/material';
import React from 'react';

const Navbar = () => {
  return (
    <AppBar position="static">
      <Toolbar>
        <IconButton color="inherit" edge="start">
          <EcoIcon/>
        </IconButton>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          EcoTrack
        </Typography>
        <Button color="inherit" href="/">Home</Button>
        <Button color="inherit" href="/dashboard">Dashboard</Button>
        <Button color="inherit" href="/news">News</Button>
        <Button color="inherit" href="/auth">Login</Button>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;