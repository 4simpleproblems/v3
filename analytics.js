// analytics.js
document.addEventListener('DOMContentLoaded', () => {
  const auth = firebase.auth();
  const errorContainer = document.getElementById('errorContainer');

  // Helper to show errors
  function showError(message) {
    if (errorContainer) {
      errorContainer.textContent = `Firestore error: ${message}`;
      errorContainer.style.display = 'block';
    }
    document.querySelectorAll('.stat-card, .chart-container').forEach(el => {
      el.classList.add('error-card');
    });
  }

  // Logout button
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      try {
        await auth.signOut();
        window.location.href = 'index.html';
      } catch (error) {
        alert('Failed to log out. Please try again.');
      }
    });
  }

  // Main analytics loader
  auth.onAuthStateChanged(async user => {
    if (!user) {
      window.location.href = 'login.html';
      return;
    }

    try {
      const db = firebase.firestore();

      // Fetch data in parallel
      const [configDoc, userActivityDoc, deviceDistDoc, performanceDoc, regionsSnapshot] = await Promise.all([
        db.collection('config').doc('analytics').get(),
        db.collection('analytics').doc('userActivity').get(),
        db.collection('analytics').doc('deviceDistribution').get(),
        db.collection('analytics').doc('performance').get(),
        db.collection('analytics').doc('regions').collection('top').get()
      ]);

      // Check for missing docs
      if (!configDoc.exists || !userActivityDoc.exists || !deviceDistDoc.exists || !performanceDoc.exists) {
        showError('Some analytics documents are missing in Firestore.');
        return;
      }

      // Example: update stat cards (replace with your actual data structure)
      const stats = {
        totalUsers: userActivityDoc.data().totalUsers || 'N/A',
        activeSessions: userActivityDoc.data().activeSessions || 'N/A',
        avgSessionTime: performanceDoc.data().avgSessionTime || 'N/A',
        conversionRate: performanceDoc.data().conversionRate || 'N/A'
      };
      for (const key in stats) {
        const card = document.querySelector(`.stat-card[data-stat="${key}"] .stat-value`);
        if (card) card.textContent = stats[key];
      }

      // Example: update charts (implement your own chart logic)
      // You can use Chart.js here, e.g., updateActivityChart(userActivityDoc.data());
      // updateUserDistributionChart(deviceDistDoc.data());
      // updatePerformanceChart(performanceDoc.data());

      // Example: update regions table
      const regionsTable = document.getElementById('regionsTable');
      if (regionsTable && !regionsSnapshot.empty) {
        const tbody = document.createElement('tbody');
        regionsSnapshot.forEach(doc => {
          const data = doc.data();
          const tr = document.createElement('tr');
          tr.innerHTML = `
            <td>${data.region || 'N/A'}</td>
            <td>${data.users || 0}</td>
            <td>${data.sessions || 0}</td>
            <td>${data.avgTime || 0}</td>
            <td>${data.conversion || 0}%</td>
          `;
          tbody.appendChild(tr);
        });
        // Remove old tbody if exists
        const oldTbody = regionsTable.querySelector('tbody');
        if (oldTbody) oldTbody.remove();
        regionsTable.appendChild(tbody);
      }

    } catch (error) {
      // Show Firestore error
      showError(error.message);
    }
  });
});
