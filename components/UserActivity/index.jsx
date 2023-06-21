import React from 'react';
import axios from 'axios';
import './styles.css';

class UserActivity extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      activities: [],
    };
  }

  componentDidMount() {
    this.fetchActivities();
  }

  fetchActivities() {
    axios
      .get('/activities')
      .then((response) => {
        const activitiesData = response.data;
        this.setState({ activities: activitiesData });
      })
      .catch((error) => {
        console.error('Error fetching activities:', error);
      });
  }

  render() {
    const { activities } = this.state;

    return (
      <div className="user-activity-container">
        <h2>User Activity</h2>
        <ul className="user-activity-list">
          {activities.map((activity) => (
            <li key={activity._id}>
              {activity.userName}: {activity.lastActivity}
            </li>
          ))}
        </ul>
      </div>
    );
  }
}

export default UserActivity;
