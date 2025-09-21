class ChatManager 
{
    constructor() {
        this.messages = [];
        this.currentUser = null;
        this.onlineUsers = 1;
        this.typingTimeout = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadChatHistory();
        this.simulateOnlineUsers();
        this.startMessageSimulation();
    }

    setupEventListeners() {
        const messageInput = document.getElementById('messageInput');
        const sendButton = document.getElementById('sendButton');

        if (messageInput) {
            messageInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.sendMessage();
                }
            });

            messageInput.addEventListener('input', () => {
                this.handleTyping();
            });
        }

        if (sendButton) {
            sendButton.addEventListener('click', () => {
                this.sendMessage();
            });
        }
    }

    loadChatHistory() {
        const chatMessages = document.getElementById('chatMessages');
        if (!chatMessages) return;

        this.messages = dataManager.getChatHistory();
        
        if (this.messages.length === 0) {
            this.addInitialMessages();
        }

        this.renderMessages();
        this.scrollToBottom();
    }

    addInitialMessages() {
        const initialMessages = [
            {
                id: 'system-1',
                type: 'system',
                content: 'Bem-vindo ao chat! Seja respeitoso e ajude outros desenvolvedores.',
                timestamp: new Date(Date.now() - 3600000).toISOString()
            },
            {
                id: 'user-1',
                type: 'other',
                user: 'DevMaster',
                content: 'Pessoal, alguém sabe uma boa fonte para aprender React Hooks?',
                timestamp: new Date(Date.now() - 1800000).toISOString()
            },
            {
                id: 'user-2',
                type: 'other',
                user: 'CodeNinja',
                content: 'Recomendo a documentação oficial do React, é muito bem explicada!',
                timestamp: new Date(Date.now() - 1200000).toISOString()
            },
            {
                id: 'user-3',
                type: 'other',
                user: 'WebDev2024',
                content: 'Acabei de completar a fase de JavaScript Avançado! 🎉',
                timestamp: new Date(Date.now() - 600000).toISOString()
            }
        ];

        initialMessages.forEach(msg => {
            dataManager.addChatMessage(msg);
        });

        this.messages = dataManager.getChatHistory();
    }

    renderMessages() {
        const chatMessages = document.getElementById('chatMessages');
        if (!chatMessages) return;

        const systemMessage = chatMessages.querySelector('.system-message');
        chatMessages.innerHTML = '';
        if (systemMessage) {
            chatMessages.appendChild(systemMessage);
        }

        this.messages.forEach(message => {
            const messageElement = this.createMessageElement(message);
            chatMessages.appendChild(messageElement);
        });
    }

    createMessageElement(message) {
        const messageDiv = document.createElement('div');
        
        if (message.type === 'system') {
            messageDiv.className = 'system-message';
            messageDiv.innerHTML = `
                <i class="fas fa-info-circle"></i>
                ${message.content}
            `;
        } else {
            const isOwn = message.type === 'own';
            messageDiv.className = `chat-message ${message.type}`;
            
            messageDiv.innerHTML = `
                ${!isOwn ? `
                    <div class="message-header">
                        <span class="message-user">${message.user}</span>
                        <span class="message-time">${this.formatMessageTime(message.timestamp)}</span>
                    </div>
                ` : ''}
                <div class="message-content">${this.escapeHtml(message.content)}</div>
                ${isOwn ? `
                    <div class="message-time-own">${this.formatMessageTime(message.timestamp)}</div>
                ` : ''}
            `;
        }

        return messageDiv;
    }

    sendMessage() {
        const messageInput = document.getElementById('messageInput');
        const content = messageInput.value.trim();
        
        if (!content) return;

        const currentUser = authManager.currentUser;
        if (!currentUser) return;

        const message = {
            type: 'own',
            user: currentUser.name,
            content: content
        };

        dataManager.addChatMessage(message);
        
        this.messages = dataManager.getChatHistory();
        
        messageInput.value = '';
        
        this.renderMessages();
        this.scrollToBottom();

        if (Math.random() < 0.3) {
            setTimeout(() => {
                this.simulateResponse(content);
            }, 2000 + Math.random() * 3000);
        }
    }

    simulateResponse(originalMessage) {
        const responses = [
            'Interessante! Pode me contar mais sobre isso?',
            'Boa pergunta! Também estou aprendendo sobre isso.',
            'Parabéns pelo progresso! Continue assim! 🎉',
            'Isso me lembra de quando eu estava aprendendo... É normal ter dúvidas.',
            'Ótima observação! Já tentou aplicar na prática?',
            'Legal! Compartilha depois como foi a experiência.',
            'Verdade! Esse conceito é bem importante.',
            'Excelente! Você está no caminho certo.',
        ];

        const botUsers = ['DevMentor', 'CodeHelper', 'WebWizard', 'TechGuru', 'StackMaster'];
        const randomUser = botUsers[Math.floor(Math.random() * botUsers.length)];
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];

        const message = {
            type: 'other',
            user: randomUser,
            content: randomResponse
        };

        dataManager.addChatMessage(message);
        this.messages = dataManager.getChatHistory();
        this.renderMessages();
        this.scrollToBottom();

        if (uiManager.currentSection !== 'chat') {
            const currentNotifications = parseInt(document.getElementById('chatNotifications').textContent) || 0;
            uiManager.updateNotificationBadge('chat', currentNotifications + 1);
        }
    }

    handleTyping() {
        const typingIndicator = document.getElementById('typingIndicator');
        
        if (this.typingTimeout) {
            clearTimeout(this.typingTimeout);
        }

        if (typingIndicator) {
            typingIndicator.style.display = 'block';
            typingIndicator.textContent = 'Você está digitando...';
        }

        this.typingTimeout = setTimeout(() => {
            if (typingIndicator) {
                typingIndicator.style.display = 'none';
            }
        }, 2000);
    }

    simulateOnlineUsers() {
        setInterval(() => {
            this.onlineUsers = Math.floor(Math.random() * 15) + 1;
            const onlineCountElement = document.getElementById('onlineCount');
            if (onlineCountElement) {
                onlineCountElement.textContent = this.onlineUsers;
            }
        }, 30000); 
    }

    startMessageSimulation() {
        setInterval(() => {
            if (Math.random() < 0.1) { 
                this.addRandomMessage();
            }
        }, 60000); 
    }

    addRandomMessage() {
        const users = ['StudyBuddy', 'CodeNewbie', 'FullStackFan', 'ReactLover', 'JSExplorer'];
        const messages = [
            'Alguém pode me ajudar com CSS Grid?',
            'Acabei de terminar meu primeiro projeto React! 🚀',
            'Qual editor de código vocês recomendam?',
            'Estou com dificuldade em async/await, alguém tem dicas?',
            'Compartilhando: ótimo tutorial sobre Node.js que encontrei',
            'Boa noite pessoal, continuando os estudos! 📚',
            'Quem mais está fazendo a trilha de JavaScript?',
            'Dica: sempre testem o código no mobile também!',
        ];

        const randomUser = users[Math.floor(Math.random() * users.length)];
        const randomContent = messages[Math.floor(Math.random() * messages.length)];

        const message = {
            type: 'other',
            user: randomUser,
            content: randomContent
        };

        dataManager.addChatMessage(message);
        this.messages = dataManager.getChatHistory();

        if (uiManager.currentSection !== 'chat') {
            const currentNotifications = parseInt(document.getElementById('chatNotifications').textContent) || 0;
            uiManager.updateNotificationBadge('chat', currentNotifications + 1);
        } else {
            this.renderMessages();
            this.scrollToBottom();
        }
    }

    clearChat() {
        dataManager.clearChatHistory();
        this.messages = [];
        this.addInitialMessages();
        this.renderMessages();
    }

    scrollToBottom() {
        const chatMessages = document.getElementById('chatMessages');
        if (chatMessages) {
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }
    }

    formatMessageTime(timestamp) {
        const date = new Date(timestamp);
        return date.toLocaleTimeString('pt-BR', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    clearNotifications() {
        uiManager.updateNotificationBadge('chat', 0);
    }
}

function sendMessage() {
    if (window.chatManager) {
        chatManager.sendMessage();
    }
}

function clearChat() {
    if (window.chatManager && confirm('Tem certeza que deseja limpar o chat?')) {
        chatManager.clearChat();
    }
}

let chatManager;
document.addEventListener('DOMContentLoaded', () => {
    chatManager = new ChatManager();
    
    document.addEventListener('sectionChanged', (e) => {
        if (e.detail.section === 'chat' && chatManager) {
            chatManager.clearNotifications();
        }
    });
});

const chatStyles = document.createElement('style');
chatStyles.textContent = `
    .message-header {
        font-size: 0.8rem;
        margin-bottom: 5px;
        opacity: 0.8;
    }

    .message-user {
        font-weight: bold;
        color: var(--primary-color);
    }

    .message-time {
        color: var(--text-muted);
        margin-left: 10px;
    }

    .message-time-own {
        font-size: 0.7rem;
        color: var(--text-muted);
        text-align: right;
        margin-top: 5px;
        opacity: 0.8;
    }

    .message-content {
        word-wrap: break-word;
        white-space: pre-wrap;
    }

    .typing-indicator {
        padding: 10px 0;
        color: var(--text-muted);
        font-style: italic;
        animation: typingBlink 1.5s infinite;
    }

    @keyframes typingBlink {
        0%, 50% { opacity: 1; }
        51%, 100% { opacity: 0.5; }
    }

    .chat-messages::-webkit-scrollbar {
        width: 6px;
    }

    .chat-messages::-webkit-scrollbar-track {
        background: var(--accent-bg);
        border-radius: 3px;
    }

    .chat-messages::-webkit-scrollbar-thumb {
        background: var(--border-color);
        border-radius: 3px;
    }

    .chat-messages::-webkit-scrollbar-thumb:hover {
        background: var(--text-muted);
    }
`;
document.head.appendChild(chatStyles);