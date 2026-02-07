// Code inspired from day 22 activity
const db = require("./DBConnection");

module.exports = {
  getAllUsers: () => {
    return db.query("SELECT id, firstName, lastName, email, role FROM user");
  },

  getUserById: (userId) => {
    return db
      .query("SELECT * FROM user WHERE id = ?", [userId])
      .then((rows) => rows[0] || null);
  },

  createUser: (firstName, lastName, email, password, salt, role) => {
    return db.query(
      "INSERT INTO user (firstName, lastName, email, password, salt, role) VALUES (?, ?, ?, ?, ?, ?)",
      [firstName, lastName, email, password, salt, role]
    );
  },

  /**
   * Update user profile information
   * @param {number} userId - User ID
   * @param {string} firstName - First name
   * @param {string} lastName - Last name
   * @param {string} email - Email
   * @param {string} institution - Institution (optional)
   * @param {string} subject - Subject (optional)
   * @returns {Promise<Object>} result object
   */
  updateUser: (userId, firstName, lastName, email, institution = null, subject = null) => {
    return db.query(
      'UPDATE user SET firstName = ?, lastName = ?, email = ?, institution = ?, subject = ? WHERE id = ?',
      [firstName, lastName, email, institution, subject, userId]
    );
  }
};
