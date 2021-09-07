import { Button, FormControl, InputLabel, MenuItem, Select, TextField, ListSubheader } from '@material-ui/core';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import { Warning } from '@material-ui/icons';
import React, { useState } from 'react';
import { useHistory, Redirect } from 'react-router-dom';
import { useGetActiveShortFormsQuery, useGetFormByIdQuery } from './services/forms';
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

const Form = ({ title, type, name, options, setFieldData }) => {
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
  const formsRequest = useGetActiveShortFormsQuery();
  const { data: forms } = formsRequest;
  const [formId, setFormId] = useState('');
  const formChosenRequest = useGetFormByIdQuery(formId);
  const formChosen = formChosenRequest.isSuccess ? formChosenRequest.data : null;
  const [createReport, createReportResult] = useCreateReportMutation();
  const [fieldData, setFieldData] = useState({});
  const { data: keys } = useGetKeysQuery();

  if (signInStatus.data === "none") {
    return <Redirect to="/login" />
  }

  const formGroups = formsRequest.data?.map(form => (form.topic)
    ).sort(
    ).filter((v, i, arr) => i === 0 || arr[i-1] !== v) ?? [];

  return (
    <div>
      <h1>Create Report</h1>
      <ErrorAlert apiResult={createReportResult} />
      {/* <FormControl variant="outlined" className={classes.formControl}>
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
      <br /> */}
      <FormControl variant="outlined" className={classes.formControl}>
        <InputLabel htmlFor="report_type_selection">Report Type</InputLabel>
        <Select
          value={formId}
          onChange={ev => setFormId(ev.target.value)}
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
            formGroups.map(group => (
              [
                <ListSubheader>{group}</ListSubheader>,
                ...forms?.filter(form => form.topic === group).map(form => (
                    <MenuItem key={form.formId} value={form.formId}>
                      {form.name}
                    </MenuItem>
                  ))
              ]
            ))
          }
        </Select>
      </FormControl>
      <p>{formChosen?.description}</p>
      {
        JSON.parse(formChosen?.definition ?? "null")?.map(form => (
          <React.Fragment key={form.name}>
            <FormControl variant="outlined" className={classes.formControl}>
              {
                form.type === 'select'
                  ? <InputLabel htmlFor={`${form.name}_${form.type}`}>
                      {form.title}
                    </InputLabel>
                  : null
              }
              <Form {...form} setFieldData={setFieldData} />
            </FormControl>
            <br />
          </React.Fragment>
        ))
      }
      <Button
        variant="contained"
        color="primary"
        className={classes.submit}
        disabled={formId === ''}
        onClick={() => {
          createReport({
            formId,
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
