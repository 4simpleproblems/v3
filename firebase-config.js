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

// Initialize Firebase (if not already initialized)
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
  console.log("Firebase initialized successfully");
} else {
  console.log("Firebase already initialized");
}

// Initialize services
window.auth = firebase.auth ? firebase.auth() : null;
window.db   = firebase.firestore ? firebase.firestore() : null;
window.storage = firebase.storage ? firebase.storage() : null;
window.analytics = firebase.analytics ? firebase.analytics() : null;

// Fetch banned emails from Firestore
window.getBannedEmails = async () => {
  if (!window.db) {
    console.error('Firestore SDK not loaded. Cannot fetch banned emails.');
    return [];
  }
  try {
    const snapshot = await window.db.collection('bannedEmails').get();
    return snapshot.docs.map(doc => doc.id);
  } catch (error) {
    console.error('Error fetching banned emails:', error);
    return [];
  }
};

// Helper: Check if an email is banned
window.isEmailBanned = async (email) => {
  const bannedList = await window.getBannedEmails();
  return bannedList.includes(email);
};

// Auth state listener with banned-email enforcement
if (window.auth) {
  window.auth.onAuthStateChanged(async (user) => {
    if (user) {
      const email = user.email;
      const banned = await window.isEmailBanned(email);
      if (banned) {
        console.warn(`Banned email detected, signing out: ${email}`);
        await window.auth.signOut();
        document.dispatchEvent(new CustomEvent('bannedUserAttempt', { detail: { email } }));
        alert('You are not authorized to access this application.');
      } else {
        console.log(`User authenticated: ${email}`);
      }
    } else {
      console.log('User is signed out');
    }
  });

  // Set persistence to LOCAL
  window.auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL)
    .then(() => console.log("Auth persistence set to LOCAL"))
    .catch(err => console.error("Auth persistence error:", err));

  // Google sign-in wrapper
  const googleProvider = new firebase.auth.GoogleAuthProvider();
  googleProvider.addScope('profile');
  googleProvider.addScope('email');
  googleProvider.setCustomParameters({ prompt: 'select_account' });
  window.googleProvider = googleProvider;

  window.signInWithGoogle = async () => {
    try {
      const result = await window.auth.signInWithPopup(window.googleProvider);
      const user = result.user;
      const banned = await window.isEmailBanned(user.email);
      if (banned) {
        console.warn(`Banned email detected during sign-in: ${user.email}`);
        await window.auth.signOut();
        return { success: false, reason: 'banned' };
      }
      return { success: true, user };
    } catch (error) {
      console.error('Google auth error:', error);
      return { success: false, error };
    }
  };
}

// Helper to check login status
window.isUserLoggedIn = () => !!(window.auth && window.auth.currentUser);
window.isCurrentUserBanned = () => {
  const user = window.auth ? window.auth.currentUser : null;
  return user ? window.isEmailBanned(user.email) : Promise.resolve(false);
};
