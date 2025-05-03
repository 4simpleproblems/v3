// analytics.js
document.addEventListener('DOMContentLoaded', () => {
  const auth = firebase.auth();
  const errorContainer = document.getElementById('errorContainer');

  const showError = (message) => {
    errorContainer.textContent = `Unable to retrieve data: ${message}`;
    errorContainer.style.display = 'block';
    document.querySelectorAll('.stat-card').forEach(card => {
      card.classList.add('error-card');
    });
  };

  auth.onAuthStateChanged(async user => {
    if (!user) return window.location.href = 'login.html';
    
    try {
      const db = firebase.firestore();
      const configDoc = await db.collection('config').doc('analytics').get();
      
      if (!configDoc.exists) {
        throw new Error('Analytics configuration missing in Firestore');
      }

      const [userActivity, deviceData] = await Promise.all([
        db.collection('analytics').doc('userActivity').get(),
        db.collection('analytics').doc('deviceDistribution').get()
      ]);

      if (!userActivity.exists || !deviceData.exists) {
        throw new Error('Required analytics documents not found in Firestore');
      }

      // If we reach here, data exists - process normally

    } catch (error) {
      console.error('Analytics Error:', error);
      showError(error.message.includes('Firestore') ? 
        'Firestore connection failed - check security rules' : 
        error.message);
        
      document.getElementById('timeframe').disabled = true;
    }
  });
});
