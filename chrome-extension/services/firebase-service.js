/**
 * Firebase Service - Handles authentication and data sync
 * Connects extension to web dashboard via Firestore
 */

import { config } from '../config/config.js';

export class FirebaseService {
  constructor() {
    this.initialized = false;
    this.userId = null;
    this.firebaseConfig = null;
    this.init();
  }

  async init() {
    // Get user ID and Firebase config from storage
    const result = await chrome.storage.local.get(['user_id', 'firebase_config']);
    this.userId = result.user_id;
    this.firebaseConfig = result.firebase_config;
    
    if (!this.firebaseConfig) {
      console.log('🔧 Firebase config not found, using default');
      // Store default config
      this.firebaseConfig = {
        apiKey: "AIzaSyBVh7yZQR8rZJ9xKjN7HFgEQpZ8vW4xYzQ",
        authDomain: "cognify-68642.firebaseapp.com",
        projectId: "cognify-68642",
        storageBucket: "cognify-68642.firebasestorage.app",
        messagingSenderId: "123456789",
        appId: "1:123456789:web:abcdef"
      };
      await chrome.storage.local.set({ firebase_config: this.firebaseConfig });
    }
    
    this.initialized = true;
    console.log('✅ Firebase service initialized', this.userId ? 'with user' : 'anonymous');
  }

  /**
   * Log problem solved - syncs to Firestore
   */
  async logProblemSolved(problemData) {
    console.log('📊 Logging problem solved:', problemData);
    
    if (!this.userId) {
      console.warn('⚠️ User not authenticated, storing locally only');
      await this.storeLocalProgress(problemData);
      return;
    }

    try {
      const solvedProblem = {
        userId: this.userId,
        problemId: problemData.id || this.generateProblemId(problemData),
        title: problemData.title,
        difficulty: problemData.difficulty,
        topics: problemData.topics || [],
        platform: problemData.platform || 'leetcode',
        solvedAt: Date.now(),
        timeSpent: problemData.timeSpent || 0,
        hintsUsed: problemData.hintsUsed || 0,
        codeAnalyses: problemData.codeAnalyses || 0,
        mode: problemData.mode || 'practice' // practice, interview, learning
      };

      // Send to Firestore via REST API
      const response = await this.writeToFirestore(`users/${this.userId}/problems/${solvedProblem.problemId}`, solvedProblem);
      
      // Update user stats
      await this.updateUserStats(solvedProblem);
      
      // Log activity
      await this.logActivity({
        type: 'problem_solved',
        problemId: solvedProblem.problemId,
        difficulty: solvedProblem.difficulty,
        platform: solvedProblem.platform,
        timeSpent: solvedProblem.timeSpent,
        hintsUsed: solvedProblem.hintsUsed
      });
      
      // Update progress metrics
      const stats = await this.readFromFirestore(`users/${this.userId}/stats/summary`);
      if (stats) {
        await this.updateProgressMetrics({
          totalSolved: stats.solvedCount || 0,
          recentActivity: Date.now(),
          streak: this.calculateStreak(stats),
          efficiency: this.calculateEfficiency(solvedProblem)
        });
      }
      
      console.log('✅ Problem logged to Firebase');
      return response;
    } catch (error) {
      console.error('❌ Failed to log problem:', error);
      await this.storeLocalProgress(problemData);
    }
  }

  /**
   * Log activity - track all user interactions
   */
  async logActivity(activityData) {
    if (!this.userId) return;

    try {
      const activityId = `activity_${Date.now()}`;
      const activity = {
        userId: this.userId,
        ...activityData,
        timestamp: Date.now()
      };

      await this.writeToFirestore(`users/${this.userId}/activities/${activityId}`, activity);
      console.log('✅ Activity logged:', activityData.type);
    } catch (error) {
      console.error('❌ Failed to log activity:', error);
    }
  }

