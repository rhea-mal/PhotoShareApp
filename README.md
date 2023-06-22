# PhotoShareApp

Welcome to the PhotoShare App repository! This app allows users to share and interact with photos in a social media-like environment. It includes several features such as favoriting photos, an activity feed, and extended user details.

Setup
Before getting started with the PhotoShare App, make sure you have the following prerequisites:

MongoDB installed on your system
Node.js installed on your system
If you don't have MongoDB and Node.js installed, please follow the respective installation instructions for your operating system.

To set up the app, follow these steps:

Clone the repository: git clone <repository-url>
Change to the project directory: cd <project-directory>
Install the project dependencies: npm install
Start the MongoDB server: mongod --dbpath /path/to/your/db
Load the initial database with the required schemas and objects: node loadDatabase.js
Start the web server and connect to the MongoDB instance: node webServer.js
Access the app in your browser at http://localhost:3000/photo-share.html


Here are the summaries of each user story as features of the PhotoShare App:

1. Extend User Profile Detail with Usage: Users can view detailed user profiles, including the most recently uploaded photo and the photo with the most comments, and clicking on these photos navigates to the user's photo view.
2. Activity Feed: Users can view a chronological activity feed displaying recent activities on the platform, including photo uploads, new comments, user registrations, logins, and logouts.
3. Photo "Like" Votes: Users can like and unlike photos, and the number of likes for each photo is displayed. The user's photos page is sorted by the number of likes in descending order.
4. Favorite Lists of Photos for Users: Users can mark photos as favorites, and a dedicated page displays the user's list of favorited photos, which can be removed from the list.
5. Sidebar List Marks Users with New Activity: The sidebar user list displays recent activities of each user, including photo uploads, comments, registrations, logins, and logouts.
6. Photo Upload: Users can upload their own photos directly from the top bar, allowing them to easily share their images with others.
Adding Comments to Other Users' Posts: Users can comment on photos uploaded by other users, fostering engagement and interaction within the community.
7. Registering New Accounts: New users can create accounts by registering through the app, providing their necessary information, and setting up their profiles.
8. Login/Logout Mechanisms: Users can securely log in and out of their accounts using the provided login/logout mechanisms. This ensures account privacy and enables personalized access to features and user-specific information.

The app utilizes the Axios library for handling API requests and responses, providing seamless communication between the front-end and back-end components.

User Profile Example
<img width="1072" alt="Screenshot 2023-06-22 at 9 56 38 AM" src="https://github.com/rhea-mal/PhotoShareApp/assets/70975260/f07e6aa2-5bb6-4ce9-9a70-685384389733">

User Details Sidebar + Most Liked/Commented
<img width="1426" alt="Screenshot 2023-06-22 at 9 57 12 AM" src="https://github.com/rhea-mal/PhotoShareApp/assets/70975260/5ff51f86-1396-4a25-a481-a4eab998b4b1">


Initial Login Page
<img width="1436" alt="Screenshot 2023-06-22 at 9 45 42 AM" src="https://github.com/rhea-mal/PhotoShareApp/assets/70975260/ac31dba4-a9ac-48a2-9582-173df51a49ee">

New User Registration Onboarding
<img width="1435" alt="Screenshot 2023-06-22 at 9 46 03 AM" src="https://github.com/rhea-mal/PhotoShareApp/assets/70975260/57642d62-93fd-4081-a01c-427a842c117a">

Favorites Photos List
<img width="1440" alt="Screenshot 2023-06-22 at 9 46 36 AM" src="https://github.com/rhea-mal/PhotoShareApp/assets/70975260/51cc16fb-9549-49ac-9416-d483d95bcf96">



