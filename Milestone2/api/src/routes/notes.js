const express = require("express");
const NotesDAO = require("./db/NotesDAO");
const router = express.Router();
const { authenticate, requireStudent } = require("../tokenHelpers");
const upload = require("../multer");
const path = require("path");

/**
 * POST /notes/classes/:classID
 * Upload a PDF note to a class
 * Expected: multipart/form-data with 'pdf' file field
 *
 * Can only be posted by student
 */
router.post(
  "/classes/:classID",
  authenticate,
  upload.single("pdf"),
  async (req, res) => {
    const classID = req.params.classID;
    const uploaderID = req.user.id; // Get from authenticated user

    if (!req.file) {
      return res.status(400).json({ message: "PDF file is required" });
    }

    const { title } = req.body;

    if (!title) {
      return res.status(400).json({ message: "Title is required" });
    }

    try {
      const filePath = req.file.path;
      const fileSize = req.file.size;

      const result = await NotesDAO.createNote(
        classID,
        uploaderID,
        title,
        filePath,
        fileSize
      );

      res.status(201).json({
        success: true,
        message: "Note uploaded successfully",
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

/**
 * GET /notes/classes/:classID
 *
 * Can be viewed by student or instructor
 */
router.get("/classes/:classID", authenticate, (req, res) => {
  const classID = req.params.classID;
  NotesDAO.getNotesByClass(classID)
    .then((notes) => res.json({ success: true, notes }))
    .catch((err) => {
      console.error(err);
      res.status(500).json({ error: "Internal server error" });
    });
});

/**
 * GET /notes/:noteID
 *
 * Can be seen by instructor or student
 */
router.get("/:noteID", authenticate, (req, res) => {
  const noteID = req.params.noteID;
  NotesDAO.getNoteById(noteID)
    .then((note) => {
      if (!note) {
        return res.status(404).json({ message: "Note not found" });
      }
      res.json({ success: true, note });
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ error: "Internal server error" });
    });
});

/**
 * GET /notes/users/:userID
 *
 * A list of notes posted by a user
 */
router.get("/users/:userID", authenticate, (req, res) => {
  const userID = req.params.userID;
  NotesDAO.getNotesByUser(userID)
    .then((notes) => {
      res.json({ success: true, notes });
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ error: "Internal server error" });
    });
});

/**
 * GET /notes/:noteID/download
 *
 * Download a note PDF file
 */
router.get("/:noteID/download", authenticate, async (req, res) => {
  const noteID = req.params.noteID;

  try {
    const note = await NotesDAO.getNoteById(noteID);

    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    // Send the file for download
    res.download(note.filePath, note.title + ".pdf", (err) => {
      if (err) {
        console.error("Download error:", err);
        res.status(500).json({ error: "Error downloading file" });
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * POST /notes/:noteID/upvote
 *
 * Can be accessed by a student
 */
router.post("/:noteID/upvote", authenticate, requireStudent, (req, res) => {
  const noteID = req.params.noteID;
  const userID = req.user.id; // Get from authenticated user

  NotesDAO.upvoteNote(noteID, userID)
    .then(() =>
      res.status(201).json({ success: true, message: "Note upvoted" })
    )
    .catch((err) => {
      console.error(err);
      if (err.message === "User has already upvoted this note") {
        res.status(400).json({ message: err.message });
      } else {
        res.status(500).json({ error: "Internal server error" });
      }
    });
});

/**
 * DELETE /notes/:noteID
 *
 * Can be accessed by instructor or the uploader
 */
router.delete("/:noteID", authenticate, async (req, res) => {
  const noteID = req.params.noteID;

  try {
    const note = await NotesDAO.getNoteById(noteID);

    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    // Check if user is instructor or the uploader
    if (req.user.role !== "instructor" && req.user.id !== note.uploaderID) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // Delete the file from filesystem
    const fs = require("fs");
    if (fs.existsSync(note.filePath)) {
      fs.unlinkSync(note.filePath);
    }

    await NotesDAO.deleteNoteByID(noteID);
    res.json({ success: true, message: "Note deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
