const express = require("express");
const path = require("path");
const router = express.Router();

router.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "static", "index.html"));
});

router.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "static", "pages/login.html"));
});

router.get("/register/student", (req, res) => {
  res.sendFile(path.join(__dirname, "static", "pages/studentRegister.html"));
});

router.get("/register/instructor", (req, res) => {
  res.sendFile(path.join(__dirname, "static", "pages/instructorRegister.html"));
});

router.get("/student/home", (req, res) => {
  res.sendFile(path.join(__dirname, "static", "pages/studentHomepage.html"));
});

router.get("/student/notes", (req, res) => {
  res.sendFile(path.join(__dirname, "static", "pages/myNotes.html"));
});

router.get("/instructor/home", (req, res) => {
  res.sendFile(path.join(__dirname, "static", "pages/instructorHomepage.html"));
});

router.get("/instructor/profile", (req, res) => {
  res.sendFile(path.join(__dirname, "static", "pages/instructorProfile.html"));
});

router.get("/class/:classID", (req, res) => {
  res.sendFile(path.join(__dirname, "static", "pages/classView.html"));
});

module.exports = router;
