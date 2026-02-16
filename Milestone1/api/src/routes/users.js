const express = require('express');
const router = express.Router();

const users = {};
/**
 * GET /users
 * 
 * Retrieves an array of all active users in the system
 */
router.get('/', (req, res) => {
  res.status(200).json({ 
    success: true,
    users: users
  });
});

/**
 * GET /users/:userId
 * 
 * Retrieves a user by its Id
 */
router.get('/:userId', (req, res) => {
  const userId = parseInt(req.params.userId);
  
  // Find user by ID
  const user = users.find(u => u.id === userId);
  
  if (!user) {
    return res.status(404).json({ 
      success: false,
      message: 'User not found' 
    });
  }
  
  res.status(200).json({ 
    success: true,
    user: user
  });
});

module.exports = router;