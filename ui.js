
class UIManager {
    constructor() {
        this.currentSection = 'dashboard';
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupUserMenu();
        this.initializeSections();
    }

    setupEventListeners() {
      
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const section = e.currentTarget.dataset.section;
                this.showSection(section);
            });
        });

        document.querySelectorAll('.profile-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const targetTab = e.target.dataset.profileTab;
                this.switchProfileTab(targetTab);
            });
        });

  
        document.querySelectorAll('.eval-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const targetTab = e.target.dataset.evalTab;
                this.switchEvaluationTab(targetTab);
            });
        });


        document.querySelectorAll('.star-rating i').forEach((star, index) => {
            star.addEventListener('click', () => {
                this.setStarRating(index + 1);
            });
        });

    
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.selectSuggestionCategory(e.target);
            });
        });
    }

    setupUserMenu() {
        document.addEventListener('click', (e) => {
            const userMenu = document.getElementById('userMenu');
            const userAvatar = document.querySelector('.user-avatar');
            
            if (!userAvatar.contains(e.target)) {
                userMenu.classList.remove('show');
            }
        });
    }

    initializeSections() {
        
        this.showSection('dashboard');
        
        
        this.switchProfileTab('info');
        
        
        this.switchEvaluationTab('progress');
    }

    showSection(sectionName) {
        
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`[data-section="${sectionName}"]`).classList.add('active');

        
        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.remove('active');
        });
        document.getElementById(sectionName).classList.add('active');

        this.currentSection = sectionName;

        
        this.initializeSection(sectionName);
    }

    initializeSection(sectionName) {
        switch(sectionName) {
            case 'dashboard':
                this.updateDashboard();
                break;
            case 'learning':
                if (window.learningManager) {
                    learningManager.renderStages();
                }
                break;
            case 'notes':
                if (window.notesManager) {
                    notesManager.loadNotes();
                }
                break;
            case 'chat':
                if (window.chatManager) {
                    chatManager.loadChatHistory();
                }
                break;
            case 'evaluation':
                this.updateEvaluationSection();
                break;
            case 'profile':
                if (window.profileManager) {
                    profileManager.loadProfile();
                }
                break;
        }
    }

    updateDashboard() {
        const stats = dataManager.getStatistics();
        
        
        this.updateRecentActivity();
        
        
        this.updateRecentAchievements();

        
        document.getElementById('dashCompletedStages').textContent = stats.completedStages;
    }

    updateRecentActivity() {
        const activityContainer = document.getElementById('recentActivity');
        const activities = this.generateRecentActivities();
        
        activityContainer.innerHTML = activities.map(activity => `
            <div class="activity-item">
                <i class="${activity.icon}"></i>
                <span>${activity.text}</span>
                <time>${this.formatTimeAgo(activity.timestamp)}</time>
            </div>
        `).join('');
    }

    generateRecentActivities() {
        const activities = [];
        const now = new Date();

        
        activities.push({
            icon: 'fas fa-play-circle',
            text: 'Iniciou sessão de aprendizado',
            timestamp: new Date(now - 5 * 60000) 
        });

        activities.push({
            icon: 'fas fa-sticky-note',
            text: 'Criou nova anotação',
            timestamp: new Date(now - 30 * 60000) 
        });

        activities.push({
            icon: 'fas fa-trophy',
            text: 'Conquistou nova medalha',
            timestamp: new Date(now - 2 * 60 * 60000) 
        });

        return activities.slice(0, 5);
    }

    updateRecentAchievements() {
        const achievementsContainer = document.getElementById('recentAchievements');
        const achievements = this.getRecentAchievements();
        
        achievementsContainer.innerHTML = achievements.map(achievement => `
            <div class="achievement-item">
                <i class="${achievement.icon}"></i>
                <span>${achievement.name}</span>
            </div>
        `).join('');
    }

    getRecentAchievements() {
        return [
            { icon: 'fas fa-baby', name: 'Primeiro Passo' },
            { icon: 'fas fa-code', name: 'Desenvolvedor' },
            { icon: 'fas fa-fire', name: 'Sequência' }
        ];
    }

    switchProfileTab(tabName) {
     
        document.querySelectorAll('.profile-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`[data-profile-tab="${tabName}"]`).classList.add('active');

       
        document.querySelectorAll('.profile-tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`${tabName}Tab`).classList.add('active');
    }

    switchEvaluationTab(tabName) {
        
        document.querySelectorAll('.eval-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`[data-eval-tab="${tabName}"]`).classList.add('active');

      
        document.querySelectorAll('.eval-tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`${tabName}Tab`).classList.add('active');
    }

    updateEvaluationSection() {
        
        this.updateProgressRing();
        
       
        this.loadFeedbackHistory();
        
      
        this.loadCommunitySuggestions();
    }

    updateProgressRing() {
        const stats = dataManager.getStatistics();
        const completionPercentage = Math.round((stats.completedStages / stats.totalStages) * 100);
        
      
        const circle = document.querySelector('.progress-ring-circle');
        const circumference = 2 * Math.PI * 52; 
        const offset = circumference - (completionPercentage / 100) * circumference;
        
        circle.style.strokeDashoffset = offset;
        
        
        document.querySelector('.progress-text').textContent = `${completionPercentage}%`;
    }

    loadFeedbackHistory() {
        const feedbackContainer = document.getElementById('feedbackHistory');
        const feedbacks = dataManager.getFeedbackHistory();
        
        if (feedbacks.length === 0) {
            feedbackContainer.innerHTML = '<p class="empty-state">Nenhum feedback enviado ainda.</p>';
            return;
        }

        feedbackContainer.innerHTML = feedbacks.slice(-5).map(feedback => `
            <div class="feedback-item">
                <div class="feedback-rating">
                    ${'★'.repeat(feedback.rating)}${'☆'.repeat(5 - feedback.rating)}
                </div>
                <p>${feedback.text}</p>
                <small>${this.formatDate(feedback.createdAt)}</small>
            </div>
        `).join('');
    }

    loadCommunitySuggestions() {
        const suggestionsContainer = document.getElementById('communityIdeas');
        const suggestions = dataManager.getAllSuggestions();
        
        if (suggestions.length === 0) {
          
            return;
        }

        const suggestionHTML = suggestions.slice(0, 6).map(suggestion => `
            <div class="suggestion-card">
                <div class="suggestion-header">
                    <span class="suggestion-category ${suggestion.category}">${this.getCategoryLabel(suggestion.category)}</span>
                    <div class="suggestion-votes">
                        <button class="vote-btn" onclick="voteSuggestion('${suggestion.id}', 1)">
                            <i class="fas fa-arrow-up"></i>
                        </button>
                        <span>${suggestion.votes}</span>
                        <button class="vote-btn" onclick="voteSuggestion('${suggestion.id}', -1)">
                            <i class="fas fa-arrow-down"></i>
                        </button>
                    </div>
                </div>
                <h4>${suggestion.title}</h4>
                <p>${suggestion.content}</p>
                <div class="suggestion-meta">
                    <span>Por: Usuário${suggestion.id.slice(-3)}</span>
                    <span>${this.formatTimeAgo(suggestion.createdAt)}</span>
                </div>
            </div>
        `).join('');

        suggestionsContainer.innerHTML = suggestionHTML;
    }

    getCategoryLabel(category) {
        const labels = {
            feature: 'Feature',
            improvement: 'Melhoria',
            content: 'Conteúdo',
            bug: 'Bug'
        };
        return labels[category] || 'Geral';
    }

    setStarRating(rating) {
        document.querySelectorAll('.star-rating i').forEach((star, index) => {
            if (index < rating) {
                star.classList.add('active');
            } else {
                star.classList.remove('active');
            }
        });
        
        
        this.currentRating = rating;
    }

    selectSuggestionCategory(btn) {
        document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.currentSuggestionCategory = btn.dataset.category;
    }

    showAchievementPopup(achievementText) {
        const popup = document.getElementById('achievementPopup');
        const textElement = document.getElementById('achievementText');
        
        textElement.textContent = achievementText;
        popup.classList.add('show');
        
        setTimeout(() => {
            popup.classList.remove('show');
        }, 3000);
    }

    updateNotificationBadge(section, count) {
        const badge = document.querySelector(`[data-section="${section}"] .notification-badge`);
        if (badge) {
            badge.textContent = count;
            badge.style.display = count > 0 ? 'block' : 'none';
        }
    }

    formatTimeAgo(timestamp) {
        const now = new Date();
        const time = new Date(timestamp);
        const diffInMinutes = Math.floor((now - time) / (1000 * 60));
        
        if (diffInMinutes < 1) return 'agora';
        if (diffInMinutes < 60) return `${diffInMinutes}min atrás`;
        
        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) return `${diffInHours}h atrás`;
        
        const diffInDays = Math.floor(diffInHours / 24);
        if (diffInDays < 7) return `${diffInDays}d atrás`;
        
        return time.toLocaleDateString('pt-BR');
    }

    formatDate(timestamp) {
        return new Date(timestamp).toLocaleDateString('pt-BR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
}


function toggleUserMenu() {
    const userMenu = document.getElementById('userMenu');
    userMenu.classList.toggle('show');
}

function showProfile() {
    uiManager.showSection('profile');
    toggleUserMenu();
}

function showSettings() {
    uiManager.showSection('profile');
    uiManager.switchProfileTab('settings');
    toggleUserMenu();
}

function showSection(sectionName) {
    uiManager.showSection(sectionName);
}

function voteSuggestion(suggestionId, vote) {
    dataManager.voteSuggestion(suggestionId, vote);
    uiManager.loadCommunitySuggestions();
}


let uiManager;
document.addEventListener('DOMContentLoaded', () => {
    uiManager = new UIManager();
});