import { FormControl, InputLabel, MenuItem, Select, TextField, Fade, CircularProgress } from '@material-ui/core';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import React from 'react';
import { useParams, Redirect } from 'react-router-dom';
import { useGetFormByIdQuery } from './services/forms';
import ErrorAlert from './components/ErrorAlert';
import { useGetSignInStatusQuery } from './services/auth';

const useStyles = makeStyles(theme =>
  createStyles({
    formControl: {
      margin: theme.spacing(1),
      width: '100%',
      maxWidth: 550
    },
  }),
);

const ViewingForm = ({ title, type, name, options }) => {
  switch (type) {
    case 'single':
      return (
        <TextField
          variant="outlined"
          label={title}
          id={`${name}_single`}
        />
      );
    case 'multi':
      return (
        <TextField
          variant="outlined"
          multiline
          label={title}
          id={`${name}_multi`}
        />
      );
    case 'select':
      return (
        <Select
          name={name}
          id={`${name}_select`}
          label={title}
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

const ViewForm = () => {
  const { formId } = useParams();
  const classes = useStyles();
  const signInStatus = useGetSignInStatusQuery();
  const formRequest = useGetFormByIdQuery(formId);
  const { data: form, isLoading, isFetching } = formRequest;

  if (signInStatus.data === "none" && signInStatus.data) {
    return <Redirect to="/login" />
  }

  return (
    <div>
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
      <ErrorAlert apiResult={formRequest} />
      
      <h1>{form?.name} </h1>
      {
        form
          ? <p>This is an example form meaning that you can interact but cannot submit it.</p>
          : null
      }
      <p>{form?.description}</p>

      {/* {
        form
          ? <FormControl variant="outlined" className={classes.formControl}>
            <TextField
              variant="outlined"
              label="Report Title"
            />
          </FormControl>
          : null
      } */}
      <br />
      {
        JSON.parse(form?.definition ?? "null")?.map(form => (
          <React.Fragment key={form.name}>
            <FormControl variant="outlined" className={classes.formControl}>
              {
                form.type === 'select'
                  ? <InputLabel htmlFor={`${form.name}_${form.type}`}>
                      {form.title}
                    </InputLabel>
                  : null
              }
              <ViewingForm {...form} />
            </FormControl>
            <br />
          </React.Fragment>
        ))
      }
    </div>
  );
}

export default ViewForm;
