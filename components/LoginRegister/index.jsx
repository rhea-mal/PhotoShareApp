import React from "react";
import axios from "axios";
import Typography from "@mui/material/Typography";
import './styles.css';

class LoginRegister extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      username: '',
      password: '',
      error: '',
      new_firstname: '',
      new_lastname: '',
      new_username: '',
      new_password1: '',
      new_password2: '',
      new_location: '',
      new_occupation: '',
      new_description: '',
      registration_output: '',
      showRegistration: false
    };
    this.handleLoginSubmit = this.handleLoginSubmit.bind(this);
    this.handleRegisterSubmit = this.handleRegisterSubmit.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleRegisterInputChange = this.handleRegisterInputChange.bind(this);
    this.handleToggleRegistration = this.handleToggleRegistration.bind(this);
  }

  handleLoginSubmit(event) {
    event.preventDefault();
    const { username, password } = this.state;
    const { onLogin } = this.props;

    axios
      .post('/admin/login', { login_name: username, password })
      .then((response) => {
        const userData = response.data;
        console.log(userData);
        onLogin(userData._id, userData.first_name);
        this.setState({ error: '' });
      })
      .catch((error) => {
        this.setState({ error: 'Invalid login name' });
        console.log(error);
      });
  }

  handleRegisterSubmit(event) {
    event.preventDefault();
    const {
      new_firstname,
      new_lastname,
      new_username,
      new_password1,
      new_password2,
      new_location,
      new_occupation,
      new_description
    } = this.state;

    if (new_password1 !== new_password2) {
      this.setState({ registration_output: "The two password fields must match." });
      return;
    }

    axios
      .post('/user', {
        login_name: new_username,
        password: new_password1,
        first_name: new_firstname,
        last_name: new_lastname,
        location: new_location,
        description: new_description,
        occupation: new_occupation
      })
      .then(() => {
        this.setState({
          registration_output: "Registration successful. Please login.",
          new_firstname: "",
          new_lastname: "",
          new_username: "",
          new_password1: "",
          new_password2: "",
          new_location: "",
          new_occupation: "",
          new_description: ""
        });
      })
      .catch((error) => {
        this.setState({
          registration_output: error.response.data,
          new_firstname: "",
          new_lastname: "",
          new_username: "",
          new_password1: "",
          new_password2: "",
          new_location: "",
          new_occupation: "",
          new_description: ""
        });
        console.log(error);
      });
  }

  handleInputChange(event) {
    this.setState({ [event.target.name]: event.target.value, error: "" });
  }

  handleRegisterInputChange(event) {
    this.setState({ [event.target.name]: event.target.value, registration_output: "" });
  }

  handleToggleRegistration() {
    this.setState((prevState) => ({
      showRegistration: !prevState.showRegistration,
      registration_output: "",
      new_firstname: "",
      new_lastname: "",
      new_username: "",
      new_password1: "",
      new_password2: "",
      new_location: "",
      new_occupation: "",
      new_description: ""
    }));
  }

  render() {
    const {
      username,
      password,
      error,
      new_firstname,
      new_lastname,
      new_username,
      new_password1,
      new_password2,
      new_location,
      new_occupation,
      new_description,
      registration_output,
      showRegistration
    } = this.state;

    return (
      <div className="login-register-container">
        <Typography variant="h4" align="center" gutterBottom className="random-font">
          Welcome‼️
        </Typography>
        <h2 className="title">Login/Register</h2>
        {error && <p className="error-message">{error}</p>}
        <form onSubmit={this.handleLoginSubmit}>
          <div className="form-group">
            <label htmlFor="loginName">Login Name:</label>
            <input
              type="text"
              id="loginName"
              value={username}
              onChange={this.handleInputChange}
              name="username"
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password:</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={this.handleInputChange}
              name="password"
            />
          </div>
          <button type="submit" className="submit-button">Submit</button>
        </form>

        <button onClick={this.handleToggleRegistration} className="cs142-topbar-button">
          {showRegistration ? 'Hide Registration' : 'Register Now!'}
        </button>

        {showRegistration && (
          <form onSubmit={this.handleRegisterSubmit}>
            <div className="form-group">
              <label htmlFor="firstName">First Name:</label>
              <input
                type="text"
                id="firstName"
                value={new_firstname}
                onChange={this.handleRegisterInputChange}
                name="new_firstname"
              />
            </div>
            <div className="form-group">
              <label htmlFor="lastName">Last Name:</label>
              <input
                type="text"
                id="lastName"
                value={new_lastname}
                onChange={this.handleRegisterInputChange}
                name="new_lastname"
              />
            </div>
            <div className="form-group">
              <label htmlFor="newUsername">Username:</label>
              <input
                type="text"
                id="newUsername"
                value={new_username}
                onChange={this.handleRegisterInputChange}
                name="new_username"
              />
            </div>
            <div className="form-group">
              <label htmlFor="newPassword1">Password:</label>
              <input
                type="password"
                id="newPassword1"
                value={new_password1}
                onChange={this.handleRegisterInputChange}
                name="new_password1"
              />
            </div>
            <div className="form-group">
              <label htmlFor="newPassword2">Re-enter Password:</label>
              <input
                type="password"
                id="newPassword2"
                value={new_password2}
                onChange={this.handleRegisterInputChange}
                name="new_password2"
              />
            </div>
            <div className="form-group">
              <label htmlFor="newLocation">Location (optional):</label>
              <input
                type="text"
                id="newLocation"
                value={new_location}
                onChange={this.handleRegisterInputChange}
                name="new_location"
              />
            </div>
            <div className="form-group">
              <label htmlFor="newOccupation">Occupation (optional):</label>
              <input
                type="text"
                id="newOccupation"
                value={new_occupation}
                onChange={this.handleRegisterInputChange}
                name="new_occupation"
              />
            </div>
            <div className="form-group">
              <label htmlFor="newDescription">Add a short description (optional):</label>
              <input
                type="text"
                id="newDescription"
                value={new_description}
                onChange={this.handleRegisterInputChange}
                name="new_description"
              />
            </div>
            <button type="submit" className="submit-button">Register Me</button>
          </form>
        )}
        <div>{registration_output}</div>
      </div>
    );
  }
}

export default LoginRegister;
