class EvaluationManager {
    constructor() {
        this.currentRating = 0;
        this.currentSuggestionCategory = 'feature';
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadInitialData();
    }

    setupEventListeners() {
        document.querySelectorAll('.star-rating i').forEach((star, index) => {
            star.addEventListener('click', () => {
                this.setRating(index + 1);
            });
            
            star.addEventListener('mouseenter', () => {
                this.highlightStars(index + 1);
            });
        });

        document.querySelector('.star-rating')?.addEventListener('mouseleave', () => {
            this.highlightStars(this.currentRating);
        });

        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.selectCategory(e.target.dataset.category);
            });
        });
    }

    loadInitialData() {
        this.updateProgressStatistics();
        
        this.loadFeedbackHistory();
        
        this.loadCommunitySuggestions();
    }

    updateProgressStatistics() {
        const stats = dataManager.getStatistics();
        
        const skillBars = [
            { name: 'HTML/CSS', progress: this.calculateSkillProgress('html-css') },
            { name: 'JavaScript', progress: this.calculateSkillProgress('javascript') },
            { name: 'React', progress: this.calculateSkillProgress('react') },
            { name: 'Node.js', progress: this.calculateSkillProgress('nodejs') }
        ];

        const skillsContainer = document.querySelector('.skills-progress');
        if (skillsContainer) {
            skillsContainer.innerHTML = skillBars.map(skill => `
                <div class="skill-bar">
                    <label>${skill.name}</label>
                    <div class="bar">
                        <div class="fill" style="width: ${skill.progress}%"></div>
                    </div>
                    <span class="skill-percentage">${skill.progress}%</span>
                </div>
            `).join('');
        }

        this.updateTimeStatistics();
        
        this.updateCircularProgress();
    }

    calculateSkillProgress(skillType) {
        const stages = dataManager.getAllStages();
        const completedStages = dataManager.data.userProgress.completedStages;
        
        const relevantStages = Object.values(stages).filter(stage => {
            const title = stage.title.toLowerCase();
            switch(skillType) {
                case 'html-css':
                    return title.includes('html') || title.includes('css');
                case 'javascript':
                    return title.includes('javascript');
                case 'react':
                    return title.includes('react');
                case 'nodejs':
                    return title.includes('node');
                default:
                    return false;
            }
        });

        if (relevantStages.length === 0) return Math.floor(Math.random() * 80) + 20;

        const completedRelevant = relevantStages.filter(stage => 
            completedStages.includes(stage.id)
        );

        return Math.floor((completedRelevant.length / relevantStages.length) * 100);
    }

    updateTimeStatistics() {
        const timeStats = {
            today: this.generateRandomTime(1, 5),
            thisWeek: this.generateRandomTime(8, 25),
            total: this.generateRandomTime(30, 100)
        };

        const timeElements = {
            today: document.querySelector('.time-item:nth-child(2) .time-value'),
            thisWeek: document.querySelector('.time-item:nth-child(3) .time-value'),
            total: document.querySelector('.time-item:nth-child(1) .time-value')
        };

        if (timeElements.total) timeElements.total.textContent = `${timeStats.total}h`;
        if (timeElements.today) timeElements.today.textContent = `${timeStats.today}h`;
        if (timeElements.thisWeek) timeElements.thisWeek.textContent = `${timeStats.thisWeek}h`;
    }

    generateRandomTime(min, max) {
        return (Math.random() * (max - min) + min).toFixed(1);
    }

    updateCircularProgress() {
        const stats = dataManager.getStatistics();
        const completionPercentage = Math.floor((stats.completedStages / stats.totalStages) * 100);
        
        const circle = document.querySelector('.progress-ring-circle');
        const progressText = document.querySelector('.progress-text');
        
        if (circle && progressText) {
            const circumference = 2 * Math.PI * 52;
            const offset = circumference - (completionPercentage / 100) * circumference;
            
            circle.style.strokeDashoffset = offset;
            progressText.textContent = `${completionPercentage}%`;
        }
    }

    setRating(rating) {
        this.currentRating = rating;
        this.highlightStars(rating);
    }

    highlightStars(rating) {
        document.querySelectorAll('.star-rating i').forEach((star, index) => {
            if (index < rating) {
                star.classList.add('active');
            } else {
                star.classList.remove('active');
            }
        });
    }

    selectCategory(category) {
        this.currentSuggestionCategory = category;
        
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        document.querySelector(`[data-category="${category}"]`)?.classList.add('active');
    }

    submitFeedback() {
        const feedbackText = document.getElementById('feedbackText')?.value?.trim();
        
        if (!this.currentRating || !feedbackText) {
            this.showMessage('Por favor, avalie com estrelas e escreva seu feedback.', 'error');
            return;
        }

        const feedback = {
            rating: this.currentRating,
            text: feedbackText,
            platform: 'web'
        };

        const success = dataManager.addFeedback(feedback);
        
        if (success) {
            document.getElementById('feedbackText').value = '';
            this.setRating(0);
            
            this.loadFeedbackHistory();
            
            this.showMessage('Feedback enviado com sucesso! Obrigado!', 'success');
        } else {
            this.showMessage('Erro ao enviar feedback. Tente novamente.', 'error');
        }
    }

    submitSuggestion() {
        const titleInput = document.getElementById('suggestionTitle');
        const contentInput = document.getElementById('suggestionContent');
        
        const title = titleInput?.value?.trim();
        const content = contentInput?.value?.trim();
        
        if (!title || !content) {
            this.showMessage('Por favor, preencha o título e a descrição da sugestão.', 'error');
            return;
        }

        const suggestion = {
            title: title,
            content: content,
            category: this.currentSuggestionCategory
        };

        const success = dataManager.addSuggestion(suggestion);
        
        if (success) {
            titleInput.value = '';
            contentInput.value = '';
            
            this.loadCommunitySuggestions();
            
            this.showMessage('Sugestão enviada com sucesso!', 'success');
        } else {
            this.showMessage('Erro ao enviar sugestão. Tente novamente.', 'error');
        }
    }

    loadFeedbackHistory() {
        const container = document.getElementById('feedbackHistory');
        if (!container) return;

        const feedbacks = dataManager.getFeedbackHistory();
        
        if (feedbacks.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-comment-alt" style="font-size: 2rem; opacity: 0.3; margin-bottom: 10px;"></i>
                    <p>Nenhum feedback enviado ainda</p>
                </div>
            `;
            return;
        }

        container.innerHTML = feedbacks.slice(-5).reverse().map(feedback => `
            <div class="feedback-item">
                <div class="feedback-header">
                    <div class="feedback-rating">
                        ${'★'.repeat(feedback.rating)}${'☆'.repeat(5 - feedback.rating)}
                    </div>
                    <span class="feedback-date">${this.formatDate(feedback.createdAt)}</span>
                </div>
                <p class="feedback-text">${this.escapeHtml(feedback.text)}</p>
            </div>
        `).join('');
    }

    loadCommunitySuggestions() {
        const container = document.getElementById('communityIdeas');
        if (!container) return;

        let suggestions = dataManager.getAllSuggestions();
        
        if (suggestions.length === 0) {
            this.addSampleSuggestions();
            suggestions = dataManager.getAllSuggestions();
        }

        suggestions.sort((a, b) => (b.votes || 0) - (a.votes || 0));

        container.innerHTML = suggestions.slice(0, 6).map(suggestion => `
            <div class="suggestion-card">
                <div class="suggestion-header">
                    <span class="suggestion-category ${suggestion.category}">
                        ${this.getCategoryLabel(suggestion.category)}
                    </span>
                    <div class="suggestion-votes">
                        <button class="vote-btn vote-up" onclick="voteSuggestion('${suggestion.id}', 1)">
                            <i class="fas fa-arrow-up"></i>
                        </button>
                        <span class="vote-count">${suggestion.votes || 0}</span>
                        <button class="vote-btn vote-down" onclick="voteSuggestion('${suggestion.id}', -1)">
                            <i class="fas fa-arrow-down"></i>
                        </button>
                    </div>
                </div>
                <h4>${this.escapeHtml(suggestion.title)}</h4>
                <p>${this.escapeHtml(this.truncateText(suggestion.content, 120))}</p>
                <div class="suggestion-meta">
                    <span>Por: User${suggestion.id.slice(-3)}</span>
                    <span>${this.formatTimeAgo(suggestion.createdAt)}</span>
                </div>
            </div>
        `).join('');
    }

    addSampleSuggestions() {
        const samples = [
            {
                title: 'Sistema de Mentoria',
                content: 'Seria interessante ter um sistema onde desenvolvedores experientes pudessem mentorar iniciantes através de videochamadas ou chat privado.',
                category: 'feature',
                votes: 15
            },
            {
                title: 'Modo Escuro Aprimorado',
                content: 'Melhorar o tema escuro com mais opções de personalização e diferentes tons de cores.',
                category: 'improvement',
                votes: 12
            },
            {
                title: 'Certificados de Conclusão',
                content: 'Adicionar certificados digitais que podem ser compartilhados no LinkedIn quando completar todas as fases.',
                category: 'feature',
                votes: 8
            },
            {
                title: 'Mais Conteúdo sobre TypeScript',
                content: 'Incluir uma trilha específica para TypeScript com exercícios práticos e projetos reais.',
                category: 'content',
                votes: 6
            }
        ];

        samples.forEach(sample => {
            dataManager.addSuggestion(sample);
        });
    }

    getCategoryLabel(category) {
        const labels = {
            feature: 'Feature',
            improvement: 'Melhoria',
            content: 'Conteúdo',
            bug: 'Bug Report'
        };
        return labels[category] || 'Geral';
    }

    formatDate(dateString) {
        return new Date(dateString).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    formatTimeAgo(dateString) {
        const now = new Date();
        const date = new Date(dateString);
        const diffInMinutes = Math.floor((now - date) / (1000 * 60));

        if (diffInMinutes < 1) return 'agora';
        if (diffInMinutes < 60) return `${diffInMinutes}min atrás`;
        
        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) return `${diffInHours}h atrás`;
        
        const diffInDays = Math.floor(diffInHours / 24);
        if (diffInDays < 7) return `${diffInDays}d atrás`;
        
        return date.toLocaleDateString('pt-BR');
    }

    truncateText(text, maxLength) {
        return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    showMessage(message, type) {
        const toast = document.createElement('div');
        toast.className = `evaluation-toast ${type}`;
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
            max-width: 350px;
        `;

        document.body.appendChild(toast);

        setTimeout(() => {
            toast.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, 4000);
    }
}

function submitFeedback() {
    if (window.evaluationManager) {
        evaluationManager.submitFeedback();
    }
}

function submitSuggestion() {
    if (window.evaluationManager) {
        evaluationManager.submitSuggestion();
    }
}

function voteSuggestion(suggestionId, vote) {
    dataManager.voteSuggestion(suggestionId, vote);
    if (window.evaluationManager) {
        evaluationManager.loadCommunitySuggestions();
    }
}

let evaluationManager;
document.addEventListener('DOMContentLoaded', () => {
    evaluationManager = new EvaluationManager();
});

const evaluationStyles = document.createElement('style');
evaluationStyles.textContent = `
    .empty-state {
        text-align: center;
        padding: 30px;
        color: var(--text-muted);
    }

    .feedback-item {
        background: var(--accent-bg);
        padding: 15px;
        border-radius: 10px;
        margin-bottom: 15px;
        border-left: 4px solid var(--primary-color);
    }

    .feedback-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 10px;
    }

    .feedback-rating {
        color: var(--accent-color);
        font-size: 1.1rem;
    }

    .feedback-date {
        color: var(--text-muted);
        font-size: 0.8rem;
    }

    .feedback-text {
        color: var(--text-secondary);
        line-height: 1.5;
    }

    .skill-bar {
        position: relative;
    }

    .skill-percentage {
        position: absolute;
        right: 10px;
        top: 0;
        font-size: 0.8rem;
        color: var(--text-muted);
    }

    .vote-btn {
        background: transparent;
        border: 1px solid var(--border-color);
        color: var(--text-secondary);
        width: 30px;
        height: 30px;
        border-radius: 6px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.3s ease;
    }

    .vote-btn:hover {
        border-color: var(--primary-color);
        color: var(--primary-color);
    }

    .vote-btn.vote-up:hover {
        background: rgba(0, 255, 136, 0.1);
    }

    .vote-btn.vote-down:hover {
        background: rgba(255, 0, 128, 0.1);
        border-color: var(--secondary-color);
        color: var(--secondary-color);
    }

    .vote-count {
        font-weight: bold;
        color: var(--text-primary);
        min-width: 25px;
        text-align: center;
    }

    .suggestion-category {
        padding: 4px 10px;
        border-radius: 12px;
        font-size: 0.75rem;
        font-weight: bold;
        text-transform: uppercase;
    }

    .suggestion-category.feature {
        background: var(--primary-color);
        color: var(--primary-bg);
    }

    .suggestion-category.improvement {
        background: var(--accent-color);
        color: var(--primary-bg);
    }

    .suggestion-category.content {
        background: var(--secondary-color);
        color: white;
    }

    .suggestion-category.bug {
        background: #ff6b6b;
        color: white;
    }

    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(evaluationStyles);