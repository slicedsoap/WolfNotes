# Team Project: Milestone 2

## WolfNotes

## Progress Report

### Completed Features

* Login/Register pages
* DAOs + endpoints

### Pending Features

* Functionality for viewing, uploading notes
* Organizing flow of PWA
* Upload pdfs, text, or images
* Organize notes by class, section, topic, and date
* Search and filter with tags
* View files uploaded by other students
* Rate and review specific study materials
* Leave comments or suggest edits to classmates
* Sync across devices


### Page Implementation Progress

<!-- Provide links to wireframes of pages not 100% completed -->

Page                              | Status | Wireframe
--------------------------------- | ------ | ---------
Login (student and instructor)    |    	✅    | 
Register (student and instructor) |    	✅    | 
Student Homepage                  |    95%     |![Home](https://github.com/ncstate-csc-coursework/csc342-2025Fall-TeamF/blob/main/Proposal/images/StudentViewDesktop.png)
My Notes                          |     95%   | ![Create](https://github.com/ncstate-csc-coursework/csc342-2025Fall-TeamF/blob/main/Proposal/images/myNotesDesktop.png)
Note view                         |   80%     | ![NoteView](https://github.com/ncstate-csc-coursework/csc342-2025Fall-TeamF/blob/main/Proposal/images/DesktopShareNotes.png)
Upload notes                      |   80%  |![Create](https://github.com/ncstate-csc-coursework/csc342-2025Fall-TeamF/blob/main/Proposal/images/Screenshot%202025-10-07%20203156.png)
Instructor Homepage                      |  95%   |![Home](https://github.com/ncstate-csc-coursework/csc342-2025Fall-TeamF/blob/main/Proposal/images/Screenshot%202025-10-07%20203218.png)



## API Documentation

## Auth Routes

| Method | Route                 | Description |
| ------ | --------------------- | ----------- |
| `POST` | `/login`              | Login a user with email password pair |
| `POST` | `/logout`             | Log out the current user |
| `POST` | `/register`           | Creates a new user account and returns the new user object |

## User Routes

| Method | Route                 | Description |
| ------ | --------------------- | ----------- |
| `GET`  | `/users`              | Retrieves an array of all active users in the system |
| `GET`  | `/users/:userId`      | Retrieves a user by its Id |

## Class Routes

| Method | Route                 | Description |
| ------ | --------------------- | ----------- |
| `POST` | `/classes`            | Create a new class |
| `GET`  | `/classes`            | Get all classes |
| `GET`  | `/classes/:classID`   | Get a specific class by classID |
| `PUT`  | `/classes/:classID`   | Update a class |
| `DELETE` | `/classes/:classID` | Delete a class by classID |

## Note Routes

| Method | Route                        | Description |
| ------ | ---------------------------- | ----------- |
| `POST` | `/notes/classes/:classID`    | Upload a new note to a class |
| `GET`  | `/notes/classes/:classID`    | Get all notes for a class |
| `GET`  | `/notes/:noteID`             | Get a specific note by ID |
| `POST` | `/notes/:noteID/upvote`      | Upvote a note |
| `DELETE` | `/notes/:noteID`           | Delete a note by ID |

## Student Routes

| Method | Route                                | Description |
| ------ | ------------------------------------ | ----------- |
| `POST` | `/students/:studentID/enroll`        | Enroll a student in a class |
| `GET`  | `/students/:studentID/classes`       | Get all classes a student is enrolled in |
| `DELETE` | `/students/:studentID/classes/:classID` | Remove a student from a class (unenroll) |


## Database ER Diagram

![ER]((https://github.com/ncstate-csc-coursework/csc342-2025Fall-TeamF/blob/main/Proposal/images/WolfNotesER.png))


## Team Member Contributions

Student & Auth Routes Chris

User & Notes Routes Simone

Class Routes & Class view page Shamiya
  

#### Christopher Brower

* Student & Auth Routes
* DB Schema

#### Simone Panja

* User & Notes Routes
* DB ER Diagram

#### Shamiya Rahmathulla

* Class Routes
* Class View Page

#### Milestone Effort Contribution

<!-- Must add to 100% -->

Christopher Brower | Simone Panja | Shamiya Rahmathulla
------------- | ------------- | --------------
35%            | 37%            | 28%
