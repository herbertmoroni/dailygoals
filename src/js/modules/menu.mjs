import { auth, signInWithGoogle } from './auth.mjs';

export class Menu {
    constructor() {
        this.initializeLucideIcons();
        this.signInButton = document.getElementById('googleSignIn');
        this.signOutButton = document.getElementById('signOut');
        this.userInfo = document.getElementById('userInfo');
        this.userName = document.getElementById('userName');
        
        this.setupEventListeners();
        this.setupAuthStateListener();
    }

    setupEventListeners() {
        this.signInButton.addEventListener('click', async () => {
            try {
                await signInWithGoogle();
            } catch (error) {
                console.error('Sign in error:', error);
            }
        });

        this.signOutButton.addEventListener('click', () => {
            auth.signOut();
        });
    }

    setupAuthStateListener() {
        auth.onAuthStateChanged((user) => {
            if (user) {
                this.signInButton.style.display = 'none';
                this.userInfo.style.display = 'block';
                this.userName.textContent = user.displayName || user.email;
            } else {
                this.signInButton.style.display = 'block';
                this.userInfo.style.display = 'none';
                this.userName.textContent = '';
            }
        });
    }

    initializeLucideIcons() {
        lucide.createIcons();
    }
}