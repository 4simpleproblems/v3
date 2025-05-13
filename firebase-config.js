// firebase-config.js
// ==================

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

// Initialize Firebase app (singleton)
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
  console.log("✅ Firebase initialized");
} else {
  console.log("⏩ Using existing Firebase app");
}

// Expose services
window.auth = firebase.auth ? firebase.auth() : null;
window.db   = firebase.firestore ? firebase.firestore() : null;
window.storage   = firebase.storage ? firebase.storage() : null;
window.analytics = firebase.analytics ? firebase.analytics() : null;

// In-memory cache of banned emails
const bannedSet = new Set();

// Load banned emails from Firestore into bannedSet
async function loadBannedEmails() {
  if (!window.db) return;
  try {
    const snap = await window.db.collection('bannedemails').get();
    bannedSet.clear();
    snap.forEach(doc => bannedSet.add(doc.id));
    console.log(`🔒 Loaded ${bannedSet.size} banned emails`);
  } catch (err) {
    console.error("❌ Failed to load banned emails:", err);
  }
}

// Check if an email is banned
async function isEmailBanned(email) {
  // If cache empty, reload once
  if (bannedSet.size === 0) {
    await loadBannedEmails();
  }
  return bannedSet.has(email);
}

// Listen for changes in the bannedemails collection and update cache
if (window.db) {
  window.db.collection('bannedemails')
    .onSnapshot(snapshot => {
      bannedSet.clear();
      snapshot.forEach(doc => bannedSet.add(doc.id));
      console.log(`🔄 Banned list updated (${bannedSet.size} entries)`);
    }, err => {
      console.error("❌ Banned list real-time update failed:", err);
    });
}

// Enforce on auth state change
if (window.auth) {
  window.auth.onAuthStateChanged(async user => {
    if (user) {
      const banned = await isEmailBanned(user.email);
      if (banned) {
        console.warn("🚫 Banned email signed in:", user.email);
        await window.auth.signOut();
        document.dispatchEvent(new CustomEvent('bannedUserAttempt', {
          detail: { email: user.email }
        }));
      } else {
        console.log("👤 Authenticated:", user.email);
      }
    } else {
      console.log("🔒 No user signed in");
    }
  });
}

// Google sign-in helper that checks ban list
if (window.auth) {
  const googleProvider = new firebase.auth.GoogleAuthProvider();
  googleProvider.addScope('profile');
  googleProvider.addScope('email');
  googleProvider.setCustomParameters({ prompt: 'select_account' });
  window.googleProvider = googleProvider;

  // Persist session
  window.auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL)
    .then(() => console.log("💾 Auth persistence: LOCAL"))
    .catch(err => console.error("❌ Auth persistence error:", err));

  window.signInWithGoogle = async () => {
    try {
      const result = await window.auth.signInWithPopup(window.googleProvider);
      const user = result.user;
      const banned = await isEmailBanned(user.email);
      if (banned) {
        console.warn("🚫 Banned during Google sign-in:", user.email);
        await window.auth.signOut();
        return { success: false, reason: 'banned' };
      }
      return { success: true, user };
    } catch (err) {
      console.error("❌ Google auth error:", err);
      return { success: false, error: err };
    }
  };
}

// Utility exports
window.isEmailBanned = isEmailBanned;
window.loadBannedEmails = loadBannedEmails;
window.isUserLoggedIn = () => !!(window.auth && window.auth.currentUser);
window.isCurrentUserBanned = () =>
  window.auth && window.auth.currentUser
    ? isEmailBanned(window.auth.currentUser.email)
    : Promise.resolve(false);
