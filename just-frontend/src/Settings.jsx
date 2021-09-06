import React from 'react';
import { makeStyles, TableContainer, Paper, Table, TableHead, TableRow, TableCell, TableBody, TextField, Button, CircularProgress, Fade, Checkbox } from '@material-ui/core';
import { Link, Redirect } from 'react-router-dom';
import { useGetSchoolUsersQuery, useGetSchoolSettingsQuery, usePromoteUserMutation, useDemoteUserMutation } from './services/school';
import ErrorAlert from './components/ErrorAlert';
import { Alert } from '@material-ui/lab';
import { useGetAllShortQuestionsQuery, useSetQuestionActivityMutation } from './services/questions';
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
  const [setQuestionActivity, setQuestionActivityResponse] = useSetQuestionActivityMutation();
  const userRequest = useGetSchoolUsersQuery();
  const settingsRequest = useGetSchoolSettingsQuery();
  const questionsRequest = useGetAllShortQuestionsQuery();
  const anythingLoading = userRequest.isLoading || userRequest.isFetching
    || settingsRequest.isLoading || userRequest.isFetching || questionsRequest.isLoading
    || questionsRequest.isFetching;
  
  const questionGroups = questionsRequest.data?.map(question => (question.topic)
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
              questionGroups.map(group => (
                <>
                <tr>
                  <td colspan="5" className={classes.tableSubHeading}>{group}</td>
                </tr>
                  {
                    questionsRequest.data?.filter(q => q.topic === group).map(question => (
                      <TableRow key={question.questionId}>
                        <TableCell>{question.name}</TableCell>
                        <TableCell>{question.codeName}</TableCell>
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
                        <TableCell>
                          <Button
                            variant="text"
                            color="primary"
                            component={Link}
                            to={`/edit_question/${question.questionId}`}
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
          to="/create_question"
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
