import React from "react";
import { Link } from "react-router-dom";
import axios from "axios";

import "./styles.css";

/**
 * Define UserDetail, a React component of CS142 Project 5.
 */
class UserDetail extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      user: null,
      recentPhoto: null,
      mostCommentedPhoto: null,
    };
  }

  componentDidMount() {
    this.fetchUser();
    this.fetchRecentPhoto();
    this.fetchMostCommentedPhoto();
  }

  componentDidUpdate(prevProps) {
    const { userId } = this.props.match.params;
    const prevUserId = prevProps.match.params.userId;
    if (userId !== prevUserId) {
      this.fetchUser();
    }
  }

  fetchUser() {
    const { userId } = this.props.match.params;
    axios
      .get(`/user/${userId}`)
      .then((response) => {
        const user = response.data;
        this.setState({ user });
      })
      .catch((error) => {
        console.error("Error fetching user:", error);
      });
  }

  //NEW FEATURE
  fetchRecentPhoto() {
    const { userId } = this.props.match.params;
    axios
      .get(`/user/${userId}/recent-photo`)
      .then((response) => {
        const recentPhoto = response.data;
        this.setState({ recentPhoto });
      })
      .catch((error) => {
        console.error("Error fetching recent photo:", error);
      });
  }

  fetchMostCommentedPhoto() {
    const { userId } = this.props.match.params;
    axios
      .get(`/user/${userId}/most-commented-photo`)
      .then((response) => {
        const mostCommentedPhoto = response.data;
        this.setState({ mostCommentedPhoto });
      })
      .catch((error) => {
        console.error("Error fetching most commented photo:", error);
      });
  }

  render() {
    const { user, recentPhoto, mostCommentedPhoto } = this.state;
    const { userId } = this.props.match.params;

    if (!user || !recentPhoto || !mostCommentedPhoto) {
      return <div>Loading...</div>;
    }

    return (
      <div>
        <h1>{`${user.first_name}`}</h1>
        <p>User ID: {userId}</p>
        <p>Name: {`${user.first_name} ${user.last_name}`}</p>
        <p>Location: {user.location}</p>
        <p>Description: {user.description}</p>
        <div className="link">
          <Link to={`/photos/${userId}`}>See Photos</Link>
        </div>
        <div>
          <h2 className="details-header">Most Recently Uploaded Photo</h2>
          {recentPhoto ? (
            <Link to={`/photos/${userId}`}>
              <img
                src={recentPhoto.thumbnailUrl}
                alt={recentPhoto.thumbnailUrl}
                className="photo-img"
              />
            </Link>
          ) : (
            <p>No recent photo found</p>
          )}
          {recentPhoto && <p>Date Uploaded: {recentPhoto.date}</p>}
        </div>

        <div>
          <h2 className="details-header">Photo with Most Comments</h2>
          {mostCommentedPhoto ? (
            <Link to={`/photos/${userId}`}>
              <img
                src={mostCommentedPhoto.thumbnailUrl}
                alt={mostCommentedPhoto.thumbnailUrl}
                className="photo-img"
              />
            </Link>
          ) : (
            <p>No most commented photo found</p>
          )}
          {mostCommentedPhoto && (
            <p>Comments Count: {mostCommentedPhoto.commentsCount}</p>
          )}
        </div>
      </div>
    );
  }
}

export default UserDetail;
