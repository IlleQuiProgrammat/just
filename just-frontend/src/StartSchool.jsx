import { useState } from 'react';
import { Redirect } from "react-router";
import { useParams } from "react-router-dom";
import { Button, Link, Typography, Checkbox, TextField, makeStyles, createStyles } from '@material-ui/core';
import { useGetSignInStatusQuery } from "./services/auth";
import { useGetSchoolBySecretQuery, useStartSchoolMutation } from "./services/school";
import zxcvbn from 'zxcvbn';
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

const StartSchool = () => {
  const { data: signInStatus } = useGetSignInStatusQuery();
  const classes = useStyles();
  const { schoolSecret } = useParams();
  const schoolResult = useGetSchoolBySecretQuery(schoolSecret);
  const [startSchool, startSchoolResult] = useStartSchoolMutation();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [passwordResult, setPasswordResult] = useState({ score: 0 });
  const [tsAndCs, setTsAndCs] = useState(false);

  if (signInStatus && signInStatus !== "none") {
    return <Redirect to="/login" />
  }

  if (startSchoolResult.isSuccess) {
    return <Redirect to="/login" />;
  }

  return (
    <>
      <h1>Start a School</h1>
      <ErrorAlert
        apiResult={startSchoolResult}
        extractErrors={errors => errors?.map(code => code.description)}
      />
      <TextField
        className={classes.input}
        label="Name"
        variant="outlined"
        disabled
        value={schoolResult.data?.name ?? "Loading..."}
      />
      <br />
      <TextField
        className={classes.input}
        label="Domain"
        variant="outlined"
        disabled
        value={schoolResult.data?.emailDomain ?? "Loading..."}
      />
      <br />
      <TextField
        className={classes.input}
        label="School Email"
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
      <TextField
        className={classes.input}
        label="Confirm Password"
        variant="outlined"
        name="password_confirmation"
        type="password"
        onChange={ev => setPasswordConfirmation(ev.target.value)}
        error={password !== passwordConfirmation}
        helperText={password !== passwordConfirmation ? 'Passwords do not match' : undefined}
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
          startSchool({
            secret: schoolSecret,
            email,
            password,
            tsAndCs,
          })
        }}
        disabled={
          passwordResult.score < 3
          || !tsAndCs
          || email === ''
          || password !== passwordConfirmation
        }
      >
        Start School
      </Button>
    </>
  );
}

export default StartSchool;
