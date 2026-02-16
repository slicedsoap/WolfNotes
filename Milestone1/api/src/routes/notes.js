const express = require('express');
const router = express.Router();

const notes = [
  { id: 1, classID: 116, uploaderID: 2, title: "Note 1", content: "Sample content", upvotes: 3 }
];

/**
 * POST /classes/:classID
 * Expected body: { uploaderID: number, title: string, content: string }
 *
 * Upload a new note to a class
 */
router.post('/classes/:classID', (req, res) => {
  const { uploaderID, title, content } = req.body;
 
  // ensure necessary fields
  if (!uploaderID || !title || !content) {
    return res.status(400).json({ message: 'uploaderID, title, and content are required' });
  }
 
  const newNote = {
    id: notes.length + 1,
    classID: parseInt(req.params.classID),
    uploaderID,  
    title,
    content,
    upvotes: 0
  };
  notes.push(newNote);
  res.status(200).json({ success: true, note: newNote });
});

/**
 * GET /classes/:classID
 *
 * Get all notes for a class
 */
router.get('/classes/:classID', (req, res) => {
  const classID = parseInt(req.params.classID);
  res.status(200).json({ success: true, notes: notes.filter(note => note.classID === classID) });
});

/**
 * GET /:noteID
 *
 * Get a specific note by ID
 */
router.get('/:noteID', (req, res) => {
  const note = notes.find(n => n.id === parseInt(req.params.noteID));
 
  if (!note) {
    return res.status(404).json({ message: 'Note not found' });
  }
 
  res.json({ success: true, note });
});

/**
 * POST /:noteID/upvote
 *
 * Upvote a note
 */
router.post('/:noteID/upvote', (req, res) => {
  const note = notes.find(n => n.id === parseInt(req.params.noteID));
 
  if (!note) {
    return res.status(404).json({ message: 'Note not found' });
  }
 
  note.upvotes++;
  res.json({ success: true, upvotes: note.upvotes });
});

/**
 * DELETE /:noteID
 *
 * Delete a note by ID
 */
router.delete('/:noteID', (req, res) => {
  const noteIndex = notes.findIndex(n => n.id === parseInt(req.params.noteID));
 
  if (noteIndex === -1) {
    return res.status(404).json({ message: 'Note not found' });
  }
 
  notes.splice(noteIndex, 1);
  res.json({ message: 'Note deleted successfully' });
});

module.exports = router;