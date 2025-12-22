/**
 * Firebase configuration and initialization
 */

import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut as firebaseSignOut } from 'firebase/auth'
import { getFirestore, collection, doc, getDoc, setDoc, query, where, orderBy, limit, getDocs } from 'firebase/firestore'
import { getAnalytics } from 'firebase/analytics'

// Firebase configuration - Replace with your config
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "demo-api-key",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "cognify-ai.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "cognify-ai",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "cognify-ai.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:123456789:web:abcdef",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-XXXXXXXXXX"
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const auth = getAuth(app)
const db = getFirestore(app)
const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null
const googleProvider = new GoogleAuthProvider()

// Auth functions
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider)
    return { user: result.user, error: null }
  } catch (error) {
    return { user: null, error: error.message }
  }
}

export const signOut = async () => {
  try {
    await firebaseSignOut(auth)
    return { error: null }
  } catch (error) {
    return { error: error.message }
  }
}

// Firestore functions
export const getUserData = async (userId) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId))
    if (userDoc.exists()) {
      return { data: userDoc.data(), error: null }
    }
    return { data: null, error: 'User not found' }
  } catch (error) {
    return { data: null, error: error.message }
  }
}

export const getUserStats = async (userId) => {
  try {
    // Try to get from users/{userId}/stats/summary
    const statsDoc = await getDoc(doc(db, 'users', userId, 'stats', 'summary'))
    if (statsDoc.exists()) {
      return { data: statsDoc.data(), error: null }
    }
    
    // Fallback: try old stats collection
    const oldStatsDoc = await getDoc(doc(db, 'stats', userId))
    if (oldStatsDoc.exists()) {
      return { data: oldStatsDoc.data(), error: null }
    }
    
    // Return default stats if not found
    return {
      data: {
        solvedCount: 0,
        weakTopics: [],
        strongTopics: [],
        avgInterviewScore: 0,
        totalInterviews: 0,
        problemsByDifficulty: { easy: 0, medium: 0, hard: 0 },
        topicsSolved: {}
      },
      error: null
    }
  } catch (error) {
    return { data: null, error: error.message }
  }
}

export const getUserProblems = async (userId, limitCount = 50) => {
  try {
    // Simple query without orderBy to avoid index requirement
    const problemsRef = collection(db, 'users', userId, 'problems')
    const snapshot = await getDocs(problemsRef)
    
    // Sort in JavaScript instead of Firestore
    const problems = snapshot.docs
      .map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      .sort((a, b) => (b.solvedAt || 0) - (a.solvedAt || 0))
      .slice(0, limitCount)
    
    return { data: problems, error: null }
  } catch (error) {
    console.error('Error fetching problems:', error)
    return { data: [], error: error.message }
  }
}

export const getInterviewReports = async (userId, limitCount = 10) => {
  try {
    // Simple query without orderBy to avoid index requirement
    const interviewsRef = collection(db, 'users', userId, 'interviews')
    const snapshot = await getDocs(interviewsRef)
    
    // Sort in JavaScript instead of Firestore
    const reports = snapshot.docs
      .map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))
      .slice(0, limitCount)
    
    return { data: reports, error: null }
  } catch (error) {
    console.error('Error fetching interviews:', error)
    // Return empty array instead of failing
    return { data: [], error: null }
  }
}

export const getProgressData = async (userId) => {
  try {
    // Try new structure: users/{userId}/progress/current
    const progressDoc = await getDoc(doc(db, 'users', userId, 'progress', 'current'))
    if (progressDoc.exists()) {
      return { data: progressDoc.data(), error: null }
    }
    
    // Fallback to old structure
    const oldProgressDoc = await getDoc(doc(db, 'progress', userId))
    if (oldProgressDoc.exists()) {
      return { data: oldProgressDoc.data(), error: null }
    }
    
    return { data: null, error: 'Progress not found' }
  } catch (error) {
    return { data: null, error: error.message }
  }
}

export const getUserActivities = async (userId, limitCount = 50) => {
  try {
    // Simple query without orderBy to avoid index requirement
    const activitiesRef = collection(db, 'users', userId, 'activities')
    const snapshot = await getDocs(activitiesRef)
    
    // Sort in JavaScript instead of Firestore
    const activities = snapshot.docs
      .map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))
      .slice(0, limitCount)
    
    return { data: activities, error: null }
  } catch (error) {
    console.error('Error fetching activities:', error)
    return { data: [], error: error.message }
  }
}

export const getUserInteractions = async (userId, limitCount = 100) => {
  try {
    // Simple query without orderBy to avoid index requirement
    const interactionsRef = collection(db, 'users', userId, 'interactions')
    const snapshot = await getDocs(interactionsRef)
    
    // Sort in JavaScript instead of Firestore
    const interactions = snapshot.docs
      .map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))
      .slice(0, limitCount)
    
    return { data: interactions, error: null }
  } catch (error) {
    console.error('Error fetching interactions:', error)
    return { data: [], error: error.message }
  }
}

export { auth, db, analytics }
export default app