  /**
   * Update user progress metrics
   */
  async updateProgressMetrics(metrics) {
    if (!this.userId) return;

    try {
      const progressData = {
        userId: this.userId,
        ...metrics,
        lastUpdated: Date.now()
      };

      await this.writeToFirestore(`users/${this.userId}/progress/current`, progressData);
      console.log('✅ Progress metrics updated');
    } catch (error) {
      console.error('❌ Failed to update progress:', error);
    }
  }

  /**
   * Update user analytics - strengths, weaknesses, stats
   */
  async updateAnalytics(analyticsData) {
    if (!this.userId) return { success: false, error: 'Not authenticated' };

    try {
      console.log('📊 Updating analytics:', analyticsData);
      
      // Get current analytics
      const currentAnalytics = await this.readFromFirestore(`users/${this.userId}/analytics/summary`);
      
      const updated = {
        userId: this.userId,
        totalInterviews: (currentAnalytics?.totalInterviews || 0) + (analyticsData.interviewCompleted ? 1 : 0),
        totalPractice: (currentAnalytics?.totalPractice || 0) + (analyticsData.practiceCompleted ? 1 : 0),
        avgCommunicationScore: analyticsData.avgCommunicationScore || currentAnalytics?.avgCommunicationScore || 0,
        avgTechnicalScore: analyticsData.avgTechnicalScore || currentAnalytics?.avgTechnicalScore || 0,
        avgOverallScore: analyticsData.avgOverallScore || currentAnalytics?.avgOverallScore || 0,
        strengths: analyticsData.strengths || currentAnalytics?.strengths || [],
        weaknesses: analyticsData.weaknesses || currentAnalytics?.weaknesses || [],
        lastUpdated: Date.now()
      };

      await this.writeToFirestore(`users/${this.userId}/analytics/summary`, updated);
      console.log('✅ Analytics updated successfully');
      return { success: true };
    } catch (error) {
      console.error('❌ Failed to update analytics:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Update topic proficiency tracking
   */
  async updateTopicProficiency(data) {
    if (!this.userId) return { success: false, error: 'Not authenticated' };

    try {
      console.log('🎯 Updating topic proficiency:', data);
      
      // Get current topic proficiencies
      const currentData = await this.readFromFirestore(`users/${this.userId}/analytics/topics`) || {};
      const topicPerformance = currentData.topicPerformance || {};
      
      // Update each topic
      for (const topicInfo of data.topics) {
        const { topic, proficiency, confidence } = topicInfo;
        
        if (!topicPerformance[topic]) {
          topicPerformance[topic] = {
            total: 0,
            strong: 0,
            needsPractice: 0,
            lastUpdated: Date.now(),
            confidence: 0
          };
        }
        
        topicPerformance[topic].total += 1;
        if (proficiency === 'strong') {
          topicPerformance[topic].strong += 1;
        } else {
          topicPerformance[topic].needsPractice += 1;
        }
        topicPerformance[topic].lastUpdated = Date.now();
        topicPerformance[topic].confidence = confidence || 0.5;
      }
      
      // Calculate overall strengths and weaknesses
      const topics = Object.entries(topicPerformance);
      const strengths = topics
        .filter(([_, data]) => data.strong >= data.needsPractice && data.total >= 2)
        .map(([topic]) => topic)
        .slice(0, 10);
      
      const weaknesses = topics
        .filter(([_, data]) => data.needsPractice > data.strong && data.total >= 2)
        .map(([topic]) => topic)
        .slice(0, 10);
      
      // Save updated data
      await this.writeToFirestore(`users/${this.userId}/analytics/topics`, {
        userId: this.userId,
        topicPerformance,
        strengths,
        weaknesses,
        lastUpdated: Date.now()
      });
      
      console.log('✅ Topic proficiency updated:', { strengths, weaknesses });
      return { success: true, strengths, weaknesses };
    } catch (error) {
      console.error('❌ Failed to update topic proficiency:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Save interview report to Firestore
   */
  async saveInterviewReport(report) {
    console.log('🎯 saveInterviewReport called');
    console.log('🔐 Current userId:', this.userId);
    console.log('📊 Report received:', JSON.stringify(report, null, 2));
    
    if (!this.userId) {
      console.error('❌ CRITICAL: User not authenticated, cannot save interview');
      console.error('💡 Make sure user is signed in on dashboard (localhost:3000)');
      console.error('💡 Check chrome.storage.local for user_id');
      return { success: false, error: 'User not authenticated' };
    }

    try {
      const interviewId = `interview_${Date.now()}`;
      
      console.log('📝 Preparing interview data for:', interviewId);
      console.log('✅ User authenticated:', this.userId);
      
      // Comprehensive interview data structure
      const interviewData = {
        userId: this.userId,
        id: interviewId,
        timestamp: report.timestamp || Date.now(),
        
        // Basic info
        problemId: report.problemId || 'unknown',
        problemTitle: report.problemTitle || report.problem?.title || 'Unknown Problem',
        platform: report.platform || 'leetcode',
        difficulty: report.difficulty || report.problem?.difficulty || 'medium',
      tags: report.tags || report.problem?.tags || [],
      hintsUsed: report.hintsUsed || 0,
        
        // Detailed scores from our new system - CRITICAL for dashboard
        scores: {
          communication: report.scores?.communication || report.finalScores?.communication || 0,
          technical: report.scores?.technical || report.finalScores?.technical || 0,
          overall: report.scores?.overall || report.finalScores?.overall || 0
        },
        
        // Interview duration and questions
        duration: report.duration || 0,
        questionsAsked: report.questionsAsked || 0,
        
        // Question-level scores with full details
        questionScores: report.questionScores || [],
        
        // Performance analysis
        strengths: report.strengths || report.finalScores?.strengths || [],
        areasToImprove: report.areasToImprove || report.finalScores?.improvements || [],
        
        // Feedback and evaluation
        feedback: report.feedback || report.report?.feedback || 'Interview completed',
        
        // Overall score for backward compatibility
        overallScore: report.overallScore || report.scores?.overall || report.finalScores?.overall || 0,
        
        // Topics and skills
        topicsCovered: report.topics || [],
        skillsTested: [],
        
        // Code statistics
        codeIterations: report.codeIterations || 0,
        syntaxErrors: report.syntaxErrors || 0,
        testsPassed: report.testsPassed || 0,
        totalTests: report.totalTests || 0,
        
        // Interview phases
        phases: report.phases || {
          problemUnderstanding: { completed: true, timeSpent: 0 },
          coding: { completed: true, timeSpent: 0 },
          testing: { completed: false, timeSpent: 0 },
          optimization: { completed: false, timeSpent: 0 }
        },
        
        // Additional metadata
        mode: report.mode || 'mock_interview',
        interviewer: report.interviewer || 'AI',
        company: report.company || null,
        position: report.position || null,
        
        // Success indicators
        solved: report.solved || report.status === 'completed',
        passedAllTests: report.passedAllTests || false,
        optimalSolution: report.optimalSolution || false
      };

      console.log('💾 Writing interview to Firestore...');
      console.log('📍 Path: users/' + this.userId + '/interviews/' + interviewId);
      console.log('📦 Data structure:', {
        hasScores: !!interviewData.scores,
        scoresDetail: interviewData.scores,
        hasQuestionScores: interviewData.questionScores?.length > 0,
        questionScoresCount: interviewData.questionScores?.length
      });

      const writeResult = await this.writeToFirestore(`users/${this.userId}/interviews/${interviewId}`, interviewData);
      
      console.log('✅ Interview written to Firestore successfully!');
      console.log('📄 Write result:', writeResult);
      
      // Log activity
      console.log('📝 Logging activity...');
      await this.logActivity({
        type: 'interview_completed',
        interviewId,
        score: interviewData.overallScore,
        status: interviewData.status,
        problemTitle: interviewData.problemTitle,
        duration: interviewData.duration,
        questionsAsked: interviewData.questionsAsked,
        platform: interviewData.platform
      });
      
      console.log('✅✅✅ Interview report saved with comprehensive data - SUCCESS!');
      return { success: true, interviewId };
    } catch (error) {
      console.error('❌❌❌ CRITICAL ERROR saving interview:', error);
      console.error('❌ Error stack:', error.stack);
      console.error('❌ Error message:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Update user stats (problems solved, difficulty breakdown, topics)
   */
  async updateUserStats(problemData) {
    if (!this.userId) return;

    try {
      // Get current stats
      const statsPath = `users/${this.userId}/stats/summary`;
      const currentStats = await this.readFromFirestore(statsPath) || this.getDefaultStats();

      // Update stats
      const uniqueProblems = currentStats.uniqueProblems || new Set();
      const problemKey = `${problemData.platform}_${problemData.problemId}`;
      
      if (!uniqueProblems.has(problemKey)) {
        uniqueProblems.add(problemKey);
        currentStats.solvedCount = (currentStats.solvedCount || 0) + 1;
        
        // Update difficulty count
        const diff = problemData.difficulty.toLowerCase();
        currentStats.problemsByDifficulty = currentStats.problemsByDifficulty || { easy: 0, medium: 0, hard: 0 };
        currentStats.problemsByDifficulty[diff] = (currentStats.problemsByDifficulty[diff] || 0) + 1;
      }

      // Update topics
      currentStats.topicsSolved = currentStats.topicsSolved || {};
      (problemData.topics || []).forEach(topic => {
        currentStats.topicsSolved[topic] = (currentStats.topicsSolved[topic] || 0) + 1;
      });

      // Calculate weak/strong topics
      const topicCounts = Object.entries(currentStats.topicsSolved);
      topicCounts.sort((a, b) => a[1] - b[1]);
      currentStats.weakTopics = topicCounts.slice(0, 3).map(t => t[0]);
      currentStats.strongTopics = topicCounts.slice(-3).reverse().map(t => t[0]);

      // Store unique problems as array
      currentStats.uniqueProblems = Array.from(uniqueProblems);
      currentStats.lastUpdated = Date.now();

      await this.writeToFirestore(statsPath, currentStats);
      console.log('✅ Stats updated');
    } catch (error) {
      console.error('❌ Failed to update stats:', error);
    }
  }

  /**
   * Write data to Firestore using REST API
   */
  async writeToFirestore(path, data) {
    const url = `https://firestore.googleapis.com/v1/projects/${this.firebaseConfig.projectId}/databases/(default)/documents/${path}`;
    
    console.log('🌐 Firestore REST API URL:', url);
    
    // Get auth token
    const authToken = await this.getAuthToken();
    console.log('🔑 Auth token:', authToken ? `${authToken.substring(0, 20)}...` : 'NO TOKEN');
    
    // Convert data to Firestore format
    const firestoreData = this.toFirestoreFormat(data);
    
    const headers = {
      'Content-Type': 'application/json'
    };
    
    // Add auth token if available
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }
    
    console.log('📤 Sending PATCH request to Firestore...');
    
    const response = await fetch(url, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ fields: firestoreData })
    });

    console.log('📥 Response status:', response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Firestore write error:', errorText);
      console.error('❌ Response status:', response.status);
      console.error('❌ Response headers:', Object.fromEntries(response.headers.entries()));
      throw new Error(`Firestore write failed: ${response.statusText} - ${errorText}`);
    }

    const result = await response.json();
    console.log('✅ Firestore write successful!');
    return result;
  }

  /**
   * Read data from Firestore using REST API
   */
  async readFromFirestore(path) {
    const url = `https://firestore.googleapis.com/v1/projects/${this.firebaseConfig.projectId}/databases/(default)/documents/${path}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error(`Firestore read failed: ${response.statusText}`);
    }

    const doc = await response.json();
    return this.fromFirestoreFormat(doc.fields);
  }

  /**
   * Convert JavaScript object to Firestore format
   */
  toFirestoreFormat(obj) {
    const result = {};
    for (const [key, value] of Object.entries(obj)) {
      if (value === null || value === undefined) continue;
      
      if (typeof value === 'string') {
        result[key] = { stringValue: value };
      } else if (typeof value === 'number') {
        result[key] = { integerValue: Math.floor(value) };
      } else if (typeof value === 'boolean') {
        result[key] = { booleanValue: value };
      } else if (Array.isArray(value)) {
        result[key] = {
          arrayValue: {
            values: value.map(v => {
              // Handle different types in arrays
              if (typeof v === 'string') {
                return { stringValue: v };
              } else if (typeof v === 'number') {
                return { integerValue: Math.floor(v) };
              } else if (typeof v === 'boolean') {
                return { booleanValue: v };
              } else if (typeof v === 'object' && v !== null) {
                // Recursively handle objects in arrays
                return { mapValue: { fields: this.toFirestoreFormat(v) } };
              }
              return { stringValue: String(v) };
            })
          }
        };
      } else if (typeof value === 'object') {
        result[key] = { mapValue: { fields: this.toFirestoreFormat(value) } };
      }
    }
    return result;
  }

  /**
   * Convert Firestore format to JavaScript object
   */
  fromFirestoreFormat(fields) {
    if (!fields) return null;
    
    const result = {};
    for (const [key, value] of Object.entries(fields)) {
      if (value.stringValue !== undefined) {
        result[key] = value.stringValue;
      } else if (value.integerValue !== undefined) {
        result[key] = parseInt(value.integerValue);
      } else if (value.booleanValue !== undefined) {
        result[key] = value.booleanValue;
      } else if (value.arrayValue) {
        result[key] = value.arrayValue.values?.map(v => {
          // Handle different types in array values
          if (v.stringValue !== undefined) return v.stringValue;
          if (v.integerValue !== undefined) return parseInt(v.integerValue);
          if (v.booleanValue !== undefined) return v.booleanValue;
          if (v.mapValue) return this.fromFirestoreFormat(v.mapValue.fields);
          return null;
        }).filter(v => v !== null) || [];
      } else if (value.mapValue) {
        result[key] = this.fromFirestoreFormat(value.mapValue.fields);
      }
    }
    return result;
  }

  /**
   * Store progress locally when offline or unauthenticated
   */
  async storeLocalProgress(problemData) {
    const result = await chrome.storage.local.get('local_progress');
    const progress = result.local_progress || [];
    progress.push({
      ...problemData,
      timestamp: Date.now()
    });
    await chrome.storage.local.set({ local_progress: progress });
    console.log('💾 Stored progress locally');
  }

  /**
   * Generate unique problem ID from title and platform
   */
  generateProblemId(problemData) {
    const slug = (problemData.title || 'unknown')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    return `${problemData.platform || 'leetcode'}_${slug}`;
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

  /**
   * Calculate user streak (placeholder for now)
   */
  calculateStreak(stats) {
    // Simple calculation - can be enhanced
    return stats.recentSolveCount || 0;
  }

  /**
   * Calculate efficiency score based on problem metrics
   */
  calculateEfficiency(problemData) {
    const baseScore = 100;
    const hintPenalty = (problemData.hintsUsed || 0) * 5;
    const timeFactor = Math.min(problemData.timeSpent / 3600, 1) * 10; // Max 10 point penalty for time
    
    return Math.max(0, baseScore - hintPenalty - timeFactor);
  }

  /**
   * Log interaction (hints, code analysis, etc.)
   */
  async logInteraction(interactionData) {
    if (!this.userId) return;

    try {
      const interactionId = `interaction_${Date.now()}`;
      await this.writeToFirestore(
        `users/${this.userId}/interactions/${interactionId}`,
        { ...interactionData, timestamp: Date.now() }
      );
    } catch (error) {
      console.error('❌ Failed to log interaction:', error);
    }
  }
}
