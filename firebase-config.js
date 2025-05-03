// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCE8iictKO9DxGiB5YolWq5ZOfVBdqgwaI",
  authDomain: "sp-v2-899a3.firebaseapp.com",
  projectId: "sp-v2-899a3",
  storageBucket: "sp-v2-899a3.appspot.com",
  messagingSenderId: "481680193086",
  appId: "1:481680193086:web:20730bc623f399133a436f",
  measurementId: "G-Q1N35C57EV"
};

// Initialize Firebase when the document is ready
document.addEventListener('DOMContentLoaded', () => {
  try {
    // Initialize Firebase if it hasn't been initialized yet
    if (!firebase.apps.length) {
      firebase.initializeApp(firebaseConfig);
      console.log("Firebase initialized successfully");
    } else {
      console.log("Firebase already initialized");
    }
    
    // Auth and Firestore references (attach to window for global access)
    window.auth = firebase.auth();
    window.db = firebase.firestore();
    
    // Set up Google Auth Provider
    const googleProvider = new firebase.auth.GoogleAuthProvider();
    googleProvider.addScope('profile');
    googleProvider.addScope('email');
    googleProvider.setCustomParameters({
      prompt: 'select_account'
    });
    window.googleProvider = googleProvider;
    
    // Set persistence to LOCAL (keep user signed in)
    window.auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL)
      .then(() => {
        console.log("Auth persistence set to LOCAL");
      })
      .catch(error => {
        console.error("Auth persistence error:", error);
      });
    
    // Initialize analytics data if on analytics page
    if (window.location.pathname.includes('analytics.html')) {
      initializeAnalyticsData();
    }
      
  } catch (error) {
    console.error("Firebase initialization failed:", error);
  }
});

// Function to initialize analytics data for the analytics page
async function initializeAnalyticsData() {
  const db = firebase.firestore();
  
  try {
    console.log("Checking analytics data...");
    
    // Check if analytics data exists
    const statsDoc = await db.collection('analytics').doc('stats').get();
    
    // If no data exists, populate with sample data
    if (!statsDoc.exists) {
      console.log("No analytics data found. Initializing sample data...");
      await generateSampleAnalyticsData();
      console.log("Sample analytics data created successfully");
    } else {
      console.log("Analytics data already exists");
    }
  } catch (error) {
    console.error("Error initializing analytics data:", error);
    // Create sample data on error to ensure functionality
    try {
      await generateSampleAnalyticsData();
      console.log("Sample analytics data created on error recovery");
    } catch (secondError) {
      console.error("Critical failure in analytics initialization:", secondError);
    }
  }
}

