import { FormControl, InputLabel, MenuItem, Select, TextField, Fade, CircularProgress } from '@material-ui/core';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import React from 'react';
import { useParams, Redirect } from 'react-router-dom';
import { useGetQuestionByIdQuery } from './services/questions';
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

const ViewingQuestion = ({ title, type, name, options }) => {
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

const ViewQuestion = () => {
  const { questionId } = useParams();
  const classes = useStyles();
  const signInStatus = useGetSignInStatusQuery();
  const questionRequest = useGetQuestionByIdQuery(questionId);
  const { data: question, isLoading, isFetching } = questionRequest;

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
      <ErrorAlert apiResult={questionRequest} />
      
      <h1>{question?.name} </h1>
      {
        question
          ? <p>This is an example form meaning that you can interact but cannot submit it.</p>
          : null
      }
      <p>{question?.description}</p>

      {
        question
          ? <FormControl variant="outlined" className={classes.formControl}>
            <TextField
              variant="outlined"
              label="Report Title"
            />
          </FormControl>
          : null
      }
      <br />
      {
        JSON.parse(question?.definition ?? "null")?.map(question => (
          <React.Fragment key={question.name}>
            <FormControl variant="outlined" className={classes.formControl}>
              {
                question.type === 'select'
                  ? <InputLabel htmlFor={`${question.name}_${question.type}`}>
                      {question.title}
                    </InputLabel>
                  : null
              }
              <ViewingQuestion {...question} />
            </FormControl>
            <br />
          </React.Fragment>
        ))
      }
    </div>
  );
}

export default ViewQuestion;
