const express = require('express');
const router = express.Router();

const ClassesDAO = require('./db/ClassesDAO');

const { authenticate, requireStudent, requireInstructor } = require('../tokenHelpers');

/**
 * POST /
 * Expected body: { instructorID: number, name: string, classDesc: string, section?: string, tags?: array }
 * Note: classCode is generated automatically on the backend
 *
 * Create a new class
 */
router.post('/', authenticate, requireInstructor, async (req, res) => {
  const {instructorID, name, classDesc, section, tags } = req.body;
  
  if (!instructorID || !name || !classDesc) {
    return res
      .status(400)
      .json({ message: "instructorID, name, and classDesc are required" });
  }
  
  try {
    // generate unique class code on backend
    let classCode;
    let isUnique = false;
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    
    while (!isUnique) {
      classCode = '';
      for (let i = 0; i < 6; i++) {
        classCode += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      
      // check if code exists
      const existing = await ClassesDAO.getClassByCode(classCode);
      isUnique = !existing || existing.length === 0;
    }
    
    const result = await ClassesDAO.createClass(
      instructorID, 
      name, 
      classCode, 
      classDesc, 
      section || null, 
      tags || null
    );
    
    res.status(201).json({ 
      message: "Class created", 
      classID: Number(result.insertId),
      classCode: classCode
    });
  } catch (err) {
    console.error("Error creating class:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * GET /
 * 
 * Get all classes for the authenticated user
 * For instructors: returns classes they teach
 * For students: returns classes they're enrolled in
 */
router.get('/', authenticate, async (req, res) => {
  try {
    const classes = await ClassesDAO.getClassesForUser(req.user.id, req.user.role);
    res.json(classes);
  } catch (err) {
    console.error('Get classes error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /:classID
 *
 * Get a specific class by classID
 */
router.get('/:classID', authenticate, (req, res) => {
  const classID = req.params.classID;
  ClassesDAO.getClass(classID).then(classes => {
    res.json(classes);
  }).catch(err => {
    res.status(404).json({error: 'Class not found'});
    throw err; 
  })
});

/**
 * PUT /:classID
 * Expected body: { name: string, classCode: string, classDesc: string }
 *
 * Update a class
 */
router.put('/:classID', authenticate, requireInstructor, (req, res) => {
  let updatedClass = req.body;
  ClassesDAO.updateClass(updatedClass).then(classes => {
    res.json(classes);
  }).catch(err => {
    res.status(500).json({error: 'Internal server error'});
  })
});

/**
 * DELETE /:classID
 *
 * Delete a class by classID
 */
router.delete('/:classID', authenticate, requireInstructor, (req, res) => {
  const classID = req.params.classID;
  ClassesDAO.deleteClass(classID).then(classes => {
    res.json(classes);
  }).catch(err => {
    res.status(500).json({error: 'Internal server error'});
  })
  
});


/**
 * GET /:classID/students
 * 
 * Get all students enrolled in a specific class
 */
router.get('/:classID/students', authenticate, requireInstructor, async (req, res) => {
  const classID = req.params.classID;
  
  try {
    const students = await ClassesDAO.getStudentsInClass(classID);
    res.json(students);
  } catch (err) {
    console.error('Error getting students for class:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * PATCH /:classID/archive
 * Expected body: { archived: boolean }
 * 
 * Update archive status of a class
 */
router.patch('/:classID/archive', authenticate, requireInstructor, async (req, res) => {
  const classID = req.params.classID;
  const { archived } = req.body;
  
  if (typeof archived !== 'boolean') {
    return res.status(400).json({ message: "archived must be a boolean" });
  }
  
  try {
    await ClassesDAO.updateClassArchiveStatus(classID, archived);
    res.json({ message: `Class ${archived ? 'archived' : 'unarchived'} successfully` });
  } catch (err) {
    console.error('Error updating archive status:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;