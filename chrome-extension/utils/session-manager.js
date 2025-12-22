/**
 * Session Manager - Manages user sessions per tab
 * Tracks problem-solving progress, hints, and interview state
 */

export class SessionManager {
  constructor() {
    this.sessions = new Map();
  }

  /**
   * Get or create session for a tab
   */
  async getCurrentSession(tabId) {
    if (!this.sessions.has(tabId)) {
      this.sessions.set(tabId, this.createNewSession());
    }
    return this.sessions.get(tabId);
  }

  /**
   * Create a fresh session
   */
  createNewSession() {
    return {
      id: this.generateSessionId(),
      startTime: Date.now(),
      currentProblem: null,
      hints: [],
      codeIterations: [],
      interview: null,
      mode: 'practice',
      metadata: {}
    };
  }

  /**
   * Save session data
   */
  async saveSession(tabId, sessionData) {
    this.sessions.set(tabId, sessionData);
    
    // Persist to storage for recovery
    await chrome.storage.local.set({
      [`session_${tabId}`]: {
        ...sessionData,
        lastUpdated: Date.now()
      }
    });
  }

  /**
   * Clear session when tab closes
   */
  async clearSession(tabId) {
    this.sessions.delete(tabId);
    await chrome.storage.local.remove(`session_${tabId}`);
  }

  /**
   * Recover session from storage
   */
  async recoverSession(tabId) {
    const result = await chrome.storage.local.get(`session_${tabId}`);
    const sessionData = result[`session_${tabId}`];
    
    if (sessionData) {
      this.sessions.set(tabId, sessionData);
      return sessionData;
    }
    
    return null;
  }

  /**
   * Get all active sessions
   */
  getAllSessions() {
    return Array.from(this.sessions.entries()).map(([tabId, session]) => ({
      tabId,
      ...session
    }));
  }

  /**
   * Generate unique session ID
   */
  generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Clean up old sessions (garbage collection)
   */
  async cleanupOldSessions() {
    const allKeys = await chrome.storage.local.get(null);
    const now = Date.now();
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours

    for (const key in allKeys) {
      if (key.startsWith('session_')) {
        const session = allKeys[key];
        if (now - session.lastUpdated > maxAge) {
          await chrome.storage.local.remove(key);
        }
      }
    }
  }
}
