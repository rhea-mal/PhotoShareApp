import React from "react";
import { AppBar, Toolbar, Typography } from "@mui/material";
import { withRouter, Link } from "react-router-dom";
import axios from "axios";
import './styles.css';

class TopBar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      versionNumber: "",
    };
    this.handleLogout = this.handleLogout.bind(this);
    this.handleUploadButton = this.handleUploadButton.bind(this);
  }

  handleLogout() {
    axios
      .post('/admin/logout')
      .then(() => {
        this.props.setLoggedOut();
        this.props.history.push('/login-register');
        //if (this.props.fetchActivities) {
          //this.props.fetchActivities();
        //}
      })
      .catch((error) => {
        console.log(error);
      });
  }
  
  handleUploadButton = (e) => {
    e.preventDefault();
    if (this.uploadInput?.files?.length > 0) {
      const domForm = new FormData();
      domForm.append('uploadedphoto', this.uploadInput.files[0]);
      axios
        .post('/photos/new', domForm)
        .then((res) => {
          console.log(res);
          //if (this.props.fetchActivities) {
            //this.props.fetchActivities();
          //}
        })
        .catch((err) => console.log(`POST ERR: ${err}`));
    }
  };  

  componentDidMount() {
    this.getVersionNumber();
  }

  async getVersionNumber() {
    try {
      const response = await axios.get("http://localhost:3000/test/info");
      const versionNumber = response.data.__v;
      this.setState({ versionNumber });
    } catch (error) {
      console.error("Error fetching version number:", error);
    }
  }

  render() {
    const { versionNumber } = this.state;

    return (
      <AppBar position="static" className="cs142-topbar-appBar TopBar">
        <Toolbar>
          <Typography variant="h6" component="div">
            Rhea Malhotra
          </Typography>
          {this.props.loggedIn ? (
            <>
              <Link to="/favorites" className="favorites-link">
                <button className="cs142-topbar-button favorites-button">See Favorites</button>
              </Link>
              <input type="file" accept="image/*" ref={(domFileRef) => { this.uploadInput = domFileRef; }} className="upload-input cs142-topbar-button" />
              <button className="upload-button cs142-topbar-button" onClick={this.handleUploadButton}>Add Photo</button>
              <Typography variant="subtitle1" color="inherit" style={{ marginLeft: "auto" }}>
                Hi {this.props.firstname}
              </Typography>
              <button className="cs142-topbar-button" onClick={() => this.handleLogout()}>Logout</button>
            </>
          ) : (
            <Typography variant="subtitle1" color="inherit" style={{ marginLeft: "auto" }}>
              Please Login
            </Typography>
          )}
          <Typography variant="subtitle1">
            Version: {versionNumber}
          </Typography>
        </Toolbar>
      </AppBar>
    );
  }
}

export default withRouter(TopBar);
