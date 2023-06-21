import React from "react";
import {
  Divider,
  List,
  ListItem,
  ListItemText,
  Typography,
} from "@mui/material";
import axios from "axios";

import "./styles.css";
import { Link } from "react-router-dom";

/**
 * Define UserList, a React component of CS142 Project 5.
 */
class UserList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      userList: [],
    };
  }

  componentDidMount() {
    axios
      .get("/user/list")
      .then((response) => {
        const userList = response.data;
        this.setState({ userList });
      })
      .catch((error) => {
        console.error("Error fetching user:", error);
      });
  }

  render() {
    const { userList } = this.state;

    return (
      <div>
        <Typography variant="body1" className="MuiTypography-body1">Users:</Typography>
        <List component="nav" className="UserList">
          {userList.map((user) => (
            <React.Fragment key={user._id}>
              <ListItem key={user._id} component={Link} to={`/users/${user._id}`}>
                <ListItemText primary={`${user.first_name} ${user.last_name}`} />
              </ListItem>
              <Divider />
            </React.Fragment>
          ))}
        </List>
        <Typography variant="body1" className="MuiTypography-body2">Click to see each profile!</Typography>
      </div>
    );
  }
}

export default UserList;