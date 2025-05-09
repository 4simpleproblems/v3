// Updated Firebase configuration and initialization with banned email support

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

// List of banned Gmail addresses
const bannedEmails = [
  "tootja30@minerva.sparcc.org"
];

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
  
  // Add auth state change listener to check for banned emails
  window.auth.onAuthStateChanged((user) => {
    if (user) {
      // Check if user's email is in the banned list
      if (bannedEmails.includes(user.email)) {
        console.log("Banned email detected, signing out:", user.email);
        window.auth.signOut().then(() => {
          // Optionally show an alert or notification
          console.warn("You are not authorized to access this application.");
          
          // Dispatch a custom event that pages can listen for
          document.dispatchEvent(new CustomEvent('bannedUserAttempt', {
            detail: { email: user.email }
          }));
        });
      } else {
        console.log("User authenticated:", user.email);
      }
    } else {
      console.log("User is signed out");
    }
  });
} else {
  console.error('Firebase Auth SDK not loaded.');
}

// Firestore
if (firebase.firestore) {
  window.db = firebase.firestore();
  
  // Optional: Set up a collection for banned emails
  // This allows you to manage banned emails in Firestore instead of hardcoding
  window.getBannedEmails = async () => {
    try {
      const bannedEmailsSnapshot = await window.db.collection('bannedEmails').get();
      const dynamicBannedEmails = [];
      
      bannedEmailsSnapshot.forEach(doc => {
        dynamicBannedEmails.push(doc.id); // Using email as document ID
      });
      
      return [...bannedEmails, ...dynamicBannedEmails]; // Combine static and dynamic lists
    } catch (error) {
      console.error('Error fetching banned emails:', error);
      return bannedEmails; // Fall back to static list
    }
  };
  
  // Check if an email is banned (combines static and dynamic lists)
  window.isEmailBanned = async (email) => {
    if (bannedEmails.includes(email)) return true;
    
    try {
      const docRef = await window.db.collection('bannedEmails').doc(email).get();
      return docRef.exists;
    } catch (error) {
      console.error('Error checking banned status:', error);
      return false;
    }
  };
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

// Set up Google Auth Provider with banned email check
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
    
  // Create a wrapper function for sign-in that checks banned emails
  window.signInWithGoogle = async () => {
    try {
      const result = await window.auth.signInWithPopup(window.googleProvider);
      const user = result.user;
      
      // Check if email is banned
      const isBanned = await window.isEmailBanned(user.email);
      if (isBanned) {
        console.warn("Banned email detected during sign-in:", user.email);
        await window.auth.signOut();
        return { success: false, reason: 'banned' };
      }
      
      return { success: true, user };
    } catch (error) {
      console.error("Google auth error:", error);
      return { success: false, error };
    }
  };
}

// Helper function to check authentication state
window.isUserLoggedIn = () => {
  return window.auth ? !!window.auth.currentUser : false;
};

// Helper function to check if current user is banned
window.isCurrentUserBanned = async () => {
  const user = window.auth ? window.auth.currentUser : null;
  if (!user) return false;
  
  return await window.isEmailBanned(user.email);
};