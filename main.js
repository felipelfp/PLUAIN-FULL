// Main application controller
class PluainFullApp {
    constructor() {
        this.version = '2.0.0';
        this.initialized = false;
        this.managers = {};
        this.init();
    }

    async init() {
        console.log(`🎮 Pluain Full v${this.version} - Inicializando...`);

        try {
            if (document.readyState === 'loading') {
                await new Promise(resolve => {
                    document.addEventListener('DOMContentLoaded', resolve);
                });
            }

            await this.initializeCoreManagers();
            
            this.setupGlobalEvents();
            
            this.setupKeyboardShortcuts();
            
            this.setupPerformanceMonitoring();
            
            // Mark as initialized
            this.initialized = true;
            
            console.log('🚀 Pluain Full inicializado com sucesso!');
            
            // Show welcome message for new users
            this.showWelcomeMessage();

        } catch (error) {
            console.error('❌ Erro ao inicializar Pluain Full:', error);
            this.showErrorMessage('Erro ao carregar a aplicação. Recarregue a página.');
        }
    }

    async initializeCoreManagers() {
        // Wait for all managers to be available
        const checkManagers = () => {
            return window.authManager && 
                   window.dataManager && 
                   window.uiManager &&
                   window.learningManager &&
                   window.chatManager &&
                   window.notesManager &&
                   window.evaluationManager &&
                   window.profileManager;
        };

        // Wait up to 10 seconds for managers to initialize
        let attempts = 0;
        while (!checkManagers() && attempts < 100) {
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }

        if (!checkManagers()) {
            throw new Error('Falha ao inicializar gerenciadores do sistema');
        }

        // Store manager references
        this.managers = {
            auth: window.authManager,
            data: window.dataManager,
            ui: window.uiManager,
            learning: window.learningManager,
            chat: window.chatManager,
            notes: window.notesManager,
            evaluation: window.evaluationManager,
            profile: window.profileManager
        };

        console.log('✅ Todos os gerenciadores inicializados');
    }

    setupGlobalEvents() {
        // Handle section changes
        this.setupSectionChangeEvents();
        
        // Handle window events
        window.addEventListener('beforeunload', this.handleBeforeUnload.bind(this));
        window.addEventListener('online', this.handleOnline.bind(this));
        window.addEventListener('offline', this.handleOffline.bind(this));
        
        // Handle visibility changes
        document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
        
        // Handle errors
        window.addEventListener('error', this.handleGlobalError.bind(this));
        window.addEventListener('unhandledrejection', this.handleUnhandledRejection.bind(this));
    }

    setupSectionChangeEvents() {
        // Create a custom event dispatcher for section changes
        const originalShowSection = window.uiManager.showSection;
        window.uiManager.showSection = (sectionName) => {
            const previousSection = window.uiManager.currentSection;
            originalShowSection.call(window.uiManager, sectionName);
            
            // Dispatch custom event
            document.dispatchEvent(new CustomEvent('sectionChanged', {
                detail: {
                    previous: previousSection,
                    current: sectionName,
                    timestamp: Date.now()
                }
            }));
        };

        // Listen for section changes
        document.addEventListener('sectionChanged', this.handleSectionChange.bind(this));
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Only handle shortcuts when not typing in inputs
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
                return;
            }

            // Ctrl/Cmd + shortcuts
            if (e.ctrlKey || e.metaKey) {
                switch(e.key) {
                    case '1':
                        e.preventDefault();
                        this.managers.ui.showSection('dashboard');
                        break;
                    case '2':
                        e.preventDefault();
                        this.managers.ui.showSection('learning');
                        break;
                    case '3':
                        e.preventDefault();
                        this.managers.ui.showSection('chat');
                        break;
                    case '4':
                        e.preventDefault();
                        this.managers.ui.showSection('notes');
                        break;
                    case '5':
                        e.preventDefault();
                        this.managers.ui.showSection('evaluation');
                        break;
                    case '6':
                        e.preventDefault();
                        this.managers.ui.showSection('profile');
                        break;
                    case 'n':
                        e.preventDefault();
                        if (this.managers.ui.currentSection === 'notes') {
                            this.managers.notes.createNewNote();
                        }
                        break;
                    case 's':
                        e.preventDefault();
                        if (this.managers.ui.currentSection === 'notes' && this.managers.notes.currentNote) {
                            this.managers.notes.saveCurrentNote();
                        }
                        break;
                }
            }

