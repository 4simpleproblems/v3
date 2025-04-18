// Initialize Firebase with error handling
try {
  const firebaseConfig = {
    apiKey: "AIzaSyCE8iictKO9DxGiB5YolWq5ZOfVBdqgwaI",
    authDomain: "sp-v2-899a3.firebaseapp.com",
    projectId: "sp-v2-899a3",
    storageBucket: "sp-v2-899a3.appspot.com",
    messagingSenderId: "481680193086",
    appId: "1:481680193086:web:20730bc623f399133a436f",
    measurementId: "G-Q1N35C57EV"
  };

  // Initialize Firebase
  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
    console.log("Firebase initialized.");
  } else {
    console.log("Firebase already initialized.");
   }

  // Auth and Firestore references
   // --- CORRECTED: Removed 'const' to make them global ---
   auth = firebase.auth();
   db = firebase.firestore();
   // Optional: You could also explicitly attach them to window if preferred:
   // window.auth = firebase.auth();
   // window.db = firebase.firestore();

   console.log("Firebase auth and db references obtained.");
   
   // Configure Google Auth Provider with additional scopes (remains the same)
   const googleProvider = new firebase.auth.GoogleAuthProvider();
   googleProvider.addScope('profile');
   googleProvider.addScope('email');
   googleProvider.setCustomParameters({
     prompt: 'select_account' // Forces account selection every time
   });

   // Set persistence with fallback (remains the same)
   auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL)
     .then(() => {
          console.log("Auth persistence set to LOCAL.");
      })
     .catch(error => {
       console.error("Auth persistence error:", error);
     });

} catch (error) {
  console.error("Firebase initialization failed:", error);
}
