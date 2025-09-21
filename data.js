class DataManager {
    constructor() {
        this.storageKey = 'pluainData';
        this.data = this.loadData();
        this.init();
    }

    init() {
        if (!this.data.stages) {
            this.data.stages = this.getDefaultStages();
        }
        if (!this.data.userProgress) {
            this.data.userProgress = {
                completedStages: [],
                unlockedStages: ['html-basics'],
                totalXP: 0,
                achievements: ['first-step']
            };
        }
        if (!this.data.notes) {
            this.data.notes = [];
        }
        if (!this.data.chatHistory) {
            this.data.chatHistory = [];
        }
        if (!this.data.feedback) {
            this.data.feedback = [];
        }
        if (!this.data.suggestions) {
            this.data.suggestions = [];
        }
        if (!this.data.profile) {
            this.data.profile = {
                education: [],
                courses: []
            };
        }

        this.saveData();
    }

    loadData() {
        const stored = localStorage.getItem(this.storageKey);
        return stored ? JSON.parse(stored) : {};
    }

    saveData() {
        localStorage.setItem(this.storageKey, JSON.stringify(this.data));
    }

    getDefaultStages() {
        return {
            'html-basics': {
                id: 'html-basics',
                title: 'HTML5 Fundamentals',
                icon: '🌐',
                level: 1,
                description: 'Aprenda os fundamentos do HTML5 e estruture suas primeiras páginas web.',
                skills: [
                    'Tags básicas do HTML',
                    'Estrutura semântica',
                    'Formulários HTML5',
                    'Multimídia (audio, video)',
                    'Canvas e SVG'
                ],
                prerequisites: [],
                xpReward: 100,
                status: 'available'
            },
            'css-styling': {
                id: 'css-styling',
                title: 'CSS3 & Design',
                icon: '🎨',
                level: 2,
                description: 'Domine CSS3, Flexbox, Grid e crie layouts responsivos incríveis.',
                skills: [
                    'CSS3 básico e avançado',
                    'Flexbox Layout',
                    'CSS Grid',
                    'Animações CSS',
                    'Design Responsivo'
                ],
                prerequisites: ['html-basics'],
                xpReward: 150,
                status: 'locked'
            },
            'javascript-core': {
                id: 'javascript-core',
                title: 'JavaScript Essencial',
                icon: '⚡',
                level: 3,
                description: 'Fundamentos do JavaScript: variáveis, funções, DOM e programação orientada a objetos.',
                skills: [
                    'Sintaxe JavaScript',
                    'Manipulação do DOM',
                    'Eventos e Event Listeners',
                    'JavaScript assíncrono',
                    'ES6+ Features'
                ],
                prerequisites: ['html-basics', 'css-styling'],
                xpReward: 200,
                status: 'locked'
            },
            'javascript-advanced': {
                id: 'javascript-advanced',
                title: 'JavaScript Avançado',
                icon: '🚀',
                level: 4,
                description: 'Conceitos avançados: closures, promises, async/await, módulos e padrões de projeto.',
                skills: [
                    'Closures e Scope',
                    'Promises e Async/Await',
                    'Módulos ES6',
                    'Design Patterns',
                    'Performance Optimization'
                ],
                prerequisites: ['javascript-core'],
                xpReward: 250,
                status: 'locked'
            },
            'react-basics': {
                id: 'react-basics',
                title: 'React Fundamentals',
                icon: '⚛️',
                level: 5,
                description: 'Aprenda React do zero: componentes, estado, props e hooks.',
                skills: [
                    'Componentes React',
                    'JSX e Virtual DOM',
                    'State e Props',
                    'React Hooks',
                    'Context API'
                ],
                prerequisites: ['javascript-advanced'],
                xpReward: 300,
                status: 'locked'
            },
            'react-advanced': {
                id: 'react-advanced',
                title: 'React Avançado',
                icon: '🏗️',
                level: 6,
                description: 'React avançado: performance, testes, padrões avançados e ecosystem.',
                skills: [
                    'React Performance',
                    'Custom Hooks',
                    'Higher-Order Components',
                    'React Testing Library',
                    'State Management (Redux/Zustand)'
                ],
                prerequisites: ['react-basics'],
                xpReward: 350,
                status: 'locked'
            },
            'nodejs-backend': {
                id: 'nodejs-backend',
                title: 'Node.js Backend',
                icon: '🌲',
                level: 7,
                description: 'Construa APIs REST com Node.js, Express e trabalhe com bancos de dados.',
                skills: [
                    'Node.js Fundamentos',
                    'Express.js Framework',
                    'REST APIs',
                    'Autenticação JWT',
                    'MongoDB/PostgreSQL'
                ],
                prerequisites: ['javascript-advanced'],
                xpReward: 400,
                status: 'locked'
            },
            'database-design': {
                id: 'database-design',
                title: 'Banco de Dados',
                icon: '🗄️',
                level: 8,
                description: 'Design de bancos relacionais e NoSQL, otimização de queries.',
                skills: [
                    'SQL Avançado',
                    'Modelagem de Dados',
                    'MongoDB',
                    'Otimização de Queries',
                    'Database Migration'
                ],
                prerequisites: ['nodejs-backend'],
                xpReward: 300,
                status: 'locked'
            },
            'fullstack-project': {
                id: 'fullstack-project',
                title: 'Projeto Full Stack',
                icon: '🏆',
                level: 9,
                description: 'Crie uma aplicação completa integrando frontend, backend e banco de dados.',
                skills: [
                    'Arquitetura Full Stack',
                    'Deploy e DevOps',
                    'Testes E2E',
                    'Performance Monitoring',
                    'Projeto Portfolio'
                ],
                prerequisites: ['react-advanced', 'database-design'],
                xpReward: 500,
                status: 'locked'
            }
        };
    }

    getStage(stageId) {
        return this.data.stages[stageId];
    }

    getAllStages() {
        return this.data.stages;
    }

    completeStage(stageId) {
        const stage = this.data.stages[stageId];
        if (!stage) return false;

        if (!this.data.userProgress.completedStages.includes(stageId)) {
            this.data.userProgress.completedStages.push(stageId);
        }

        this.data.userProgress.totalXP += stage.xpReward;

        Object.keys(this.data.stages).forEach(id => {
            const nextStage = this.data.stages[id];
            if (nextStage.prerequisites.includes(stageId)) {
                if (!this.data.userProgress.unlockedStages.includes(id)) {
                    this.data.userProgress.unlockedStages.push(id);
                }
            }
        });

        stage.status = 'completed';

        this.saveData();
        return true;
    }

    getStageProgress(stageId) {
        if (this.data.userProgress.completedStages.includes(stageId)) {
            return { status: 'completed', progress: 100 };
        } else if (this.data.userProgress.unlockedStages.includes(stageId)) {
            return { status: 'available', progress: 0 };
        } else {
            return { status: 'locked', progress: 0 };
        }
    }

    createNote(title, content) {
        const note = {
            id: Date.now().toString(),
            title: title || 'Nova Anotação',
            content: content || '',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            tags: []
        };

        this.data.notes.unshift(note);
        this.saveData();
        return note;
    }

    updateNote(noteId, updates) {
        const noteIndex = this.data.notes.findIndex(note => note.id === noteId);
        if (noteIndex === -1) return null;

        this.data.notes[noteIndex] = {
            ...this.data.notes[noteIndex],
            ...updates,
            updatedAt: new Date().toISOString()
        };

        this.saveData();
        return this.data.notes[noteIndex];
    }

    deleteNote(noteId) {
        const noteIndex = this.data.notes.findIndex(note => note.id === noteId);
        if (noteIndex === -1) return false;

        this.data.notes.splice(noteIndex, 1);
        this.saveData();
        return true;
    }

    getAllNotes() {
        return this.data.notes;
    }

    getNote(noteId) {
        return this.data.notes.find(note => note.id === noteId);
    }

    searchNotes(query) {
        const lowerQuery = query.toLowerCase();
        return this.data.notes.filter(note => 
            note.title.toLowerCase().includes(lowerQuery) ||
            note.content.toLowerCase().includes(lowerQuery)
        );
    }

    addChatMessage(message) {
        const chatMessage = {
            id: Date.now().toString(),
            ...message,
            timestamp: new Date().toISOString()
        };

        this.data.chatHistory.push(chatMessage);
        
        if (this.data.chatHistory.length > 100) {
            this.data.chatHistory = this.data.chatHistory.slice(-100);
        }

        this.saveData();
        return chatMessage;
    }

    getChatHistory() {
        return this.data.chatHistory;
    }

    clearChatHistory() {
        this.data.chatHistory = [];
        this.saveData();
    }

    addFeedback(feedback) {
        const feedbackItem = {
            id: Date.now().toString(),
            ...feedback,
            createdAt: new Date().toISOString()
        };

        this.data.feedback.push(feedbackItem);
        this.saveData();
        return feedbackItem;
    }

    getFeedbackHistory() {
        return this.data.feedback;
    }

    addSuggestion(suggestion) {
        const suggestionItem = {
            id: Date.now().toString(),
            ...suggestion,
            votes: 0,
            createdAt: new Date().toISOString()
        };

        this.data.suggestions.push(suggestionItem);
        this.saveData();
        return suggestionItem;
    }

    getAllSuggestions() {
        return this.data.suggestions;
    }

    voteSuggestion(suggestionId, vote) {
        const suggestion = this.data.suggestions.find(s => s.id === suggestionId);
        if (suggestion) {
            suggestion.votes += vote;
            this.saveData();
        }
    }

    updateProfile(profileData) {
        this.data.profile = { ...this.data.profile, ...profileData };
        this.saveData();
    }

    addEducation(education) {
        if (!this.data.profile.education) {
            this.data.profile.education = [];
        }
        
        const educationItem = {
            id: Date.now().toString(),
            ...education,
            createdAt: new Date().toISOString()
        };

        this.data.profile.education.push(educationItem);
        this.saveData();
        return educationItem;
    }

    addCourse(course) {
        if (!this.data.profile.courses) {
            this.data.profile.courses = [];
        }

        const courseItem = {
            id: Date.now().toString(),
            ...course,
            createdAt: new Date().toISOString()
        };

        this.data.profile.courses.push(courseItem);
        this.saveData();
        return courseItem;
    }

    getProfile() {
        return this.data.profile;
    }

    getStatistics() {
        return {
            totalStages: Object.keys(this.data.stages).length,
            completedStages: this.data.userProgress.completedStages.length,
            totalXP: this.data.userProgress.totalXP,
            totalNotes: this.data.notes.length,
            totalFeedback: this.data.feedback.length,
            totalSuggestions: this.data.suggestions.length,
            streak: this.calculateStreak()
        };
    }

    calculateStreak() {
        return this.data.userProgress.completedStages.length > 0 ? 
               Math.min(this.data.userProgress.completedStages.length, 30) : 0;
    }
}

let dataManager;
document.addEventListener('DOMContentLoaded', () => {
    dataManager = new DataManager();
});