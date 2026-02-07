const db = require("./DBConnection");

module.exports = {

  /**
   * Create a new class
   * 
   * @param {number} instructorID instructor's user ID
   * @param {string} name class name
   * @param {string} classCode class code
   * @param {string} classDesc class description
   * @param {string} section class section (optional)
   * @param {Array} tags array of tags (optional)
   * @returns result with insertId
   */
  createClass: (instructorID, name, classCode, classDesc, section = null, tags = null) => {
    const tagsJSON = tags && tags.length > 0 ? JSON.stringify(tags) : null;
    return db.query(
      "INSERT INTO class (instructorID, name, classCode, classDesc, section, tags) VALUES (?, ?, ?, ?, ?, ?)",
      [instructorID, name, classCode, classDesc, section, tagsJSON]
    );
  },
  /**
   * Get all classes for a specific user (instructor or student)
   * For instructors: returns classes they teach
   * For students: returns classes they're enrolled in
   * 
   * @param {number} userID user's ID
   * @param {string} role user's role ('student' or 'instructor')
   * @returns array of class objects
   */
  getClassesForUser: (userID, role) => {
    if (role === 'instructor') {
      return db.query('SELECT * FROM class WHERE instructorID = ? ORDER BY id DESC', [userID]);
    } 
    else if (role === 'student') {
      return db.query(`
        SELECT c.* 
        FROM class c
        INNER JOIN enrollment e ON c.id = e.classID
        WHERE e.studentID = ?
        ORDER BY c.id DESC
      `, [userID]);
    } 
    return null;
  },

  /**
   * Get a specific class by ID
   * 
   * @param {number} classID class ID
   * @returns {Promise<Array>} array with single class object
   */
  getClass: (classID) => {
    return db.query('SELECT * FROM class WHERE id = ?', [classID]);
  },


  /**
   * Update a class
   * 
   * @param {number} classID class ID
   * @param {string} name class name
   * @param {string} classCode class code
   * @param {string} classDesc class description
   * @param {string} section class section (optional)
   * @param {Array} tags array of tags (optional)
   * @returns {Promise<Object>} result object
   */
  updateClass: (classID, name, classCode, classDesc, section = null, tags = null) => {
    const tagsJSON = tags && tags.length > 0 ? JSON.stringify(tags) : null;
    return db.query(`
      UPDATE class
      SET name = ?, classCode = ?, classDesc = ?, section = ?, tags = ?
      WHERE id = ?
    `, [name, classCode, classDesc, section, tagsJSON, classID]);
  },

  /**
   * Get a class by its class code
   * 
   * @param {string} classCode class code
   * @returns {Promise<Array>} array with class object
   */
  getClassByCode: (classCode) => {
    return db.query('SELECT * FROM class WHERE classCode = ?', [classCode]);
  },

  /**
   * Delete a class by ID
   * 
   * @param {number} classID class ID
   * @returns {Promise<Object>} result object
   */
  deleteClass: (classID) => {
    return db.query('DELETE FROM class WHERE id = ?', [classID]);
  },

  /**
   * Get all students enrolled in a class
   * @param {number} classID - Class ID
   * @returns {Promise<Array>} - Array of student objects with email
   */
  getStudentsInClass: (classID) => {
    return db.query(`
      SELECT u.id, u.firstName, u.lastName, u.email 
      FROM user u
      INNER JOIN enrollment e ON u.id = e.studentID
      WHERE e.classID = ?
      ORDER BY u.lastName, u.firstName
    `, [classID]);
  },

/**
 * Update class archive status
 * @param {number} classID - Class ID
 * @param {boolean} archived - Archive status
 * @returns {Promise<Object>} result object
 */
  updateClassArchiveStatus: (classID, archived) => {
    return db.query(
      'UPDATE class SET archived = ? WHERE id = ?',
      [archived, classID]
    );
  }

  
  
}