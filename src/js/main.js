import { auth, db, signInWithGoogle } from './modules/auth.mjs';
import { GoalTracker } from './modules/GoalTracker.mjs';

document.addEventListener('DOMContentLoaded', () => {
    const tracker = new GoalTracker(auth, db);
    
    const signInButton = document.getElementById('googleSignIn');
    const signOutButton = document.getElementById('signOut');
    const userInfo = document.getElementById('userInfo');
    const userName = document.getElementById('userName');

    signInButton.addEventListener('click', async () => {
        try {
            await signInWithGoogle();
        } catch (error) {
            console.error('Sign in error:', error);
        }
    });

    signOutButton.addEventListener('click', () => {
        auth.signOut();
    });

    auth.onAuthStateChanged((user) => {
        if (user) {
            signInButton.style.display = 'none';
            userInfo.style.display = 'block';
            userName.textContent = user.displayName || user.email;
        } else {
            signInButton.style.display = 'block';
            userInfo.style.display = 'none';
            userName.textContent = '';
        }
    });
});