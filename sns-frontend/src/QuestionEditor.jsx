import { Button, List, ListItem, ListItemIcon, Select, TextField, MenuItem, FormControl, InputLabel, makeStyles, Paper } from '@material-ui/core';
import { DragIndicator } from '@material-ui/icons';
import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { useHistory, Redirect } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import ErrorAlert from './components/ErrorAlert';
import { useCreateQuestionMutation } from './services/questions';
import { useGetSignInStatusQuery } from './services/auth';

const useStyles = makeStyles(theme =>
  ({
    field: {
      marginTop: theme.spacing(1),
      marginBottom: theme.spacing(1),
      width: '100%',
      maxWidth: 550
    },
    fieldParent: {
      alignItems: 'flex-start',
      width: '100%',
      marginBottom: theme.spacing(2),
      maxWidth: 640,
    },
    spread: {
      width: '100%',
      maxWidth: 640,
      display: 'flex',
      justifyContent: 'space-between'
    }
  }),
);

const areFieldsOk = fields => {
  return !fields.some(field =>
    field.type === ''
    || (field.options?.length ?? 1) === 0
    || field.title.length === 0
  )
}

const QuestionEditor = () => {
  const classes = useStyles();
  const history = useHistory();
  const signInStatus = useGetSignInStatusQuery();
  const [createQuestion, createQuestionResponse] = useCreateQuestionMutation();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [fields, setFields] = useState([{ type: '', title: '', name: uuidv4() }]);

  if (signInStatus.data !== "school_admin" && signInStatus.data) {
    return <Redirect to="/login" />
  }

  const changeFieldValue = (index, property, value) => {
    const newFields = [...fields];
    newFields[index][property] = value;
    setFields(newFields);
  }

  return (
    <>
      <h1>Create Question</h1>
      <ErrorAlert
        apiResult={createQuestionResponse}
        customTitle="An unknown error occurred when creating the question."
      />
      <TextField
        className={classes.field}
        variant="outlined"
        label="Name"
        onChange={ev => setName(ev.target.value)}
      />
      <br />
      <TextField
        className={classes.field}
        multiple
        variant="outlined"
        label="Description"
        onChange={ev => setDescription(ev.target.value)}
      />
      <DragDropContext
        onDragEnd={result => {
          const { destination, source } = result;
          if (!destination) return;
          if (destination.droppableId === source.droppableId && destination.index === source.index)
            return;
          const newFields = [...fields];
          const field = newFields.splice(source.index, 1)[0];
          newFields.splice(destination.index, 0, field);
          setFields(newFields);
        }}
      >
        <Droppable droppableId="0">
          {
            provided => (
              <List
                ref={provided.innerRef}
                {...provided.droppableProps}
              >
                {
                  fields.map((field, index) => (
                    <Draggable draggableId={field.name} index={index} key={field.name}>
                      {
                        provided => (
                          <ListItem
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={classes.fieldParent}
                            component={Paper}
                          >
                            <ListItemIcon {...provided.dragHandleProps} style={{ marginTop: '1rem' }}>
                              <DragIndicator />
                            </ListItemIcon>
                            <div style={{ flexGrow: 1 }}>
                              <FormControl variant="outlined" className={classes.field}>
                                <InputLabel htmlFor={`${field.name}_type_qin`}>
                                  Field Type
                                </InputLabel>
                                <Select
                                  value={field.type}
                                  onChange={ev => {
                                    const val = ev.target.value;
                                    changeFieldValue(index, 'type', val)
                                    changeFieldValue(
                                      index,
                                      'options',
                                      val === 'select' ? '' : undefined
                                    )
                                  }}
                                  label="Field Type"
                                  inputProps={{
                                    id: `${field.name}_type_qin`
                                  }}
                                >
                                  <MenuItem value="">
                                    <em>None</em>
                                  </MenuItem>
                                  <MenuItem value="single">Single-line input</MenuItem>
                                  <MenuItem value="multi">Multi-line Input</MenuItem>
                                  <MenuItem value="select">Drop-Down Menu</MenuItem>
                                </Select>
                              </FormControl>
                              <br />
                              <TextField
                                className={classes.field}
                                multiple
                                variant="outlined"
                                label="Title"
                                onChange={ev => changeFieldValue(index, 'title', ev.target.value)}
                              />
                              <br />
                              {
                                field.type === 'select'
                                  ? <TextField
                                  className={classes.field}
                                  multiple
                                  variant="outlined"
                                  label="Options (Comma-Separated)"
                                  onChange={ev => changeFieldValue(index, 'options', ev.target.value.split(','))}
                                /> : null
                              }
                              <Button
                                variant="text"
                                color="primary"
                                onClick={() => setFields(fields.filter((_, i) => i !== index))}
                                disabled={fields.length === 1}
                              >
                                Delete
                              </Button>
                            </div>
                          </ListItem>
                        )
                      }
                    </Draggable>
                  ))
                }
                {provided.placeholder}
              </List>
            )
          }
        </Droppable>
      </DragDropContext>
      <div className={classes.spread}>
        <Button
          variant="text"
          color="primary"
          onClick={() => setFields([...fields, { type: '', title: '', name: uuidv4()}])}
        >
          Add Field
        </Button>
        <Button
          variant="contained"
          color="primary"
          disabled={name.length === 0 || description.length === 0 || !areFieldsOk(fields)}
          onClick={() => {
            createQuestion({
              name,
              description,
              definition: JSON.stringify(fields),
              active: true
            }).then(({ error }) => {
              if (!error) history.push('/school_settings')
            })
          }}
        >
          Create
        </Button>
      </div>
    </>
  );
}

export default QuestionEditor;
