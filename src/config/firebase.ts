/**
 * @file firebase.ts
 * @description Configuración centralizada de Firebase para ARCHCOS.
 * Inicializa la app una sola vez y exporta las instancias de `db` y `auth`
 * para uso en toda la aplicación.
 */

import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAUmIg_wbjwUI-pITr_tJST-5OruLfyD48",
  authDomain: "archcosbasededatos.firebaseapp.com",
  projectId: "archcosbasededatos",
  storageBucket: "archcosbasededatos.firebasestorage.app",
  messagingSenderId: "897194789991",
  appId: "1:897194789991:web:5161f86f4ea50e149dd8c2",
  measurementId: "G-HJ29K132NV",
};

// Patrón Singleton: solo inicializa si no existe una instancia previa.
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

export const db   = firebase.firestore();
export const auth = firebase.auth();
export default firebase;
