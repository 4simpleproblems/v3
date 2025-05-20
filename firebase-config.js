// firebase-config.js
// Updated Firebase configuration and initialization with dynamic banned email support

// Import Firebase SDK (ensure <script> tags or module bundler includes these)
// <script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js"></script>
// <script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js"></script>
// <script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js"></script>
// <script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-storage.js"></script>
// <script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-analytics.js"></script>

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

// Expose Firebase services
window.auth    = firebase.auth ? firebase.auth() : null;
window.db      = firebase.firestore ? firebase.firestore() : null;
window.storage = firebase.storage ? firebase.storage() : null;
window.analytics = firebase.analytics ? firebase.analytics() : null;

// Static fallback banned emails (in case Firestore fetch fails or for quick checks)
const staticBannedEmails = [
  "hornbr30@minerva.sparcc.org",
  "russsi30@minerva.sparcc.org",
  "tootja30@minerva.sparcc.org",
  "4simpleproblems@gmail.com"
];

// Function to fetch dynamic banned emails from Firestore
window.fetchBannedEmails = async () => {
  if (!window.db) return staticBannedEmails;
  try {
    const snapshot = await window.db.collection('bannedemails').get();
    // each doc id is the email
    const dynamic = snapshot.docs.map(doc => doc.id);
    return [...staticBannedEmails, ...dynamic];
  } catch (error) {
    console.error('Error fetching banned emails:', error);
    return staticBannedEmails;
  }
};

// Function to check if an email is banned
window.isEmailBanned = async (email) => {
  // quick static check
  if (staticBannedEmails.includes(email)) return true;
  // dynamic check via Firestore document
  if (!window.db) return false;
  try {
    const doc = await window.db.collection('bannedemails').doc(email).get();
    return doc.exists;
  } catch (error) {
    console.error('Error checking banned status:', error);
    return false;
  }
};

// Auth state listener with banned email enforcement
if (window.auth) {
  window.auth.onAuthStateChanged(async (user) => {
    if (user) {
      const banned = await window.isEmailBanned(user.email);
      if (banned) {
        console.log('Banned email detected, signing out:', user.email);
        await window.auth.signOut();
        console.warn('You are not authorized to access this application.');
        document.dispatchEvent(new CustomEvent('bannedUserAttempt', { detail: { email: user.email } }));
      } else {
        console.log('User authenticated:', user.email);
      }
    } else {
      console.log('User is signed out');
    }
  });
} else {
  console.error('Firebase Auth SDK not loaded.');
}

// Google Auth provider setup with banned email guard
if (window.auth) {
  const googleProvider = new firebase.auth.GoogleAuthProvider();
  googleProvider.addScope('profile');
  googleProvider.addScope('email');
  googleProvider.setCustomParameters({ prompt: 'select_account' });
  window.googleProvider = googleProvider;

  window.auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL)
    .then(() => console.log('Auth persistence set to LOCAL'))
    .catch(err => console.error('Auth persistence error:', err));

  window.signInWithGoogle = async () => {
    try {
      const result = await window.auth.signInWithPopup(window.googleProvider);
      const email = result.user.email;
      if (await window.isEmailBanned(email)) {
        console.warn('Banned email detected during sign-in:', email);
        await window.auth.signOut();
        return { success: false, reason: 'banned' };
      }
      return { success: true, user: result.user };
    } catch (error) {
      console.error('Google auth error:', error);
      return { success: false, error };
    }
  };
}

// Helper to check login and banned status
window.isUserLoggedIn = () => !!(window.auth && window.auth.currentUser);
window.isCurrentUserBanned = async () => {
  const user = window.auth ? window.auth.currentUser : null;
  if (!user) return false;
  return await window.isEmailBanned(user.email);
};
