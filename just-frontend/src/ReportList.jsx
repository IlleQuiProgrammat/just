import React from 'react';
import { DataGrid, GridToolbarColumnsButton, GridToolbarContainer, GridToolbarDensitySelector, GridToolbarExport, GridToolbarFilterButton } from '@material-ui/data-grid';
import { Badge, createStyles, Link as MuiLink, makeStyles, Fade, LinearProgress } from '@material-ui/core';
import { Link, Redirect } from 'react-router-dom';
import ResolutionChip from './components/ResolutionChip';
import { useGetShortReportsQuery } from './services/report';
import { useGetAllShortQuestionsQuery } from './services/questions';
import { useGetSignInStatusQuery } from './services/auth';

const useStyles = makeStyles(theme =>
  createStyles({
    grid: {
      margin: theme.spacing(1),
      width: '100%',
      backgroundColor: 'white',
    },
  }),
);

const ReportList = () => {
  const classes = useStyles();
  // const [selectedRows, setSelectedRows] = useState([]);
  const signInStatus = useGetSignInStatusQuery();
  const reportsRequest = useGetShortReportsQuery(undefined, { pollingInterval: 120 * 1000 });
  const { data: unTransformedReports, isLoading, isFetching, error: reportsError } = reportsRequest;
  const reports = unTransformedReports?.map(report => ({ ...report, id: report.reportId }));
  const questionsRequest = useGetAllShortQuestionsQuery(undefined, { pollingInterval: 120 * 1000 });
  const {
    data: questions,
    isLoading: isLoadingQuestions,
    isFetching: isFetchingQuestions,
    error: questionsError
  } = questionsRequest;

  const anyRequestLoading = isLoading || isFetching || isLoadingQuestions || isFetchingQuestions;
  const anyRequestError = questionsError || reportsError;

  if (signInStatus.data !== "school_admin" && signInStatus.data) {
    return <Redirect to="/login" />
  }

  const columns = [
    {
      field: 'title',
      headerName: 'Title',
      minWidth: 200,
      flex: 1,
      editable: false,
      renderCell: params => (
        <MuiLink component={Link} to={`/view/${params.id}`}>{params.value}</MuiLink>
      )
    },
    {
      field: 'reportType',
      headerName: 'Type',
      minWidth: 150,
      flex: 1,
      editable: false,
      valueGetter: params => questions?.filter(question => question.id === params.value)[0]?.name
    },
    {
      field: 'openedDateTime',
      headerName: 'Created',
      type: 'date',
      width: 150,
      editable: false,
      valueFormatter: params => params.value
    },
    {
      field: 'closedDateTime',
      headerName: 'Closed',
      width: 150,
      editable: false,
      valueFormatter: params => params.value
    },
    {
      field: 'reportStatus',
      headerName: 'Reason',
      width: 130,
      editable: false,
      renderCell: params => {
        switch (params.value) {
          case 1:
            return <ResolutionChip result="spam" />;
          case 2:
            return <ResolutionChip result="resolved" />;
          default:
            return ''
        }
      }
    },
    {
      field: 'schoolRead',
      headerName: 'Unread',
      width: 30,
      editable: false,
      renderCell: params => (
        <Badge color="secondary" variant="dot" invisible={params.value} />
      )
    },
  ];

  return (
    <DataGrid
      className={classes.grid}
      autoHeight
      loading={anyRequestLoading} // fetching will show elsewhere
      error={anyRequestError}
      rows={reports ?? []}
      columns={columns}
      rowsPerPageOptions={[10, 25, 50]}
      disableSelectionOnClick
      disableColumnMenu
      // onSelectionModelChange={setSelectedRows}
      components={{
        Toolbar: () => (
          <GridToolbarContainer>
            <Fade
              in={anyRequestLoading}
              style={{
                transitionDelay: anyRequestLoading ? '800ms' : '0ms',
              }}
            >
              <LinearProgress value={anyRequestLoading ? undefined : 0} />
            </Fade>
            <GridToolbarColumnsButton />
            <GridToolbarFilterButton />
            <GridToolbarDensitySelector />
            <GridToolbarExport />
            {/* <Button
              variant="text"
              color="primary"
              disabled={selectedRows.length === 0}
            >
              Mark As Spam
            </Button>
            <Button
              variant="text"
              color="primary"
              disabled={selectedRows.length === 0}
            >
              Mark As Resolved
            </Button> */}
          </GridToolbarContainer>
        )
      }}
    />
  );
};

export default ReportList;