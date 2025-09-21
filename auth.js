
class AuthManager {
    constructor() {
        this.currentUser = null;
        this.isLoggedIn = false;
        this.init();
    }

    init() {
       
        const storedUser = localStorage.getItem('pluainUser');
        if (storedUser) {
            this.currentUser = JSON.parse(storedUser);
            this.isLoggedIn = true;
            this.showApp();
        } else {
            this.showLogin();
        }

        this.setupEventListeners();
    }

    setupEventListeners() {
     
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const targetTab = e.target.dataset.tab;
                this.switchTab(targetTab);
            });
        });

      
        document.getElementById('loginForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin(e.target);
        });

        document.getElementById('registerForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleRegister(e.target);
        });
    }

    switchTab(tabName) {
      
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

     
        document.querySelectorAll('.login-form').forEach(form => {
            form.classList.remove('active');
        });
        document.getElementById(`${tabName}Form`).classList.add('active');
    }

    async handleLogin(form) {
        const formData = new FormData(form);
        const email = form.querySelector('input[type="email"]').value;
        const password = form.querySelector('input[type="password"]').value;

        
        await this.simulateApiCall();

        
        if (email && password) {
            this.createUserSession({
                id: Date.now(),
                name: email.split('@')[0],
                email: email,
                avatar: './WhatsApp Image 2025-09-19 at 22.05.42.jpeg Image 2025-09-19 at 22.05.42.jpeg',
                level: 1,
                xp: 0,
                coins: 100,
                streak: 0,
                joinDate: new Date().toISOString()
            });

            this.showSuccessMessage('Login realizado com sucesso!');
            setTimeout(() => this.showApp(), 1500);
        } else {
            this.showErrorMessage('Por favor, preencha todos os campos.');
        }
    }

    async handleRegister(form) {
        const name = form.querySelector('input[type="text"]').value;
        const email = form.querySelector('input[type="email"]').value;
        const age = form.querySelector('input[type="number"]').value;
        const password = form.querySelector('input[type="password"]').value;

   
        await this.simulateApiCall();

        if (name && email && age && password) {
            this.createUserSession({
                id: Date.now(),
                name: name,
                email: email,
                age: parseInt(age),
                avatar: './WhatsApp Image 2025-09-19 at 22.05.42.jpeg Image 2025-09-19 at 22.05.42.jpeg',
                level: 1,
                xp: 0,
                coins: 100,
                streak: 0,
                joinDate: new Date().toISOString()
            });

            this.showSuccessMessage('Conta criada com sucesso!');
            setTimeout(() => this.showApp(), 1500);
        } else {
            this.showErrorMessage('Por favor, preencha todos os campos.');
        }
    }

    createUserSession(userData) {
        this.currentUser = userData;
        this.isLoggedIn = true;
        localStorage.setItem('pluainUser', JSON.stringify(userData));
    }

    showLogin() {
        document.getElementById('loginScreen').style.display = 'flex';
        document.getElementById('appContainer').style.display = 'none';
    }

    showApp() {
        document.getElementById('loginScreen').style.display = 'none';
        document.getElementById('appContainer').style.display = 'grid';
        
        
        this.updateUserInterface();
    }

    updateUserInterface() {
        if (!this.currentUser) return;

      
        document.getElementById('welcomeUserName').textContent = this.currentUser.name;
        document.getElementById('profileUserName').textContent = this.currentUser.name;
        document.getElementById('userName').value = this.currentUser.name;
        document.getElementById('userEmail').value = this.currentUser.email;
        if (this.currentUser.age) {
            document.getElementById('userAge').value = this.currentUser.age;
        }

        
        document.getElementById('userLevel').textContent = this.currentUser.level;
        document.getElementById('profileUserLevel').textContent = this.currentUser.level;
        document.getElementById('userCoins').textContent = this.currentUser.coins;
        document.getElementById('userStreak').textContent = this.currentUser.streak;
        document.getElementById('currentXP').textContent = this.currentUser.xp;
        document.getElementById('maxXP').textContent = this.currentUser.level * 100;

       
        document.getElementById('dashTotalXP').textContent = this.currentUser.xp;
        document.getElementById('dashStreak').textContent = this.currentUser.streak;
        document.getElementById('dashCoins').textContent = this.currentUser.coins;

  
        document.getElementById('profileTotalXP').textContent = this.currentUser.xp;
        document.getElementById('profileStreak').textContent = this.currentUser.streak;

        
        const progressPercentage = (this.currentUser.xp % 100);
        document.getElementById('mainProgressFill').style.width = `${progressPercentage}%`;

        if (this.currentUser.avatar) {
            document.getElementById('userAvatarImg').src = this.currentUser.avatar;
            document.getElementById('profileAvatarImg').src = this.currentUser.avatar;
        }
    }

    async simulateApiCall() {
        return new Promise(resolve => {
            setTimeout(resolve, 1000);
        });
    }

    showSuccessMessage(message) {
       
        this.showToast(message, 'success');
    }

    showErrorMessage(message) {
        
        this.showToast(message, 'error');
    }

    showToast(message, type) {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
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

    logout() {
        this.currentUser = null;
        this.isLoggedIn = false;
        localStorage.removeItem('pluainUser');
        this.showLogin();
    }
}


function loginWithGoogle() {
    authManager.showSuccessMessage('Login com Google em desenvolvimento...');
}

function loginWithLinkedIn() {
    authManager.showSuccessMessage('Login com LinkedIn em desenvolvimento...');
}

function logout() {
    authManager.logout();
}


let authManager;
document.addEventListener('DOMContentLoaded', () => {
    authManager = new AuthManager();
});


const toastStyles = document.createElement('style');
toastStyles.textContent = `
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(toastStyles);