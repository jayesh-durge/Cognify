/**
 * Authentication Service - Handles user authentication in the extension
 * Uses Firebase REST API for authentication (no SDK needed)
 */

import { config } from '../config/config.js';

export class AuthService {
  constructor() {
    this.user = null;
    // Don't call async init in constructor
  }

  async init() {
    // Load cached user
    const result = await chrome.storage.local.get(['user_id', 'user_profile', 'auth_token']);
    if (result.user_id) {
      this.user = {
        uid: result.user_id,
        ...result.user_profile
      };
      console.log('✅ User loaded from cache:', this.user.displayName);
    }
  }

  /**
   * Sign in with Google - Open dashboard for auth
   */
  async signInWithGoogle() {
    try {
      console.log('🔐 Starting sign-in flow...');

      // Open dashboard in new tab for authentication
      const dashboardUrl = 'http://localhost:3000';
      
      return new Promise((resolve) => {
        chrome.tabs.create({ url: dashboardUrl }, (tab) => {
          console.log('📱 Dashboard opened for sign-in');
          
          // Listen for auth sync from dashboard
          const listener = (changes, area) => {
            if (area === 'local' && changes.user_id) {
              console.log('✅ Auth received from dashboard');
              chrome.storage.onChanged.removeListener(listener);
              
              // Load user data
              chrome.storage.local.get(['user_id', 'user_profile'], (result) => {
                if (result.user_id) {
                  this.user = {
                    uid: result.user_id,
                    ...result.user_profile
                  };
                  resolve({ 
                    success: true, 
                    user: this.user,
                    message: 'Signed in successfully! You can close the dashboard tab.'
                  });
                }
              });
            }
          };
          
          chrome.storage.onChanged.addListener(listener);
          
          // Timeout after 2 minutes
          setTimeout(() => {
            chrome.storage.onChanged.removeListener(listener);
            resolve({ 
              success: false, 
              error: 'Sign-in timeout. Please sign in to the dashboard within 2 minutes.' 
            });
          }, 120000);
        });
      });
    } catch (error) {
      const errorMsg = error.message || error.toString();
      console.error('❌ Sign-in failed:', errorMsg, error);
      return { success: false, error: errorMsg };
    }
  }

  /**
   * Sign out
   */
  async signOut() {
    try {
      // Clear storage
      await chrome.storage.local.remove(['user_id', 'auth_token', 'user_profile']);
      
      this.user = null;
      console.log('✅ User signed out');

      return { success: true };
    } catch (error) {
      console.error('❌ Sign-out failed:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get current user
   */
  async getCurrentUser() {
    if (this.user) {
      return this.user;
    }

    // Try to load from storage
    await this.init();
    return this.user;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated() {
    return !!this.user;
  }

  /**
   * Get ID token for API calls
   */
  async getIdToken() {
    const result = await chrome.storage.local.get('auth_token');
    return result.auth_token || null;
  }
}
