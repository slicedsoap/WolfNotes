const db = require('./DBConnection');
const User = require('./models/User');

module.exports = {
  /**
   * Get user by email and validate password for authentication
   * 
   * @param {string} email user email
   * @param {string} password user password
   * @returns {Promise<User>} user object if valid
   */
  getUserByCredentials: (email, password) => {
    return db.query('SELECT * FROM user WHERE email = ?', [email]).then(rows => {
      if (rows.length === 1) {
        const user = new User(rows[0]);
        return user.validatePassword(password);
      }
      throw new Error("Invalid email or password");
    });
  },

  /**
   * Gets user by ID
   * 
   * @param {number} userId user ID
   * @returns {Promise<User>} user object
   */
  getUserById: (userId) => {
    return db.query('SELECT * FROM user WHERE id = ?', [userId]).then(rows => {
      if (rows.length === 1) {
        return new User(rows[0]);
      }
      throw new Error("User not found");
    });
  },

  /**
   * Gets user by email
   * 
   * @param {number} userId user email
   * @returns {Promise<User>} user object
   */
  getUserByEmail: (email) => {
    return db.query('SELECT * FROM user WHERE email = ?', [email]).then(rows => {
      if (rows.length === 1) {
        return new User(rows[0]);
      }
      return null;
    });
  },

  /**
   * Create a new user
   * @param {Object} userData user data object
   * @param {string} userData.firstName user first name
   * @param {string} userData.lastName user last name
   * @param {string} userData.email user email
   * @param {string} userData.password user plain text password
   * @param {string} userData.role user role (student/instructor)
   * @param {string} userData.institution optional institution name
   * @param {string} userData.subject optional subject (for instructors)
   * @returns {Promise<User>} new user object
   */
  createUser: async (userData) => {
    // hash the password
    const { hash, salt } = await User.hashPassword(userData.password);

    // insert user into database
    const insertQuery = `
      INSERT INTO user (firstName, lastName, email, password, salt, role, institution, subject)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
      userData.firstName,
      userData.lastName,
      userData.email,
      hash,
      salt,
      userData.role,
      userData.institution || null,
      userData.subject || null
    ];

    const result = await db.query(insertQuery, params);


    // return the new user object 
    return module.exports.getUserById(result.insertId);
  },

  /**
   * Delete a user
   * @param {number} userId user id
   * @returns {Promise<boolean>} True if user was deleted
   */
  deleteUser: (userId) => {
    return db.query('DELETE FROM user WHERE id = ?', [userId]).then(result => {
      return result.affectedRows > 0;
    });
  }
};