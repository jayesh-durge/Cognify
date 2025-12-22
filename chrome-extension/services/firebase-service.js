/**
 * Firebase Service - Handles authentication and data sync
 * Connects extension to web dashboard via Firestore
 */

import { config } from '../config/config.js';

export class FirebaseService {
  constructor() {
    this.initialized = false;
    this.userId = null;
    this.init();
  }

  async init() {
    // Get user ID from storage (set during auth)
    const result = await chrome.storage.local.get('user_id');
    this.userId = result.user_id;
    this.initialized = true;
  }

  /**
   * Log user interaction for analytics
   */
  async logInteraction(data) {
    if (!this.userId) {
      console.warn('User not authenticated, skipping interaction log');
      return;
    }

    try {
      const endpoint = `${config.FIREBASE_FUNCTIONS_URL}/logInteraction`;
      await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await this.getAuthToken()}`
        },
        body: JSON.stringify({
          userId: this.userId,
          ...data
        })
      });
    } catch (error) {
      console.error('Failed to log interaction:', error);
    }
  }

  /**
   * Save interview report to Firestore
   */
  async saveInterviewReport(report) {
    if (!this.userId) return;

    try {
      const endpoint = `${config.FIREBASE_FUNCTIONS_URL}/saveInterviewReport`;
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await this.getAuthToken()}`
        },
        body: JSON.stringify({
          userId: this.userId,
          report,
          timestamp: Date.now()
        })
      });

      return await response.json();
    } catch (error) {
      console.error('Failed to save interview report:', error);
      throw error;
    }
  }

  /**
   * Sync user progress to dashboard
   */
  async syncProgress(progressData) {
    if (!this.userId) return;

    try {
      const endpoint = `${config.FIREBASE_FUNCTIONS_URL}/syncProgress`;
      await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await this.getAuthToken()}`
        },
        body: JSON.stringify({
          userId: this.userId,
          progress: progressData,
          timestamp: Date.now()
        })
      });
    } catch (error) {
      console.error('Failed to sync progress:', error);
    }
  }

  /**
   * Get user statistics from Firestore
   */
  async getUserStats() {
    if (!this.userId) {
      return this.getDefaultStats();
    }

    try {
      const endpoint = `${config.FIREBASE_FUNCTIONS_URL}/getUserStats?userId=${this.userId}`;
      const response = await fetch(endpoint, {
        headers: {
          'Authorization': `Bearer ${await this.getAuthToken()}`
        }
      });

      if (!response.ok) throw new Error('Failed to fetch stats');
      
      return await response.json();
    } catch (error) {
      console.error('Failed to get user stats:', error);
      return this.getDefaultStats();
    }
  }

  /**
   * Get auth token from storage
   */
  async getAuthToken() {
    const result = await chrome.storage.local.get('auth_token');
    return result.auth_token || '';
  }

  /**
   * Set user authentication
   */
  async setAuth(userId, token) {
    this.userId = userId;
    await chrome.storage.local.set({
      user_id: userId,
      auth_token: token
    });
  }

  /**
   * Sign out user
   */
  async signOut() {
    this.userId = null;
    await chrome.storage.local.remove(['user_id', 'auth_token']);
  }

  /**
   * Default stats for unauthenticated users
   */
  getDefaultStats() {
    return {
      solvedCount: 0,
      weakTopics: [],
      strongTopics: [],
      avgInterviewScore: 0,
      totalInterviews: 0,
      problemsByDifficulty: {
        easy: 0,
        medium: 0,
        hard: 0
      }
    };
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated() {
    return !!this.userId;
  }
}
