import React from "react";
import ReactDOM from "react-dom";
import { Grid, Paper } from "@mui/material";
import { HashRouter, Route, Switch, Redirect } from "react-router-dom";
import axios from "axios";

import "./styles/main.css";
import TopBar from "./components/TopBar";
import UserDetail from "./components/UserDetail";
import UserList from "./components/UserList";
import UserPhotos from "./components/UserPhotos";
import LoginRegister from "./components/LoginRegister";
import Favorites from "./components/Favorites";
import UserActivity from "./components/UserActivity";

class PhotoShare extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loggedIn: false,
      firstname: "",
      user_id: "",
      activities: [],
    };

    this.setLoggedIn = this.setLoggedIn.bind(this);
    this.setLoggedOut = this.setLoggedOut.bind(this);
    this.fetchActivities = this.fetchActivities.bind(this);
  }

  componentDidMount() {
    this.fetchActivities();
  }

  fetchActivities() {
    axios
      .get("/activities")
      .then((response) => {
        const activitiesData = response.data;
        this.setState({ activities: activitiesData });
      })
      .catch((error) => {
        console.error("Error fetching activities:", error);
      });
  }

  setLoggedIn(id, name) {
    window.location.href = "#/users/" + id;
    this.setState({ loggedIn: true, firstname: name, user_id: id }, () => {
      this.fetchActivities(); 
    });
  }

  setLoggedOut() {
    this.setState({ loggedIn: false, firstname: "", user_id: "" });
  }

  render() {
    const { loggedIn, firstname, user_id, activities } = this.state;

    return (
      <HashRouter>
        <div>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TopBar
                loggedIn={loggedIn}
                firstname={firstname}
                setLoggedOut={this.setLoggedOut}
                uploadInputRef={(domFileRef) => {
                  this.uploadInput = domFileRef;
                }}
                handleUploadButton={this.handleUploadButton}
                setNewPhoto={this.setNewPhoto}
              />
            </Grid>
            <div className="cs142-main-topbar-buffer" />
            <Grid item sm={3}>
              <Paper className="cs142-main-grid-item">
                {loggedIn ? <UserList onMount={this.reRender} /> : ""}
                {loggedIn ? (
                  <UserActivity
                    userId={user_id}
                    activities={activities}
                    fetchActivities={this.fetchActivities}
                  />
                ) : (
                  ""
                )}
              </Paper>
            </Grid>
            <Grid item sm={9}>
              <Paper className="cs142-main-grid-item">
                <Switch>
                  {loggedIn ? (
                    <Route path="/users/:userId" render={(props) => <UserDetail {...props} />} />
                  ) : (
                    <Redirect path="/users/:userId" to="/login-register" />
                  )}
                  {loggedIn ? (
                    <Route path="/photos/:userId" render={(props) => <UserPhotos {...props} />} />
                  ) : (
                    <Redirect path="/photos/:userId" to="/login-register" />
                  )}
                  {loggedIn ? (
                    <Route path="/users" component={UserList} />
                  ) : (
                    <Redirect path="/users" to="/login-register" />
                  )}
                  {loggedIn ? (
                    <Redirect path="/login-register" to={"/users/" + user_id} />
                  ) : (
                    <>
                      <Route
                        path="/login-register"
                        render={() => <LoginRegister onLogin={this.setLoggedIn} onLogout={this.handleLogout} />}
                      />
                      <Redirect exact path="/" to="/login-register" />
                    </>
                  )}
                  {loggedIn ? (
                    <Route path="/favorites" render={(props) => <Favorites {...props} userId={user_id} />} />
                  ) : (
                    <Redirect path="/favorites" to="/login-register" />
                  )}
                </Switch>
              </Paper>
            </Grid>
          </Grid>
        </div>
      </HashRouter>
    );
  }
}

ReactDOM.render(<PhotoShare />, document.getElementById("photoshareapp"));