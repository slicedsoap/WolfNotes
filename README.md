# Final Team Project

# [WolfNotes]

# Progress Report

## Completed Features

* Instructor homepage online/offline course load
* Student homepage online/offline course load
* Instructor profile page controls
* Class view page offline note load
* My notes page offline note load
* Installability


## Known Issues & Limitations

* No offline capability on instructor profile page
* No student profile page for editing fields
* ...


## Authentication & Authorization

For authentication, we use a combination of a JWT approach and a local storage item. When a user registers or logs in, we provide them with a JWT for their role and also store the current user in local storage. If the user is online we run auth checks to the /verify api endpoint with their JWT to ensure they can view the page they are on. If offline, we use the local storage value to check if they can view the page. 

All backend routes are protected with authentication middleware that checks a users role before performing the specified operation.

## PWA Capabilities

<!-- Describe features available to your users offline, caching strategy, installability, theming, etc. -->
### Offline

When offline, a user has a variety of things they can still do thanks to IndexedDB and caching. The user can still navigate to every page since our service worker caches every page on install. The actual data on each page is sometimes available depending on if the user has visited the page online before. When a user visits a page online, we save necessary objects like classes and notes to the IndexedDB. So, if the user is offline, we retrieve these values from the IndexedDB and display them. The user can upload notes while offline, and have the upload sync when online, also thanks to IndexedDB. 

The user cannot update likes or download notes in offline mode, nor edit the values on the instructor profile page.

### Caching Strategy

As mentioned above, we used IndexedDB to cache json responses from the API, and we are using the service worker to cache all static assets on install. This allows for all pages to be available in offline mode, and sometimes to have cached data if applicable.

### Installibility

The user can install the app on the landing page or on either homepage. We have a variety of icon sizes to show in the installable app, and provided a color theme. Functionality is thorough on the installed app.






## API Documentation

### Authentication
| Method | Route       | Description                                             | Auth Required | Body / Params                                                                      |
| ------ | ----------- | ------------------------------------------------------- | ------------- | ---------------------------------------------------------------------------------- |
| `POST` | `/login`    | Logs in a user with email/password, sets JWT cookie     | No            | **Body:** `{ email, password }`                                                    |
| `POST` | `/logout`   | Logs out current user by clearing token cookie          | Yes           | —                                                                                  |
| `POST` | `/register` | Creates a new user; validates email, password, and role | No            | **Body:** `{ firstName, lastName, email, password, role, institution?, subject? }` |
| `GET`  | `/verify`   | Verifies token and returns current authenticated user   | Yes           | —                                                                                  |

### Classes
| Method   | Route                        | Description                                                                                               | Auth Required    | Body / Params                                                  |
| -------- | ---------------------------- | --------------------------------------------------------------------------------------------------------- | ---------------- | -------------------------------------------------------------- |
| `POST`   | `/classes`                   | Instructor creates a new class. Class code is auto-generated.                                             | Yes (Instructor) | **Body:** `{ instructorID, name, classDesc, section?, tags? }` |
| `GET`    | `/classes`                   | Gets all classes for the authenticated user (instructor = classes they teach, student = classes enrolled) | Yes              | —                                                              |
| `GET`    | `/classes/:classID`          | Gets a class by ID                                                                                        | Yes              | **Params:** `classID`                                          |
| `PUT`    | `/classes/:classID`          | Updates class fields                                                                                      | Yes (Instructor) | **Body:** `{ name, classCode, classDesc }`                     |
| `DELETE` | `/classes/:classID`          | Deletes a class                                                                                           | Yes (Instructor) | **Params:** `classID`                                          |
| `GET`    | `/classes/:classID/students` | Instructor gets all students enrolled in their class                                                      | Yes (Instructor) | **Params:** `classID`                                          |
| `PATCH`  | `/classes/:classID/archive`  | Archive/unarchive a class                                                                                 | Yes (Instructor) | **Body:** `{ archived: boolean }`                              |

### Notes
| Method   | Route                     | Description                                               | Auth Required | Body / Params                 |
| -------- | ------------------------- | --------------------------------------------------------- | ------------- | ----------------------------- |
| `POST`   | `/notes/classes/:classID` | Upload a PDF note to a class (students only)              | Yes (Student) | **Form-Data:** `pdf`, `title` |
| `GET`    | `/notes/classes/:classID` | Get all notes for a class                                 | Yes           | —                             |
| `GET`    | `/notes/:noteID`          | Get a note by ID                                          | Yes           | **Params:** `noteID`          |
| `GET`    | `/notes/users/:userID`    | Get all notes posted by a specific user                   | Yes           | **Params:** `userID`          |
| `GET`    | `/notes/:noteID/download` | Downloads the PDF file associated with the note           | Yes           | **Params:** `noteID`          |
| `POST`   | `/notes/:noteID/upvote`   | Upvote a note (students only); prevents duplicate upvotes | Yes (Student) | **Params:** `noteID`          |
| `DELETE` | `/notes/:noteID`          | Delete a note (uploader or instructor only)               | Yes           | **Params:** `noteID`          |

### Users
| Method | Route            | Description                                                  | Auth Required | Body / Params                                                      |
| ------ | ---------------- | ------------------------------------------------------------ | ------------- | ------------------------------------------------------------------ |
| `GET`  | `/users/:userId` | Retrieves user by ID                                         | Yes           | **Params:** `userId`                                               |
| `PUT`  | `/users/:userId` | Updates a user’s profile (only the user can update themself) | Yes           | **Body:** `{ firstName, lastName, email, institution?, subject? }` |


### Enrollment
| Method   | Route                                     | Description                            | Auth Required | Body / Params                      |
| -------- | ----------------------------------------- | -------------------------------------- | ------------- | ---------------------------------- |
| `POST`   | `/enrollment/:studentID/enroll`           | Enrolls a student using a *class code* | Yes (Student) | **Body:** `{ classID: classCode }` |
| `DELETE` | `/enrollment/:studentID/classes/:classID` | Unenrolls a student from a class       | Yes           | **Params:** `studentID`, `classID` |


## Database ER Diagram

```markdown

Use this syntax to embed an image in your markdown file:

![](images/erd.png)
```



## Team Member Contributions

#### [Christopher Brower]

* Instructor homepage online/offline course load
* Student homepage online/offline course load
* Instructor profile page controls
* Class view page offline note load
* My notes page offline note load
* Installability

#### [Shamiya Rahmathulla]

* Completed Class view page

#### [Name of Team Member 3]

* Contribution 1
* Contribution 2
* ...

#### Milestone Effort Contribution

<!-- Must add to 100% -->

Chris | Shamiya | Simone
------------- | ------------- | --------------
33%            | 33%            | 34%