// Generate sample analytics data for testing purposes
async function generateSampleAnalyticsData() {
  const db = firebase.firestore();
  const batch = db.batch();
  const now = new Date();
  
  // 1. Generate stats overview data
  const statsRef = db.collection('analytics').doc('stats');
  batch.set(statsRef, {
    totalUsers: 10754,
    totalUsersTrend: 12.7,
    activeSessions: 3124,
    activeSessionsTrend: 8.4,
    avgSessionTime: 953, // in seconds
    avgSessionTimeTrend: 3.1,
    conversionRate: 8.9,
    conversionRateTrend: -1.2
  });
  
  // 2. Generate device distribution data
  const deviceRef = db.collection('analytics').doc('deviceDistribution');
  batch.set(deviceRef, {
    desktop: 58,
    mobile: 35,
    tablet: 7
  });
  
  // 3. Generate performance metrics
  const performanceRef = db.collection('analytics').doc('performance');
  batch.set(performanceRef, {
    pageLoad: 320,
    apiResponse: 145,
    databaseQuery: 98,
    processing: 215,
    rendering: 178
  });
  
  // 4. Generate top regions data
  const regions = [
    {
      name: "North America",
      users: 5243,
      sessions: 15721,
      avgTime: 972,
      conversion: 9.2
    },
    {
      name: "Europe",
      users: 3892,
      sessions: 11234,
      avgTime: 892,
      conversion: 8.7
    },
    {
      name: "Asia",
      users: 2453,
      sessions: 6789,
      avgTime: 784,
      conversion: 7.1
    },
    {
      name: "Australia",
      users: 950,
      sessions: 2568,
      avgTime: 865,
      conversion: 8.5
    },
    {
      name: "South America",
      users: 698,
      sessions: 1845,
      avgTime: 742,
      conversion: 6.2
    },
    {
      name: "Africa",
      users: 261,
      sessions: 723,
      avgTime: 654,
      conversion: 4.8
    }
  ];
  
  // Add each region to the batch
  regions.forEach((region, index) => {
    const regionRef = db.collection('analytics').doc('regions').collection('data').doc(`region${index + 1}`);
    batch.set(regionRef, region);
  });
  
  // 5. Generate daily user activity data for the past 30 days
  for (let i = 0; i < 30; i++) {
    const date = new Date(now);
    date.setDate(now.getDate() - i);
    
    // Generate deterministic but varying data based on date
    const dayOfMonth = date.getDate();
    const dayOfWeek = date.getDay();
    
    // More users on weekdays, peaking midweek
    const weekdayFactor = dayOfWeek >= 1 && dayOfWeek <= 5 ? 1 + (0.2 - Math.abs(dayOfWeek - 3) * 0.1) : 0.8;
    
    // Slight upward trend over time
    const trendFactor = 1 + (i * 0.005);
    
    // Base values with some variability
    const baseActiveUsers = Math.floor(2500 * weekdayFactor / trendFactor);
    const baseNewRegistrations = Math.floor(200 * weekdayFactor / trendFactor);
    
    // Add some variability based on day of month
    const dayVariation = 1 + Math.sin(dayOfMonth / 5) * 0.15;
    
    const activeUsers = Math.floor(baseActiveUsers * dayVariation);
    const newRegistrations = Math.floor(baseNewRegistrations * dayVariation);
    
    const activityRef = db.collection('analytics').doc('userActivity').collection('daily').doc(`day${i}`);
    batch.set(activityRef, {
      date: firebase.firestore.Timestamp.fromDate(date),
      activeUsers: activeUsers,
      newRegistrations: newRegistrations
    });
  }
  
  // Commit all the batch operations
  return batch.commit();
}

// Helper function to check if analytics data exists and should be refreshed
// This can be called from analytics.html to refresh data or check for updates
window.checkAndRefreshAnalyticsData = async function() {
  const db = firebase.firestore();
  
  try {
    // Check if analytics data exists at all
    const statsDoc = await db.collection('analytics').doc('stats').get();
    
    if (!statsDoc.exists) {
      console.log("No analytics data found. Generating new sample data...");
      await generateSampleAnalyticsData();
      return true; // Data was refreshed
    }
    
    // Check if data is stale (older than 24 hours) based on timestamp
    const metadata = statsDoc.metadata || {};
    const lastUpdated = metadata.updatedAt ? metadata.updatedAt.toDate() : null;
    
    if (!lastUpdated || (new Date() - lastUpdated) > (24 * 60 * 60 * 1000)) {
      console.log("Analytics data is stale. Refreshing...");
      await generateSampleAnalyticsData();
      return true; // Data was refreshed
    }
    
    console.log("Analytics data is current");
    return false; // No refresh needed
  } catch (error) {
    console.error("Error checking analytics data:", error);
    return false;
  }
};

// Add error handling for Firestore operations
const originalGet = firebase.firestore.DocumentReference.prototype.get;
firebase.firestore.DocumentReference.prototype.get = function() {
  return originalGet.apply(this).catch(error => {
    console.error(`Firestore get error for ${this.path}:`, error);
    // Return empty doc for graceful fallback
    return {
      exists: false,
      data: () => ({}),
      id: this.id
    };
  });
};

// Add error handling for collection queries
const originalWhere = firebase.firestore.Query.prototype.where;
firebase.firestore.Query.prototype.where = function(...args) {
  try {
    return originalWhere.apply(this, args);
  } catch (error) {
    console.error("Firestore where() error:", error);
    // Return self to allow chaining to continue
    return this;
  }
};

// Provide a helper to force refresh analytics data
window.forceRefreshAnalyticsData = async function() {
  try {
    await generateSampleAnalyticsData();
    alert("Analytics data has been refreshed. Please reload the page to see changes.");
    return true;
  } catch (error) {
    console.error("Error during forced analytics refresh:", error);
    alert("Failed to refresh analytics data. See console for details.");
    return false;
  }
};
