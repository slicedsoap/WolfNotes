const db = require("../dao/DBConnection");

module.exports = class Class {
  id = null;
  instructorID = null;
  name = null;
  classCode = null;
  classDesc = null;
  archived = null;
  createdAt = null;
  updatedAt = null;
  
  constructor(data) {
    this.id = data.id;
    this.instructorID = data.instructorID;
    this.name = data.name;
    this.classCode = data.classCode;
    this.classDesc = data.classDesc;
    this.archived = data.archived || false;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }
  
  toJSON() {
    return {
      id: this.id,
      instructorID: this.instructorID,
      name: this.name,
      classCode: this.classCode,
      classDesc: this.classDesc,
      archived: this.archived,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
  
  static create({ instructorID, name, classCode, classDesc }) {
    return db.query(
      `INSERT INTO class (instructorID, name, classCode, classDesc) 
       VALUES (?, ?, ?, ?)`,
      [instructorID, name, classCode, classDesc]
    );
  }
  
  static getById(id) {
    return db.query("SELECT * FROM class WHERE id = ?", [id]).then(rows => rows[0] || null);
  }
  
  static getAll() {
    return db.query("SELECT * FROM class");
  }

  static getByInstructor(instructorID) {
    return db.query("SELECT * FROM class WHERE instructorID = ?", [instructorID]);
  }
};