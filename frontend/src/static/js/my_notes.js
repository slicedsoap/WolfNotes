import apiClient from "./APIClient.js";
import { dbHelper } from "./dbHelper.js";

const logoutIcon = document.querySelector('img[alt="Logout Icon"]');
const filterBar = document.querySelector("#filter-by-class");

let allNotes = [];
let currentUser = null;

document.addEventListener("DOMContentLoaded", async () => {
  await loadCurrentUser();
  const notes = await loadAllNotes();
  allNotes = notes;
  displayNotes(notes);

  filterBar.addEventListener("input", () => filterNotes(allNotes));
});

logoutIcon.addEventListener("click", async () => {
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

async function loadAllNotes() {
  try {
    const notes = await apiClient.getNotesByUserId(currentUser.id);
    if (notes.notes) {
      await saveToCache('notes', notes.notes);
    }
    return notes;
  } catch (err) {
    const cachedNotes = await loadFromCache('notes');
    return cachedNotes || { notes: [] };
  }
}

async function loadCurrentUser() {
  try {
    const response = await fetch("/api/auth/verify", {
      method: "GET",
      credentials: "include",
    });

    if (response.ok) {
      const data = await response.json();
      currentUser = data.user;
      await saveToCache('user', data.user);
    } else {
      const cached = await loadFromCache('user');
      if (!cached) {
        window.location.href = "/login";
      }
    }
  } catch (err) {
    const cached = await loadFromCache('user');
    if (!cached) {
      window.location.href = "/login";
    }
  }
}

async function saveToCache(type, data) {
  try {
    if (type === 'user') {
      await dbHelper.saveUserProfile(data);
    } else if (type === 'notes') {
      await dbHelper.saveMultipleNotes(data);
    } else if (type === 'class') {
      await dbHelper.saveClasses([data]);
    }
  } catch (e) {
    // silently fail
  }
}

async function loadFromCache(type) {
  try {
    if (type === 'user') {
      currentUser = await dbHelper.getUserProfile?.();
      return currentUser;
    } else if (type === 'notes') {
      const cachedNotes = await dbHelper.getAllNotes();
      if (cachedNotes?.length > 0) {
        return { notes: cachedNotes };
      }
    } else if (type === 'class') {
      const classes = await dbHelper.getClasses();
      return classes;
    }
  } catch (e) {
    return null;
  }
}

async function displayNotes(notesObj) {
  const container = document.getElementById("note-box");
  container.innerHTML = "";

  const notesArr = notesObj.notes;

  if (!notesArr || notesArr.length === 0) {
    const emptyMsg = document.createElement("p");
    emptyMsg.classList.add("empty-message");
    emptyMsg.textContent = "You haven't posted any notes yet.";
    container.appendChild(emptyMsg);
    return;
  }

  for (const note of notesArr) {
    const wrapper = document.createElement("div");
    wrapper.classList.add("note-item");

    const titleEl = document.createElement("h3");
    titleEl.classList.add("note-title");
    titleEl.textContent = note.title;

    const classEl = document.createElement("p");
    classEl.classList.add("note-class");

    const dateEl = document.createElement("p");
    dateEl.classList.add("note-date");
    const date = new Date(note.createdAt);
    dateEl.textContent = date.toLocaleDateString();

    wrapper.appendChild(titleEl);
    wrapper.appendChild(classEl);
    wrapper.appendChild(dateEl);

    const className = await getClassName(note.classID);
    classEl.textContent = className;

    wrapper.addEventListener("click", () => {
      window.location.href = `/class/${note.classID}`;
    });

    container.appendChild(wrapper);
  }
}

async function getClassName(classID) {
  try {
    const classData = await apiClient.getClassById(classID);
    const name = classData[0].name;
    await saveToCache('class', { id: classID, name });
    return name;
  } catch (err) {
    const cachedClasses = await loadFromCache('class');
    const found = cachedClasses?.find(c => c.id === classID);
    return found?.name || "Unknown Class";
  }
}

async function filterNotes(notesArr) {
  const filterValue = filterBar.value.trim().toLowerCase();

  if (!filterValue) {
    displayNotes(notesArr);
    return;
  }

  const filtered = [];

  for (const note of notesArr.notes) {
    const className = await getClassName(note.classID);
    if (className.toLowerCase().includes(filterValue)) {
      filtered.push(note);
    }
  }

  displayNotes({ success: true, notes: filtered });
}