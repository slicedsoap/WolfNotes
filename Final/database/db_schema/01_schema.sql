SET NAMES utf8mb4;

--
-- USER TABLE
--
-- Indexing on email & role. Primary key is id
--
-- id: unique key for user
-- firstName & lastName: strings of up to 100 chars
-- email: string of 150, also must be unique
-- password: string of up to 255 chars
-- salt: to hash passwords with bcrypt, up to 100 chars
-- role: either the value 'student' or 'instructor'
-- institution: optional string (nullable) of up to 150 chars
-- subject: optional string (nullable) of up to 100 chars
-- createdAt & updatedAt: sql timestamp tracks
--
CREATE TABLE IF NOT EXISTS `user` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `firstName` varchar(100) NOT NULL,
  `lastName` varchar(100) NOT NULL,
  `email` varchar(150) NOT NULL UNIQUE,
  `password` varchar(255) NOT NULL,
  `salt` varchar(100) NOT NULL,
  `role` enum('student','instructor') NOT NULL,
  `institution` varchar(150) DEFAULT NULL,
  `subject` varchar(100) DEFAULT NULL,
  `createdAt` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `IDX_EMAIL` (`email`),
  KEY `IDX_ROLE` (`role`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- CLASS TABLE
--
-- Primary key is id. Indexing on class code, instructor ID, and archived. 
--
-- Contains foreign key for user table through instructorID
--
-- id: unique key for a class
-- instructorID: user ID of instructor. Foreign key into user table
-- name: class name up to 200 chars
-- classCode: unique code for class register up to 50 chars
-- classDesc: description for class, text field as varies in size per course
-- archived: boolean flag to mark class as archived, defaults to FALSE
-- createdAt & updatedAt: sql timestamp tracks
-- 
CREATE TABLE IF NOT EXISTS `class` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `instructorID` int unsigned NOT NULL,
  `name` varchar(200) NOT NULL,
  `classCode` varchar(50) NOT NULL UNIQUE,
  `classDesc` text,
  `section` varchar(50) DEFAULT NULL,
  `tags` JSON DEFAULT NULL,
  `archived` BOOLEAN NOT NULL DEFAULT FALSE,
  `createdAt` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `IDX_CLASS_CODE` (`classCode`),
  KEY `IDX_ARCHIVED` (`archived`),
  KEY `FK_CLASS_INSTRUCTOR` (`instructorID`),
  CONSTRAINT `FK_CLASS_INSTRUCTOR` FOREIGN KEY (`instructorID`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- ENROLLMENT TABLE
--
-- Composite primary key of studentID & classID. Indexing on classID
--
-- Contains foreign keys for user and class tables
--
-- studentID: user ID of student. Foreign key into user table
-- classID: ID of class. Foreign key into class table
-- enrolledAt: timestamp when student enrolled in class
--
CREATE TABLE IF NOT EXISTS `enrollment` (
  `studentID` int unsigned NOT NULL,
  `classID` int unsigned NOT NULL,
  `enrolledAt` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`studentID`, `classID`),
  KEY `FK_ENROLLMENT_CLASS` (`classID`),
  CONSTRAINT `FK_ENROLLMENT_STUDENT` FOREIGN KEY (`studentID`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `FK_ENROLLMENT_CLASS` FOREIGN KEY (`classID`) REFERENCES `class` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- NOTE TABLE
--
-- Indexing on classID, uploaderID, and upvotes. Primary key is `id`
--
-- Contains foreign keys for class and user tables
--
-- id: unique key for a note
-- classID: ID of class note belongs to. Foreign key into class table
-- uploaderID: user ID of note creator. Foreign key into user table
-- title: note title/filename up to 200 chars
-- filePath: path to the stored PDF file, up to 500 chars
-- fileSize: size of file in bytes
-- upvotes: count of upvotes for note, unsigned int defaults to 0
-- createdAt & updatedAt: sql timestamp tracks
--
CREATE TABLE IF NOT EXISTS `note` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `classID` int unsigned NOT NULL,
  `uploaderID` int unsigned NOT NULL,
  `title` varchar(200) NOT NULL,
  `filePath` varchar(500) NOT NULL,
  `fileSize` int unsigned DEFAULT 0,
  `upvotes` int unsigned DEFAULT 0,
  `createdAt` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `FK_NOTE_CLASS` (`classID`),
  KEY `FK_NOTE_UPLOADER` (`uploaderID`),
  KEY `IDX_UPVOTES` (`upvotes`),
  CONSTRAINT `FK_NOTE_CLASS` FOREIGN KEY (`classID`) REFERENCES `class` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `FK_NOTE_UPLOADER` FOREIGN KEY (`uploaderID`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- NOTE_UPVOTE TABLE
--
-- Composite primary key of noteID & userID. Indexing on userID
--
-- Table to track which users upvoted which notes (prevent duplicates)
--
-- Contains foreign keys for note and user tables
--
-- noteID: ID of note being upvoted. Foreign key into note table
-- userID: user ID of upvoter. Foreign key into user table
-- createdAt: timestamp when upvote was created
--
CREATE TABLE IF NOT EXISTS `note_upvote` (
  `noteID` int unsigned NOT NULL,
  `userID` int unsigned NOT NULL,
  `createdAt` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`noteID`, `userID`),
  KEY `FK_UPVOTE_USER` (`userID`),
  CONSTRAINT `FK_UPVOTE_NOTE` FOREIGN KEY (`noteID`) REFERENCES `note` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `FK_UPVOTE_USER` FOREIGN KEY (`userID`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;