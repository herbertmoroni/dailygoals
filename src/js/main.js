import { auth, signInWithGoogle } from './modules/auth.mjs';


// Get DOM elements
const signInButton = document.getElementById('googleSignIn');
const signOutButton = document.getElementById('signOut');
const userInfo = document.getElementById('userInfo');
const userName = document.getElementById('userName');

// Add click event for sign in
signInButton.addEventListener('click', async () => {
    try {
        const user = await signInWithGoogle();
        if (user) {
            console.log('Signed in successfully!');
        }
    } catch (error) {
        console.error('Sign in error:', error);
    }
});

// Add click event for sign out
signOutButton.addEventListener('click', () => {
    auth.signOut().then(() => {
        console.log('Signed out successfully!');
    }).catch((error) => {
        console.error('Sign out error:', error);
    });
});

// Listen for auth state changes
auth.onAuthStateChanged((user) => {
    if (user) {
        // User is signed in
        signInButton.style.display = 'none';
        userInfo.style.display = 'block';
        userName.textContent = user.displayName || user.email;
    } else {
        // User is signed out
        signInButton.style.display = 'block';
        userInfo.style.display = 'none';
        userName.textContent = '';
    }
});