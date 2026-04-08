// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAUmIg_wbjwUI-pITr_tJST-5OruLfyD48",
  authDomain: "archcosbasededatos.firebaseapp.com",
  projectId: "archcosbasededatos",
  storageBucket: "archcosbasededatos.firebasestorage.app",
  messagingSenderId: "897194789991",
  appId: "1:897194789991:web:5161f86f4ea50e149dd8c2",
  measurementId: "G-HJ29K132NV"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
export const db = getFirestore(app);
