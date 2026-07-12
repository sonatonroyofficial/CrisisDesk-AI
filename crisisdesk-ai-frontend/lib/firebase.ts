import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCrSrdZPM3xsHRoWMK65zAK7Mm6VTQ9lxc",
  authDomain: "crisisdesk-ai-seu.firebaseapp.com",
  projectId: "crisisdesk-ai-seu",
  storageBucket: "crisisdesk-ai-seu.firebasestorage.app",
  messagingSenderId: "1011389605651",
  appId: "1:1011389605651:web:9a919008edd2bd75f25ce6"
};

// Prevent Firebase initialization error on hot reloads
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
