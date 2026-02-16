import apiClient from "./APIClient.js";
import { dbHelper } from "./dbHelper.js";

const notesInList = document.querySelectorAll(".one-note-in-list");
const searchInput = document.getElementById("search-notes");
const downloadButton = document.querySelector(".download-button");
const logoutIcon = document.querySelector('img[alt="Logout Icon"]');
const homeIcon = document.querySelector('img[alt="Home Logo"]');
const likeBtn = document.querySelector(".like-btn");
let currentUser = null;
let global_notes_list = null;
let currentClassID = null;

document.addEventListener("DOMContentLoaded", async () => {
  const postButton = document.getElementById("upload-notes-button");
  const createNoteForm = document.getElementById("note-creation");
  const form = document.getElementById("create-new-note");

  currentClassID = window.location.pathname.split("/")[2];

  const noteToDisplayContainer = document.getElementById("note-to-display");
  noteToDisplayContainer.classList.add("empty");

  await loadCurrentUser();
  await loadClassNotes();

  searchInput.addEventListener("input", (e) => {
    searchNotes(e.target.value);
  });

  postButton.addEventListener("click", () => {
    createNoteForm.classList.toggle("hidden");
  });

  homeIcon.addEventListener("click", () => {
    window.location.href = "/student/home";
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

  downloadButton.addEventListener("click", async (event) => {
    try {
      const noteID = event.target.id;
      const response = await fetch(`/api/notes/${noteID}/download`, {
        method: "GET",
        credentials: "include",
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `note_${noteID}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
      } else {
        console.error("Failed to download");
      }
    } catch (err) {
      alert("Unable to download. You may be offline.");
    }
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const title = document.getElementById("create-note-title").value;
    const fileInput = document.getElementById("create-note-file");
    const pdf = fileInput.files[0];

    if (!pdf) {
      alert("Please choose a PDF");
      return;
    }

    // handle offline - save for later
    if (!navigator.onLine) {
      await savePendingUpload(title, pdf);
      closeFormAndReset(createNoteForm, form);
      return;
    }

    // upload if online
    const formData = new FormData();
    formData.append("title", title);
    formData.append("pdf", pdf);

    try {
      const res = await fetch(`/api/notes/classes/${currentClassID}`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (data.success) {
        alert("Note uploaded successfully!");
        await loadClassNotes();
        closeFormAndReset(createNoteForm, form);
      } else {
        alert(data.message || "Failed to create note.");
      }
    } catch (err) {
      await savePendingUpload(title, pdf);
      closeFormAndReset(createNoteForm, form);
    }
  });

  notesInList.forEach((note) => {
    addClickListener(note);
  });
});

async function savePendingUpload(title, pdf) {
  try {
    await dbHelper.addPendingUpload(
      { title, classID: currentClassID, tags: "" },
      pdf
    );
    alert("Note saved and will be uploaded when you're back online.");
  } catch (err) {
    console.error("Error saving pending upload:", err);
    alert("Failed to save note. Please try again.");
  }
}

function closeFormAndReset(form, formElement) {
  form.classList.add("hidden");
  formElement.reset();
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
      await saveToCache("user", data.user);
    } else {
      await loadFromCache("user");
    }
  } catch (err) {
    await loadFromCache("user");
  }
}

async function getAuthor(userID) {
  try {
    const response = await fetch(`/api/users/${userID}`, {
      method: "GET",
      credentials: "include",
    });

    if (response.ok) {
      const data = await response.json();
      const fullName = data.firstName + " " + data.lastName;

      // cache author data
      await dbHelper.saveAuthor(userID, {
        firstName: data.firstName,
        lastName: data.lastName,
        fullName: fullName,
      });

      return fullName;
    }
  } catch (err) {
    console.error("Error loading author:", err);
  }

  // try to load from cache when offline or if fetch fails
  try {
    const cachedAuthor = await dbHelper.getAuthor?.(userID);
    if (cachedAuthor?.fullName) {
      return cachedAuthor.fullName;
    }
  } catch (e) {
    console.error("Error loading cached author:", e);
  }

  return "Unknown Author";
}

async function loadClassNotes() {
  try {
    const response = await fetch(`/api/notes/classes/${currentClassID}`, {
      method: "GET",
      credentials: "include",
    });

    if (response.ok) {
      const data = await response.json();
      global_notes_list = data.notes;
      await saveToCache("notes", data.notes);
      displayClassNotes(data.notes || []);
    } else {
      await loadFromCache("notes");
    }
  } catch (err) {
    console.error("Error loading class notes:", err);
    await loadFromCache("notes");
  }
}

async function saveToCache(type, data, id = null) {
  try {
    if (type === "user") {
      await dbHelper.saveUserProfile(data);
    } else if (type === "notes") {
      await dbHelper.saveMultipleNotes(data);
    } else if (type === "author") {
      await dbHelper.saveAuthor(id, { fullName: data });
    }
  } catch (e) {
    console.error(`Error saving ${type} to cache:`, e);
  }
}

async function loadFromCache(type, id = null) {
  try {
    if (type === "user") {
      currentUser = await dbHelper.getUserProfile?.();
      if (currentUser) {
        console.log("Loaded user from cache");
      }
      return currentUser;
    } else if (type === "notes") {
      const classIDNumber = parseInt(currentClassID, 10);
      const cachedNotes = await dbHelper.getNotesByClass(classIDNumber);
      if (cachedNotes?.length > 0) {
        console.log("Loaded notes from cache");
        global_notes_list = cachedNotes;
        displayClassNotes(cachedNotes);
      } else {
        displayClassNotes([]);
      }
      return cachedNotes;
    } else if (type === "author") {
      const cachedAuthor = await dbHelper.getAuthor(id);
      return cachedAuthor?.fullName || null;
    }
  } catch (e) {
    console.error(`Error loading cached ${type}:`, e);
    if (type === "notes") displayClassNotes([]);
    return null;
  }
}

function displayClassNotes(notes) {
  clearNotesList();
  const list = document.getElementById("note-list");

  if (notes.length === 0) {
    const emptyMsg = document.createElement("p");
    emptyMsg.className = "empty-message";
    emptyMsg.textContent = "No notes available for this class.";
    list.appendChild(emptyMsg);
    return;
  }

  const note_preview = document.querySelector(".one-note");

  notes.forEach(async (note) => {
    const date = formatDate(note.createdAt);
    const author = await getAuthor(note.uploaderID);

    const newNote = document.importNode(note_preview.content, true);
    newNote.querySelector("div").className = "one-note-in-list";
    newNote.querySelector(".note-title").textContent = note.title;
    newNote.querySelector(".note-author").textContent = author;
    newNote.querySelector(".note-date").textContent = date;

    const ref = newNote.querySelector(".one-note-in-list");
    addClickListener(ref, note.id);

    list.appendChild(newNote);
  });
}

function formatDate(dateStr) {
  let date = dateStr.split("-");
  const day = date[2].slice(0, date[2].indexOf("T"));
  return `${date[1]}/${day}/${date[0]}`;
}

function clearNotesList() {
  document.getElementById("note-list").innerHTML = "";
}

function addClickListener(noteItem, noteID) {
  noteItem.addEventListener("click", async (event) => {
    event.preventDefault();

    const noteToDisplayContainer = document.getElementById("note-to-display");
    noteToDisplayContainer.classList.remove("empty");

    let notePreview = document.querySelector(".one-note-in-detail");
    notePreview.classList.remove("hidden");

    notePreview.querySelector(".note-title").textContent =
      noteItem.querySelector(".note-title").textContent;
    notePreview.querySelector(".note-author").textContent =
      noteItem.querySelector(".note-author").textContent;
    notePreview.querySelector(".note-date").textContent =
      noteItem.querySelector(".note-date").textContent;
    notePreview.querySelector(".download-button").id = noteID;

    // load current upvote count
    await loadUpvoteCount(noteID, notePreview);

    likeBtn.onclick = async () => {
      try {
        await getLikes(noteID);
        await loadUpvoteCount(noteID, notePreview);
      } catch (err) {
        console.error("Error updating likes:", err);
        if (!navigator.onLine) {
          alert("You're offline. Likes will sync when you're back online.");
        }
      }
    };
  });
}

async function loadUpvoteCount(noteID, notePreview) {
  try {
    const noteData = await getNotesByNoteID(noteID);
    notePreview.querySelector(".upvote-count").textContent =
      noteData.note.upvotes;
  } catch (err) {
    // try to get from cached notes
    const note = global_notes_list?.find((n) => n.id === noteID);
    if (note?.upvotes !== undefined) {
      notePreview.querySelector(".upvote-count").textContent = note.upvotes;
    }
  }
}

function searchNotes(query) {
  const q = query.trim().toLowerCase();
  if (q === "") {
    displayClassNotes(global_notes_list || []);
    return;
  }

  const filtered = (global_notes_list || []).filter((n) =>
    n.title.toLowerCase().includes(q)
  );

  displayClassNotes(filtered);
}

function getLikes(noteID) {
  return apiClient.upvoteNote(noteID);
}

function getNotesByNoteID(noteID) {
  return apiClient.getNoteById(noteID);
}
