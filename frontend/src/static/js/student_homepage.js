import { dbHelper } from './dbHelper.js';

const join = document.getElementById("join");
const enrollButton = document.getElementById("enroll-button");
const logoutIcon = document.querySelector('img[alt="Logout Icon"]');
const myNotesButton = document.getElementById("myNotesBtn");

let currentUser = null;

document.addEventListener("DOMContentLoaded", async () => {
  await loadCurrentUser();
  
  if (!currentUser || currentUser.role !== 'student') {
    redirectBasedOnRole(currentUser?.role);
    return;
  }

  myNotesButton.addEventListener("click", () => {
    window.location.href = "/student/notes";
  });

  await loadCourses();
});

/**
 * Handle user logout by calling API endpoint and redirecting to login
 */
logoutIcon.addEventListener("click", async () => {
  if (!navigator.onLine) {
    alert("You are offline. Cannot logout at this time.");
    return;
  }

  try {
    const response = await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include",
    });

    if (response.ok) {
      window.location.href = "/login";
    } else {
      alert("Failed to logout. Please try again.");
    }
  } catch (err) {
    alert("An error occurred during logout.");
  }
});

/**
 * Load current authenticated user from API or cache
 * Validates user role and redirects if unauthorized
 */
async function loadCurrentUser() {
  if (!navigator.onLine) {
    await loadFromCache('user');
    return;
  }

  try {
    const response = await fetch('/api/auth/verify', {
      method: 'GET',
      credentials: 'include'
    });
    
    if (response.ok) {
      const data = await response.json();
      currentUser = data.user;
      await saveToCache('user', data.user);
      localStorage.setItem("userRole", data.user.role);
    } else {
      await loadFromCache('user');
      if (!currentUser) {
        window.location.href = "/login";
      }
    }
  } catch (err) {
    await loadFromCache('user');
    if (!currentUser) {
      window.location.href = "/login";
    }
  }
}

/**
 * Load all courses for current user from API or cache
 */
async function loadCourses() {
  try {
    const response = await fetch(`/api/classes`, {
      method: 'GET',
      credentials: 'include'
    });
    
    if (response.ok) {
      const data = await response.json();
      await saveToCache('courses', data);
      displayCourses(data);
    } else {
      await loadFromCache('courses');
    }
  } catch (err) {
    await loadFromCache('courses');
  }
}

/**
 * Save data to IndexedDB cache
 * @param {string} type - type of data to cache ('user' or 'courses')
 * @param {Object|Array} data - data to cache
 */
async function saveToCache(type, data) {
  try {
    if (type === 'user') {
      await dbHelper.saveUserProfile(data);
    } else if (type === 'courses') {
      await dbHelper.saveClasses(data);
    }
  } catch (e) {
    // silently fail
  }
}

/**
 * Load data from IndexedDB cache
 * @param {string} type - type of data to load ('user' or 'courses')
 * @returns {Object|Array|null} cached data or null if not found
 */
async function loadFromCache(type) {
  try {
    if (type === 'user') {
      currentUser = await dbHelper.getUserProfile?.();
      return currentUser;
    } else if (type === 'courses') {
      const cached = await dbHelper.getClasses();
      displayCourses(cached || []);
      return cached;
    }
  } catch (e) {
    if (type === 'courses') displayCourses([]);
    return null;
  }
}

/**
 * Redirect user based on their role
 * @param {string} role - user role ('student' or 'instructor')
 */
function redirectBasedOnRole(role) {
  if (role === "instructor") {
    window.location.href = "/instructor/home";
  } else if (!role) {
    window.location.href = "/login";
  }
}

/**
 * Display courses in the DOM, separating enrolled and archived courses
 * @param {Array} classes - array of course objects
 */
