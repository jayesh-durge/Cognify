/**
 * Background Service Worker - Core messaging and state management
 * Handles communication between content scripts, popup, and side panel
 * Manages AI API calls, authentication, and data synchronization
 */

import { GeminiService } from '../services/gemini-service.js';
import { FirebaseService } from '../services/firebase-service.js';
import { SessionManager } from '../utils/session-manager.js';

// Initialize services
const geminiService = new GeminiService();
const firebaseService = new FirebaseService();
const sessionManager = new SessionManager();

// Service worker lifecycle
chrome.runtime.onInstalled.addListener(async (details) => {
  console.log('Cognify AI Mentor installed:', details.reason);
  
  // Initialize default settings
  await chrome.storage.local.set({
    mode: 'practice', // practice, interview, learning
    settings: {
      enableVoice: false,
      interviewDuration: 45, // minutes
      hintLevel: 'medium', // low, medium, high
      autoTrack: true
    },
    onboarding: {
      completed: false,
      currentStep: 0
    }
  });

  // Open onboarding on first install
  if (details.reason === 'install') {
    chrome.tabs.create({ url: chrome.runtime.getURL('onboarding/welcome.html') });
  }
});

// Listen for storage changes to reload API key
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'local' && changes.gemini_api_key) {
    console.log('🔄 API key changed, reloading...');
    geminiService.init();
  }
});

// Message router - handles all extension communication
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Message received:', message.type, 'from:', sender.tab?.id || 'popup/sidepanel');

  // Handle async responses
  (async () => {
    try {
      switch (message.type) {
        case 'EXTRACT_PROBLEM':
          return await handleProblemExtraction(message.data, sender);
        
        case 'REQUEST_HINT':
          return await handleHintRequest(message.data, sender);
        
        case 'ANALYZE_CODE':
          return await handleCodeAnalysis(message.data, sender);
        
        case 'START_INTERVIEW':
          return await handleInterviewStart(message.data, sender);
        
        case 'INTERVIEW_QUESTION':
          return await handleInterviewQuestion(message.data, sender);
        
        case 'END_INTERVIEW':
          return await handleInterviewEnd(message.data, sender);
        
        case 'EXPLAIN_CONCEPT':
          return await handleConceptExplanation(message.data, sender);
        
        case 'SYNC_PROGRESS':
          return await handleProgressSync(message.data, sender);
        
        case 'GET_RECOMMENDATIONS':
          return await handleRecommendations(message.data, sender);
        
        case 'OPEN_SIDEPANEL':
          await chrome.sidePanel.open({ tabId: sender.tab.id });
          return { success: true };
        
        default:
          return { error: 'Unknown message type' };
      }
    } catch (error) {
      console.error('Error handling message:', error);
      return { error: error.message };
    }
  })().then(sendResponse);

  return true; // Keep channel open for async response
});

/**
 * Extract and analyze problem from content script
 */
async function handleProblemExtraction(data, sender) {
  const { platform, problemData } = data;
  
  // Store current problem in session
  const session = await sessionManager.getCurrentSession(sender.tab.id);
  session.currentProblem = {
    platform,
    title: problemData.title,
    difficulty: problemData.difficulty,
    description: problemData.description,
    constraints: problemData.constraints,
    examples: problemData.examples,
    tags: problemData.tags,
    timestamp: Date.now()
  };
  
  await sessionManager.saveSession(sender.tab.id, session);
  
  // Don't auto-analyze to save API quota - user can request analysis manually
  // Return basic analysis from problem data
  const analysis = {
    difficulty: problemData.difficulty || 'medium',
    topics: problemData.tags || [],
    patterns: ['Click "Analyze Code" for AI insights'],
    estimatedTime: problemData.difficulty === 'easy' ? 15 : problemData.difficulty === 'hard' ? 45 : 30,
    prerequisites: [],
    summary: `Problem extracted. Ask me questions or click "Get Hint" for guidance.`
  };
  
  return {
    success: true,
    problem: session.currentProblem,
    analysis
  };
}

/**
 * Generate contextual hints without revealing solution
 */
