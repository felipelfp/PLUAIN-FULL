
class NotesManager {
    constructor() {
        this.currentNote = null;
        this.notes = [];
        this.autoSaveTimeout = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadNotes();
    }

    setupEventListeners() {
        
        const titleInput = document.getElementById('noteTitle');
        if (titleInput) {
            titleInput.addEventListener('input', (e) => {
                this.updateCurrentNote({ title: e.target.value });
                this.autoSave();
            });
        }

        const contentTextarea = document.getElementById('noteContent');
        if (contentTextarea) {
            contentTextarea.addEventListener('input', (e) => {
                this.updateCurrentNote({ content: e.target.value });
                this.updateWordCount();
                this.autoSave();
            });
        }

        const searchInput = document.getElementById('notesSearch');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchNotes(e.target.value);
            });
        }

        document.querySelectorAll('.editor-toolbar button').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = e.target.closest('button').onclick;
                if (action) {
                    action.call(e.target);
                }
            });
        });
    }

    loadNotes() {
        this.notes = dataManager.getAllNotes();
        this.renderNotesList();
        
        if (this.notes.length === 0) {
            this.createNewNote();
        } else {
            this.selectNote(this.notes[0]);
        }
    }

    renderNotesList(filteredNotes = null) {
        const notesList = document.getElementById('notesList');
        if (!notesList) return;

        const notesToRender = filteredNotes || this.notes;

        if (notesToRender.length === 0) {
            notesList.innerHTML = `
                <div class="empty-notes">
                    <i class="fas fa-sticky-note" style="font-size: 3rem; opacity: 0.3; margin-bottom: 15px;"></i>
                    <p>Nenhuma anotação encontrada</p>
                    <button onclick="createNewNote()" class="btn-secondary">
                        <i class="fas fa-plus"></i> Criar primeira nota
                    </button>
                </div>
            `;
            return;
        }

        notesList.innerHTML = notesToRender.map(note => {
            const isActive = this.currentNote && this.currentNote.id === note.id;
            return `
                <div class="note-item ${isActive ? 'active' : ''}" onclick="selectNote('${note.id}')">
                    <h4>${this.escapeHtml(note.title) || 'Sem título'}</h4>
                    <p>${this.escapeHtml(this.truncateText(note.content, 50)) || 'Sem conteúdo'}</p>
                    <time>${this.formatDate(note.updatedAt)}</time>
                </div>
            `;
        }).join('');
    }

    createNewNote() {
        const newNote = dataManager.createNote('Nova Anotação', '');
        this.notes = dataManager.getAllNotes();
        this.renderNotesList();
        this.selectNote(newNote);
        
        setTimeout(() => {
            const titleInput = document.getElementById('noteTitle');
            if (titleInput) {
                titleInput.focus();
                titleInput.select();
            }
        }, 100);
    }

    selectNote(noteOrId) {
        const note = typeof noteOrId === 'string' 
            ? this.notes.find(n => n.id === noteOrId) 
            : noteOrId;

        if (!note) return;

        this.currentNote = note;
        this.updateEditor(note);
        this.renderNotesList();
    }

    updateEditor(note) {
        const titleInput = document.getElementById('noteTitle');
        const contentTextarea = document.getElementById('noteContent');
        const lastEditSpan = document.getElementById('noteLastEdit');

        if (titleInput) titleInput.value = note.title || '';
        if (contentTextarea) contentTextarea.value = note.content || '';
        if (lastEditSpan) lastEditSpan.textContent = this.formatDate(note.updatedAt);

        this.updateWordCount();
    }

    updateCurrentNote(updates) {
        if (!this.currentNote) return;

        this.currentNote = { ...this.currentNote, ...updates };
    }

    saveCurrentNote() {
        if (!this.currentNote) return;

        const updatedNote = dataManager.updateNote(this.currentNote.id, this.currentNote);
        if (updatedNote) {
            this.currentNote = updatedNote;
            this.notes = dataManager.getAllNotes();
            this.renderNotesList();
            this.updateLastEditTime();
            
            this.showSaveSuccess();
        }
    }

    deleteCurrentNote() {
        if (!this.currentNote) return;

        if (confirm('Tem certeza que deseja excluir esta anotação?')) {
            const success = dataManager.deleteNote(this.currentNote.id);
            
            if (success) {
                this.notes = dataManager.getAllNotes();
                this.renderNotesList();
                
                if (this.notes.length > 0) {
                    this.selectNote(this.notes[0]);
                } else {
                    this.createNewNote();
                }
                
                this.showDeleteSuccess();
            }
        }
    }

    searchNotes(query) {
        if (!query.trim()) {
            this.renderNotesList();
            return;
        }

        const filteredNotes = dataManager.searchNotes(query);
        this.renderNotesList(filteredNotes);
    }

    autoSave() {
        if (this.autoSaveTimeout) {
            clearTimeout(this.autoSaveTimeout);
        }

        this.autoSaveTimeout = setTimeout(() => {
            this.saveCurrentNote();
        }, 2000);
    }

    updateWordCount() {
        const contentTextarea = document.getElementById('noteContent');
        const wordCountSpan = document.getElementById('noteWordCount');

        if (contentTextarea && wordCountSpan) {
            const text = contentTextarea.value;
            const wordCount = text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
            wordCountSpan.textContent = wordCount;
        }
    }

    updateLastEditTime() {
        const lastEditSpan = document.getElementById('noteLastEdit');
        if (lastEditSpan) {
            lastEditSpan.textContent = this.formatDate(new Date().toISOString());
        }
    }

    formatText(command) {
        const textarea = document.getElementById('noteContent');
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selectedText = textarea.value.substring(start, end);

        if (selectedText === '') return;

        let formattedText = selectedText;
        switch(command) {
            case 'bold':
                formattedText = `**${selectedText}**`;
                break;
            case 'italic':
                formattedText = `*${selectedText}*`;
                break;
            case 'underline':
                formattedText = `__${selectedText}__`;
                break;
        }

        textarea.value = textarea.value.substring(0, start) + formattedText + textarea.value.substring(end);
        this.updateCurrentNote({ content: textarea.value });
        this.updateWordCount();
        this.autoSave();

        textarea.focus();
        textarea.setSelectionRange(start, start + formattedText.length);
    }

    insertList() {
        const textarea = document.getElementById('noteContent');
        if (!textarea) return;

        const cursorPos = textarea.selectionStart;
        const textBefore = textarea.value.substring(0, cursorPos);
        const textAfter = textarea.value.substring(cursorPos);

        const listItem = '\n- Item da lista';
        textarea.value = textBefore + listItem + textAfter;

        this.updateCurrentNote({ content: textarea.value });
        this.updateWordCount();
        this.autoSave();

        textarea.focus();
        textarea.setSelectionRange(cursorPos + listItem.length, cursorPos + listItem.length);
    }

    insertCode() {
        const textarea = document.getElementById('noteContent');
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selectedText = textarea.value.substring(start, end);

        const codeText = selectedText ? `\`${selectedText}\`` : '\`código aqui\`';
        
        textarea.value = textarea.value.substring(0, start) + codeText + textarea.value.substring(end);
        this.updateCurrentNote({ content: textarea.value });
        this.updateWordCount();
        this.autoSave();

        textarea.focus();
        const newPos = selectedText ? start + codeText.length : start + 1;
        textarea.setSelectionRange(newPos, selectedText ? newPos : newPos + 10);
    }

    truncateText(text, maxLength) {
        if (!text) return '';
        return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    }

    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffInMinutes = Math.floor((now - date) / (1000 * 60));

        if (diffInMinutes < 1) return 'agora';
        if (diffInMinutes < 60) return `${diffInMinutes}min atrás`;
        
        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) return `${diffInHours}h atrás`;
        
        const diffInDays = Math.floor(diffInHours / 24);
        if (diffInDays < 7) return `${diffInDays}d atrás`;
        
        return date.toLocaleDateString('pt-BR');
    }

    showSaveSuccess() {
        const saveBtn = document.querySelector('.editor-actions button[title="Salvar"]');
        if (saveBtn) {
            const originalHTML = saveBtn.innerHTML;
            saveBtn.innerHTML = '<i class="fas fa-check"></i>';
            saveBtn.style.color = 'var(--primary-color)';
            
            setTimeout(() => {
                saveBtn.innerHTML = originalHTML;
                saveBtn.style.color = '';
            }, 1000);
        }
    }

    showDeleteSuccess() {
        if (window.uiManager) {
            uiManager.showAchievementPopup('Anotação excluída com sucesso!');
        }
    }
}

