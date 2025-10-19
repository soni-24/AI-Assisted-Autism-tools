// firebase.js
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyDCF5SH3yDS0DrMVyrjg-PNsgK8ySWK6uo",
  authDomain: "autism-ai-tool.firebaseapp.com",
  projectId: "autism-ai-tool",
  storageBucket: "autism-ai-tool.firebasestorage.app",
  messagingSenderId: "188598592341",
  appId: "1:188598592341:web:3819b00c2ee2e41bbd85dc",
  measurementId: "G-JS7QRQLE0F"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const analytics = getAnalytics(app);

export { db, auth, analytics, firebaseConfig }; // ✅ export firebaseConfig
