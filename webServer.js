/**
 * This builds on the webServer of previous projects in that it exports the
 * current directory via webserver listing on a hard code (see portno below)
 * port. It also establishes a connection to the MongoDB named 'cs142project6'.
 *
 * To start the webserver run the command:
 *    node webServer.js
 *
 * Note that anyone able to connect to localhost:portNo will be able to fetch
 * any file accessible to the current user in the current directory or any of
 * its children.
 *
 * This webServer exports the following URLs:
 * /            - Returns a text status message. Good for testing web server
 *                running.
 * /test        - Returns the SchemaInfo object of the database in JSON format.
 *                This is good for testing connectivity with MongoDB.
 * /test/info   - Same as /test.
 * /test/counts - Returns the population counts of the cs142 collections in the
 *                database. Format is a JSON object with properties being the
 *                collection name and the values being the counts.
 *
 * The following URLs need to be changed to fetch there reply values from the
 * database:
 * /user/list         - Returns an array containing all the User objects from
 *                      the database (JSON format).
 * /user/:id          - Returns the User object with the _id of id (JSON
 *                      format).
 * /photosOfUser/:id  - Returns an array with all the photos of the User (id).
 *                      Each photo should have all the Comments on the Photo
 *                      (JSON format).
 */
//added for project7
const session = require("express-session");
const bodyParser = require("body-parser");
const multer = require('multer');
const processFormBody = multer({ storage: multer.memoryStorage() }).single('uploadedphoto');
const fs = require('fs');


const mongoose = require("mongoose");
mongoose.Promise = require("bluebird");

const async = require("async");

const express = require("express");
const app = express();

// Load the Mongoose schema for User, Photo, and SchemaInfo
const User = require("./schema/user.js");
const Photo = require("./schema/photo.js");
const SchemaInfo = require("./schema/schemaInfo.js");
const Activity = require("./schema/activity.js");

// XXX - Commented out!
//const cs142models = require("./modelData/photoApp.js").cs142models;
mongoose.set("strictQuery", false);
mongoose.connect("mongodb://127.0.0.1/cs142project6", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// We have the express static module
// (http://expressjs.com/en/starter/static-files.html) do all the work for us.
app.use(express.static(__dirname));

//added for project7
app.use(session({ secret: "secretKey", resave: false, saveUninitialized: false }));
app.use(bodyParser.json());

app.get("/", function (request, response) {
  response.send("Simple web server of files from " + __dirname);
});

/**
 * Use express to handle argument passing in the URL. This .get will cause
 * express to accept URLs with /test/<something> and return the something in
 * request.params.p1.
 * 
 * If implement the get as follows:
 * /test        - Returns the SchemaInfo object of the database in JSON format.
 *                This is good for testing connectivity with MongoDB.
 * /test/info   - Same as /test.
 * /test/counts - Returns an object with the counts of the different collections
 *                in JSON format.
 */
app.get("/test/:p1", function (request, response) {
  // Express parses the ":p1" from the URL and returns it in the request.params
  // objects.
  console.log("/test called with param1 = ", request.params.p1);

  const param = request.params.p1 || "info";

  if (param === "info") {
    // Fetch the SchemaInfo. There should only one of them. The query of {} will
    // match it.
    SchemaInfo.find({}, function (err, info) {
      if (err) {
        // Query returned an error. We pass it back to the browser with an
        // Internal Service Error (500) error code.
        console.error("Error in /user/info:", err);
        response.status(500).send(JSON.stringify(err));
        return;
      }
      if (info.length === 0) {
        // Query didn't return an error but didn't find the SchemaInfo object -
        // This is also an internal error return.
        response.status(500).send("Missing SchemaInfo");
        return;
      }

      // We got the object - return it in JSON format.
      console.log("SchemaInfo", info[0]);
      response.end(JSON.stringify(info[0]));
    });
  } else if (param === "counts") {
    // In order to return the counts of all the collections we need to do an
    // async call to each collections. That is tricky to do so we use the async
    // package do the work. We put the collections into array and use async.each
    // to do each .count() query.
    const collections = [
      { name: "user", collection: User },
      { name: "photo", collection: Photo },
      { name: "schemaInfo", collection: SchemaInfo },
    ];
    async.each(
      collections,
      function (col, done_callback) {
        col.collection.countDocuments({}, function (err, count) {
          col.count = count;
          done_callback(err);
        });
      },
      function (err) {
        if (err) {
          response.status(500).send(JSON.stringify(err));
        } else {
          const obj = {};
          for (let i = 0; i < collections.length; i++) {
            obj[collections[i].name] = collections[i].count;
          }
          response.end(JSON.stringify(obj));
        }
      }
    );
  } else {
    // If we know understand the parameter we return a (Bad Parameter) (400)
    // status.
    response.status(400).send("Bad param " + param);
  }
});

/**
 * URL /user/list - Returns all the User objects.
 */
app.get('/user/list', async function (request, response) {
  try {
    const users = await User.find({}, '_id first_name last_name').lean().exec();
    const userList = users.map(({ _id, first_name, last_name }) => ({ _id, first_name, last_name }));
    response.status(200).json(userList);
  } catch (error) {
    console.error('Error fetching user list:', error);
    response.status(500).send('Internal Server Error');
  }
});

/**
 * URL /user/:id - Returns the information for User (id).
 */

app.get('/user/:id', async function (request, response) {
  try {
    const id = request.params.id;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      response.status(400).send('Invalid user ID');
      return;
    }
    const user = await User.findById(id, '_id first_name last_name location description occupation').lean().exec();
    if (!user) {
      console.log('User with _id:' + id + ' not found.');
      response.status(400).send('Not found');
      return;
    }
    response.status(200).json(user);
  } catch (error) {
    console.error('Error fetching user data:', error);
    response.status(500).send('Internal Server Error');
  }
});


