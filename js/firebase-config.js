// =============================================================================
// DONATIONCARE - FIREBASE CONFIGURATION & INITIALIZATION
// =============================================================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { 
    getFirestore, 
    collection, 
    doc, 
    setDoc, 
    getDoc, 
    getDocs, 
    updateDoc, 
    deleteDoc, 
    onSnapshot, 
    query, 
    where, 
    orderBy, 
    serverTimestamp 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js";

// =============================================================================
// YOUR FIREBASE CONFIGURATION
// Replace the placeholder values below with your credentials from the Firebase Console
// (Project Settings > General > Your Apps > Web app SDK configuration)
// =============================================================================
export const firebaseConfig = {
    apiKey: "AIzaSyB79xZHbi-Ij5H6RJ2K2CiOYUdMUXNJae8",
    authDomain: "donationcare.firebaseapp.com",
    projectId: "donationcare",
    storageBucket: "donationcare.firebasestorage.app",
    messagingSenderId: "668835550276",
    appId: "1:668835550276:web:71cbb4db80d12bf8575811",
    measurementId: "G-6Q5GB5ESS6"
};

// Check if credentials have been provided by the user
export const isFirebaseConfigured = () => {
    return firebaseConfig.apiKey && 
           firebaseConfig.apiKey !== "YOUR_API_KEY" && 
           firebaseConfig.appId !== "YOUR_APP_ID" &&
           firebaseConfig.projectId !== "";
};

let app = null;
let auth = null;
let db = null;
let storage = null;

if (isFirebaseConfigured()) {
    try {
        app = initializeApp(firebaseConfig);
        auth = getAuth(app);
        db = getFirestore(app);
        storage = getStorage(app);
        console.log("🔥 Firebase initialized successfully with project:", firebaseConfig.projectId);
    } catch (err) {
        console.warn("⚠️ Firebase initialization error:", err);
    }
} else {
    console.info("ℹ️ Firebase running in Local Storage fallback mode. Paste your apiKey in js/firebase-config.js to activate live Firestore sync.");
}

export { 
    app, 
    auth, 
    db, 
    storage, 
    collection, 
    doc, 
    setDoc, 
    getDoc, 
    getDocs, 
    updateDoc, 
    deleteDoc, 
    onSnapshot, 
    query, 
    where, 
    orderBy, 
    serverTimestamp 
};