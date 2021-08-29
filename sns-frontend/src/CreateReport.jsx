import { Button, FormControl, InputLabel, MenuItem, Select, TextField, FormHelperText, Grid } from '@material-ui/core';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import { Warning } from '@material-ui/icons';
import React, { useState } from 'react';
import { useHistory, Redirect } from 'react-router-dom';
import { useGetActiveShortQuestionsQuery, useGetQuestionByIdQuery } from './services/questions';
import { useCreateReportMutation } from './services/report';
import ErrorAlert from './components/ErrorAlert';
import { useGetKeysQuery, useGetSignInStatusQuery } from './services/auth';

const useStyles = makeStyles(theme =>
  createStyles({
    formControl: {
      margin: theme.spacing(1),
      width: '100%',
      maxWidth: 550
    },
    submit: {
      margin: theme.spacing(1),
    },
  }),
);

const Question = ({ title, type, name, options, setFieldData }) => {
  switch (type) {
    case 'single':
      return (
        <TextField
          variant="outlined"
          label={title}
          name={name}
          id={`${name}_single`}
          onChange={ev => {
            setFieldData(data => ({...data, [name]: ev.target.value }));
          }}
        />
      );
    case 'multi':
      return (
        <TextField
          variant="outlined"
          multiline
          label={title}
          name={name}
          id={`${name}_multi`}
          onChange={ev => {
            setFieldData(data => ({...data, [name]: ev.target.value }));
          }}
        />
      );
    case 'select':
      return (
        <Select
          name={name}
          id={`${name}_select`}
          label={title}
          onChange={ev => {
            setFieldData(data => ({...data, [name]: ev.target.value }));
          }}
        >
          <MenuItem value="" aria-label="None"><em>None</em></MenuItem>
          {
            options.map(option => <MenuItem key={option} value={option}>{option}</MenuItem>)
          }
        </Select>
      );
    default:
      return null
  }
}

const CreateReport = () => {
  const classes = useStyles();
  const history = useHistory();
  const signInStatus = useGetSignInStatusQuery();
  const questionsRequest = useGetActiveShortQuestionsQuery();
  const { data: questions } = questionsRequest;
  const [questionId, setQuestionId] = useState('');
  const questionChosenRequest = useGetQuestionByIdQuery(questionId);
  const questionChosen = questionChosenRequest.isSuccess ? questionChosenRequest.data : null;
  const [createReport, createReportResult] = useCreateReportMutation();
  const [fieldData, setFieldData] = useState({});
  const [title, setTitle] = useState('');
  const { data: keys } = useGetKeysQuery();

  if (signInStatus.data === "none") {
    return <Redirect to="/login" />
  }

  return (
    <div>
      <h1>Create Report</h1>
      <ErrorAlert apiResult={createReportResult} />
      <FormControl variant="outlined" className={classes.formControl}>
        <TextField
          variant="outlined"
          label="Report Title"
          onChange={ev => setTitle(ev.target.value)}
        />
        <FormHelperText id="component-helper-text">
          <Grid container alignItems="center">
            <Warning fontSize="small" />
            <div style={{ lineHeight: '24px' }}>
              &nbsp;
              This title is sent unencrypted.
            </div>
          </Grid>
        </FormHelperText>
      </FormControl>
      <br />
      <FormControl variant="outlined" className={classes.formControl}>
        <InputLabel htmlFor="report_type_selection">Report Type</InputLabel>
        <Select
          value={questionId}
          onChange={ev => setQuestionId(ev.target.value)}
          label="Report Type"
          inputProps={{
            name: 'report_type',
            id: 'report_type_selection'
          }}
        >
          <MenuItem value="">
            <em>None</em>
          </MenuItem>
          {
            questions?.map(question => (
              <MenuItem key={question.questionId} value={question.questionId}>
                {question.name}
              </MenuItem>
            ))
          }
        </Select>
      </FormControl>
      <p>{questionChosen?.description}</p>
      {
        JSON.parse(questionChosen?.definition ?? "null")?.map(question => (
          <React.Fragment key={question.name}>
            <FormControl variant="outlined" className={classes.formControl}>
              {
                question.type === 'select'
                  ? <InputLabel htmlFor={`${question.name}_${question.type}`}>
                      {question.title}
                    </InputLabel>
                  : null
              }
              <Question {...question} setFieldData={setFieldData} />
            </FormControl>
            <br />
          </React.Fragment>
        ))
      }
      <Button
        variant="contained"
        color="primary"
        className={classes.submit}
        disabled={questionId === ''}
        onClick={() => {
          createReport({
            questionId,
            title,
            responseContent: JSON.stringify(
              Object.keys(fieldData).map(key => ({ name: key, value: fieldData[key] }))
            ),
            schoolPublicKey: keys.schoolPublicKey,
            symmetricEncryptionKey: keys.symmetricEncryptionKey,
          }).then(({ data, error }) => {
            if (!error) history.push('/my_reports')
          })
        }}
      >
        Submit
      </Button>
    </div>
  );
}

export default CreateReport;