/**
 * URL /photosOfUser/:id - Returns the Photos for User (id).
 */
app.get('/photosOfUser/:id', function (request, response) {
  var id = request.params.id;
  var result = [];

  Photo.find({ user_id: id }, function (err, photos) {
    if (err) {
      console.log('No photos found for _id: ' + id + '.');
      response.status(400).send('Not found');
      return;
    }

    let all_photos = JSON.parse(JSON.stringify(photos));
    async.each(
      all_photos,
      function (photo, photo_callback) {
        var commentsArray = [];
        let all_comments = JSON.parse(JSON.stringify(photo.comments));
        async.each(
          all_comments,
          function (comment, comment_callback) {
            User.findOne({ _id: comment.user_id }, function (err1, user) {
              if (err1) {
                console.log('Error fetching user:', err1);
                comment_callback(err1);
              } else {
                if (user) {
                  const user_obj = {
                    _id: user._id,
                    first_name: user.first_name,
                    last_name: user.last_name,
                  };
                  commentsArray.push({
                    comment: comment.comment,
                    date_time: comment.date_time,
                    _id: comment._id,
                    user: user_obj,
                  });
                }
                comment_callback();
              }
            });
          },
          function (err2) {
            if (err2) {
              console.log('Error fetching comments:', err2);
            } else {
              result.push({
                _id: photo._id,
                user_id: photo.user_id,
                comments: commentsArray,
                file_name: photo.file_name,
                date_time: photo.date_time,
              });
              photo_callback();
            }
          }
        );
      },
      function (err3) {
        if (err3) {
          console.log('Error fetching photos:', err3);
          response.status(400).send('Not found');
        } else {
          response.status(200).json(result);
        }
      }
    );
  });
});

