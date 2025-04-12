// Firebase configuration (replace with your actual config)
const firebaseConfig = {
  apiKey: "AIzaSyCIShXZAgmjZcNTPxxph_SBIFyHyD0KlHM",
  authDomain: "sp-proj-ee318.firebaseapp.com",
  projectId: "sp-proj-ee318",
  storageBucket: "sp-proj-ee318.firebasestorage.app",
  messagingSenderId: "306497646656",
  appId: "1:306497646656:web:e87b7bc7b96ffd85506fa5",
  measurementId: "G-8ZR9HSE4GC"
};

// Initialize Firebase only if not already initialized
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
} else {
  firebase.app(); // Use existing app if already initialized
}

const auth = firebase.auth();

// Configure Google Auth Provider
const googleProvider = new firebase.auth.GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account' // Forces account selection
});

// Email/password signup function
async function emailSignUp(email, password, confirmPassword) {
  if (password !== confirmPassword) {
    throw new Error("Passwords don't match");
  }

  try {
    const userCredential = await auth.createUserWithEmailAndPassword(email, password);
    return userCredential.user;
  } catch (error) {
    console.error("Signup error:", error);
    throw error;
  }
}

// Google sign-in function with popup/redirect fallback
async function googleSignIn() {
  try {
    // First try popup method
    const result = await auth.signInWithPopup(googleProvider);
    return result.user;
  } catch (error) {
    console.error("Google sign-in error:", error);
    
    // If popup is blocked, fallback to redirect
    if (error.code === 'auth/popup-blocked' || error.code === 'auth/popup-closed-by-user') {
      console.log("Attempting redirect...");
      await auth.signInWithRedirect(googleProvider);
      return null; // Redirect flow will handle the rest
    }
    
    throw error;
  }
}

// Auth state observer
function monitorAuthState(callback) {
  auth.onAuthStateChanged(user => {
    callback(user);
  });
}

// Password reset function
async function sendPasswordReset(email) {
  try {
    await auth.sendPasswordResetEmail(email);
    return true;
  } catch (error) {
    console.error("Password reset error:", error);
    throw error;
  }
}

// Sign out function
async function signOut() {
  try {
    await auth.signOut();
    return true;
  } catch (error) {
    console.error("Sign out error:", error);
    throw error;
  }
}

// Export all auth functions
export {
  auth,
  emailSignUp,
  googleSignIn,
  monitorAuthState,
  sendPasswordReset,
  signOut
};
