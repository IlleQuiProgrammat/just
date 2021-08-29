import { Button, Card, CardActions, CardContent, Grid, Typography, makeStyles } from '@material-ui/core';
import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Redirect } from 'react-router-dom/cjs/react-router-dom.min';
import { useGetSignInStatusQuery } from './services/auth';

const useStyles = makeStyles({
  card: {
    margin: '1rem',
  },
});

const Home = () => {
  const signInStatus = useGetSignInStatusQuery();
  const classes = useStyles();

  
  if (signInStatus.data === "student")
    return (
      <>
        <h1>Home</h1>
        <Grid container>
          <Grid item xs={12} sm={6}>
            <Card className={classes.card}>
              <CardContent>
                <Typography variant="h5" component="h2">
                  Create a Report
                </Typography>
                <Typography color="textSecondary">
                  Need to let someone know about something? Want to talk?
                </Typography>
              </CardContent>
              <CardActions>
                <Button component={RouterLink} size="small" to="/create">
                  Create
                </Button>
              </CardActions>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Card className={classes.card}>
              <CardContent>
                <Typography variant="h5" component="h2">
                  Check Report Status
                </Typography>
                <Typography color="textSecondary">
                  What's happened with that report?
                </Typography>
              </CardContent>
              <CardActions>
                <Button component={RouterLink} size="small" to="/my_reports">
                  Check
                </Button>
              </CardActions>
            </Card>
          </Grid>
        </Grid>
      </>
    );
  if (signInStatus.data === "school_admin")
    return (
      <>
        <h1>Home</h1>
        <Grid container spacing={1}>
          <Grid item xs={12} sm={6}>
            <Card className={classes.card}>
              <CardContent>
                <Typography variant="h5" component="h2">
                  Respond
                </Typography>
                <Typography color="textSecondary">
                  Respond to reports sent to you by your students.
                </Typography>
              </CardContent>
              <CardActions>
                <Button component={RouterLink} size="small" to="/reports">
                  Respond
                </Button>
              </CardActions>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Card className={classes.card}>
              <CardContent>
                <Typography variant="h5" component="h2">
                  Settings
                </Typography>
                <Typography color="textSecondary">
                  Configure your school's settings, questions and users.
                </Typography>
              </CardContent>
              <CardActions>
                <Button component={RouterLink} size="small" to="/school_settings">
                  Configure
                </Button>
              </CardActions>
            </Card>
          </Grid>
        </Grid>
      </>
    );
  return (
    <>
      <h1>Home</h1>
      <Grid container spacing={1}>
        <Grid item xs={12} sm={6}>
          <Card className={classes.card}>
            <CardContent>
              <Typography variant="h5" component="h2">
                Login
              </Typography>
              <Typography color="textSecondary">
                Login to your account.
              </Typography>
            </CardContent>
            <CardActions>
              <Button component={RouterLink} size="small" to="/login">
                login
              </Button>
            </CardActions>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Card className={classes.card}>
            <CardContent>
              <Typography variant="h5" component="h2">
                Register
              </Typography>
              <Typography color="textSecondary">
                Create an account.
              </Typography>
            </CardContent>
            <CardActions>
              <Button component={RouterLink} size="small" to="/register">
                Register
              </Button>
            </CardActions>
          </Card>
        </Grid>
      </Grid>
    </>
  );
}

export default Home;
