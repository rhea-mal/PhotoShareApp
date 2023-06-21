import React from "react";
import axios from "axios";
import { Grid, Modal, Typography, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import './styles.css';

class Favorites extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            favoritePhotos: [],
            selectedPhoto: null,
        };
    }

    componentDidMount() {
        const { userId } = this.props;
        this.fetchFavoritePhotos(userId);
    }

    fetchFavoritePhotos = (userId) => {
        axios
            .get(`/favorites/${userId}`)
            .then((response) => {
                this.setState({ favoritePhotos: response.data });
            })
            .catch((error) => {
                console.error("Error fetching favorite photos:", error);
            });
    };

    openModal = (photo) => {
        this.setState({ selectedPhoto: photo });
    };

    closeModal = () => {
        this.setState({ selectedPhoto: null });
    };

    removeFavorite = (photoId) => {
        const updatedPhotos = this.state.favoritePhotos.filter((photo) => photo.photo_id !== photoId);

        axios
            .post("/favorites/remove", { photoId })
            .then(() => {
                this.setState({ favoritePhotos: updatedPhotos }, () => {
                    const photoContainer = document.getElementById(`photo-${photoId}`);
                    if (photoContainer) {
                        photoContainer.classList.add("removed-photo");
                        setTimeout(() => {
                            this.setState((prevState) => ({
                                favoritePhotos: prevState.favoritePhotos.filter((photo) => photo.photo_id !== photoId),
                            }));
                        }, 1000); // Wait for the animation to finish
                    }
                });
            })
            .catch((error) => {
                console.error("Error removing favorite photo:", error);
            });
    };

    render() {
        const { favoritePhotos, selectedPhoto } = this.state;

        return (
            <div className="favorites-container">
                <Typography variant="h6" className="favorites-heading">Favorite Photos</Typography>
                <Grid container spacing={2}>
                    {favoritePhotos.map((photo) => (
                        <Grid item key={photo.photo_id} xs={6} sm={3}>
                            <div className={`favorite-photo ${photo.isRemoved ? 'removed-photo' : ''}`} id={`photo-${photo.photo_id}`}>
                                <img
                                    src={`/images/${photo.file_name}`}
                                    alt={photo.file_name}
                                    onClick={() => this.openModal(photo)}
                                    className="favorite-photo-image"
                                />
                                <IconButton
                                    size="small"
                                    onClick={() => this.removeFavorite(photo.photo_id)}
                                    className="close-button"
                                >
                                    <CloseIcon />
                                </IconButton>
                            </div>
                        </Grid>
                    ))}
                </Grid>
                {selectedPhoto && (
                    <Modal open={true} onClose={this.closeModal}>
                        <div className="modal-content">
                            <img
                                src={`/images/${selectedPhoto.file_name}`}
                                alt={selectedPhoto.file_name}
                                className="modal-image"
                            />
                            <Typography variant="body1" className="modal-info">
                                Date: {selectedPhoto.date_time}
                            </Typography>
                        </div>
                    </Modal>
                )}
            </div>
        );
    }
}

export default Favorites;
