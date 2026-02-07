const express = require('express');
const router = express.Router();
const EnrollmentDAO = require('./db/EnrollmentDAO');
const ClassesDAO = require('./db/ClassesDAO');

const { authenticate, requireStudent } = require("../tokenHelpers");

/**
 * POST /:studentID/enroll
 * Enroll a student in a class using class code
 * 
 * Expected body: { classID: string } - this is actually the classCode
 */
router.post('/:studentID/enroll', authenticate, requireStudent, async (req, res) => {
  const { classID: classCode } = req.body; // classID from frontend is actually the class code
  const studentID = parseInt(req.params.studentID);
  
  if (!classCode) {
    return res.status(400).json({ message: 'Class code is required' });
  }
  
  try {
    // first, find the class by classCode
    const classes = await ClassesDAO.getClassByCode(classCode);
    
    if (!classes || classes.length === 0) {
      return res.status(404).json({ message: 'Class not found with that code' });
    }
    
    const actualClassID = classes[0].id;
    
    // check if already enrolled
    const alreadyEnrolled = await EnrollmentDAO.isStudentEnrolled(studentID, actualClassID);
    if (alreadyEnrolled) {
      return res.status(400).json({ message: 'Student already enrolled in this class' });
    }
    
    // enroll using the actual class ID
    await EnrollmentDAO.enrollStudent(studentID, actualClassID);
    res.status(200).json({ success: true, message: 'Student enrolled successfully' });
  } catch (err) {
    console.error('Error enrolling student:', err);
    res.status(500).json({ message: 'Server error enrolling student' });
  }
});


/**
 * DELETE /:studentID/classes/:classID
 * Unenroll a student from a class
 */
router.delete('/:studentID/classes/:classID', authenticate, async (req, res) => {
  const studentID = parseInt(req.params.studentID);
  const classID = parseInt(req.params.classID);

  try {
    const alreadyEnrolled = await EnrollmentDAO.isStudentEnrolled(studentID, classID);
    if (!alreadyEnrolled) {
      return res.status(404).json({ message: 'Enrollment not found' });
    }

    await EnrollmentDAO.unenrollStudent(studentID, classID);
    res.json({ success: true, message: 'Student unenrolled successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error unenrolling student' });
  }
});

module.exports = router;
