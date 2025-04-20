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

  // Auth and Firestore references (attach to window for global access)
  window.auth = firebase.auth();
  window.db = firebase.firestore();

  // Optional: Google Auth Provider
  const googleProvider = new firebase.auth.GoogleAuthProvider();
  googleProvider.addScope('profile');
  googleProvider.addScope('email');
  googleProvider.setCustomParameters({
    prompt: 'select_account'
  });

  window.googleProvider = googleProvider;

  // Set persistence
  window.auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL)
    .then(() => {
      console.log("Auth persistence set to LOCAL.");
    })
    .catch(error => {
      console.error("Auth persistence error:", error);
    });

} catch (error) {
  console.error("Firebase initialization failed:", error);
}
