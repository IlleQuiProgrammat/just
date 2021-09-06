import { CssBaseline, Container, Box } from '@material-ui/core';
import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  useLocation
} from "react-router-dom";
import { Provider } from 'react-redux';
import store from './store';
import CreateReport from './CreateReport';
import Home from './Home';
import FormEditor from './FormEditor';
import EditForm from './EditForm';
import ReportList from './ReportList';
import Settings from './Settings';
import ViewReport from './ViewReport';
import Login from './Login';
import Register from './Register';
import Header from './components/Header';
import MyReportList from './MyReportList';
import ViewForm from './ViewForm';

export default function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <Router>
        <CssBaseline />
        <Header />
        <ScrollToTop />
        <Container maxWidth="lg">
          <Box marginTop="6rem" paddingBottom='5rem'>
            <Switch>
              <Route path="/view/:reportId">
                <ViewReport />
              </Route>
              <Route path="/my_reports">
                <MyReportList />
              </Route>
              <Route path="/reports">
                <ReportList />
              </Route>
              <Route path="/create">
                <CreateReport />
              </Route>
              <Route path="/school_settings">
                <Settings />
              </Route>
              <Route path="/create_form">
                <FormEditor />
              </Route>
              <Route path="/view_form/:formId">
                <ViewForm />
              </Route>
              <Route path="/edit_form/:formId">
                <EditForm />
              </Route>
              <Route path="/login">
                <Login />
              </Route>
              <Route path="/register">
                <Register />
              </Route>
              <Route exact path={["/home", "/"]}>
                <Home />
              </Route>
              <Route path="*">
                <h1>We couldn't find what you were looking for.</h1>
              </Route>
            </Switch>
          </Box>
        </Container>
      </Router>
    </Provider>
  </React.StrictMode>,
  document.getElementById('root')
);
