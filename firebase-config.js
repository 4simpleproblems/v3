// Firebase configuration and initialization with banned email support from Firestore

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

// Admin email for managing banned users
const adminEmail = "4simpleproblems@gmail.com", "wyattbelknap67@gmail.com", "belkwy30@minerva.sparcc.org";

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
  window.auth.onAuthStateChanged(async (user) => {
    if (user) {
      // Check if user's email is in the banned list
      const isBanned = await window.isEmailBanned(user.email);
      if (isBanned) {
        console.log("Banned email detected, signing out:", user.email);
        window.auth.signOut().then(() => {
          // Show alert for banned user
          alert("Your account has been banned from accessing this application.");
          
          // Redirect to index
          window.location.href = "index.html";
          
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
  
  // Get banned emails from Firestore
  window.getBannedEmails = async () => {
    try {
      const bannedEmailsSnapshot = await window.db.collection('bannedemails').get();
      const bannedEmails = [];
      
      bannedEmailsSnapshot.forEach(doc => {
        bannedEmails.push(doc.id); // Using email as document ID
      });
      
      return bannedEmails;
    } catch (error) {
      console.error('Error fetching banned emails:', error);
      return [];
    }
  };
  
  // Check if an email is banned
  window.isEmailBanned = async (email) => {
    try {
      const docRef = await window.db.collection('bannedemails').doc(email).get();
      return docRef.exists;
    } catch (error) {
      console.error('Error checking banned status:', error);
      return false;
    }
  };
  
  // Add an email to the banned list
  window.addBannedEmail = async (email) => {
    try {
      await window.db.collection('bannedemails').doc(email).set({
        bannedAt: firebase.firestore.FieldValue.serverTimestamp(),
      });
      return true;
    } catch (error) {
      console.error('Error adding banned email:', error);
      return false;
    }
  };
  
  // Remove an email from the banned list
  window.removeBannedEmail = async (email) => {
    try {
      await window.db.collection('bannedemails').doc(email).delete();
      return true;
    } catch (error) {
      console.error('Error removing banned email:', error);
      return false;
    }
  };
  
  // Check if current user is admin
  window.isUserAdmin = () => {
    const user = window.auth ? window.auth.currentUser : null;
    return user && user.email === adminEmail;
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
        alert("Your account has been banned from accessing this application.");
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
