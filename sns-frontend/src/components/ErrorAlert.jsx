import React, { useState, useEffect } from 'react';
import { Alert, AlertTitle } from '@material-ui/lab';
import { makeStyles, createStyles, Collapse } from '@material-ui/core';
import { v4 as uuidv4 } from 'uuid';

const useStyles = makeStyles(theme =>
  createStyles({
    marginBottom: {
      marginBottom: theme.spacing(2),
    }
  }),
);

const ErrorAlert = ({ apiResult, extractErrors, customTitle }) => {
  const classes = useStyles();
  const [memoisedError, setMemoisedError] = useState([]);
  const [uuid] = useState(uuidv4());
  let title = '';
  if (customTitle) {
    title = customTitle
  } else {
    title = extractErrors ? "One or more errors occurred." : "An unknown error occurred.";
  }
  useEffect(() => {
    if (apiResult.isLoading === false) {
      setMemoisedError((apiResult.error && !!extractErrors) ? extractErrors(apiResult.error.data) : []);
      if (apiResult.isError) {
        document.getElementById(uuid).scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiResult.isLoading, apiResult.isError])

  return (
    <Collapse in={apiResult.isError || memoisedError.length > 0} id={uuid}>
      {
        extractErrors ?
          <Alert severity="error" className={classes.marginBottom}>
            <AlertTitle>{title}</AlertTitle>
            <ul>
              {
                memoisedError.map(error => <li>{error}</li>)
              }
            </ul>
          </Alert>
        : <Alert severity="error" className={classes.marginBottom}>{title}</Alert>
      }
    </Collapse>
  );
}

export default ErrorAlert;