app.post('/admin/login', async (request, response) => {
  try {
    const { login_name, password } = request.body;

    console.log('Received login request for login_name:', login_name);

    if (login_name === '' || password === '') {
      response.status(400).send('Please input a username and a password.');
      return;
    }

    // Check if the user exists in the database using the login_name
    const user = await User.findOne({ login_name }).exec();

    if (!user) {
      console.log('User with login_name: ' + login_name + ' not found.');
      response.status(400).send('User not found.');
      return;
    }

    let user_obj = JSON.parse(JSON.stringify(user));

    if (password !== user_obj.password) {
      response.status(400).send('Invalid password.');
      return;
    }

    console.log('User found:', user);

    // Store relevant user information in the session
    request.session.user = {
      loggedIn: true,
      loginName: login_name,
      _id: user_obj._id,
      first_name: user_obj.first_name,
      last_name: user_obj.last_name,
    };

    console.log('Session information stored:', request.session);

    // Update the activities log with the login activity
    const activity = new Activity({
      userId: user_obj._id,
      userName: user_obj.first_name + ' ' + user_obj.last_name,
      lastActivity: 'user logged in',
    });
    await activity.save();

    // Return the necessary user information as the response body
    const userData = {
      _id: user_obj._id,
      first_name: user_obj.first_name,
    };

    console.log('User data to be sent as response:', userData);

    response.status(200).json(userData);
  } catch (error) {
    console.error('Error fetching user data:', error);
    response.status(500).send('Internal Server Error');
  }
});

app.post('/admin/logout', async (request, response) => {
  try {
    const { _id, first_name, last_name } = request.session.user;

    // Create a new activity document for the logout action
    const activity = new Activity({
      userId: _id,
      userName: `${first_name} ${last_name}`,
      lastActivity: 'user logged out',
    });

    // Save the activity to the database
    await activity.save();

    // Clear the session data
    request.session.loggedIn = false;
    delete request.session.loginName;

    if (!request.session.loggedIn) {
      request.session.destroy((err) => {
        if (err) {
          console.error('Error destroying session:', err);
          response.status(500).send('Internal Server Error');
        } else {
          response.status(200).send('Logged out successfully');
        }
      });
    } else {
      response.status(400).send('Bad Request');
    }
  } catch (error) {
    console.error('Error logging out:', error);
    response.status(500).send('Internal Server Error');
  }
});

app.post('/commentsOfPhoto/:photo_id', async function (request, response) {
  try {
    if (!request.session.user._id) {
      return response.status(401).send("Unauthorized.");
    }

    const comment = request.body.comment;
    const userId = request.session.user._id;

    const photo = await Photo.findOne({ _id: request.params.photo_id });
    if (!photo) {
      return response.status(400).send('Not found');
    }

    const newComment = { comment: comment, user_id: userId };
    photo.comments.push(newComment);
    await photo.save();

    // Create a new activity for the added comment
    const activity = new Activity({
      userId: userId,
      userName: request.session.user.first_name + ' ' + request.session.user.last_name,
      lastActivity: 'added a comment',
    });
    await activity.save();

    return response.status(200).send();
  } catch (error) {
    console.error('Error adding comment:', error);
    return response.status(500).send('Internal Server Error');
  }
});

app.post('/photos/new', function (request, response) {
  processFormBody(request, response, function (uploadError) {
    if (uploadError || !request.file) {
      // Handle any errors that occur during file upload
      response.status(400).send('Error uploading file');
      return;
    }

    // Save the file to the desired location (e.g., the "images" directory)
    const timestamp = new Date().valueOf();
    const filename = 'U' + String(timestamp) + request.file.originalname;

    fs.writeFile("./images/" + filename, request.file.buffer, function (writeError) {
      if (writeError) {
        console.error('Error writing file:', writeError);
        response.status(500).send('Internal Server Error');
        return;
      }

      // Create a Photo object in the database
      const photo = new Photo({
        file_name: filename,
        user_id: request.session.user._id,
      });

      photo.save(function (saveError) {
        if (saveError) {
          console.error('Error saving photo:', saveError);
          response.status(500).send('Internal Server Error');
        } else {
          // Create a new activity record for the photo upload
          const activity = new Activity({
            userId: request.session.user._id,
            userName: request.session.user.first_name + ' ' + request.session.user.last_name,
            lastActivity: 'posted a photo',
          });

          activity.save(function (activitySaveError) {
            if (activitySaveError) {
              console.error('Error saving activity:', activitySaveError);
              response.status(500).send('Internal Server Error');
            } else {
              response.status(200).send('File uploaded successfully');
            }
          });
        }
      });
    });
  });
});


