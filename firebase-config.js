// Updated Firebase configuration and initialization

// Your Firebase project configuration
const firebaseConfig = {
  apiKey: "AIzaSyCE8iictKO9DxGiB5YolWq5ZOfVBdqgwaI",
  authDomain: "sp-v2-899a3.firebaseapp.com",
  projectId: "sp-v2-899a3",
  storageBucket: "sp-v2-899a3.appspot.com",
  messagingSenderId: "481680193086",
  appId: "1:481680193086:web:20730bc623f399133a436f",
  measurementId: "G-Q1N35C57EV"
};

// Initialize Firebase (check for existing app)
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
  console.log("Firebase initialized successfully");
} else {
  console.log("Firebase already initialized");
}

// Initialize and expose Firebase services globally
// Authentication
if (firebase.auth) {
  window.auth = firebase.auth();
} else {
  console.error('Firebase Auth SDK not loaded.');
}

// Firestore
if (firebase.firestore) {
  window.db = firebase.firestore();
} else {
  console.error('Firebase Firestore SDK not loaded.');
}

// Storage
if (firebase.storage) {
  window.storage = firebase.storage();
} else {
  console.warn('Firebase Storage SDK not loaded.');
}

// Analytics
if (firebase.analytics) {
  window.analytics = firebase.analytics();
} else {
  console.warn('Firebase Analytics SDK not loaded.');
}

// Set up Google Auth Provider
if (window.auth) {
  const googleProvider = new firebase.auth.GoogleAuthProvider();
  googleProvider.addScope('profile');
  googleProvider.addScope('email');
  googleProvider.setCustomParameters({ prompt: 'select_account' });
  window.googleProvider = googleProvider;

  // Set persistence to LOCAL
  window.auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL)
    .then(() => console.log("Auth persistence set to LOCAL"))
    .catch(error => console.error("Auth persistence error:", error));
}
