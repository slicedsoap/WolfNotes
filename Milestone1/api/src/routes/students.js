const express = require('express');
const router = express.Router();

const enrollments = [
  { studentID: 2, classID: 116 },
  { studentID: 3, classID: 342 }
];

/**
 * POST /:studentID/enroll
 * Expected body: { classID: number }
 *
 * Enroll a student in a class
 */
router.post('/:studentID/enroll', (req, res) => {
  const { classID } = req.body;
  
  if (!classID) {
    return res.status(400).json({ message: 'classID required' });
  }
  
  const studentID = parseInt(req.params.studentID);
  
  // check if already enrolled
  const alreadyEnrolled = enrollments.find(e => e.studentID === studentID && e.classID === classID);
  if (alreadyEnrolled) {
    return res.status(400).json({ message: 'Student already enrolled in this class' });
  }
  
  enrollments.push({ studentID, classID });
  res.status(200).json({ success: true, message: 'Student enrolled successfully' });
});

/**
 * GET /:studentID/classes
 *
 * Get all classes a student is enrolled in
 */
router.get('/:studentID/classes', (req, res) => {
  const studentID = parseInt(req.params.studentID);
  const studentClasses = enrollments.filter(e => e.studentID === studentID);
  
  res.status(200).json({ success: true, classes: studentClasses });
});

/**
 * DELETE /:studentID/classes/:classID
 *
 * Remove a student from a class (unenroll)
 */
router.delete('/:studentID/classes/:classID', (req, res) => {
  const studentID = parseInt(req.params.studentID);
  const classID = parseInt(req.params.classID);
  
  const enrollmentIndex = enrollments.findIndex(e => e.studentID === studentID && e.classID === classID);
  
  if (enrollmentIndex === -1) {
    return res.status(404).json({ message: 'Enrollment not found' });
  }
  
  enrollments.splice(enrollmentIndex, 1);
  res.json({ message: 'Student unenrolled successfully' });
});

module.exports = router;