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
  console.log("Firebase initialized");
} else {
  console.log("Firebase already initialized");
}

// Expose Firebase services
window.auth = firebase.auth();
window.db   = firebase.firestore();

// --- UTILITY: fetch the banned-emails set from Firestore ---
let bannedSet = new Set();
async function loadBannedEmails() {
  try {
    const snapshot = await window.db.collection('bannedemails').get();
    bannedSet = new Set(snapshot.docs.map(doc => doc.id.toLowerCase()));
    console.log(`Loaded ${bannedSet.size} banned emails`);
  } catch (err) {
    console.error("Error loading banned emails:", err);
    // Leave bannedSet as-is (possibly empty)
  }
}

// Kick off initial load
loadBannedEmails();

// Keep banned list up to date in real time (optional)
// Uncomment if you want live updates whenever Firestore changes:
// window.db.collection('bannedemails').onSnapshot(snap => {
//   bannedSet = new Set(snap.docs.map(d => d.id.toLowerCase()));
//   console.log(`Banned list updated: ${bannedSet.size}`);
// });

// --- AUTH STATE HANDLING ---
window.auth.onAuthStateChanged(async user => {
  if (!user) {
    // Signed out or not yet signed in
    return;
  }

  // Ensure we have the latest banned list
  await loadBannedEmails();

  const email = user.email && user.email.toLowerCase();
  if (email && bannedSet.has(email)) {
    console.warn("Banned user attempted login:", email);
    // Force sign-out and redirect
    await window.auth.signOut();
    // Optionally: show a message before redirect
    alert("Your account has been banned. You will be redirected to the home page.");
    window.location.href = 'index.html';
  } else {
    console.log("Authenticated:", email);
  }
});

// --- GOOGLE SIGN-IN WRAPPER ---
const googleProvider = new firebase.auth.GoogleAuthProvider();
googleProvider.addScope('profile');
googleProvider.addScope('email');
googleProvider.setCustomParameters({ prompt: 'select_account' });
window.googleProvider = googleProvider;

// Enforce LOCAL persistence
window.auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL)
  .then(() => console.log("Auth persistence: LOCAL"))
  .catch(err => console.error("Persistence error:", err));

// Call this function to trigger Google login
window.signInWithGoogle = async () => {
  try {
    const result = await window.auth.signInWithPopup(window.googleProvider);
    // onAuthStateChanged will handle banned-user check & redirect
    return { success: true, user: result.user };
  } catch (error) {
    console.error("Google sign-in failed:", error);
    return { success: false, error };
  }
};

// --- OPTIONAL HELPERS ---
window.isEmailBanned = (email) => {
  return bannedSet.has((email||"").toLowerCase());
};

window.isUserLoggedIn = () => !!(window.auth.currentUser);
window.isCurrentUserBanned = () => {
  const u = window.auth.currentUser;
  return u ? bannedSet.has(u.email.toLowerCase()) : false;
};
