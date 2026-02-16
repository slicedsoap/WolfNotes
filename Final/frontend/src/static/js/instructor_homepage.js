const logoutIcon = document.querySelector('img[alt="Logout Icon"]');
const profileIcon = document.querySelector('img[alt="Profile Icon"]');
const createCourseForm = document.getElementById("create_course_form");
import { dbHelper } from './dbHelper.js';
let currentUser = null;

document.addEventListener("DOMContentLoaded", async () => {
    console.log("DOM loaded, checking user role...");
    checkUserRole("instructor");

    await loadCurrentUser(); // fetch current user
    
    if (currentUser) { // load course list if valid user
        await loadInstructorCourses();
    } else {
        console.warn("No user loaded");
        displayInstructorCourses([]);
    }
});

/**
 * Add profile navigation event
 */
profileIcon.addEventListener("click", () => {
    window.location.href = '/instructor/profile';
});

/**
 * Add logout event through hitting API logout endpoint
 */
logoutIcon.addEventListener("click", async () => {
    try {
        const response = await fetch('/api/auth/logout', {
            method: 'POST',
            credentials: 'include'
        });
        
        if (response.ok) {
            window.location.href = '/login';
        } else {
            console.error("Logout failed");
            alert("Failed to logout. Please try again.");
        }
    } catch (err) {
        console.error("Error during logout:", err);
        alert("You are offline. Cannot logout at this time.");
    }
});

/**
 * Function uses /verify auth endpoint to get user credentials
 * Falls back to cached data when offline
 */
async function loadCurrentUser() {
    try {
        const response = await fetch('/api/auth/verify', {
            method: 'GET',
            credentials: 'include'
        });
        
        if (response.ok) {
            const data = await response.json();
            currentUser = data.user;
            
            // Cache user data for offline use
            try {
                await dbHelper.saveUserProfile(data.user);
                console.log("✓ Cached user profile");
            } catch(e) {
                console.error("Failed to cache user data:", e);
            }
        } else {
            console.error("Failed to load current user from API");
            await loadCachedUser();
        }
    } catch (err) {
        console.error("Error loading current user (likely offline):", err);
        await loadCachedUser();
    }
}

/**
 * Load user from cache when offline
 */
async function loadCachedUser() {
    try {
        currentUser = await dbHelper.getUserProfile();
        if (currentUser) {
            console.log("✓ Loaded user from cache:", currentUser);
        } else {
            console.warn("No cached user profile found");
        }
    } catch(e) {
        console.error("Failed to load cached user:", e);
    }
}

/**
 * Function that uses current user ID to get all instructor classes
 * Uses GET /api/classes endpoint which returns classes based on user role
 */
async function loadInstructorCourses() {
    try {
        const response = await fetch(`/api/classes`, {
            method: 'GET',
            credentials: 'include'
        });
        
        if (response.ok) {
            const classes = await response.json();
            console.log("Instructor classes from API:", classes);

            // Cache classes for offline use
            try {
                await dbHelper.saveClasses(classes);
                console.log("✓ Cached classes to IndexedDB");
            } catch(e) {
                console.error("Failed to cache classes:", e);
            }
            
            displayInstructorCourses(classes || []);
        } else {
            console.error("Failed to load instructor courses from API");
            await loadCachedCourses();
        }
    } catch (err) {
        console.error("Error loading instructor courses (likely offline):", err);
        await loadCachedCourses();
    }
}

/**
 * Load courses from IndexedDB cache when offline
 */
async function loadCachedCourses() {
    try {
        const cached = await dbHelper.getClasses();
        console.log("✓ Loaded courses from cache:", cached);
        displayInstructorCourses(cached || []);
    } catch(e) {
        console.error("Failed to load cached courses:", e);
        displayInstructorCourses([]);
    }
}

/**
 * Helper function to take a json array of classes and display them
 * @param {Array} classes classes received from API
 */
