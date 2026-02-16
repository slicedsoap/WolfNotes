const express = require('express');
const router = express.Router();

/**
 * POST /login
 * Expected body: { email: string, password: string }
 * 
 * Login a user with email password pair
 */
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) { // ensure email/password
    return res.status(400).json({message: 'Email and password required'});
  }

  // actual validation here

  // fake response
  res.status(200).json({ 
    success: true, 
    user: {
      id: 1,
      email,
      firstName: 'Chris',
      lastName: 'Brower',
      role: 'student' // {student/instructor}
    }
  });
});

/**
 * POST /logout
 * Expected body: { userId: number }
 * 
 * Endpoint to logout user
 */
router.post('/logout', (req, res) => {
  const { userID } = req.body;

  if (!userID) { // ensure id
    return res.status(400).json({message: 'ID required'});
  }

  // fake success
  res.json({ message: "User logged out" });
});

/**
 * POST /register
 * Expected body: { firstName: string, lastName: string, email: string, password: string, role: string {student/instructor} }
 * 
 * Registers a new user with basic information
 */
router.post('/register', (req, res) => {
  const { firstName, lastName, email, password, role, institution, subject } = req.body;

  // ensure necessary fields
  if (!firstName || !lastName || !email || !password || !role) {
    return res.status(400).json({ message: 'All fields including role are required' });
  }

  if (!['student', 'instructor'].includes(role)) {
    return res.status(400).json({ message: 'Role must be student or instructor' });
  }

  // validation & creation in db here
  const newUserId = 1;

  const newUser = {
    id: newUserId,
    firstName,
    lastName,
    email,
    role
  };
  
  if (institution) { // optional field
    newUser.institution = institution;
  }
  
  if (subject && role === 'instructor') { // optional field
    newUser.subject = subject;
  }
  
  // fake creation
  res.status(201).json({ 
    success: true,
    user: newUser
  });
});

module.exports = router;
