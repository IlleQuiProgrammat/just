import { Button, Card, CardActions, CardContent, Grid, Typography, makeStyles } from '@material-ui/core';
import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Redirect } from 'react-router-dom/cjs/react-router-dom.min';
import { useGetSignInStatusQuery } from './services/auth';

const useStyles = makeStyles({
  card: {
    width: 275,
    marginRight: 20
  },
});

const Home = () => {
  const signInStatus = useGetSignInStatusQuery();
  const classes = useStyles();

  if (signInStatus.data === "none")
    return (
      <Redirect to="/login" />
    );
  if (signInStatus.data === "student")
    return (
      <>
        <h1>Home</h1>
        <Grid container justifyContent="flex-start" spacing={2} wrap="wrap">
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
      </>
    );
  if (signInStatus.data === "school_admin")
    return (
      <>
        <h1>Home</h1>
        <Grid container justifyContent="center" spacing={2}>
        <Grid container justifyContent="flex-start" spacing={2} wrap="wrap">
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
  return <></>
}

export default Home;
