import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyAeE4r7KKuyFwWp5Z-N5SYQiRsjiWZ4QwQ",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "flutter-ai-playground-d5855.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "flutter-ai-playground-d5855",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "flutter-ai-playground-d5855.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "700259421993",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:700259421993:web:94bcc0b2a5ca16384af138"
};

export { firebaseConfig };

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
export const db = firebase.firestore();

db.enablePersistence({ synchronizeTabs: true }).catch(err => console.warn("Caching error:", err));
