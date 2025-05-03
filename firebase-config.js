// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCE8iictKO9DxGiB5YolWq5ZOfVBdqgwaI",
  authDomain: "sp-v2-899a3.firebaseapp.com",
  projectId: "sp-v2-899a3",
  storageBucket: "sp-v2-899a3.appspot.com",
  messagingSenderId: "481680193086",
  appId: "1:481680193086:web:20730bc623f399133a436f",
  measurementId: "G-Q1N35C57EV"
};

// Initialize Firebase when the document is ready
document.addEventListener('DOMContentLoaded', () => {
  try {
    // Check if Firebase is loaded from the SDK scripts
    if (typeof firebase === 'undefined') {
        console.error('Firebase SDK not loaded. Check your script tags in the HTML.');
        return; // Stop execution if Firebase object is not available
    }

    // Initialize Firebase if it hasn't been initialized yet
    if (!firebase.apps.length) {
      firebase.initializeApp(firebaseConfig);
      console.log("Firebase initialized successfully");
    } else {
      console.log("Firebase already initialized");
    }

    // Auth and Firestore references (attach to window for global access)
    // Check if auth and firestore modules are loaded
    if (typeof firebase.auth === 'undefined') {
         console.error('Firebase Auth SDK not loaded.');
    } else {
         window.auth = firebase.auth();
    }

    if (typeof firebase.firestore === 'undefined') {
        console.error('Firebase Firestore SDK not loaded.');
    } else {
         window.db = firebase.firestore();
    }


    // Set up Google Auth Provider
    if (window.auth) { // Only set up provider if auth is available
        const googleProvider = new firebase.auth.GoogleAuthProvider();
        googleProvider.addScope('profile');
        googleProvider.addScope('email');
        googleProvider.setCustomParameters({
          prompt: 'select_account'
        });
        window.googleProvider = googleProvider;

        // Set persistence to LOCAL (keep user signed in)
        window.auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL)
          .then(() => {
            console.log("Auth persistence set to LOCAL");
          })
          .catch(error => {
            console.error("Auth persistence error:", error);
          });
    }


  } catch (error) {
    console.error("Firebase initialization failed:", error);
  }
});
