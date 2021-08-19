import React from 'react';
import { TableContainer, Paper, Table, TableHead, TableRow, TableCell, TableBody, Link as MuiLink, makeStyles, Button, LinearProgress, Fade, Badge } from '@material-ui/core';
import { Link, Redirect } from 'react-router-dom';
import { Alert } from '@material-ui/lab';
import ResolutionChip from './components/ResolutionChip';
import { useGetShortReportsQuery } from './services/report';
import { getStatusFromNumber } from './utils';
import ErrorAlert from './components/ErrorAlert';
import { useGetSignInStatusQuery } from './services/auth';

const useStyles = makeStyles(theme => (
  {
    vertMarg: {
      marginBottom: theme.spacing(2)
    }
  }
));

const MyReportList = () => {
  const classes = useStyles();
  const signInStatus = useGetSignInStatusQuery();
  const result = useGetShortReportsQuery(undefined, {
    pollingInterval: 120 * 1000
  });
  const { data, isLoading, isFetching } = result;

  if (signInStatus.data !== "student" && signInStatus.data) {
    return <Redirect to="/login" />
  }
  
  return (
    <>
      <h1>Opened Reports</h1>
      <ErrorAlert apiResult={result} />
      <TableContainer component={Paper} className={classes.vertMarg}>
        <Fade
          in={isLoading || isFetching}
          style={{
            transitionDelay: isLoading || isFetching ? '800ms' : '0ms',
          }}
        >
          <LinearProgress value={isLoading || isFetching ? undefined : 0} />
        </Fade>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Report Title</TableCell>
              <TableCell>Created</TableCell>
              <TableCell>Result</TableCell>
              <TableCell>Unread</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {
              data?.map(report => (
                <TableRow>
                  <TableCell>
                    <MuiLink component={Link} to={`/view/${report.reportId}`}>
                      {report.title}
                    </MuiLink>
                  </TableCell>
                  <TableCell>{report.openedDateTime}</TableCell>
                  <TableCell><ResolutionChip result={getStatusFromNumber(report.reportStatus)} notext /></TableCell>
                  <TableCell><Badge color="secondary" variant="dot" invisible={report.studentRead} /></TableCell>
                </TableRow>
              ))
            }
          </TableBody>
        </Table>
        {
          (data?.length ?? 0) === 0 && !isLoading
            ? <Alert severity="info">You have not made any reports yet.</Alert>
            : null
        }
      </TableContainer>
      <Button
        variant="contained"
        color="primary"
        className={classes.vertMarg}
        component={Link}
        to="/create"
      >
        Create Report
      </Button>
    </>
  )
};

export default MyReportList;
