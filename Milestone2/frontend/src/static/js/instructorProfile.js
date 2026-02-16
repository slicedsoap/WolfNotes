import { dbHelper } from './dbHelper.js';
import apiClient from './APIClient.js';

const logoutIcon = document.querySelector('img[alt="Logout Icon"]');
const profileForm = document.getElementById('profile-form');
let currentUser = null;

document.addEventListener("DOMContentLoaded", async () => {
    console.log("Instructor profile loading...");
    checkUserRole("instructor");
    
    await loadCurrentUser();
    
    if (currentUser) {
        loadProfileData();
        await loadInstructorClasses();
    }
});

/**
 * Add logout event
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
        alert("An error occurred during logout.");
    }
});

/**
 * Handle profile form submission
 */
profileForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = {
        id: currentUser.id,
        firstName: document.getElementById('firstName').value.trim(),
        lastName: document.getElementById('lastName').value.trim(),
        email: document.getElementById('email').value.trim(),
        institution: document.getElementById('institution').value.trim() || null,
        subject: document.getElementById('subject').value.trim() || null
    };
    
    try {
        const response = await fetch(`/api/users/${currentUser.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify(formData)
        });
        
        if (response.ok) {
            alert('Profile updated successfully!');
            await loadCurrentUser();
            loadProfileData();
        } else {
            const data = await response.json();
            alert(data.message || 'Failed to update profile');
        }
    } catch (err) {
        console.error('Error updating profile:', err);
        alert('An error occurred. Please try again.');
    }
});

/**
 * Load current user
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

            await dbHelper.saveUserProfile({ id: 1, ...currentUser });

        } else {
            throw new Error("Server rejected");
        }
    } catch (err) {
        console.warn("Offline, loading user from IndexedDB...");

        currentUser = await dbHelper.getUserProfile();

        if (!currentUser) {
            alert("You must log in online at least once before using offline mode.");
            window.location.href = '/login';
        }
    }
}


/**
 * Load profile data into form
 */
function loadProfileData() {
    if (!currentUser) return;
    
    document.getElementById('firstName').value = currentUser.firstName || '';
    document.getElementById('lastName').value = currentUser.lastName || '';
    document.getElementById('email').value = currentUser.email || '';
    document.getElementById('institution').value = currentUser.institution || '';
    document.getElementById('subject').value = currentUser.subject || '';
}

/**
 * Load instructor's classes with enrolled students
 */
async function loadInstructorClasses() {
    try {
        const classes = await apiClient.getAllClasses();
        
        // Save classes to IndexedDB
        if (dbHelper && dbHelper.saveClasses) {
            try {
                await dbHelper.saveClasses(classes);
            } catch (e) {
                console.error("Error saving classes to IndexedDB:", e);
            }
        }
        
        // Load students for each class
        const classesWithStudents = await Promise.all(
            classes.map(async (cls) => {
                const students = await loadStudentsForClass(cls.id);
                return { ...cls, students };
            })
        );
        
        displayClasses(classesWithStudents);
    } catch (err) {
        console.error("Error loading classes:", err);
        
        // offline: indexedDB
        if (dbHelper && dbHelper.getClasses) {
            try {
                const cachedClasses = await dbHelper.getClasses();
                
                // Load cached students for each class
                const classesWithStudents = await Promise.all(
                    cachedClasses.map(async (cls) => {
                        const students = await loadStudentsFromCache(cls.id);
                        return { ...cls, students };
                    })
                );
                
                console.log("Loading classes from IndexedDB cache");
                displayClasses(classesWithStudents);
            } catch (e) {
                console.error("Error loading from IndexedDB:", e);
                displayClasses([]);
            }
        } else {
            displayClasses([]);
        }
    }
}

/**
 * Load students for a specific class from API
 */
async function loadStudentsForClass(classID) {
    try {
        const response = await fetch(`/api/classes/${classID}/students`, {
            method: 'GET',
            credentials: 'include'
        });
        
        if (response.ok) {
            const students = await response.json();
            
            // Save students to IndexedDB
            if (dbHelper && dbHelper.saveStudentsForClass) {
                try {
                    await dbHelper.saveStudentsForClass(classID, students);
                } catch (e) {
                    console.error("Error saving students to IndexedDB:", e);
                }
            }
            
            return students;
        } else {
            return [];
        }
    } catch (err) {
        console.error(`Error loading students for class ${classID}:`, err);
        return [];
    }
}

/**
 * Load students from IndexedDB cache
 */
async function loadStudentsFromCache(classID) {
    if (dbHelper && dbHelper.getStudentsForClass) {
        try {
            return await dbHelper.getStudentsForClass(classID);
        } catch (e) {
            console.error("Error loading students from cache:", e);
            return [];
        }
    }
    return [];
}

/**
 * Display classes with enrolled students
 */
function displayClasses(classes) {
    const container = document.getElementById('classes-list');
    container.innerHTML = '';
    
    if (classes.length === 0) {
        const emptyMsg = document.createElement('p');
        emptyMsg.className = 'empty-message';
        emptyMsg.textContent = 'No classes found.';
        container.appendChild(emptyMsg);
        return;
    }
    
    classes.forEach(cls => {
        const classCard = createClassCard(cls);
        container.appendChild(classCard);
    });
}

/**
 * Create a class card with student dropdown and archive option
 */
function createClassCard(cls) {
    const card = document.createElement('div');
    card.className = 'class-card';
    
    // Class header
    const header = document.createElement('div');
    header.className = 'class-header';
    
    const title = document.createElement('h3');
    title.textContent = `${cls.name} | ${cls.classCode}`;
    
    const archiveBtn = document.createElement('button');
    archiveBtn.className = 'archive-btn';
    archiveBtn.textContent = cls.archived ? 'Unarchive' : 'Archive';
    archiveBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleArchiveClass(cls.id, !cls.archived);
    });
    
    header.appendChild(title);
    header.appendChild(archiveBtn);
    
    // Class details
    const details = document.createElement('div');
    details.className = 'class-details';
    
    const desc = document.createElement('p');
    desc.textContent = cls.classDesc || 'No description';
    
    const section = document.createElement('p');
    section.textContent = `Section: ${cls.section || 'N/A'}`;
    
    details.appendChild(desc);
    details.appendChild(section);
    
    // Students section
    const studentsSection = document.createElement('div');
    studentsSection.className = 'students-section';
    
    const studentsHeader = document.createElement('div');
    studentsHeader.className = 'students-header';
    studentsHeader.innerHTML = `
        <span>Enrolled Students (${cls.students?.length || 0})</span>
        <span class="dropdown-icon">▼</span>
    `;
    
    const studentsList = document.createElement('div');
    studentsList.className = 'students-list';
    studentsList.style.display = 'none';
    
    if (cls.students && cls.students.length > 0) {
        cls.students.forEach(student => {
            const studentItem = document.createElement('div');
            studentItem.className = 'student-item';
            
            const email = document.createElement('span');
            email.textContent = student.email;
            
            const unenrollBtn = document.createElement('button');
            unenrollBtn.className = 'unenroll-btn';
            unenrollBtn.textContent = 'Unenroll';
            unenrollBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                unenrollStudent(student.id, cls.id, student.email);
            });
            
            studentItem.appendChild(email);
            studentItem.appendChild(unenrollBtn);
            studentsList.appendChild(studentItem);
        });
    } else {
        const noStudents = document.createElement('p');
        noStudents.className = 'no-students';
        noStudents.textContent = 'No students enrolled yet';
        studentsList.appendChild(noStudents);
    }
    
    // Toggle dropdown
    studentsHeader.addEventListener('click', () => {
        const isHidden = studentsList.style.display === 'none';
        studentsList.style.display = isHidden ? 'block' : 'none';
        studentsHeader.querySelector('.dropdown-icon').textContent = isHidden ? '▲' : '▼';
    });
    
    studentsSection.appendChild(studentsHeader);
    studentsSection.appendChild(studentsList);
    
    card.appendChild(header);
    card.appendChild(details);
    card.appendChild(studentsSection);
    
    return card;
}

/**
 * Toggle archive status of a class
 */
async function toggleArchiveClass(classID, archive) {
    try {
        const response = await fetch(`/api/classes/${classID}/archive`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({ archived: archive })
        });
        
        if (response.ok) {
            alert(`Class ${archive ? 'archived' : 'unarchived'} successfully`);
            await loadInstructorClasses();
        } else {
            const data = await response.json();
            alert(data.message || 'Failed to update class');
        }
    } catch (err) {
        console.error('Error archiving class:', err);
        alert('An error occurred. Please try again.');
    }
}

/**
 * Unenroll a student from a class
 */
async function unenrollStudent(studentID, classID, email) {
    if (!confirm(`Are you sure you want to unenroll ${email}?`)) {
        return;
    }
    
    try {
        const response = await apiClient.unenrollStudent(studentID, classID);
        
        if (response) {
            alert('Student unenrolled successfully');
            await loadInstructorClasses();
        }
    } catch (err) {
        console.error('Error unenrolling student:', err);
        alert('Failed to unenroll student. Please try again.');
    }
}