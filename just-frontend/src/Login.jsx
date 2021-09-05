import { makeStyles, createStyles, TextField, Button } from '@material-ui/core';
import { useDispatch } from 'react-redux';
import React, { useState } from 'react';
import { Redirect } from 'react-router-dom/cjs/react-router-dom.min';
import { useGetSignInStatusQuery, useLoginMutation } from './services/auth';
import { signin } from './features/users/userSlice';
import ErrorAlert from './components/ErrorAlert';

const useStyles = makeStyles(theme =>
  createStyles({
    input: {
      margin: theme.spacing(1),
      width: '100%',
      maxWidth: 550,
    },
    submit: {
      margin: theme.spacing(1),
    },
  }),
);

const Login = () => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const signInStatus = useGetSignInStatusQuery();
  const [login, loginResult] = useLoginMutation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  if (signInStatus.data !== "none" && signInStatus.data) {
    return <Redirect to="/" />
  }
  
  return (
    <>
      <h1>Login</h1>
      <ErrorAlert apiResult={loginResult} customTitle="Could not sign in with the given credentials." />
      <TextField
        className={classes.input}
        label="Email" variant="outlined"
        name="email"
        onChange={(ev) => setEmail(ev.target.value)}
      />
      <br />
      <TextField
        className={classes.input}
        label="Password"
        variant="outlined"
        name="password"
        type="password"
        onChange={(ev) => setPassword(ev.target.value)}
      />
      <br />
      <Button
        variant="contained" 
        color="primary"
        className={classes.submit}
        onClick={
          () => login({ email, password }).then(({ data, error }) => {
            if (!error) dispatch(signin());
          })
        }
      >
        Login
      </Button>
    </>
  );
};

export default Login;