async function handleHintRequest(data, sender) {
  const { userCode, userQuestion, context, conversationHistory, actionType } = data;
  const session = await sessionManager.getCurrentSession(sender.tab.id);
  const mode = await getMode();
  
  // Check if API key is configured
  const settings = await chrome.storage.local.get('gemini_api_key');
  if (!settings.gemini_api_key) {
    return {
      success: false,
      error: 'Please configure your Gemini API key in extension settings first'
    };
  }
  
  // Check if problem is loaded
  if (!session.currentProblem || !session.currentProblem.title || session.currentProblem.title === 'Unknown Problem') {
    return {
      success: false,
      error: 'Problem not detected. Please refresh the page and wait a few seconds.'
    };
  }
  
  // Track hint requests (for spaced learning)
  session.hints = session.hints || [];
  session.hints.push({
    timestamp: Date.now(),
    userQuestion,
    actionType: actionType || 'chat',
    codeSnapshot: userCode?.substring(0, 200) // First 200 chars
  });
  
  try {
    // Generate hint using AI with strict no-solution rules
    // Pass conversation history and action type for context-aware responses
    const hint = await geminiService.generateHint({
      problem: session.currentProblem,
      userCode,
      userQuestion,
      previousHints: session.hints,
      conversationHistory: conversationHistory || [],
      actionType: actionType || 'chat', // 'chat', 'hint', or 'analyze'
      mode,
      context
    });
    
    // Update session
    await sessionManager.saveSession(sender.tab.id, session);
  
    // Sync to Firebase for dashboard
    await firebaseService.logInteraction({
      type: 'hint_request',
      problemId: session.currentProblem?.title,
      hint: hint.question, // Don't log full response for privacy
      timestamp: Date.now()
    });
    
    console.log('✅ Hint generated successfully:', {
      questionLength: hint.question?.length,
      preview: hint.question?.substring(0, 100)
    });
    
    return {
      success: true,
      hint,
      remainingHints: calculateRemainingHints(session.hints, mode)
    };
  } catch (error) {
    console.error('Error generating hint:', error);
    return {
      success: false,
      error: error.message || 'Failed to generate hint. Please check your API key and quota.'
    };
  }
}

/**
 * Analyze user code and provide reasoning-focused feedback
 */
async function handleCodeAnalysis(data, sender) {
  const { code, language } = data;
  const session = await sessionManager.getCurrentSession(sender.tab.id);
  const mode = await getMode();
  
  // AI analyzes: approach, time/space complexity, edge cases, reasoning
  const analysis = await geminiService.analyzeCode({
    code,
    language,
    problem: session.currentProblem,
    mode
  });
  
  // Track code iterations
  session.codeIterations = session.codeIterations || [];
  session.codeIterations.push({
    timestamp: Date.now(),
    codeHash: hashCode(code),
    feedback: analysis.summary
  });
  
  await sessionManager.saveSession(sender.tab.id, session);
  
  return {
    success: true,
    analysis
  };
}

/**
 * Start interview simulation mode
 */
async function handleInterviewStart(data, sender) {
  const session = await sessionManager.getCurrentSession(sender.tab.id);
  
  session.interview = {
    startTime: Date.now(),
    duration: data.duration || 45 * 60 * 1000, // 45 minutes
    questions: [],
    currentPhase: 'problem_understanding', // problem_understanding, coding, optimization, edge_cases
    interviewerId: `interviewer_${Date.now()}`,
    evaluations: []
  };
  
  await sessionManager.saveSession(sender.tab.id, session);
  
  // Generate initial interviewer question
  const firstQuestion = await geminiService.generateInterviewQuestion({
    problem: session.currentProblem,
    phase: 'problem_understanding',
    context: {}
  });
  
  return {
    success: true,
    interviewSession: session.interview,
    firstQuestion
  };
}

/**
 * Handle follow-up interview questions
 */
async function handleInterviewQuestion(data, sender) {
  const { userResponse, currentCode } = data;
  const session = await sessionManager.getCurrentSession(sender.tab.id);
  
  // Record user response
  session.interview.questions.push({
    timestamp: Date.now(),
    userResponse,
    codeSnapshot: currentCode?.substring(0, 300)
  });
  
  // Evaluate response quality
  const evaluation = await geminiService.evaluateInterviewResponse({
    problem: session.currentProblem,
    userResponse,
    currentCode,
    interviewPhase: session.interview.currentPhase,
    previousQuestions: session.interview.questions
  });
  
  session.interview.evaluations.push(evaluation);
  
  // Determine next phase or question
  const nextAction = determineInterviewProgression(session.interview);
  
  let nextQuestion = null;
  if (nextAction.type === 'continue') {
    nextQuestion = await geminiService.generateInterviewQuestion({
      problem: session.currentProblem,
      phase: nextAction.phase,
      context: {
        previousEvaluations: session.interview.evaluations,
        userStrengths: evaluation.strengths,
        userWeaknesses: evaluation.weaknesses
      }
    });
    
    session.interview.currentPhase = nextAction.phase;
  }
  
  await sessionManager.saveSession(sender.tab.id, session);
  
  return {
    success: true,
    evaluation,
    nextQuestion,
    shouldEnd: nextAction.type === 'end'
  };
}

