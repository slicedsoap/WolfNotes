const express = require('express');
const router = express.Router();
const path = require('path');
const UserDAO = require('./db/UserDAO.js');
const { generateToken, clearToken, authenticate } = require('../tokenHelpers');

/**
 * POST /login
 * Expected body: { email: string, password: string }
 * 
 * Login a user with email password pair
 */
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) { // ensure email/password
    return res.status(400).json({message: 'Email and password required'});
  }
  try {
    const user = await UserDAO.getUserByCredentials(email, password); // database query with email/password

    const token = generateToken({ // generate token with info about id, email, and role
      id: user.id,
      email: user.email,
      role: user.role
    });
    
    res.cookie('token', token, { // set cookie
      httpOnly: true,
      secure: false, // true for secure application 
      maxAge: 24 * 60 * 60 * 1000 // 1 day token
    });
    
    res.status(200).json({ 
      success: true, 
      user: user.toJSON()
    });
  } 
  catch (error) {
    console.error('Login error:', error);
    res.status(401).json({ 
      success: false,
      message: 'Invalid email or password'
    });
  }
});

/**
 * POST /logout
 * 
 * Endpoint to logout user by clearing token cookie
 */
router.post('/logout', authenticate, (req, res) => {
  clearToken(res); // clear token (logout)
  
  res.json({ 
    success: true,
  });
});

/**
 * POST /register
 * Expected body: { firstName: string, lastName: string, email: string, password: string, role: string {student/instructor}, institution?, subject? }
 * 
 * Registers a new user with basic information
 */
router.post('/register', async (req, res) => {
  const { firstName, lastName, email, password, role, institution, subject } = req.body;
  console.log(req.body);
  
  // ensure necessary fields
  if (!firstName || !lastName || !email || !password || !role) {
    return res.status(400).json({ message: 'First name, last name, email, password, and role are required' });
  }
  if (!['student', 'instructor'].includes(role)) {
    return res.status(400).json({ message: 'Role must be student or instructor' });
  }
  
  if (password.length < 8) { // validate password length
    return res.status(400).json({ 
      success: false,
      message: 'Password must be at least 8 characters long' 
    });
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // basic email validation
  if (!emailRegex.test(email)) {
    return res.status(400).json({ 
      success: false,
      message: 'Invalid email format' 
    });
  }
  
  try {
    const existingUser = await UserDAO.getUserByEmail(email); // ensure not existing user
    if (existingUser) {
      return res.status(409).json({ 
        success: false,
        message: 'An account with this email already exists' 
      });
    }
    
    const userData = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email,
      password,
      role,
      institution: institution || null, // optional field
      subject: (role === 'instructor' && subject) ? subject : null // optional field
    };
    
    const newUser = await UserDAO.createUser(userData);
    
    // generate token with id, email, role
    const token = generateToken({
      id: newUser.id,
      email: newUser.email,
      role: newUser.role
    });
    
    res.cookie('token', token, { // set in cookie
      httpOnly: true,
      secure: false, // true in prod
      maxAge: 24 * 60 * 60 * 1000 // 1 day
    });
    
    res.status(201).json({ 
      success: true,
      user: newUser.toJSON() // return user as json
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      success: false,
      message: 'An error occurred during registration. Please try again.'
    });
  }
});

/**
 * GET /verify
 * Verify if the current user is authenticated
 * Uses authenticate middleware to check token in cookie
 */
router.get('/verify', authenticate, async (req, res) => {
  try {
    const user = await UserDAO.getUserById(req.user.id);
    
    res.json({
      success: true,
      user: user.toJSON()
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }
});

module.exports = router;