function displayCourses(classes) {
  const courseList = document.getElementById("course-list");
  const archivedList = document.querySelector("#archived-courses .card");

  courseList.innerHTML = "";
  archivedList.innerHTML = "";

  const enrolledCourses = classes.filter((c) => !c.archived);
  const archivedCourses = classes.filter((c) => c.archived);

  if (enrolledCourses.length === 0) {
    const emptyMsg = document.createElement("p");
    emptyMsg.className = "empty-message";
    emptyMsg.textContent =
      "No enrolled courses yet. Join a course using the class code!";
    courseList.appendChild(emptyMsg);
  } else {
    enrolledCourses.forEach((course) => {
      const courseCard = createCourseCard(course);
      courseList.appendChild(courseCard);
    });
  }

  if (archivedCourses.length === 0) {
    const emptyMsg = document.createElement("p");
    emptyMsg.className = "empty-message";
    emptyMsg.textContent = "No archived courses";
    archivedList.appendChild(emptyMsg);
  } else {
    archivedCourses.forEach((course) => {
      const courseCard = createCourseCard(course);
      archivedList.appendChild(courseCard);
    });
  }
}

/**
 * Create a course card DOM element
 * @param {Object} course - course object with name, description, section, tags
 * @returns {HTMLElement} course card element
 */
function createCourseCard(course) {
  const courseDiv = document.createElement("div");
  courseDiv.className = "course-card";

  courseDiv.addEventListener("click", () => {
    window.location.href = `/class/${course.id}`;
  });

  const courseName = document.createElement("h3");
  courseName.textContent = course.name || `Class ${course.id}`;

  const courseDesc = document.createElement("p");
  courseDesc.className = "course-desc";
  courseDesc.textContent = course.classDesc || "No description";
  if (!course.classDesc) {
    courseDesc.classList.add("empty-desc");
  }

  courseDiv.appendChild(courseName);
  courseDiv.appendChild(courseDesc);

  if (course.section) {
    const courseSection = document.createElement("p");
    courseSection.className = "course-section";
    courseSection.textContent = `Section: ${course.section}`;
    courseDiv.appendChild(courseSection);
  }

  if (course.tags) {
    const tagsArray =
      typeof course.tags === "string" ? JSON.parse(course.tags) : course.tags;

    if (tagsArray && tagsArray.length > 0) {
      const courseTags = document.createElement("p");
      courseTags.className = "course-tags";
      courseTags.textContent = `Tags: ${tagsArray.join(", ")}`;
      courseDiv.appendChild(courseTags);
    }
  }

  return courseDiv;
}

/**
 * Display feedback message to user after enrollment attempt
 * @param {string} message - message to display
 * @param {boolean} isSuccess - whether operation was successful
 */
function showFeedbackMessage(message, isSuccess) {
  let feedback = document.getElementById("enrollment-feedback");

  if (!feedback) {
    feedback = document.createElement("p");
    feedback.id = "enrollment-feedback";

    const joinSection = document.getElementById("join-course");
    joinSection.appendChild(feedback);
  }

  feedback.textContent = message;
  feedback.className = isSuccess ? "feedback-success" : "feedback-error";

  setTimeout(() => {
    feedback.textContent = "";
  }, 4000);
}

/**
 * Handle course enrollment form submission
 * Validates input and calls enrollInCourse
 */
function handleEnrollment() {
  if (!navigator.onLine) {
    showFeedbackMessage("You are offline. Cannot enroll at this time.", false);
    return;
  }

  const classID = join.value.trim();

  if (!classID) {
    showFeedbackMessage("Please enter a class code", false);
    return;
  }

  if (!currentUser) {
    showFeedbackMessage("User not loaded. Please refresh the page.", false);
    return;
  }

  enrollInCourse(classID);
}

/**
 * Enroll student in course via API
 * @param {string} classID - class code to enroll in
 */
async function enrollInCourse(classID) {
  try {
    const response = await fetch(`/api/students/${currentUser.id}/enroll`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ classID }),
    });

    const data = await response.json();

    if (response.ok) {
      showFeedbackMessage(
        data.message || "Successfully enrolled in course!",
        true
      );
      join.value = "";
      await loadCourses();
    } else {
      showFeedbackMessage(data.message || "Failed to enroll in course", false);
    }
  } catch (err) {
    showFeedbackMessage(
      "An error occurred while enrolling. Please try again.",
      false
    );
  }
}

enrollButton.addEventListener("click", handleEnrollment);

join.addEventListener("keyup", (e) => {
  if (e.key === "Enter") {
    handleEnrollment();
  }
});