            // Escape key
            if (e.key === 'Escape') {
                // Close any open modals
                const modal = document.getElementById('stageModal');
                if (modal && modal.style.display === 'block') {
                    this.managers.learning.closeModal();
                }
                
                // Close user menu if open
                const userMenu = document.getElementById('userMenu');
                if (userMenu && userMenu.classList.contains('show')) {
                    userMenu.classList.remove('show');
                }
            }
        });
    }

    setupPerformanceMonitoring() {
        // Monitor memory usage
        if ('memory' in performance) {
            setInterval(() => {
                const memory = performance.memory;
                if (memory.usedJSHeapSize > 100 * 1024 * 1024) { // 100MB
                    console.warn('🔥 Alto uso de memória detectado:', 
                        Math.round(memory.usedJSHeapSize / 1024 / 1024) + 'MB');
                }
            }, 30000); // Check every 30 seconds
        }

        // Monitor long tasks
        if ('PerformanceObserver' in window) {
            try {
                const observer = new PerformanceObserver((list) => {
                    list.getEntries().forEach((entry) => {
                        if (entry.duration > 100) { // Tasks longer than 100ms
                            console.warn('⚠️ Tarefa longa detectada:', entry.duration + 'ms');
                        }
                    });
                });
                observer.observe({ entryTypes: ['longtask'] });
            } catch (e) {
                console.log('Long task monitoring não disponível');
            }
        }

        // Monitor network status
        this.updateNetworkStatus();
    }

    handleSectionChange(e) {
        const { previous, current } = e.detail;
        
        console.log(`📱 Seção alterada: ${previous} → ${current}`);
        
        // Track section visits
        this.trackSectionVisit(current);
        
        // Clear notifications for the current section
        if (current === 'chat') {
            this.managers.chat.clearNotifications();
        }
        
        // Update page title
        this.updatePageTitle(current);
        
        // Preload section data if needed
        this.preloadSectionData(current);
    }

    handleBeforeUnload(e) {
        // Auto-save current note if editing
        if (this.managers.notes.currentNote && this.managers.ui.currentSection === 'notes') {
            this.managers.notes.saveCurrentNote();
        }
        
        // Don't show confirmation dialog for now
        // e.preventDefault();
        // return (e.returnValue = 'Tem certeza que deseja sair?');
    }

    handleOnline() {
        console.log('🌐 Conexão restaurada');
        this.showMessage('Conexão com a internet restaurada!', 'success');
        this.syncOfflineData();
    }

    handleOffline() {
        console.log('📵 Conexão perdida');
        this.showMessage('Sem conexão com a internet. Funcionando offline.', 'warning');
    }

    handleVisibilityChange() {
        if (document.hidden) {
            console.log('🔍 Aplicação em segundo plano');
            this.pauseBackgroundTasks();
        } else {
            console.log('👁️ Aplicação em foco');
            this.resumeBackgroundTasks();
        }
    }

    handleGlobalError(e) {
        console.error('❌ Erro global:', e.error);
        this.showErrorMessage('Ocorreu um erro inesperado. A página será recarregada.');
        
        // Auto-reload after 3 seconds
        setTimeout(() => {
            location.reload();
        }, 3000);
    }

    handleUnhandledRejection(e) {
        console.error('❌ Promise rejeitada:', e.reason);
        // Don't reload for promise rejections, just log them
    }

    trackSectionVisit(section) {
        
        const visits = JSON.parse(localStorage.getItem('sectionVisits') || '{}');
        visits[section] = (visits[section] || 0) + 1;
        visits.lastVisit = Date.now();
        localStorage.setItem('sectionVisits', JSON.stringify(visits));
    }

    updatePageTitle(section) {
        const titles = {
            dashboard: 'Dashboard - Pluain Full',
            learning: 'Aprendizado - Pluain Full',
            chat: 'Chat - Pluain Full',
            notes: 'Anotações - Pluain Full',
            evaluation: 'Avaliações - Pluain Full',
            profile: 'Perfil - Pluain Full'
        };
        
        document.title = titles[section] || 'Pluain Full';
    }

    preloadSectionData(section) {
        switch(section) {
            case 'chat':
                break;
            case 'evaluation':
                this.managers.evaluation.updateProgressStatistics();
                break;
        }
    }

    updateNetworkStatus() {
        const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
        
        if (connection) {
            console.log(`📡 Conexão: ${connection.effectiveType} (${connection.downlink}Mbps)`);
            
            if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
                console.warn('🐌 Conexão lenta detectada');
            }
        }
    }

    pauseBackgroundTasks() {
        
    }

    resumeBackgroundTasks() {
        
        if (this.managers.ui.currentSection === 'chat') {
            
        }
    }

    syncOfflineData() {
        console.log('🔄 Sincronizando dados offline...');
    }

    showWelcomeMessage() {
        const isNewUser = !localStorage.getItem('hasVisited');
        
        if (isNewUser) {
            localStorage.setItem('hasVisited', 'true');
            
            setTimeout(() => {
                this.showMessage(
                    'Bem-vindo ao Pluain Full! 🎮 Sua jornada de aprendizado começa agora!', 
                    'welcome'
                );
            }, 2000);
        }
    }

    showMessage(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `app-toast ${type}`;
        
        const icons = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            warning: 'fa-exclamation-triangle',
            info: 'fa-info-circle',
            welcome: 'fa-star'
        };

        const colors = {
            success: 'var(--primary-color)',
            error: 'var(--secondary-color)',
            warning: '#ffa500',
            info: 'var(--accent-color)',
            welcome: 'linear-gradient(45deg, var(--primary-color), var(--accent-color))'
        };

        toast.innerHTML = `
            <i class="fas ${icons[type]}"></i>
            <span>${message}</span>
        `;

        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'welcome' ? colors[type] : colors[type]};
            color: ${type === 'warning' ? 'var(--primary-bg)' : type === 'welcome' ? 'var(--primary-bg)' : 'var(--primary-bg)'};
            padding: 15px 20px;
            border-radius: 12px;
            display: flex;
            align-items: center;
            gap: 10px;
            z-index: 10001;
            animation: slideInRight 0.3s ease;
            box-shadow: var(--shadow-dark);
            max-width: 400px;
            font-weight: 600;
        `;

        if (type !== 'welcome') {
            toast.style.background = colors[type];
        }

        document.body.appendChild(toast);

        const duration = type === 'welcome' ? 5000 : type === 'error' ? 7000 : 4000;
        
        setTimeout(() => {
            toast.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, duration);
    }

    showErrorMessage(message) {
        this.showMessage(message, 'error');
    }

    getVersion() {
        return this.version;
    }

    isInitialized() {
        return this.initialized;
    }

    getManager(name) {
        return this.managers[name];
    }

    enableDebugMode() {
        window.pluainDebug = {
            app: this,
            managers: this.managers,
            clearData: () => {
                if (confirm('Limpar todos os dados? Esta ação não pode ser desfeita.')) {
                    localStorage.clear();
                    location.reload();
                }
            },
            exportData: () => {
                const data = {
                    user: JSON.parse(localStorage.getItem('pluainUser') || '{}'),
                    data: JSON.parse(localStorage.getItem('pluainData') || '{}'),
                    version: this.version,
                    timestamp: new Date().toISOString()
                };
                
                const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `pluain-backup-${Date.now()}.json`;
                a.click();
                URL.revokeObjectURL(url);
            }
        };
        
        console.log('🔧 Debug mode enabled. Use window.pluainDebug for developer tools.');
    }
}

const pluainApp = new PluainFullApp();

if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    pluainApp.enableDebugMode();
}

window.PluainFullApp = pluainApp;

const mainStyles = document.createElement('style');
mainStyles.textContent = `
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }

    .app-toast {
        font-family: 'Exo 2', sans-serif;
        cursor: pointer;
    }

    .app-toast:hover {
        transform: translateX(-5px);
    }

    /* Loading spinner for slow connections */
    .loading-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: var(--primary-bg);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
        opacity: 0;
        visibility: hidden;
        transition: all 0.3s ease;
    }

    .loading-overlay.show {
        opacity: 1;
        visibility: visible;
    }

    .loading-spinner {
        width: 60px;
        height: 60px;
        border: 4px solid var(--accent-bg);
        border-top: 4px solid var(--primary-color);
        border-radius: 50%;
        animation: spin 1s linear infinite;
    }

    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }

    /* Keyboard shortcut hints */
    .shortcut-hint {
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: var(--glass-bg);
        backdrop-filter: blur(10px);
        padding: 10px 20px;
        border-radius: 20px;
        border: 1px solid var(--border-color);
        color: var(--text-secondary);
        font-size: 0.8rem;
        opacity: 0;
        transition: opacity 0.3s ease;
        z-index: 1000;
        pointer-events: none;
    }

    .shortcut-hint.show {
        opacity: 1;
    }
`;
document.head.appendChild(mainStyles);

console.log('🎮 Pluain Full - Sistema inicializado');