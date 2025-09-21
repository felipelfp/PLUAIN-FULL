
class ProfileManager {
    constructor() {
        this.currentTab = 'info';
        this.profileData = {};
        this.init();
    }

    init() {
        this.loadProfile();
        this.setupEventListeners();
    }

    setupEventListeners() {
       
        const saveButtons = document.querySelectorAll('button[onclick="saveProfile()"]');
        saveButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                this.saveProfile();
            });
        });

       
        const settingsButtons = document.querySelectorAll('button[onclick="saveSettings()"]');
        settingsButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                this.saveSettings();
            });
        });

       
        const avatarBtn = document.querySelector('.avatar-edit-btn');
        if (avatarBtn) {
            avatarBtn.addEventListener('click', () => {
                this.changeAvatar();
            });
        }
    }

    loadProfile() {
        this.profileData = dataManager.getProfile();
        const currentUser = authManager.currentUser;

        if (currentUser) {
          
            this.updateFormField('userName', currentUser.name);
            this.updateFormField('userEmail', currentUser.email);
            if (currentUser.age) {
                this.updateFormField('userAge', currentUser.age);
            }
        }

        
        if (this.profileData.bio) {
            this.updateFormField('userBio', this.profileData.bio);
        }
        if (this.profileData.location) {
            this.updateFormField('userLocation', this.profileData.location);
        }

        
        this.loadEducation();
        this.loadCourses();
        
        
        this.loadAchievements();
        
        
        this.loadSettings();
    }

    updateFormField(fieldId, value) {
        const field = document.getElementById(fieldId);
        if (field && value !== undefined) {
            field.value = value;
        }
    }

    saveProfile() {
        const formData = {
            bio: document.getElementById('userBio')?.value || '',
            location: document.getElementById('userLocation')?.value || ''
        };

        
        if (authManager.currentUser) {
            const userName = document.getElementById('userName')?.value;
            const userAge = document.getElementById('userAge')?.value;

            if (userName) {
                authManager.currentUser.name = userName;
            }
            if (userAge) {
                authManager.currentUser.age = parseInt(userAge);
            }

        
            localStorage.setItem('pluainUser', JSON.stringify(authManager.currentUser));
            authManager.updateUserInterface();
        }

        
        dataManager.updateProfile(formData);
        this.profileData = dataManager.getProfile();

        this.showMessage('Perfil atualizado com sucesso!', 'success');
    }

    saveSettings() {
        const settings = {
            theme: document.getElementById('themeSelect')?.value || 'dark',
            emailNotifications: document.getElementById('emailNotifications')?.checked || false,
            pushNotifications: document.getElementById('pushNotifications')?.checked || false,
            achievementNotifications: document.getElementById('achievementNotifications')?.checked || false,
            profilePublic: document.getElementById('profilePublic')?.checked || false,
            showProgressPublic: document.getElementById('showProgressPublic')?.checked || false
        };

        
        if (settings.theme !== 'dark') {
            this.applyTheme(settings.theme);
        }

        
        dataManager.updateProfile({ settings });

        this.showMessage('Configurações salvas com sucesso!', 'success');
    }

    loadEducation() {
        const container = document.getElementById('educationList');
        if (!container) return;

        const education = this.profileData.education || [];

        if (education.length === 0) {
            container.innerHTML = `
                <div class="empty-section">
                    <i class="fas fa-graduation-cap" style="font-size: 2rem; opacity: 0.3; margin-bottom: 10px;"></i>
                    <p>Nenhuma formação adicionada ainda</p>
                </div>
            `;
            return;
        }

        container.innerHTML = education.map(edu => `
            <div class="education-item" data-id="${edu.id}">
                <div class="item-header">
                    <h4>${this.escapeHtml(edu.title)}</h4>
                    <button class="remove-btn" onclick="removeEducation('${edu.id}')">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <p><strong>${this.escapeHtml(edu.institution)}</strong></p>
                <p>${this.escapeHtml(edu.period)}</p>
                ${edu.description ? `<p>${this.escapeHtml(edu.description)}</p>` : ''}
            </div>
        `).join('');
    }

    loadCourses() {
        const container = document.getElementById('coursesList');
        if (!container) return;

        const courses = this.profileData.courses || [];

        if (courses.length === 0) {
            container.innerHTML = `
                <div class="empty-section">
                    <i class="fas fa-book" style="font-size: 2rem; opacity: 0.3; margin-bottom: 10px;"></i>
                    <p>Nenhum curso adicionado ainda</p>
                </div>
            `;
            return;
        }

        container.innerHTML = courses.map(course => `
            <div class="course-item" data-id="${course.id}">
                <div class="item-header">
                    <h4>${this.escapeHtml(course.title)}</h4>
                    <button class="remove-btn" onclick="removeCourse('${course.id}')">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <p><strong>${this.escapeHtml(course.provider)}</strong></p>
                <p>${course.status} - ${this.escapeHtml(course.duration)}</p>
                ${course.description ? `<p>${this.escapeHtml(course.description)}</p>` : ''}
            </div>
        `).join('');
    }

    loadAchievements() {
        const container = document.getElementById('profileAchievements');
        if (!container) return;

        const achievements = this.getAchievements();
        
        container.innerHTML = achievements.map(achievement => `
            <div class="achievement-badge ${achievement.unlocked ? 'unlocked' : 'locked'}">
                <div class="badge-icon">${achievement.icon}</div>
                <div class="badge-info">
                    <h4>${achievement.name}</h4>
                    <p>${achievement.description}</p>
                    ${achievement.unlocked ? 
                        `<span class="unlock-date">Conquistado em ${this.formatDate(achievement.unlockedAt)}</span>` :
                        `<span class="lock-info">Complete mais fases para desbloquear</span>`
                    }
                </div>
            </div>
        `).join('');
    }

    getAchievements() {
        const stats = dataManager.getStatistics();
        
        return [
            {
                id: 'first-step',
                name: 'Primeiro Passo',
                description: 'Completou sua primeira fase',
                icon: '👶',
                unlocked: stats.completedStages >= 1,
                unlockedAt: '2024-01-15'
            },
            {
                id: 'learner',
                name: 'Aprendiz',
                description: 'Completou 3 fases',
                icon: '📚',
                unlocked: stats.completedStages >= 3,
                unlockedAt: stats.completedStages >= 3 ? '2024-01-20' : null
            },
            {
                id: 'developer',
                name: 'Desenvolvedor',
                description: 'Completou 5 fases',
                icon: '💻',
                unlocked: stats.completedStages >= 5,
                unlockedAt: stats.completedStages >= 5 ? '2024-01-25' : null
            },
            {
                id: 'streak-master',
                name: 'Mestre da Consistência',
                description: 'Manteve sequência de 7 dias',
                icon: '🔥',
                unlocked: stats.streak >= 7,
                unlockedAt: stats.streak >= 7 ? '2024-01-22' : null
            },
            {
                id: 'note-taker',
                name: 'Anotador',
                description: 'Criou 10 anotações',
                icon: '📝',
                unlocked: stats.totalNotes >= 10,
                unlockedAt: stats.totalNotes >= 10 ? '2024-01-18' : null
            },
            {
                id: 'social',
                name: 'Social',
                description: 'Participou do chat 5 vezes',
                icon: '💬',
                unlocked: Math.random() > 0.5, 
                unlockedAt: '2024-01-19'
            },
            {
                id: 'feedback-giver',
                name: 'Colaborador',
                description: 'Enviou feedback ou sugestão',
                icon: '🤝',
                unlocked: stats.totalFeedback >= 1 || stats.totalSuggestions >= 1,
                unlockedAt: stats.totalFeedback >= 1 ? '2024-01-21' : null
            },
            {
                id: 'fullstack',
                name: 'Full Stack',
                description: 'Completou todas as fases',
                icon: '🏆',
                unlocked: stats.completedStages >= stats.totalStages,
                unlockedAt: null
            }
        ];
    }

    loadSettings() {
        const settings = this.profileData.settings || {};
        
        
        const themeSelect = document.getElementById('themeSelect');
        if (themeSelect && settings.theme) {
            themeSelect.value = settings.theme;
        }

        this.updateCheckbox('emailNotifications', settings.emailNotifications !== false);
        this.updateCheckbox('pushNotifications', settings.pushNotifications !== false);
        this.updateCheckbox('achievementNotifications', settings.achievementNotifications !== false);
        
        
        this.updateCheckbox('profilePublic', settings.profilePublic || false);
        this.updateCheckbox('showProgressPublic', settings.showProgressPublic || false);
    }

    updateCheckbox(id, checked) {
        const checkbox = document.getElementById(id);
        if (checkbox) {
            checkbox.checked = checked;
        }
    }

    addEducation() {
        const title = prompt('Título da formação (ex: Bacharelado em Ciência da Computação):');
        if (!title) return;

        const institution = prompt('Instituição:');
        if (!institution) return;

        const period = prompt('Período (ex: 2020-2024):');
        if (!period) return;

        const description = prompt('Descrição (opcional):') || '';

        const education = {
            title,
            institution,
            period,
            description
        };

        dataManager.addEducation(education);
        this.profileData = dataManager.getProfile();
        this.loadEducation();
        
        this.showMessage('Formação adicionada com sucesso!', 'success');
    }

    addCourse() {
        const title = prompt('Nome do curso:');
        if (!title) return;

        const provider = prompt('Provedor/Plataforma:');
        if (!provider) return;

        const duration = prompt('Duração (ex: 40 horas):');
        if (!duration) return;

        const status = prompt('Status (Concluído/Em andamento/Planejado):') || 'Em andamento';
        const description = prompt('Descrição (opcional):') || '';

        const course = {
            title,
            provider,
            duration,
            status,
            description
        };

        dataManager.addCourse(course);
        this.profileData = dataManager.getProfile();
        this.loadCourses();
        
        this.showMessage('Curso adicionado com sucesso!', 'success');
    }

    removeEducation(educationId) {
        if (!confirm('Remover esta formação?')) return;

        this.profileData.education = this.profileData.education.filter(edu => edu.id !== educationId);
        dataManager.updateProfile(this.profileData);
        this.loadEducation();
        
        this.showMessage('Formação removida.', 'success');
    }

    removeCourse(courseId) {
        if (!confirm('Remover este curso?')) return;

        this.profileData.courses = this.profileData.courses.filter(course => course.id !== courseId);
        dataManager.updateProfile(this.profileData);
        this.loadCourses();
        
        this.showMessage('Curso removido.', 'success');
    }

    changeAvatar() {
        const avatars = [
            
        ];

        const currentAvatar = authManager.currentUser?.avatar;
        const currentIndex = avatars.indexOf(currentAvatar);
        const nextIndex = (currentIndex + 1) % avatars.length;
        const newAvatar = avatars[nextIndex];

        if (authManager.currentUser) {
            authManager.currentUser.avatar = newAvatar;
            localStorage.setItem('pluainUser', JSON.stringify(authManager.currentUser));
            authManager.updateUserInterface();
        }

        this.showMessage('Avatar alterado!', 'success');
    }

    applyTheme(theme) {
        const root = document.documentElement;
        
        switch(theme) {
            case 'darker':
                root.style.setProperty('--primary-bg', '#000000');
                root.style.setProperty('--secondary-bg', '#111111');
                root.style.setProperty('--accent-bg', '#1a1a1a');
                break;
            case 'neon':
                root.style.setProperty('--primary-color', '#00ffff');
                root.style.setProperty('--secondary-color', '#ff00ff');
                root.style.setProperty('--accent-color', '#ffff00');
                break;
            default:
               
                root.style.removeProperty('--primary-bg');
                root.style.removeProperty('--secondary-bg');
                root.style.removeProperty('--accent-bg');
                root.style.removeProperty('--primary-color');
                root.style.removeProperty('--secondary-color');
                root.style.removeProperty('--accent-color');
                break;
        }
    }

  
    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    formatDate(dateString) {
        return new Date(dateString).toLocaleDateString('pt-BR');
    }

    showMessage(message, type) {
        
        const toast = document.createElement('div');
        toast.className = `profile-toast ${type}`;
        toast.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-triangle'}"></i>
            <span>${message}</span>
        `;

        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? 'var(--primary-color)' : 'var(--secondary-color)'};
            color: var(--primary-bg);
            padding: 15px 20px;
            border-radius: 10px;
            display: flex;
            align-items: center;
            gap: 10px;
            z-index: 10000;
            animation: slideInRight 0.3s ease;
            box-shadow: var(--shadow-dark);
        `;

        document.body.appendChild(toast);

        setTimeout(() => {
            toast.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
}


function saveProfile() {
    if (window.profileManager) {
        profileManager.saveProfile();
    }
}

function saveSettings() {
    if (window.profileManager) {
        profileManager.saveSettings();
    }
}

function addEducation() {
    if (window.profileManager) {
        profileManager.addEducation();
    }
}

function addCourse() {
    if (window.profileManager) {
        profileManager.addCourse();
    }
}

function removeEducation(educationId) {
    if (window.profileManager) {
        profileManager.removeEducation(educationId);
    }
}

function removeCourse(courseId) {
    if (window.profileManager) {
        profileManager.removeCourse(courseId);
    }
}

function changeAvatar() {
    if (window.profileManager) {
        profileManager.changeAvatar();
    }
}

let profileManager;
document.addEventListener('DOMContentLoaded', () => {
    profileManager = new ProfileManager();
});

const profileStyles = document.createElement('style');
profileStyles.textContent = `
    .empty-section {
        text-align: center;
        padding: 30px;
        color: var(--text-muted);
    }

    .item-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 10px;
    }

    .remove-btn {
        background: transparent;
        border: 1px solid var(--border-color);
        color: var(--text-muted);
        width: 30px;
        height: 30px;
        border-radius: 6px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.3s ease;
        flex-shrink: 0;
    }

    .remove-btn:hover {
        border-color: var(--secondary-color);
        color: var(--secondary-color);
        background: rgba(255, 0, 128, 0.1);
    }

    .achievement-badge {
        background: var(--accent-bg);
        border-radius: 12px;
        padding: 20px;
        display: flex;
        gap: 15px;
        transition: all 0.3s ease;
        border: 2px solid transparent;
    }

    .achievement-badge.unlocked {
        border-color: var(--primary-color);
        background: linear-gradient(135deg, var(--accent-bg), rgba(0, 255, 136, 0.1));
    }

    .achievement-badge.locked {
        opacity: 0.5;
        filter: grayscale(50%);
    }

    .badge-icon {
        font-size: 3rem;
        text-align: center;
        min-width: 60px;
    }

    .badge-info h4 {
        color: var(--text-primary);
        margin-bottom: 5px;
    }

    .badge-info p {
        color: var(--text-secondary);
        margin-bottom: 8px;
        line-height: 1.4;
    }

    .unlock-date {
        color: var(--primary-color);
        font-size: 0.8rem;
        font-weight: bold;
    }

    .lock-info {
        color: var(--text-muted);
        font-size: 0.8rem;
        font-style: italic;
    }

    .achievement-badge:hover.unlocked {
        transform: translateY(-3px);
        box-shadow: var(--shadow-neon);
    }
`;
document.head.appendChild(profileStyles);