import React, { createContext, useContext, useState, useEffect } from 'react'
import { auth, signInWithGoogle as firebaseSignIn, signOut as firebaseSignOut } from '../services/firebase'
import { onAuthStateChanged } from 'firebase/auth'

const AuthContext = createContext({})

export function useAuth() {
  return useContext(AuthContext)
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user)
      setLoading(false)
      
      // Sync auth to extension if logged in
      if (user) {
        const token = await user.getIdToken()
        
        // Post message to window (extension will listen)
        window.postMessage({
          type: 'COGNIFY_AUTH',
          userId: user.uid,
          token,
          displayName: user.displayName,
          email: user.email
        }, window.location.origin)
        
        console.log('✅ Auth synced to extension')
      } else {
        // Notify logout
        window.postMessage({
          type: 'COGNIFY_LOGOUT'
        }, window.location.origin)
      }
    })

    return unsubscribe
  }, [])

  const signIn = async () => {
    const { user, error } = await firebaseSignIn()
    if (error) {
      console.error('Sign in error:', error)
      return { error }
    }
    return { user }
  }

  const signOut = async () => {
    const { error } = await firebaseSignOut()
    if (error) {
      console.error('Sign out error:', error)
      return { error }
    }
    setUser(null)
    return {}
  }

  const value = {
    user,
    loading,
    signIn,
    signOut
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
