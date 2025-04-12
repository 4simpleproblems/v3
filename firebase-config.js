// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCIShXZAgmjZcNTPxxph_SBIFyHyD0KlHM",
  authDomain: "sp-proj-ee318.firebaseapp.com",
  projectId: "sp-proj-ee318",
  storageBucket: "sp-proj-ee318.firebasestorage.app",
  messagingSenderId: "306497646656",
  appId: "1:306497646656:web:e87b7bc7b96ffd85506fa5",
  measurementId: "G-8ZR9HSE4GC"
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
const analytics = getAnalytics(app);

// Google Auth Provider
const googleProvider = new firebase.auth.GoogleAuthProvider();

// Set up auth state persistence
auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL)
  .catch((error) => {
    console.error("Error setting auth persistence:", error);
  });
