const express = require('express');
const router = express.Router();

const classes = [
  { classID: 101, instructorID: 1, name: "Introduction to Computer Science", classCode: "CSC116", classDesc: "Intro to java" },
  { classID: 102, instructorID: 3, name: "Data Structures", classCode: "CSC246", classDesc: "Advanced data structures and algorithms" }
];

/**
 * POST /
 * Expected body: { instructorID: number, name: string, classCode: string, classDesc: string }
 *
 * Create a new class
 */
router.post('/', (req, res) => {
  const { instructorID, name, classCode, classDesc } = req.body;
 
  // ensure necessary fields
  if (!instructorID || !name || !classCode || !classDesc) {
    return res.status(400).json({ message: 'instructorID, name, classCode, and classDesc are required' });
  }
 
  const newClass = {
    classID: 101,
    instructorID,
    name,
    classCode,
    classDesc
  };
 
  classes.push(newClass);
  res.status(200).json({ success: true, class: newClass });
});

/**
 * GET /
 *
 * Get all classes
 */
router.get('/', (req, res) => {
  res.status(200).json({ success: true, classes });
});

/**
 * GET /:classID
 *
 * Get a specific class by classID
 */
router.get('/:classID', (req, res) => {
  const classItem = classes.find(c => c.classID === parseInt(req.params.classID));
 
  if (!classItem) {
    return res.status(404).json({ message: 'Class not found' });
  }
 
  res.status(200).json({ success: true, class: classItem });
});

/**
 * PUT /:classID
 * Expected body: { name: string, classCode: string, classDesc: string }
 *
 * Update a class
 */
router.put('/:classID', (req, res) => {
  const { name, classCode, classDesc } = req.body;
 
  // ensure necessary fields
  if (!name || !classCode || !classDesc) {
    return res.status(400).json({ message: 'name, classCode, and classDesc are required' });
  }
 
  const classItem = classes.find(c => c.classID === parseInt(req.params.classID));
 
  if (!classItem) {
    return res.status(404).json({ message: 'Class not found' });
  }
 
  classItem.name = name;
  classItem.classCode = classCode;
  classItem.classDesc = classDesc;
 
  res.status(200).json({ success: true, class: classItem });
});

/**
 * DELETE /:classID
 *
 * Delete a class by classID
 */
router.delete('/:classID', (req, res) => {
  const classIndex = classes.findIndex(c => c.classID === parseInt(req.params.classID));
 
  if (classIndex === -1) {
    return res.status(404).json({ message: 'Class not found' });
  }
 
  classes.splice(classIndex, 1);
  res.json({ message: 'Class deleted successfully' });
});

module.exports = router;