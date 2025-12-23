/**
 * Configuration file for Cognify extension
 * Contains API endpoints, feature flags, and constants
 */

export const config = {
  // Gemini API Configuration
  GEMINI_API_KEY: '', // User must provide in settings
  GEMINI_MODEL: 'gemini-2.5-flash',
  
  // Firebase Configuration
  FIREBASE_CONFIG: {
    apiKey: "AIzaSyBVh7yZQR8rZJ9xKjN7HFgEQpZ8vW4xYzQ",
    authDomain: "cognify-68642.firebaseapp.com",
    projectId: "cognify-68642",
    storageBucket: "cognify-68642.firebasestorage.app",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abcdef"
  },
  FIREBASE_FUNCTIONS_URL: 'https://us-central1-cognify-ai.cloudfunctions.net',
  FIREBASE_PROJECT_ID: 'cognify-68642',
  
  // Feature Flags
  FEATURES: {
    voiceInterview: false, // Premium feature
    autoAnalysis: true,
    offlineMode: false,
    betaFeatures: false
  },
  
  // Rate Limiting
  RATE_LIMITS: {
    hintsPerHour: 20,
    interviewsPerDay: 3,
    analysisPerHour: 10
  },
  
  // Interview Configuration
  INTERVIEW: {
    defaultDuration: 45, // minutes
    phases: ['problem_understanding', 'coding', 'optimization', 'edge_cases'],
    maxHintsInInterview: 3
  },
  
  // Supported Platforms
  PLATFORMS: {
    leetcode: {
      name: 'LeetCode',
      enabled: true,
      editorType: 'monaco'
    },
    codechef: {
      name: 'CodeChef',
      enabled: true,
      editorType: 'codemirror'
    },
    codeforces: {
      name: 'Codeforces',
      enabled: true,
      editorType: 'ace'
    },
    geeksforgeeks: {
      name: 'GeeksforGeeks',
      enabled: true,
      editorType: 'monaco'
    }
  },
  
  // UI Configuration
  UI: {
    panelPosition: 'right', // left, right
    panelWidth: 400,
    theme: 'auto', // light, dark, auto
    animations: true
  },
  
  // Analytics
  ANALYTICS: {
    enabled: true,
    trackHints: true,
    trackProgress: true,
    trackInterviews: true
  },
  
  // Version
  VERSION: '1.0.0',
  
  // Update URLs
  URLS: {
    dashboard: 'https://cognify-ai.web.app',
    feedback: 'https://forms.gle/cognify-feedback',
    docs: 'https://docs.cognify-ai.com',
    apiKeyHelp: 'https://aistudio.google.com/app/apikey'
  }
};
