// Initialize Firebase with error handling
try {
  const firebaseConfig = {
    apiKey: "AIzaSyCE8iictKO9DxGiB5YolWq5ZOfVBdqgwaI",
    authDomain: "sp-v2-899a3.firebaseapp.com",
    projectId: "sp-v2-899a3",
    storageBucket: "sp-v2-899a3.appspot.com", // Fixed storage bucket URL
    messagingSenderId: "481680193086",
    appId: "1:481680193086:web:20730bc623f399133a436f",
    measurementId: "G-Q1N35C57EV"
  };

  // Initialize Firebase
  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  }

  // Auth and Firestore references
  const auth = firebase.auth();
  const db = firebase.firestore();
  
  // Configure Google Auth Provider with additional scopes
  const googleProvider = new firebase.auth.GoogleAuthProvider();
  googleProvider.addScope('profile');
  googleProvider.addScope('email');
  googleProvider.setCustomParameters({
    prompt: 'select_account' // Forces account selection every time
  });

  // Set persistence with fallback
  auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL)
    .catch(error => {
      console.error("Auth persistence error:", error);
    });

} catch (error) {
  console.error("Firebase initialization failed:", error);
}