/**
 * End interview and generate comprehensive report
 */
async function handleInterviewEnd(data, sender) {
  const session = await sessionManager.getCurrentSession(sender.tab.id);
  const interview = session.interview;
  
  interview.endTime = Date.now();
  interview.totalDuration = interview.endTime - interview.startTime;
  
  // Generate comprehensive interview report
  const report = await geminiService.generateInterviewReport({
    problem: session.currentProblem,
    interview,
    codeIterations: session.codeIterations
  });
  
  // Sync to Firebase for dashboard
  await firebaseService.saveInterviewReport({
    problemId: session.currentProblem?.title,
    platform: session.currentProblem?.platform,
    report,
    duration: interview.totalDuration,
    timestamp: interview.endTime
  });
  
  return {
    success: true,
    report
  };
}

/**
 * Explain concepts for learning mode (YouTube/Theory)
 */
async function handleConceptExplanation(data, sender) {
  const { concept, videoContext, timestamp } = data;
  
  // Generate simplified explanation with mental models
  const explanation = await geminiService.explainConcept({
    concept,
    videoContext,
    style: 'mental_model' // Use intuitive analogies
  });
  
  // Connect to real problems
  const relatedProblems = await geminiService.findRelatedProblems({
    concept,
    difficulty: 'easy' // Start with easier applications
  });
  
  return {
    success: true,
    explanation,
    relatedProblems
  };
}

/**
 * Sync user progress to Firebase
 */
async function handleProgressSync(data, sender) {
  const { progressData } = data;
  
  await firebaseService.syncProgress(progressData);
  
  return { success: true };
}

/**
 * Get personalized problem recommendations
 */
async function handleRecommendations(data, sender) {
  const { userProfile } = data;
  
  // Fetch from Firebase
  const userStats = await firebaseService.getUserStats();
  
  // Generate recommendations using AI
  const recommendations = await geminiService.generateRecommendations({
    userStats,
    userProfile,
    focus: 'weak_areas' // Focus on improvement areas
  });
  
  return {
    success: true,
    recommendations
  };
}

// Helper functions

async function getMode() {
  const result = await chrome.storage.local.get('mode');
  return result.mode || 'practice';
}

function calculateRemainingHints(hints, mode) {
  // Interview mode: Limited hints
  // Practice mode: Unlimited but tracked
  if (mode === 'interview') {
    const hintsInLast15Min = hints.filter(h => 
      Date.now() - h.timestamp < 15 * 60 * 1000
    ).length;
    return Math.max(0, 3 - hintsInLast15Min);
  }
  return -1; // Unlimited
}

function hashCode(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash.toString(36);
}

function determineInterviewProgression(interview) {
  const phases = ['problem_understanding', 'coding', 'optimization', 'edge_cases'];
  const currentIndex = phases.indexOf(interview.currentPhase);
  const timeElapsed = Date.now() - interview.startTime;
  const totalDuration = interview.duration;
  
  // End if time exceeded
  if (timeElapsed > totalDuration) {
    return { type: 'end' };
  }
  
  // Progress based on quality and time
  const recentEvals = interview.evaluations.slice(-3);
  const avgQuality = recentEvals.reduce((sum, e) => sum + (e.score || 50), 0) / recentEvals.length;
  
  // Move to next phase if performing well
  if (avgQuality > 70 && interview.questions.length >= 2 && currentIndex < phases.length - 1) {
    return { type: 'continue', phase: phases[currentIndex + 1] };
  }
  
  // Continue in current phase
  return { type: 'continue', phase: interview.currentPhase };
}

// Tab management - cleanup sessions
chrome.tabs.onRemoved.addListener((tabId) => {
  sessionManager.clearSession(tabId);
});

console.log('Cognify Service Worker initialized');
