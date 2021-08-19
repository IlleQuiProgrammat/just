import React, { useState } from 'react';
import { Paper, TableContainer, Table, TableRow, TableHead, TableBody, TableCell, makeStyles, Chip, Avatar, TextField, Button, CircularProgress, Fade } from '@material-ui/core';
import { blue } from '@material-ui/core/colors';
import { Face, School } from '@material-ui/icons';
import { Alert } from '@material-ui/lab';
import ResolutionChip from './components/ResolutionChip';
import { getStatusFromNumber } from './utils';
import { useChangeReportStatusMutation, useGetReportByIdQuery, useSendMessageMutation } from './services/report';
import ErrorAlert from './components/ErrorAlert';
import { useParams, Redirect } from 'react-router-dom';
import { useGetSignInStatusQuery } from './services/auth';

const useStyles = makeStyles(theme => ({
  chips: {
    display: 'flex',
    padding: theme.spacing(1),
    marginBottom: theme.spacing(1),
    flexWrap: 'wrap',
  },
  chip: {
    marginLeft: theme.spacing(1),
  },
  them: {
    display: 'flex',
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1)
  },
  school: {
    display: 'flex',
    flexDirection: 'row-reverse',
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1)
  },
  themMessage: {
    width: '80%',
    height: 'auto',
    backgroundColor: theme.palette.grey[200],
    padding: theme.spacing(1),
    borderRadius: theme.spacing(1),
    marginLeft: theme.spacing(1),
  },
  schoolMessage: {
    width: '80%',
    height: 'auto',
    backgroundColor: blue[100],
    padding: theme.spacing(1),
    borderRadius: theme.spacing(1),
    marginRight: theme.spacing(1),
  },
  alert: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1)
  },
  textField: {
    width: '100%',
    marginBottom: theme.spacing(2)
  },
  actions: {
    display: 'flex',
    justifyContent: 'space-between',
  }
}));

const ViewReport = () => {
  const classes = useStyles();
  const { reportId } = useParams();
  const signInStatus = useGetSignInStatusQuery();
  const fullReportRequest = useGetReportByIdQuery(reportId, {
    pollingInterval: 60 * 1000,
    forceRefetch: true
  });
  const { data: fullReportC, isLoading, isFetching } = fullReportRequest;
  let fullReport;
  if (fullReportC)
    fullReport = {
      ...fullReportC,
      // eslint-disable-next-line no-mixed-operators
      messages: [...fullReportC.messages].sort((a, b) => a.sentTime > b.sentTime && 1 || -1)
    }
  const [changeReportStatus, changeReportStatusResult] = useChangeReportStatusMutation();
  const [sendMessage, sendMessageResult] = useSendMessageMutation();
  const responseFields = JSON.parse(fullReport?.responseContent ?? "null") ?? []
  const getResponseFromFieldName = name => (
    responseFields.filter(field => field.name === name)[0]?.value
  )
  const [messageContent, setMessageContent] = useState('');

  if (signInStatus.data === "none" && signInStatus.data) {
    return <Redirect to="/login" />
  }

  return (
    <>
      <Fade
          in={isLoading || isFetching}
          style={{
            transitionDelay: isLoading || isFetching ? '800ms' : '0ms',
            position: 'absolute',
            left: '50%',
            transform: 'translateX(-50%)'
          }}
        >
          <div>
            <CircularProgress value={isLoading || isFetching ? undefined : 0} />
          </div>
      </Fade>
      <ErrorAlert
        apiResult={fullReportRequest}
        customTitle={`Unknown error occurred when fetching report with ID ${reportId}.`}
      />
      <h1>{fullReport?.title}</h1>
      <ErrorAlert apiResult={fullReportRequest} />
      { !fullReport ? null : (
        <>
          <Paper className={classes.chips}>
          <ResolutionChip result={getStatusFromNumber(fullReport.reportStatus)} />
          <Chip
            variant="outlined"
            label={`Opened: ${fullReport.openedDateTime}`}
            className={classes.chip}
          />
          {
            fullReport.closedDateTime !== null
              ? (
                  <Chip
                    variant="outlined"
                    label={`Closed: ${fullReport.closedDateTime}`}
                    className={classes.chip}
                  />
                )
              : null
          }
          </Paper>
          <TableContainer component={Paper}>
            <Table aria-label="Response Contents">
              <TableHead>
                <TableRow>
                  <TableCell>Question Name</TableCell>
                  <TableCell>Question Response</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {
                  JSON.parse(fullReport.question.definition).map(field => (
                    <TableRow>
                      <TableCell>{field.title}</TableCell>
                      <TableCell>{getResponseFromFieldName(field.name)}</TableCell>
                    </TableRow>
                  ))
                }
              </TableBody>
            </Table>
          </TableContainer>
          <h1>Follow-Up Messages</h1>
          {
            fullReport.messages.length === 0 ? (
              <Alert severity="info" className={classes.alert}>
                No messages have been sent yet.
              </Alert>
            ) : null
          }
          {
            fullReport.messages.map(message => {
              if (message.type === 1) return (
                <Alert severity="error" className={classes.alert} key={message.reportMessageId}>
                  This post was marked as spam.
                </Alert>
              )
              if (message.type === 2) return (
                <Alert severity="success" className={classes.alert} key={message.reportMessageId}>
                  This post was marked as resolved.
                </Alert>
              )
              if (message.type === 3) return (
                <Alert severity="warning" className={classes.alert} key={message.reportMessageId}>
                  This post was marked as unresolved.
                </Alert>
              )
              return (
                <div
                  className={[classes.them, classes.school][message.genericSender]}
                  key={message.reportMessageId}
                >
                  <Avatar>{message.genericSender === 0 ? <Face /> : <School />}</Avatar>
                  <div className={[classes.themMessage, classes.schoolMessage][message.genericSender]}>
                    {message.contents}
                  </div>
                </div>
              );
            })
          }
          
          <TextField
            multiline
            label="Your Message"
            variant="outlined"
            className={classes.textField}
            value={messageContent}
            onChange={ev => setMessageContent(ev.target.value)}
            style={{ marginTop: '2rem' }}
          />
          <div className={classes.actions}>
            <div>
              {
                fullReport.reportStatus === 0 && (
                  <Button
                    variant="text"
                    color="primary"
                    onClick={() => changeReportStatus({ id: fullReport.reportId, status: 'spam'})}
                  >
                    Mark As Spam
                  </Button>
                )
              }
              {
                fullReport.reportStatus === 0 && (
                  <Button
                    variant="text"
                    color="primary"
                    onClick={() => changeReportStatus({ id: fullReport.reportId, status: 'resolved'})}
                  >
                    Mark As Resolved
                  </Button>
                )
              }
            </div>
            <Button
              variant="contained"
              color="primary"
              onClick={() => {
                sendMessage({ id: fullReport.reportId, messageContent })
                  .then(({ error }) => {
                    if (!error) setMessageContent('');
                  })
              }}
              disabled={messageContent.length === 0 || fullReport.reportStatus !== 0}
            >
              Send
            </Button>
          </div>
          <ErrorAlert
            apiResult={sendMessageResult}
            customTitle="Unknown error occurred when sending message."
          />
          <ErrorAlert
            apiResult={changeReportStatusResult}
            customTitle="Unknown error occurred when changing status."
          />
        </>
      )
      }
    </>
  );
}

export default ViewReport;
