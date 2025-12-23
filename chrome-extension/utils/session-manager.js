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
    // First check in-memory cache
    if (!this.sessions.has(tabId)) {
      // Try to recover from storage first
      console.log('🔄 Session not in memory, attempting recovery for tab:', tabId);
      const recovered = await this.recoverSession(tabId);
      
      if (recovered) {
        console.log('✅ Session recovered from storage:', recovered.id);
        console.log('📊 Recovered problem:', recovered.currentProblem?.title || 'None');
        return recovered;
      }
      
      // No stored session, create new one
      console.log('🆕 Creating new session for tab:', tabId);
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
      metadata: {},
      interviewState: {
        active: false,
        questionsAsked: 0,
        questionTimers: [],
        scores: [],
        lastQuestionTime: null,
        awaitingAnswer: false,
        questionContext: []
      }
    };
  }

  /**
   * Save session data
   */
  async saveSession(tabId, sessionData) {
    this.sessions.set(tabId, sessionData);
    
    // Persist to storage for recovery
    const storageKey = `session_${tabId}`;
    const storageData = {
      ...sessionData,
      lastUpdated: Date.now()
    };
    
    await chrome.storage.local.set({
      [storageKey]: storageData
    });
    
    console.log('💾 Session saved for tab:', tabId, '- Problem:', sessionData.currentProblem?.title || 'None');
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