function createNewNote() {
    if (window.notesManager) {
        notesManager.createNewNote();
    }
}

function selectNote(noteId) {
    if (window.notesManager) {
        notesManager.selectNote(noteId);
    }
}

function saveCurrentNote() {
    if (window.notesManager) {
        notesManager.saveCurrentNote();
    }
}

function deleteCurrentNote() {
    if (window.notesManager) {
        notesManager.deleteCurrentNote();
    }
}

function formatText(command) {
    if (window.notesManager) {
        notesManager.formatText(command);
    }
}

function insertList() {
    if (window.notesManager) {
        notesManager.insertList();
    }
}

function insertCode() {
    if (window.notesManager) {
        notesManager.insertCode();
    }
}

function searchNotes() {
    const searchInput = document.getElementById('notesSearch');
    if (searchInput && window.notesManager) {
        notesManager.searchNotes(searchInput.value);
    }
}

let notesManager;
document.addEventListener('DOMContentLoaded', () => {
    notesManager = new NotesManager();
});

const notesStyles = document.createElement('style');
notesStyles.textContent = `
    .empty-notes {
        text-align: center;
        padding: 40px 20px;
        color: var(--text-muted);
    }

    .empty-notes i {
        display: block;
        color: var(--text-muted);
    }

    .empty-notes p {
        margin-bottom: 20px;
        font-size: 1.1rem;
    }

    .note-item:hover {
        transform: translateX(5px);
    }

    .note-item.active {
        transform: translateX(5px);
    }

    .editor-actions button.success {
        color: var(--primary-color) !important;
        border-color: var(--primary-color) !important;
    }

    .note-title-input::placeholder {
        color: var(--text-muted);
    }

    .editor-content textarea::placeholder {
        color: var(--text-muted);
    }

    /* Custom scrollbar for notes list */
    .notes-list::-webkit-scrollbar {
        width: 6px;
    }

    .notes-list::-webkit-scrollbar-track {
        background: var(--accent-bg);
        border-radius: 3px;
    }

    .notes-list::-webkit-scrollbar-thumb {
        background: var(--border-color);
        border-radius: 3px;
    }

    .notes-list::-webkit-scrollbar-thumb:hover {
        background: var(--text-muted);
    }
`;
document.head.appendChild(notesStyles);