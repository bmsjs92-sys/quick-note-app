const noteForm = document.getElementById('note-form');
const noteTitle = document.getElementById('note-title');
const noteContent = document.getElementById('note-content');
const notesGrid = document.getElementById('notes-grid');

async function fetchNotes() {
  try {
    const response = await fetch('/notes');
    const notes = await response.json();
    renderNotes(notes);
  } catch (error) {
    console.error('Error fetching notes:', error);
  }
}

function renderNotes(notes) {
  notesGrid.innerHTML = '';

  if (notes.length === 0) {
    notesGrid.innerHTML = '<p style="color:#64748b; grid-column: 1/-1; text-align:center;">No notes yet. Create one above!</p>';
    return;
  }

  notes.forEach((note) => {
    const card = document.createElement('div');
    card.className = 'note-card';
    card.innerHTML = `
      <div>
        <h3>${escapeHTML(note.title)}</h3>
        <p>${escapeHTML(note.content)}</p>
      </div>
      <div class="note-footer">
        <span>${note.createdAt || ''}</span>
        <button class="delete-btn" onclick="deleteNote('${note.id}')">Delete</button>
      </div>
    `;
    notesGrid.appendChild(card);
  });
}

noteForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const title = noteTitle.value;
  const content = noteContent.value;

  try {
    const response = await fetch('/notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, content })
    });

    if (response.ok) {
      noteTitle.value = '';
      noteContent.value = '';
      fetchNotes();
    }
  } catch (error) {
    console.error('Error adding note:', error);
  }
});

async function deleteNote(id) {
  try {
    const response = await fetch(`/notes/${id}`, {
      method: 'DELETE'
    });

    if (response.ok) {
      fetchNotes();
    }
  } catch (error) {
    console.error('Error deleting note:', error);
  }
}

function escapeHTML(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

fetchNotes();
