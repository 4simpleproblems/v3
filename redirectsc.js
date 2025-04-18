// Ensure Firebase is initialized
// Replace with your project's config object - This MUST match the config used in redirect.html or other pages
const firebaseConfig = {
  apiKey: "AIzaSyCE8iictKO9DxGiB5YolWq5ZOfVBdqgwaI",
  authDomain: "sp-v2-899a3.firebaseapp.com",
  projectId: "sp-v2-899a3",
  storageBucket: "sp-v2-899a3.firebasestorage.app",
  messagingSenderId: "481680193086",
  appId: "1:481680193086:web:20730bc623f399133a436f",
  measurementId: "G-Q1N35C57EV"
};

// Initialize Firebase only if it hasn't been initialized already
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

const auth = firebase.auth();
const db = firebase.firestore();

// Listen for authentication state changes to get the user ID
auth.onAuthStateChanged((user) => {
    console.log("Redirect script auth state changed. User:", user ? user.uid : "none");

    // Add the keydown listener only after auth state is determined
    document.addEventListener('keydown', async (event) => {
        // Check if Shift + X is pressed
        if (event.shiftKey && event.key === 'x') {
            console.log("Shift + X pressed");

            // Prevent default browser behavior (like quick find in some browsers)
            event.preventDefault();

            let redirectUrl = 'https://google.com'; // Default URL

            if (user) {
                // User is logged in, try to fetch their saved URL
                const userSettingsRef = db.collection('users').doc(user.uid).collection('settings').doc('redirect');
                try {
                    const doc = await userSettingsRef.get();
                    if (doc.exists && doc.data().redirectUrl) {
                        redirectUrl = doc.data().redirectUrl;
                        console.log("Redirecting to saved URL:", redirectUrl);
                    } else {
                        console.log("User logged in but no saved URL found. Redirecting to default:", redirectUrl);
                    }
                } catch (error) {
                    console.error("Error fetching redirect URL:", error);
                    console.log("Error fetching URL. Redirecting to default:", redirectUrl);
                }
            } else {
                // User is not logged in, redirect to default
                console.log("No user logged in. Redirecting to default:", redirectUrl);
            }

            // Perform the redirect
            window.location.href = redirectUrl;
        }
    });
});

// Optional: Basic check if the script is loaded
console.log("redirectsc.js loaded.");
