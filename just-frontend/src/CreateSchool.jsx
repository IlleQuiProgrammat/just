import { TextField, makeStyles, createStyles, Button, Link } from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import { useState } from 'react';
import { Link as RouterLink, Redirect } from 'react-router-dom';
import ErrorAlert from './components/ErrorAlert';
import { useGetSignInStatusQuery } from './services/auth';
import { useCreateSchoolMutation } from './services/school';

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

const CreateSchool = () => {
  const classes = useStyles();
  const { data: signInStatus } = useGetSignInStatusQuery();
  const [createSchool, createSchoolResult] = useCreateSchoolMutation();
  const [name, setName] = useState("");
  const [domain, setDomain] = useState("");

  if (signInStatus && signInStatus !== "admin") {
    return <Redirect to="/login" />
  }

  if (createSchoolResult.isSuccess) {
    const url = createSchoolResult.data;
    return (
      <Alert severity="success" title="School Creation Success">
        The creation interface can be accessed at
        <Link component={RouterLink} to={`/start_school/${url}`}>
          &nbsp;/start_school/{url}
        </Link>
      </Alert>
    );
  }

  return (
    <>
      <h1>Create a School</h1>
      <ErrorAlert apiResult={createSchoolResult} />
      <TextField
        className={classes.input}
        label="Name"
        variant="outlined"
        onChange={(ev) => setName(ev.target.value)}
      />
      <br />
      <TextField
        className={classes.input}
        label="Domain"
        variant="outlined"
        onChange={(ev) => setDomain(ev.target.value)}
      />
      <br />
      <Button
        variant="contained"
        color="primary"
        onClick={() => {
          createSchool({
            name,
            emailDomain: domain,
            studentLimit: 9999999,
          })
        }}
      >Create</Button>
    </>
  );
}

export default CreateSchool;
