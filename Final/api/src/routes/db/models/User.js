const crypto = require('crypto');

module.exports = class User {
  id = null;
  firstName = null;
  lastName = null;
  email = null;
  role = null;
  institution = null;
  subject = null;
  createdAt = null;
  updatedAt = null;
  #passwordHash = null;
  #salt = null;

  constructor(data) {
    this.id = data.id;
    this.firstName = data.firstName;
    this.lastName = data.lastName;
    this.email = data.email;
    this.role = data.role;
    this.institution = data.institution;
    this.subject = data.subject;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
    this.#salt = data.salt;
    this.#passwordHash = data.password;
  }

  validatePassword(password) {
    return new Promise((resolve, reject) => {
      crypto.pbkdf2(password, this.#salt, 100000, 64, 'sha512', (err, derivedKey) => {
        if (err) {
          reject("Error: " + err);
        }
        const digest = derivedKey.toString('hex');
        if (this.#passwordHash == digest) {
          resolve(this);
        } else {
          reject("Invalid email or password");
        }
      });
    });
  }

  static hashPassword(password) {
    return new Promise((resolve, reject) => {
      const salt = crypto.randomBytes(16).toString('hex');
      crypto.pbkdf2(password, salt, 100000, 64, 'sha512', (err, derivedKey) => {
        if (err) {
          reject("Error hashing password: " + err);
        }
        const hash = derivedKey.toString('hex');
        resolve({ hash, salt });
      });
    });
  }

  toJSON() {
    return {
      id: this.id,
      firstName: this.firstName,
      lastName: this.lastName,
      email: this.email,
      role: this.role,
      institution: this.institution,
      subject: this.subject,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
};