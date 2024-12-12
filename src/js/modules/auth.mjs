import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyDVthxo1jiLLLQLPdLSYWnD25q7MYlgarE",
    authDomain: "goaltracker-b4c70.firebaseapp.com",
    projectId: "goaltracker-b4c70",
    storageBucket: "goaltracker-b4c70.firebasestorage.app",
    messagingSenderId: "805133015060",
    appId: "1:805133015060:web:707211170af1ccc14d2f01"
  };

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const db = getFirestore(app);

// Login function
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (error) {
    console.error("Error signing in with Google:", error);
  }
};

export { auth }; 
export { db };