import { AppBar, Toolbar, Zoom, useScrollTrigger, makeStyles, Fab, Drawer, Button, IconButton, List, ListItem, ListItemText, ListItemIcon } from '@material-ui/core';
import { Assignment, Close, Home, KeyboardArrowUp, Menu as MenuIcon, NoteAdd, Settings } from '@material-ui/icons';
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { signout } from '../features/users/userSlice';
import { useGetSignInStatusQuery, useLogoutMutation } from '../services/auth';

const useStyles = makeStyles(theme => ({
  root: {
    position: 'fixed',
    bottom: theme.spacing(2),
    right: theme.spacing(2),
  },
  toolbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  left: {
    display: 'flex'
  },
  drawer: {
    minWidth: 250
  }
}));

const Header = () => {
  const { data: signInStatus } = useGetSignInStatusQuery();
  const dispatch = useDispatch();
  const classes = useStyles();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [logout] = useLogoutMutation();

  const elevationTrigger = useScrollTrigger({
    disableHysteresis: true,
    threshold: 0
  });

  const returnTrigger = useScrollTrigger({
    disableHysteresis: true,
    threshold: 100
  });

  return (
    <>
      <div id="top-anchor" />
      <AppBar elevation={elevationTrigger ? 4 : 0}>
        <Toolbar className={classes.toolbar}>
          <div className={classes.left}>
            <IconButton
              edge="start"
              className={classes.menuButton}
              color="inherit" aria-label="menu"
              onClick={() => setDrawerOpen(!drawerOpen)}
            >
              <MenuIcon />
            </IconButton>
            <h2>
              Spot and Stop
            </h2>
          </div>
          <div className={classes.right}>
            {
              signInStatus !== "none" && signInStatus
                ? (
                  <Button color="inherit" onClick={() => {
                    logout().then(({ data, error }) => {
                      if (!error) dispatch(signout());
                    })
                  }}>
                    Logout
                  </Button>
                )
                : (
                  <>
                    <Button color="inherit" component={Link} to="/login">Login</Button>
                    <Button color="inherit" component={Link} to="/register">Register</Button>
                  </>
                )
            }
          </div>
        </Toolbar>
        <Zoom in={returnTrigger}>
          <div
            onClick={() => {
              document.querySelector('#top-anchor')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }}
            role="presentation"
            className={classes.root}
          >
            <Fab color="secondary" size="small" aria-label="scroll back to top">
              <KeyboardArrowUp />
            </Fab>
          </div>
        </Zoom>
      </AppBar>
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={() => drawerOpen ? setDrawerOpen(false) : null}
      >
        <List className={classes.drawer}>
          <ListItem button onClick={() => setDrawerOpen(false)}>
            <ListItemIcon><Close /></ListItemIcon>
            <ListItemText primary="Close" />
          </ListItem>
          <ListItem button component={Link} to="/" onClick={() => setDrawerOpen(false)}>
            <ListItemIcon><Home /></ListItemIcon>
            <ListItemText primary="Home" />
          </ListItem>
          {
            signInStatus === "student" ? (
              <>
                <ListItem button component={Link} to="/my_reports" onClick={() => setDrawerOpen(false)}>
                  <ListItemIcon><Assignment /></ListItemIcon>
                  <ListItemText primary="My Reports" />
                </ListItem>
                <ListItem button component={Link} to="/create" onClick={() => setDrawerOpen(false)}>
                  <ListItemIcon><NoteAdd /></ListItemIcon>
                  <ListItemText primary="Create Report" />
                </ListItem>
              </>
            ) : null
          }
          {
            signInStatus === "school_admin" ? (
              <>
                <ListItem button component={Link} to="/reports" onClick={() => setDrawerOpen(false)}>
                  <ListItemIcon><Assignment /></ListItemIcon>
                  <ListItemText primary="All School Reports" />
                </ListItem>
                <ListItem button component={Link} to="/school_settings" onClick={() => setDrawerOpen(false)}>
                  <ListItemIcon><Settings /></ListItemIcon>
                  <ListItemText primary="School Settings" />
                </ListItem>
              </>
            ) : null
          }
        </List>
      </Drawer>
    </>
  );
}

export default Header;