function displayInstructorCourses(classes) {
    const courseList = document.querySelector(".instructor_courses");
    const archivedList = document.querySelector(".archived_courses");
    
    // safely clear existing lists (for if updating)
    courseList.innerHTML = '';
    archivedList.innerHTML = '';
    
    // filter classes to separate lists
    const activeCourses = classes.filter(c => !c.archived);
    const archivedCourses = classes.filter(c => c.archived);
    
    // either display empty message or create and append cards
    if (activeCourses.length === 0) {
        const emptyMsg = document.createElement("p");
        emptyMsg.className = "empty-message";
        emptyMsg.textContent = "No active courses. Create a course to get started!";
        courseList.appendChild(emptyMsg);
    } else {
        activeCourses.forEach(course => {
            const courseCard = createInstructorCourseCard(course);
            courseList.appendChild(courseCard);
        });
    }
    
    // same for archived
    if (archivedCourses.length === 0) {
        const emptyMsg = document.createElement("p");
        emptyMsg.className = "empty-message";
        emptyMsg.textContent = "No archived courses";
        archivedList.appendChild(emptyMsg);
    } else {
        archivedCourses.forEach(course => {
            const courseCard = createInstructorCourseCard(course);
            archivedList.appendChild(courseCard);
        });
    }
}

/**
 * Helper function to take a specific course and display its card
 * @param {Object} course course details to create course
 * @returns {HTMLElement} course card element returned
 */
function createInstructorCourseCard(course) {
    const courseDiv = document.createElement("div");
    courseDiv.className = "course-card";
    
    courseDiv.addEventListener("click", () => {
        window.location.href = `/class/${course.id}`;
    });
    
    const courseName = document.createElement("h2");
    const courseCode = course.classCode || 'N/A';
    courseName.innerHTML = `${course.name || `Class ${course.id}`} | <span class="course-code-display"><i>${courseCode}</i></span>`;
    
    const courseDesc = document.createElement("p");
    courseDesc.textContent = course.classDesc || 'No description';
    
    const sectionElem = document.createElement("p");
    sectionElem.textContent = `Section: ${course.section || 'N/A'}`;

    const tagsElem = document.createElement("p");
    const tagsDisplay = Array.isArray(course.tags) && course.tags.length > 0
        ? course.tags.join(', ')
        : 'None';
    tagsElem.textContent = `Tags: ${tagsDisplay}`;

    courseDiv.appendChild(courseName);
    courseDiv.appendChild(courseDesc);
    courseDiv.appendChild(sectionElem); 
    courseDiv.appendChild(tagsElem);    
    
    return courseDiv;
}

/**
 * Frontend custom validation for the course creation form.
 * Validates required course fields using setCustomValidity and prevents submission until valid.
 * @param {*} event - form submission event
 */
createCourseForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    
    // grab all form elements
    const title = document.getElementById("create_course_title");
    const name = document.getElementById("create_course_name");
    const section = document.getElementById("create_course_section");
    const tags = document.getElementById("create_course_tag");
    
    // reset previous validity states
    title.setCustomValidity("");
    name.setCustomValidity("");
    section.setCustomValidity("");
    tags.setCustomValidity("");
    
    // validate course title
    if (!title.value.trim()) {
        title.setCustomValidity("Course title is required.");
    }
    
    // validate course name
    if (!name.value.trim()) {
        name.setCustomValidity("Course name is required.");
    }
    
    // check overall form validity before submitting
    if (!createCourseForm.checkValidity()) {
        createCourseForm.reportValidity();
        return;
    }
    
    if (!currentUser) {
        alert("User not loaded. Please refresh the page.");
        return;
    }
    
    await createCourse({
        title: title.value.trim(),
        name: name.value.trim(),
        section: section.value.trim(),
        tags: tags.value.trim()
    });
});

/**
 * Async function to create a new course via API
 * @param {Object} courseData course data to create
 */
async function createCourse(courseData) {
    try {
        // parse tags from comma-separated string into array
        const tagsArray = courseData.tags 
            ? courseData.tags.split(',').map(t => t.trim()).filter(t => t.length > 0)
            : [];
        
        const response = await fetch(`/api/classes`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({
                instructorID: currentUser.id,
                name: courseData.name,
                classDesc: courseData.title,
                section: courseData.section || null,
                tags: tagsArray.length > 0 ? tagsArray : null
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            alert(data.message || `Successfully created course! Class code: ${data.classCode}`);
            
            // clear form and reset validity states
            createCourseForm.reset();
            document.getElementById("create_course_title").setCustomValidity("");
            document.getElementById("create_course_name").setCustomValidity("");
            document.getElementById("create_course_section").setCustomValidity("");
            document.getElementById("create_course_tag").setCustomValidity("");
            
            // reload courses
            await loadInstructorCourses();
        } else {
            alert(data.message || "Failed to create course");
        }
    } catch (err) {
        console.error("Error creating course:", err);
        alert("An error occurred. You may be offline.");
    }
}