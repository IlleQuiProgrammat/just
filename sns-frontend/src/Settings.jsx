import React from 'react';
import { makeStyles, TableContainer, Paper, Table, TableHead, TableRow, TableCell, TableBody, TextField, Button, CircularProgress, Fade, Checkbox } from '@material-ui/core';
import { Link, Redirect } from 'react-router-dom';
import { useDemoteUserMutation, useGetSchoolUsersQuery, useGetSchoolSettingsQuery, usePromoteUserMutation } from './services/school';
import ErrorAlert from './components/ErrorAlert';
import { Alert } from '@material-ui/lab';
import { useGetAllShortQuestionsQuery, useSetQuestionActivityMutation } from './services/questions';
import { useGetSignInStatusQuery } from './services/auth';

const useStyles = makeStyles(theme => ({
  tf: {
    marginBottom: theme.spacing(2),
    width: '100%',
    maxWidth: 550
  }
}));

const Settings = () => {
  const classes = useStyles();
  const signInStatus = useGetSignInStatusQuery();
  const [demoteUser, demoteUserResponse] = useDemoteUserMutation();
  const [promoteUser, promoteUserRepsonse] = usePromoteUserMutation();
  const [setQuestionActivity, setQuestionActivityResponse] = useSetQuestionActivityMutation();
  const userRequest = useGetSchoolUsersQuery();
  const settingsRequest = useGetSchoolSettingsQuery();
  const questionsRequest = useGetAllShortQuestionsQuery();
  const anythingLoading = userRequest.isLoading || userRequest.isFetching
    || settingsRequest.isLoading || userRequest.isFetching || questionsRequest.isLoading
    || questionsRequest.isFetching;

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
      <ErrorAlert apiResult={questionsRequest} customTitle="Unknown error when retrieving questions list." />
      <ErrorAlert apiResult={setQuestionActivityResponse} customTitle="Unknown error when setting question activity." />
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
      <h1>Questions</h1>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                Question Name
              </TableCell>
              <TableCell>
                Active
              </TableCell>
              <TableCell>
                View
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {
              questionsRequest.data?.map(question => (
                <TableRow key={question.questionId}>
                  <TableCell>{question.name}</TableCell>
                  <TableCell>
                    <Checkbox
                      color="primary"
                      checked={question.active}
                      onChange={
                        ev => setQuestionActivity({
                          questionId: question.questionId,
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
                      to={`/view_question/${question.questionId}`}
                    >
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            }
          </TableBody>
        </Table>
        <Button
          variant="text"
          component={Link}
          to="/create_question"
          color="primary"
          style={{ width: '100%' }}
        >
          Create
        </Button>
      </TableContainer>
      <h1>Users</h1>
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
                    <Button variant="text" color="primary" onClick={() => demoteUser(user.id)}>
                      Demote from Staff
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
                    <Button variant="text" color="primary" onClick={() => promoteUser(user.id)}>
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