//for creating a new user in the database
app.post('/user', (req, res) => {
  const { login_name, password, first_name, last_name, location, description, occupation } = req.body;

  // validate the input
  if (!login_name || !password || !first_name || !last_name) {
    res.status(400).send('Missing required fields');
    return;
  }

  // ensure that the login_name doesn't already exist
  User.findOne({ login_name }, (findError, existingUser) => {
    if (findError) {
      console.error('Error finding user:', findError);
      res.status(500).send('Internal Server Error');
      return;
    }

    if (existingUser) {
      res.status(400).send('Username already exists');
      return;
    }

    const newUser = new User({
      login_name,
      password,
      first_name,
      last_name,
      location,
      description,
      occupation
    });

    newUser.save((saveError, savedUser) => {
      if (saveError) {
        console.error('Error saving user:', saveError);
        res.status(500).send('Internal Server Error');
        return;
      }

      // Create a new activity record for user registration
      const activity = new Activity({
        userId: savedUser._id,
        userName: savedUser.first_name + ' ' + savedUser.last_name,
        lastActivity: 'registered as a user',
      });

      activity.save((activitySaveError) => {
        if (activitySaveError) {
          console.error('Error saving activity:', activitySaveError);
          res.status(500).send('Internal Server Error');
        } else {
          // Return properties
          res.status(200).json({ login_name: savedUser.login_name });
        }
      });
    });
  });
});

// NEED TO CHANGE THIS - COMPLETELY
// Used to add photoId to the "favorite" property of a user object
app.post('/favorites/add', function (request, response) {
  if (!request.session.user._id) {
    response.status(401).send('Unauthorized user');
    return;
  }

  var session_user_id = request.session.user._id;
  var photoId = request.body.photoId;

  User.findOneAndUpdate(
    { _id: session_user_id },
    { $addToSet: { favorites: photoId } },
    { new: true },
    function (error, userInfo) {
      if (error) {
        console.error('Adding favorite photo error: ', error);
        response.status(400).send(JSON.stringify(error));
        return;
      }

      if (!userInfo) {
        console.log('User not found.');
        response.status(400).send('Not found');
        return;
      }
      console.log('Favorited photos:', userInfo.favorites); // Log favorited photos
      response.status(200).send('Favorite photo successfully added.');
    }
  );
});

// do i even use this what is this
app.get('/favorites/:userId', function (request, response) {
  var userId = request.session.user._id;

  User.findOne({ _id: userId }, function (err, userInfo) {
    if (err) {
      console.error('Error fetching user:', err);
      response.status(400).send(JSON.stringify(err));
      return;
    }

    if (userInfo === null || userInfo === undefined) {
      console.log('User not found.');
      response.status(404).send('User not found');
      return;
    }

    var favoritePhotoIds = userInfo.favorites;

    Photo.find({ _id: { $in: favoritePhotoIds } }, function (error, favoritePhotos) {
      if (error) {
        console.error('Error fetching favorite photos:', error);
        response.status(400).send(JSON.stringify(error));
        return;
      }

      var favoritePhotoInfo = favoritePhotos.map(photo => {
        return {
          photo_id: photo._id,
          owner_id: photo.user_id,
          file_name: photo.file_name,
          date_time: photo.date_time
        };
      });

      response.status(200).send(favoritePhotoInfo);
    });
  });
});


// Used to delete a favorite photo object for the logged-in user
app.post('/favorites/remove', function (request, response) {
  if (!request.session.user._id) {
    response.status(401).send('Unauthorized user');
    return;
  }

  var session_user_id = request.session.user._id;
  var photoId = request.body.photoId;

  User.findByIdAndUpdate(
    session_user_id,
    { $pull: { favorites: photoId } },
    { new: true },
    function (error, userInfo) {
      if (error) {
        console.error('Removing favorite photo error: ', error);
        response.status(400).send(JSON.stringify(error));
        return;
      }

      if (!userInfo) {
        console.log('User not found.');
        response.status(400).send('Not found');
        return;
      }

      response.status(200).send('Favorite photo successfully removed.');
    }
  );
});

