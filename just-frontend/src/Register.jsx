import { makeStyles, createStyles, TextField, Button, Checkbox, Typography, Link } from '@material-ui/core';
import React, { useState } from 'react';
import { Redirect } from 'react-router-dom';
import ErrorAlert from './components/ErrorAlert';
import { useGetSignInStatusQuery, useRegisterMutation } from './services/auth';
import zxcvbn from 'zxcvbn';

const useStyles = makeStyles(theme =>
  createStyles({
    input: {
      margin: theme.spacing(1),
      width: '100%',
      maxWidth: 550
    },
    submit: {
      margin: theme.spacing(1),
    }
  }),
);

const Register = ({ history }) => {
  const classes = useStyles();
  const [email, setEmail] = useState('');
  const signInStatus = useGetSignInStatusQuery();
  const [password, setPassword] = useState('');
  const [passwordResult, setPasswordResult] = useState({ score: 0 });
  const [tsAndCs, setTsAndCs] = useState(false);
  const [register, registerResult] = useRegisterMutation();

  if (signInStatus.data !== "none" && signInStatus.data) {
    return <Redirect to="/" />
  }

  if (registerResult.isSuccess) {
    return <Redirect to="/login" />
  }

  return (
    <>
      <h1>Register</h1>
      <ErrorAlert apiResult={registerResult} extractErrors={errors => errors?.map(code => code.description)} />
      <TextField
        className={classes.input}
        label="Email"
        variant="outlined"
        name="email"
        onChange={ev => setEmail(ev.target.value)}
      />
      <br />
      <TextField
        className={classes.input}
        label="Password"
        variant="outlined"
        name="password"
        type="password"
        onChange={ev => {
          setPassword(ev.target.value);
          setPasswordResult(zxcvbn(ev.target.value, [email]));
        }}
        error={passwordResult.score < 3 && password !== ''}
        helperText={passwordResult.score < 4 && password !== '' ? (
          <div>
            <p>This password is weak.</p>
            <strong>{passwordResult.feedback.warning}</strong>
            <ul>
              {
                passwordResult.feedback.suggestions.map(suggestion => (
                  <li>{suggestion}</li>
                ))
              }
            </ul>
          </div>
        ) : undefined}
      />
      <br />
      <Checkbox
        label="I agree to the terms and conditions"
        color="primary"
        onChange={ev => setTsAndCs(ev.target.checked)}
      />
      <span>
        <Typography variant="p">
          I agree to the
          {' '}
          <Link>Terms and Conditions</Link>
          .
        </Typography>
      </span>
      <br />
      <Button
        variant="contained"
        color="primary"
        className={classes.submit}
        onClick={() => {
          register({ email, password, tsAndCs })
        }}
        disabled={passwordResult.score < 3 || !tsAndCs || email === ''}
      >
        Register
      </Button>
    </>
  );
};

export default Register;
