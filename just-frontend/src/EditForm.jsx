import { Button, List, ListItem, ListItemIcon, Select, TextField, MenuItem, FormControl, InputLabel, makeStyles, Paper } from '@material-ui/core';
import { DragIndicator } from '@material-ui/icons';
import React, { useEffect, useState } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { useHistory, Redirect } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import ErrorAlert from './components/ErrorAlert';
import { useEditFormMutation, useGetFormByIdQuery } from './services/forms';
import { useGetSignInStatusQuery } from './services/auth';
import { useParams } from 'react-router-dom';
import { Alert } from '@material-ui/lab';

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

const isEmptyOrWhitespace = s => (
  s === null || s === undefined || s.match(/^\s*$/) !== null
)

const areFieldsOk = fields => {
  return !fields.some(field =>
    field.type === ''
    || (field.options?.length ?? 1) === 0
    || isEmptyOrWhitespace(field.title)
  )
}

const FormEditor = () => {
  const classes = useStyles();
  const history = useHistory();
  const { formId } = useParams();
  const signInStatus = useGetSignInStatusQuery();
  const formResult = useGetFormByIdQuery(formId);
  const [editForm, editFormResponse] = useEditFormMutation();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [codeName, setCodeName] = useState('');
  const [topic, setTopic] = useState('');
  const [fields, setFields] = useState([{ type: '', title: '', name: uuidv4() }]);

  useEffect(() => {
    setName(formResult.data?.name);
    setDescription(formResult.data?.description);
    setCodeName(formResult.data?.codeName);
    setTopic(formResult.data?.topic);
    setFields(JSON.parse(formResult.data?.definition ?? "[]"));
  }, [formResult])

  if (signInStatus.data !== "school_admin" && signInStatus.data) {
    return <Redirect to="/login" />;
  }

  if (formResult.data?.retired) {
    return <Redirect to="/school_settings" />;
  }

  const changeFieldValue = (index, property, value) => {
    const newFields = [...fields];
    newFields[index][property] = value;
    setFields(newFields);
  }

  return (
    <>
      <h1>Edit Form</h1>
      <ErrorAlert
        apiResult={editFormResponse}
        customTitle="An unknown error occurred when editing the form."
      />
      <ErrorAlert
        apiResult={formResult}
        customTitle="An unknown error occurred when fetching the form."
      />
      <TextField
        className={classes.field}
        variant="outlined"
        label="Name"
        value={name}
        onChange={ev => setName(ev.target.value)}
      />
      <br />
      <TextField
        className={classes.field}
        multiple
        variant="outlined"
        label="Description"
        value={description}
        onChange={ev => setDescription(ev.target.value)}
      />
      <br />
      <TextField
        className={classes.field}
        variant="outlined"
        label="Code Name"
        value={codeName}
        onChange={ev => setCodeName(ev.target.value)}
      />
      <br />
      <TextField
        className={classes.field}
        variant="outlined"
        label="Topic"
        value={topic}
        onChange={ev => setTopic(ev.target.value)}
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
                                value={field.title}
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
          disabled={
            isEmptyOrWhitespace(name)
            || isEmptyOrWhitespace(description)
            || isEmptyOrWhitespace(topic)
            || isEmptyOrWhitespace(codeName)
            || !areFieldsOk(fields)}
          onClick={() => {
            editForm({
              formId,
              name,
              description,
              codeName,
              topic,
              definition: JSON.stringify(fields),
              active: true
            }).then(({ error }) => {
              if (!error) history.push('/school_settings')
            })
          }}
        >
          Save
        </Button>
      </div>
    </>
  );
}

export default FormEditor;
