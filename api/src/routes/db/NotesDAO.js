const db = require("./DBConnection");

module.exports = {
  createNote: (classID, uploaderID, title, filePath, fileSize) => {
    return db.query(
      "INSERT INTO note (classID, uploaderID, title, filePath, fileSize) VALUES (?, ?, ?, ?, ?)",
      [classID, uploaderID, title, filePath, fileSize]
    );
  },

  upvoteNote: (noteID, userID) => {
    return db
      .query("SELECT * FROM note_upvote WHERE noteID = ? AND userID = ?", [
        noteID,
        userID,
      ])
      .then((rows) => {
        if (rows.length > 0) {
          throw new Error("User has already upvoted this note");
        }
        return db
          .query("INSERT INTO note_upvote (noteID, userID) VALUES (?, ?)", [
            noteID,
            userID,
          ])
          .then(() => {
            return db.query(
              "UPDATE note SET upvotes = upvotes + 1 WHERE id = ?",
              [noteID]
            );
          });
      });
  },

  getNotesByClass: (classID) => {
    return db.query(
      "SELECT * FROM note WHERE classID = ? ORDER BY upvotes DESC, createdAt DESC",
      [classID]
    );
  },

  getNoteById: (noteID) => {
    return db
      .query("SELECT * FROM note WHERE id = ?", [noteID])
      .then((rows) => rows[0] || null);
  },

  getNotesByUser: (userID) => {
    return db.query(
      "SELECT * FROM note WHERE uploaderID = ? ORDER BY createdAt DESC",
      [userID]
    );
  },

  deleteNoteByID: (noteID) => {
    return db.query("DELETE FROM note WHERE id = ?", [noteID]);
  },
};
