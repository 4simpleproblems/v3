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

// Initialize Firebase (only once)
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
} 

// Expose Firebase services
window.auth = firebase.auth();
window.db   = firebase.firestore();

// In-memory set of banned emails
let bannedSet = new Set();

// Load banned list from Firestore
async function loadBannedEmails() {
  try {
    const snap = await db.collection('bannedemails').get();
    bannedSet = new Set(snap.docs.map(d => d.id.toLowerCase()));
  } catch (e) {
    console.error("Failed to load banned list:", e);
    bannedSet = new Set();
  }
}

// Immediately fetch once
loadBannedEmails();

// Optionally keep it in sync
// db.collection('bannedemails').onSnapshot(snap => {
//   bannedSet = new Set(snap.docs.map(d => d.id.toLowerCase()));
// });

// Core handler: if banned, sign out & redirect instantly
async function enforceNotBanned(user) {
  if (!user) return;           // not signed in at all
  const email = user.email?.toLowerCase() || "";
  // ensure we have the latest list
  await loadBannedEmails();
  if (bannedSet.has(email)) {
    // force sign-out and redirect immediately
    await auth.signOut();
    // flush any JS state, then redirect
    window.location.replace('index.html');
    // throw to stop any further logic
    throw new Error("Banned user - redirected");
  }
}

// Listen for auth changes
auth.onAuthStateChanged(user => {
  // wrap in a microtask so that UI render logic can await this if needed
  enforceNotBanned(user).catch(() => {});
});

// Google sign-in wrapper
const googleProvider = new firebase.auth.GoogleAuthProvider();
googleProvider.addScope('email');
window.signInWithGoogle = async () => {
  try {
    const { user } = await auth.signInWithPopup(googleProvider);
    // enforce immediately
    await enforceNotBanned(user);
    return { success: true, user };
  } catch (err) {
    // if banned we already redirected; else return failure
    console.error("SignIn error:", err);
    return { success: false, error: err };
  }
};

// Enforce LOCAL persistence
auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL)
  .catch(console.error);

// Helpers
window.isEmailBanned = email => bannedSet.has((email||"").toLowerCase());
window.isUserLoggedIn = () => !!auth.currentUser;
window.isCurrentUserBanned = () => auth.currentUser
  ? bannedSet.has(auth.currentUser.email.toLowerCase())
  : false;
