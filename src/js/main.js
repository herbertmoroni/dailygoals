import { auth, db, signInWithGoogle } from './modules/auth.mjs';
import { GoalTracker } from './modules/goalTracker.mjs';
import { Menu } from './modules/menu.mjs';

document.addEventListener('DOMContentLoaded', () => {
    new Menu();
    new GoalTracker(auth, db);
});