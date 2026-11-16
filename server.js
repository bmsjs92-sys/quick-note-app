const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'notes.json');

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const readNotes = () => {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      fs.writeFileSync(DATA_FILE, '[]', 'utf8');
    }
    const data = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    return [];
  }
};

const writeNotes = (notes) => {
  fs.writeFileSync(DATA_FILE, JSON.stringify(notes, null, 2), 'utf8');
};

app.get('/notes', (req, res) => {
  const notes = readNotes();
  res.json(notes);
});

app.post('/notes', (req, res) => {
  const { title, content } = req.body;
  if (!title || !content) {
    return res.status(400).json({ error: 'Title and content are required.' });
  }

  const notes = readNotes();
  const newNote = {
    id: Date.now().toString(),
    title: title.trim(),
    content: content.trim(),
    createdAt: new Date().toLocaleDateString()
  };

  notes.unshift(newNote);
  writeNotes(notes);
  res.status(201).json(newNote);
});

app.delete('/notes/:id', (req, res) => {
  const { id } = req.params;
  let notes = readNotes();
  const initialLength = notes.length;

  notes = notes.filter((note) => note.id !== id);

  if (notes.length === initialLength) {
    return res.status(404).json({ error: 'Note not found.' });
  }

  writeNotes(notes);
  res.json({ message: 'Note deleted successfully.' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
