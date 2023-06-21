import React from "react";
import { Typography } from "@mui/material";
import { Link } from "react-router-dom";
import axios from 'axios';
import "./styles.css";
import heartIcon from "./heart.svg";
import FilledheartIcon from "./heart2.svg";

class UserPhotos extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      photoList: null,
      user: null,
      newComment: "",
      isFavorite: {},
    };
    this.handleNewComment = this.handleNewComment.bind(this);
    this.handleCommentChange = this.handleCommentChange.bind(this);
    this.handleAddFavorite = this.handleAddFavorite.bind(this);
  }

  componentDidMount() {
    axios.get(`photosOfUser/${this.props.match.params.userId}`)
      .then((response) => {
        this.setState({ photoList: response.data });
      })
      .catch((error) => {
        console.error("Error fetching user photos:", error);
      });

    axios.get(`/user/${this.props.match.params.userId}`)
      .then((response) => {
        this.setState({ user: response.data, currentUser: response.data._id }); // added something here
      })
      .catch((error) => {
        console.error("Error fetching user:", error);
      });

    //new did mount
    axios.get(`/favorites/${this.props.match.params.userId}`)
      .then((response) => {
        const favorites = response.data;
        const isFavorite = {};

        // Store the favorite status in the state
        favorites.forEach((favorite) => {
          isFavorite[favorite.photoId] = true;
        });

        this.setState({ isFavorite });
      })
      .catch((error) => {
        console.error("Error fetching favorite status:", error);
      });

    this.fetchData();
  }

  componentDidUpdate(prevProps) {
    const { newPhoto } = this.props;

    if (newPhoto !== prevProps.newPhoto) {
      this.fetchData();
    }
  }

  handleCommentChange = (event) => {
    this.setState({ newComment: event.target.value });
  };

  handleNewComment = (id) => {
    const { newComment, currentUser } = this.state;
  
    if (newComment === "") {
      return;
    }
  
    axios
      .post(`/commentsOfPhoto/${id.toString()}`, { comment: newComment, user_id: currentUser })
      .then(() => {
        const { isFavorite } = this.state;
        isFavorite[id] = true;
        this.setState({ isFavorite });
  
        // Call fetchActivities from the UserActivity component to update the activities
        if (this.props.fetchActivities) {
          this.props.fetchActivities();
        }
  
        this.fetchData();
      })
      .catch((error) => {
        console.log(error);
      });
  };  

  // NEW HANDLE ADDED
  handleAddFavorite(photoId) {
    axios.post(`/favorites/add`, { photoId })
      .then(() => {
        const { isFavorite } = this.state;
        isFavorite[photoId] = true;
        this.setState({ isFavorite });
      })
      .catch((error) => {
        console.log(error);
      });
  }

  fetchData = () => {
    const { userId } = this.props.match.params;

    axios.get(`/photosOfUser/${userId.toString()}`)
      .then((response) => {
        this.setState({
          photoList: response.data
        });
      })
      .catch(() => {
        this.setState({ photoList: [] });
      });
  };

  render() {
    const userId = this.props.match.params.userId;
    const { photoList, user } = this.state;
    if (!photoList || !user) {
      return null;
    }

    if (photoList.length === 0) {
      return <div>No photos available.</div>;
    }

    const renderComments = (comments) => {
      if (!comments || comments.length === 0) {
        return <p className="no-comments">No comments available for this post.</p>;
      }

      return (
        <>
          {comments.map((comment) => (
            <div key={comment._id} className="comment">
              <p className="user-name">
                <Link to={`/users/${comment.user._id}`}>
                  {comment.user.first_name} {comment.user.last_name}
                </Link>
                <br />
                <span className="date-time">{comment.date_time}</span>
              </p>
              <p>{comment.comment}</p>
            </div>
          ))}
        </>
      );
    };

    return (
      <div className="container">
        <Typography variant="h6" className="header">
          Photos of {user ? `${user.first_name} ${user.last_name}` : "User"}
        </Typography>
        <Typography variant="body1">
          Showing details of user: {userId}
        </Typography>
        {photoList.map((photo) => (
          <div key={photo._id} className="photo">
            <img
              src={`/images/${photo.file_name}`}
              alt={photo.file_name}
              className="photo-img"
            />
            <div className="photo-content">
              <p className="date-time">Date/Time: {photo.date_time}</p>
              <p className="file-name">File Name: {photo.file_name}</p>
              <div className="comments">
                <p>Comments:</p>
                {renderComments(photo.comments)}
              </div>
              <form onSubmit={() => this.handleNewComment(photo._id)}>
                <label>
                  Add new comment:
                  <input type="text" onChange={this.handleCommentChange} />
                </label>
                <input type="submit" value="Submit" />
              </form>
              <button
                disabled={this.state.isFavorite[photo._id]}
                onClick={() => {
                  if (this.state.isFavorite[photo._id]) {
                    // remove this from here??
                    //this.handleRemoveFavorite(photo._id);
                  } else {
                    this.handleAddFavorite(photo._id);
                  }
                }}
                className="favorite-button"
              >
                {this.state.isFavorite[photo._id] ? (
                  <img src={FilledheartIcon} alt="Favorited" className="heart-icon" />
                ) : (
                  <img src={heartIcon} alt="Favorite" className="heart-icon" />
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  }
}

export default UserPhotos;
