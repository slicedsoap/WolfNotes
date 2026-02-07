const db = require("./DBConnection");

module.exports = {
  enrollStudent: (studentID, classID) => {
    return db.query(
      "INSERT INTO enrollment (studentID, classID) VALUES (?, ?)",
      [studentID, classID]
    );
  },

  unenrollStudent: (studentID, classID) => {
    return db.query(
      "DELETE FROM enrollment WHERE studentID = ? AND classID = ?",
      [studentID, classID]
    );
  },

  getStudentEnrollments: (studentID) => {
    return db.query(
      `SELECT e.*, c.id, c.name, c.classCode, c.classDesc, c.instructorID 
       FROM enrollment e
       JOIN class c ON e.classID = c.id
       WHERE e.studentID = ?`,
      [studentID]
    );
  },

  getClassStudents: (classID) => {
    return db.query(
      `SELECT e.*, u.firstName, u.lastName, u.email 
       FROM enrollment e
       JOIN user u ON e.studentID = u.id
       WHERE e.classID = ?`,
      [classID]
    );
  },

  isStudentEnrolled: (studentID, classID) => {
    return db.query(
      "SELECT * FROM enrollment WHERE studentID = ? AND classID = ?",
      [studentID, classID]
    ).then(rows => rows.length > 0);
  }
};
