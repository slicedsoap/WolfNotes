const express = require("express");
const router = express.Router();

const UsersDAO = require("./db/UsersDAO");
const { authenticate } = require("../tokenHelpers");

/**
 * GET /users/:userId
 *
 * Retrieves a user by its ID
 */
router.get("/:userId", authenticate, (req, res) => {
  const userId = req.params.userId;
  UsersDAO.getUserById(userId)
    .then((user) => {
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    })
    .catch((err) => {
      res.status(500).json({ error: "Internal server error" });
    });
});

/**
 * PUT /users/:userId
 * 
 * Update user profile information
 */
router.put("/:userId", authenticate, async (req, res) => {
  const userId = req.params.userId;
  const { firstName, lastName, email, institution, subject } = req.body;
  
  if (req.user.id !== parseInt(userId)) {
    return res.status(403).json({ message: "Unauthorized to update this profile" });
  }
  
  if (!firstName || !lastName || !email) {
    return res.status(400).json({ message: "firstName, lastName, and email are required" });
  }
  
  try {
    await UsersDAO.updateUser(userId, firstName, lastName, email, institution, subject);
    res.json({ message: "Profile updated successfully" });
  } catch (err) {
    console.error("Error updating user:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
