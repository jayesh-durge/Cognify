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
    const statsDoc = await getDoc(doc(db, 'stats', userId))
    if (statsDoc.exists()) {
      return { data: statsDoc.data(), error: null }
    }
    
    // Return default stats if not found
    return {
      data: {
        solvedCount: 0,
        weakTopics: [],
        strongTopics: [],
        avgInterviewScore: 0,
        totalInterviews: 0,
        problemsByDifficulty: { easy: 0, medium: 0, hard: 0 }
      },
      error: null
    }
  } catch (error) {
    return { data: null, error: error.message }
  }
}

export const getInterviewReports = async (userId, limitCount = 10) => {
  try {
    const q = query(
      collection(db, 'interviews'),
      where('userId', '==', userId),
      orderBy('timestamp', 'desc'),
      limit(limitCount)
    )
    
    const snapshot = await getDocs(q)
    const reports = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
    
    return { data: reports, error: null }
  } catch (error) {
    return { data: [], error: error.message }
  }
}

export const getProgressData = async (userId) => {
  try {
    const progressDoc = await getDoc(doc(db, 'progress', userId))
    if (progressDoc.exists()) {
      return { data: progressDoc.data(), error: null }
    }
    return { data: null, error: 'Progress not found' }
  } catch (error) {
    return { data: null, error: error.message }
  }
}

export { auth, db, analytics }
export default app
