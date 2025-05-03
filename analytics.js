// analytics.js - Updated error handling
document.addEventListener('DOMContentLoaded', () => {
  const auth = firebase.auth();
  const errorContainer = document.getElementById('errorContainer');

  const showError = (message) => {
    errorContainer.textContent = `Firestore Error: ${message}`;
    errorContainer.style.display = 'block';
    document.querySelectorAll('.stat-card, .chart-container').forEach(el => {
      el.classList.add('error-card');
    });
  };

  auth.onAuthStateChanged(async user => {
    if (!user) return window.location.href = 'login.html';
    
    try {
      const db = firebase.firestore();
      
      // Verify user token first
      const token = await user.getIdTokenResult();
      if (!token.claims.analyticsAccess) {
        throw new Error('User not authorized for analytics access');
      }

      const [configDoc, userActivity, deviceData] = await Promise.all([
        db.collection('config').doc('analytics').get(),
        db.collection('analytics').doc('userActivity').get(),
        db.collection('analytics').doc('deviceDistribution').get()
      ]);

      if (!configDoc.exists || !userActivity.exists || !deviceData.exists) {
        throw new Error('Required analytics data not found in Firestore');
      }

      // Process valid data here

    } catch (error) {
      console.error('Firestore Error:', error);
      const errorMsg = error.message.includes('permission-denied') ? 
        'Firestore security rules blocked access - check authentication status' : 
        error.message;
      showError(errorMsg);
    }
  });
});