// UNTIL HERE

app.get("/favorites", function (request, response) {
  var session_user_id = request.session.user._id;

  if (session_user_id) {
    User.findOne({ _id: session_user_id }, function (err, userInfo) {
      if (err) {
        console.error("Error fetching user:", err);
        response.status(400).send(JSON.stringify(err));
        return;
      }

      if (!userInfo) {
        console.log("User not found.");
        response.status(404).send("User not found");
        return;
      }

      var favoritePhotos = userInfo.favorites;

      Photo.find({ _id: { $in: favoritePhotos } }, function (error, photos) {
        if (error) {
          console.error("Error fetching favorite photos:", error);
          response.status(400).send(JSON.stringify(error));
          return;
        }

        response.status(200).send(photos);
      });
    });
  } else {
    response.status(401).send("Unauthorized user");
  }
});

app.get('/user/:userId/recent-photo', function (req, res) {
  const userId = req.params.userId;

  Photo.find({ user_id: userId })
    .sort({ date_time: -1 })
    .limit(1)
    .exec(function (err, photos) {
      if (err) {
        console.error('Error fetching recent photo:', err);
        res.status(500).send('Internal server error');
        return;
      }

      if (photos.length === 0) {
        console.log('No photos found for user:', userId);
        res.status(200).json({ message: 'No photos found for user' });
        return;
      }

      const recentPhoto = photos[0];
      const recentPhotoData = {
        photoId: recentPhoto._id,
        thumbnailUrl: `/images/${recentPhoto.file_name}`, // Replace with the URL of the thumbnail image
        date: recentPhoto.date_time,
      };

      console.log('Most recently uploaded photo:', recentPhotoData);
      res.status(200).json(recentPhotoData);
    });
});

app.get('/user/:userId/most-commented-photo', function (req, res) {
  const userId = req.params.userId;

  Photo.find({ user_id: userId }, function (err, photos) {
    if (err) {
      console.error('Error fetching photos:', err);
      res.status(500).send('Internal server error');
      return;
    }

    if (!photos || photos.length === 0) {
      console.log('No photos found for user:', userId);
      res.status(200).json({ message: 'No photos found for user' });
      return;
    }

    let maxCommentCount = 0;
    let mostCommentedPhoto = null;

    for (let i = 0; i < photos.length; i++) {
      const photo = photos[i];
      if (photo.comments.length > maxCommentCount) {
        maxCommentCount = photo.comments.length;
        mostCommentedPhoto = photo;
      }
    }

    if (!mostCommentedPhoto) {
      console.log('No most commented photo found for user:', userId);
      res.status(200).json({ message: 'No most commented photo found for user' });
      return;
    }

    const mostCommentedPhotoData = {
      photoId: mostCommentedPhoto._id,
      thumbnailUrl: `/images/${mostCommentedPhoto.file_name}`, // Replace with the URL of the thumbnail image
      commentsCount: mostCommentedPhoto.comments.length,
    };

    console.log('Most commented photo:', mostCommentedPhotoData);
    res.status(200).json(mostCommentedPhotoData);
  });
});


app.get('/activities', function (req, res) {
  // Fetch the activities data from your database
  Activity.find({}, 'userId userName lastActivity', function (err, activities) {
    if (err) {
      console.error('Error fetching activities:', err);
      res.status(500).send('Error fetching activities');
      return;
    }

    // Create an object to store the unique activities based on userId
    const uniqueActivities = {};

    // Iterate over the fetched activities and update the unique activities object
    activities.forEach((activity) => {
      uniqueActivities[activity.userId] = activity;
    });

    // Convert the object values back to an array
    const updatedActivities = Object.values(uniqueActivities);

    // Return the updated activities as the response
    res.status(200).json(updatedActivities);
  });
});



const server = app.listen(3000, function () {
  const port = server.address().port;
  console.log(
    "Listening at http://localhost:" +
    port +
    " exporting the directory " +
    __dirname
  );
});
