//Code inspired from Day 22 activity
import HTTPClient from "./HTTPClient.js";

const BASE_API_PATH = "/api";

const handleAuthError = (error) => {
  if (error.status === 401) {
    document.location = "./login";
  }
  throw error;
};

//Auth routes
const login = (email, password) => {
  const data = { email, password };
  return HTTPClient.post(`${BASE_API_PATH}/login`, data).catch(handleAuthError);
};

const logout = () => {
  return HTTPClient.post(`${BASE_API_PATH}/logout`, {}).catch(handleAuthError);
};

const register = (firstName, lastName, email, password) => {
  const data = { firstName, lastName, email, password };
  return HTTPClient.post(`${BASE_API_PATH}/register`, data).catch(
    handleAuthError
  );
};

//User routes
const getAllUsers = () => {
  return HTTPClient.get(`${BASE_API_PATH}/users`).catch(handleAuthError);
};

const getUserById = (userId) => {
  return HTTPClient.get(`${BASE_API_PATH}/users/${userId}`).catch(
    handleAuthError
  );
};

//Class routes
const createClass = (classData) => {
  return HTTPClient.post(`${BASE_API_PATH}/classes`, classData).catch(
    handleAuthError
  );
};

const getAllClasses = () => {
  return HTTPClient.get(`${BASE_API_PATH}/classes`).catch(handleAuthError);
};

const getClassById = (classID) => {
  return HTTPClient.get(`${BASE_API_PATH}/classes/${classID}`).catch(
    handleAuthError
  );
};

const updateClass = (classID, classData) => {
  return HTTPClient.put(`${BASE_API_PATH}/classes/${classID}`, classData).catch(
    handleAuthError
  );
};

const deleteClass = (classID) => {
  return HTTPClient.delete(`${BASE_API_PATH}/classes/${classID}`).catch(
    handleAuthError
  );
};

//Note routes
const uploadNote = (classID, noteData) => {
  return HTTPClient.post(
    `${BASE_API_PATH}/notes/classes/${classID}`,
    noteData
  ).catch(handleAuthError);
};

const getNotesByClass = (classID) => {
  return HTTPClient.get(`${BASE_API_PATH}/notes/classes/${classID}`).catch(
    handleAuthError
  );
};

const getNoteById = (noteID) => {
  return HTTPClient.get(`${BASE_API_PATH}/notes/${noteID}`).catch(
    handleAuthError
  );
};

const getNotesByUserId = (userID) => {
  return HTTPClient.get(`${BASE_API_PATH}/notes/users/${userID}`).catch(
    handleAuthError
  );
};

const upvoteNote = (noteID) => {
  return HTTPClient.post(`${BASE_API_PATH}/notes/${noteID}/upvote`, {}).catch(
    handleAuthError
  );
};

const deleteNote = (noteID) => {
  return HTTPClient.delete(`${BASE_API_PATH}/notes/${noteID}`).catch(
    handleAuthError
  );
};

//Student routes
const enrollStudent = (studentID, classID) => {
  return HTTPClient.post(`${BASE_API_PATH}/students/${studentID}/enroll`, {
    classID,
  }).catch(handleAuthError);
};

const getStudentClasses = (studentID) => {
  return HTTPClient.get(`${BASE_API_PATH}/students/${studentID}/classes`).catch(
    handleAuthError
  );
};

const unenrollStudent = (studentID, classID) => {
  return HTTPClient.delete(
    `${BASE_API_PATH}/students/${studentID}/classes/${classID}`
  ).catch(handleAuthError);
};

export default {
  // Auth
  login,
  logout,
  register,

  // Users
  getAllUsers,
  getUserById,

  // Classes
  createClass,
  getAllClasses,
  getClassById,
  updateClass,
  deleteClass,

  // Notes
  uploadNote,
  getNotesByClass,
  getNoteById,
  getNotesByUserId,
  upvoteNote,
  deleteNote,

  // Students
  enrollStudent,
  getStudentClasses,
  unenrollStudent,
};
