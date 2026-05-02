// Firebase initialization for frontend
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBJd0AYV_f-mCoJQhI24F7e_YF440i40dw",
  authDomain: "community0pulse.firebaseapp.com",
  projectId: "community0pulse",
  storageBucket: "community0pulse.firebasestorage.app",
  messagingSenderId: "131658014155",
  appId: "1:131658014155:web:d8c3c4ce8ad6dab7dd2a4e",
  measurementId: "G-DPHH73F9JZ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// Analytics may not be available in some environments (SSR); guard usage if needed
let analytics;
try {
  analytics = getAnalytics(app);
} catch (err) {
  // Analytics may fail during local dev or unsupported browsers; ignore safely
  // console.debug("Firebase analytics not initialized:", err);
}

export { app, analytics, firebaseConfig };
