import React from 'react';
import { makeStyles, TableContainer, Paper, Table, TableHead, TableRow, TableCell, TableBody, TextField, Button, CircularProgress, Fade, Checkbox } from '@material-ui/core';
import { Link, Redirect } from 'react-router-dom';
import { useGetSchoolUsersQuery, useGetSchoolSettingsQuery, usePromoteUserMutation, useDemoteUserMutation } from './services/school';
import ErrorAlert from './components/ErrorAlert';
import { Alert } from '@material-ui/lab';
import { useGetAllShortFormsQuery, useSetFormActivityMutation } from './services/forms';
import { useGetKeysQuery, useGetSignInStatusQuery } from './services/auth';

const useStyles = makeStyles(theme => ({
  tf: {
    marginBottom: theme.spacing(2),
    width: '100%',
    maxWidth: 550
  },
  tableSubHeading: {
    fontWeight: 'bold',
    padding: theme.spacing(1),
    backgroundColor: 'rgba(224, 224, 224, 0.8)', //'1px #E0E0E0 solid'
  }
}));

const Settings = () => {
  const classes = useStyles();
  const signInStatus = useGetSignInStatusQuery();
  const { data: keys } = useGetKeysQuery();
  const [promoteUser, promoteUserRepsonse] = usePromoteUserMutation();
  const [demoteUser, demoteUserResponse] = useDemoteUserMutation();
  const [setFormActivity, setFormActivityResponse] = useSetFormActivityMutation();
  const userRequest = useGetSchoolUsersQuery();
  const settingsRequest = useGetSchoolSettingsQuery();
  const formsRequest = useGetAllShortFormsQuery();
  const anythingLoading = userRequest.isLoading || userRequest.isFetching
    || settingsRequest.isLoading || userRequest.isFetching || formsRequest.isLoading
    || formsRequest.isFetching;
  
  const formGroups = formsRequest.data?.map(form => (form.topic)
    ).sort(
    ).filter((v, i, arr) => i === 0 || arr[i-1] !== v) ?? [];

  if (signInStatus.data !== "school_admin" && signInStatus.data) {
    return <Redirect to="/login" />
  }

  return (
    <>
      <Fade
        in={anythingLoading}
        style={{
          transitionDelay: anythingLoading ? '800ms' : '0ms',
          position: 'absolute',
          left: '50%',
          transform: 'translateX(-50%)'
        }}
      >
        <div>
          <CircularProgress value={anythingLoading ? undefined : 0} />
        </div>
      </Fade>
      <h1>Settings</h1>
      <ErrorAlert apiResult={demoteUserResponse} customTitle="Unknown error when demoting user." />
      <ErrorAlert apiResult={promoteUserRepsonse} customTitle="Unknown error when promoting user." />
      <ErrorAlert apiResult={settingsRequest} customTitle="Unknown error when retrieving settings." />
      <ErrorAlert apiResult={userRequest} customTitle="Unknown error when retrieving user list." />
      <ErrorAlert apiResult={formsRequest} customTitle="Unknown error when retrieving forms list." />
      <ErrorAlert apiResult={setFormActivityResponse} customTitle="Unknown error when setting form activity." />
      <TextField
        variant="outlined"
        value={settingsRequest.data?.name ?? 'Loading...'}
        disabled
        label="School Name"
        className={classes.tf}
      />
      <br />
      <TextField
        variant="outlined"
        disabled
        label="Configured Email Domain"
        className={classes.tf}
        value={settingsRequest.data?.emailDomain ?? 'Loading...'}
      />
      <h1>Forms</h1>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                Form Name
              </TableCell>
              <TableCell>
                Code Name
              </TableCell>
              <TableCell>
                Active
              </TableCell>
              <TableCell>
                View
              </TableCell>
              <TableCell>
                Edit
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {
              formGroups.map(group => (
                <>
                <tr>
                  <td colspan="5" className={classes.tableSubHeading}>{group}</td>
                </tr>
                  {
                    formsRequest.data?.filter(q => q.topic === group).map(form => (
                      <TableRow key={form.formId}>
                        <TableCell>{form.name}</TableCell>
                        <TableCell>{form.codeName}</TableCell>
                        <TableCell>
                          <Checkbox
                            color="primary"
                            checked={form.active}
                            onChange={
                              ev => setFormActivity({
                                formId: form.formId,
                                activity: ev.target.checked
                              })
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="text"
                            color="primary"
                            component={Link}
                            to={`/view_form/${form.formId}`}
                          >
                            View
                          </Button>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="text"
                            color="primary"
                            component={Link}
                            to={`/edit_form/${form.formId}`}
                          >
                            Edit
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  }
                </>
              ))
            }
          </TableBody>
        </Table>
        <Button
          variant="text"
          component={Link}
          to="/create_form"
          color="primary"
          style={{ width: '100%' }}
        >
          Create
        </Button>
      </TableContainer>
      <h1>Users</h1>
      <Alert severity="warning">
        Although demotion removes the user&rsquo;s ability to view reports and users, they could
        theoretically retain the private key shared with them during promotion which could be used
        if unfettered access to the database is obtained. Therefore, take caution promoting users.
      </Alert>
      <h2>Staff</h2>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                Email
              </TableCell>
              <TableCell />
            </TableRow>
          </TableHead>
          <TableBody>
            {
              userRequest.data?.filter(user => user.role > 1).map(user => (
                <TableRow key={user.id}>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Button
                    variant="text"
                    color="primary"
                    onClick={() => demoteUser(user.id)}
                    >
                      Demote From Staff
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            }
          </TableBody>
        </Table>
      </TableContainer>
      <h2>Students</h2>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                Email
              </TableCell>
              <TableCell />
            </TableRow>
          </TableHead>
          <TableBody>
          {
              userRequest.data?.filter(user => user.role <= 1).map(user => (
                <TableRow key={user.id}>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Button variant="text" color="primary" onClick={() => promoteUser(
                      {
                        userId: user.id,
                        encodedUserPublicKey: user.publicKey,
                        schoolPrivateKey: keys.schoolPrivateKey
                      })}>
                      Promote to Staff
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            }
          </TableBody>
        </Table>
        {
          userRequest.data?.some(user => user.role <= 1) || !userRequest.data
            ? null
            : <Alert severity="info">No students have signed up yet.</Alert>
        }
      </TableContainer>
    </>
  );
};

export default Settings;
