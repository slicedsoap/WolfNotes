# Team Project: Milestone 1

## WolfNotes

## Progress Report

### Completed Features

* User login
* User registration

### Pending Features

* Find class section
* Upload pdfs, text, or images
* Organize notes by class, section, topic, and date
* Search and filter with tags
* View files uploaded by other students
* Rate and review specific study materials
* Leave comments or suggest edits to classmates
* Sync across devices

Instructors can:

* Create classes.
* Remove students from a class.
* Remove notes uploaded by students.

Students can:

* Join an existing class.
* Upload their own notes.
* View other students notes.
* Upvote other notes.


### Page Implementation Progress

<!-- Provide links to wireframes of pages not 100% completed -->

Page                              | Status | Wireframe
--------------------------------- | ------ | ---------
Login (student and instructor)    |    	✅    | 
Register (student and instructor) |    	✅    | 
Student Homepage                  |    95%     |![Home](https://github.com/ncstate-csc-coursework/csc342-2025Fall-TeamF/blob/main/Proposal/images/StudentViewDesktop.png)
My Notes                          |     95%   | ![Create](https://github.com/ncstate-csc-coursework/csc342-2025Fall-TeamF/blob/main/Proposal/images/myNotesDesktop.png)
Note view                         |   80%     | ![NoteView](https://github.com/ncstate-csc-coursework/csc342-2025Fall-TeamF/blob/main/Proposal/images/DesktopShareNotes.png)
Upload notes                      |   0%  |![Create](https://github.com/ncstate-csc-coursework/csc342-2025Fall-TeamF/blob/main/Proposal/images/Screenshot%202025-10-07%20203156.png)
Instructor Homepage                      |  95%   |![Home](https://github.com/ncstate-csc-coursework/csc342-2025Fall-TeamF/blob/main/Proposal/images/Screenshot%202025-10-07%20203218.png)



# API Documentation

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

## Team Member Contributions

#### Christopher Brower

* API Scaffolding
* Login screen html/css/basic validation js
* Register screen html/css/basic validation js

#### Simone Panja

* Instructor homepage html/css/javascript
* Progress Report

#### Shamiya Rahmathulla

* Student homepage screen html/css/javascript
* Student notes sceen html/css/javascript
* Progress Report

#### Milestone Effort Contribution

<!-- Must add to 100% -->

Christopher Brower| Simone Panja| Shamiya Rahmathulla
------------- | ------------- | --------------
50%            | 25%            | 25%
