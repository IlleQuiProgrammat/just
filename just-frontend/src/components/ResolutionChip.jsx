import React from 'react';
import { Chip } from '@material-ui/core';
import { CheckCircle, Error as ErrorIcon } from '@material-ui/icons';
import { green, red } from '@material-ui/core/colors';

const ResolutionChip = ({ result, notext }) => {
  if (result === 'resolved') {
    if (notext) {
      return <CheckCircle style={{ color: green[500] }} />;
    }
    return (
      <Chip
        variant="outlined"
        icon={<CheckCircle style={{ color: green[500] }} />}
        label="Resolved"
        style={{
          color: green[500],
          borderColor: green[500]
        }}
      />
    )
  } else if (result === 'spam') {
    if (notext) {
      return <ErrorIcon style={{ color: red[500] }} />;
    }
    return (
      <Chip
        variant="outlined"
        icon={<ErrorIcon style={{ color: red[500] }} />}
        label="Spam"
        style={{
          color: red[500],
          borderColor: red[500]
        }}
      />
    );
  } else {
    return (
      <Chip
        variant="outlined"
        label={result}
      />
    );
  }
}

export default ResolutionChip;
