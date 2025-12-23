/**
 * Background Service Worker - Core messaging and state management
 * Handles communication between content scripts, popup, and side panel
 * Manages AI API calls, authentication, and data synchronization
 */

import { GeminiService } from '../services/gemini-service.js';
import { FirebaseService } from '../services/firebase-service.js';
import { AuthService } from '../services/auth-service.js';
import { SessionManager } from '../utils/session-manager.js';

// Initialize services
const geminiService = new GeminiService();
const firebaseService = new FirebaseService();
let authService = null; // Initialize later to avoid async issues
const sessionManager = new SessionManager();

// Initialize auth service after Chrome is ready
(async () => {
  authService = new AuthService();
  await authService.init();
  console.log('✅ Auth service initialized');
})();

/**
 * Setup alarm to reset problemsToday counter at midnight
 */
function setupMidnightReset() {
  // Clear any existing alarm
  chrome.alarms.clear('midnightReset');
  
  // Calculate milliseconds until midnight
  const now = new Date();
  const midnight = new Date();
  midnight.setHours(24, 0, 0, 0);
  const msUntilMidnight = midnight.getTime() - now.getTime();
  
  // Create alarm for midnight, then repeat every 24 hours
  chrome.alarms.create('midnightReset', {
    when: Date.now() + msUntilMidnight,
    periodInMinutes: 24 * 60 // Repeat every 24 hours
  });
  
  console.log('⏰ Midnight reset alarm set for:', midnight.toLocaleString());
}

// Listen for alarm to reset counter
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'midnightReset') {
    console.log('🌅 Midnight reset triggered');
    chrome.storage.local.set({
      problemsToday: 0,
      lastResetDate: new Date().toDateString()
    });
  }
});

// Check if we need to reset counter on startup (in case extension was reloaded)
chrome.runtime.onStartup.addListener(async () => {
  const result = await chrome.storage.local.get(['lastResetDate', 'problemsToday']);
  const today = new Date().toDateString();
  
  if (result.lastResetDate !== today) {
    // It's a new day, reset counter
    await chrome.storage.local.set({
      problemsToday: 0,
      lastResetDate: today
    });
    console.log('🌅 Counter reset for new day');
  }
  
  // Ensure alarm is set
  setupMidnightReset();
});

// Service worker lifecycle
chrome.runtime.onInstalled.addListener(async (details) => {
  console.log('Cognify AI Mentor installed:', details.reason);
  
  // Initialize default settings
  await chrome.storage.local.set({
    mode: 'practice', // practice, interview, learning
    problemsToday: 0,
    lastResetDate: new Date().toDateString(),
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
  
  // Set up midnight reset alarm
  setupMidnightReset();

  // Open welcome page on first install
  if (details.reason === 'install') {
    chrome.tabs.create({
      url: chrome.runtime.getURL('welcome/welcome.html')
    });
  }
});

// Listen for storage changes to reload API key and user auth
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'local') {
    if (changes.gemini_api_key) {
      console.log('🔄 API key changed, reloading...');
      geminiService.init();
    }
    
    // CRITICAL: Update firebaseService userId when user signs in/out
    if (changes.user_id) {
      const newUserId = changes.user_id.newValue;
      console.log('🔄 User authentication changed:', newUserId ? `User: ${newUserId}` : 'Signed out');
      firebaseService.userId = newUserId || null;
      
      if (newUserId) {
        console.log('✅ Firebase service now has userId:', newUserId);
      } else {
        console.log('⚠️ Firebase service userId cleared (user signed out)');
      }
    }
  }
});

/**
 * Check if user is authenticated
 */
async function requireAuth() {
  if (!authService) {
    authService = new AuthService();
    await authService.init();
  }
  
  const user = await authService.getCurrentUser();
  if (!user) {
    return {
      success: false,
      requiresAuth: true,
      error: 'Authentication required. Please sign in to use this feature.',
      dashboardUrl: 'https://cognify-68642.web.app/'
    };
  }
  return { success: true, user };
}

// Message router - handles all extension communication
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Message received:', message.type, 'from:', sender.tab?.id || 'popup/sidepanel');

  // Handle async responses
  (async () => {
    try {
      // Check authentication for protected endpoints
      const protectedEndpoints = [
        'EXTRACT_PROBLEM',
        'REQUEST_HINT',
        'ANALYZE_CODE',
        'PROBLEM_SOLVED',
        'START_INTERVIEW',
        'INTERVIEW_QUESTION',
        'END_INTERVIEW',
        'EXPLAIN_CONCEPT',
        'SYNC_PROGRESS',
        'GET_RECOMMENDATIONS'
      ];
      
      if (protectedEndpoints.includes(message.type)) {
        const authCheck = await requireAuth();
        if (!authCheck.success) {
          return authCheck;
        }
      }
      
      switch (message.type) {
        case 'CHECK_AUTH':
          return await requireAuth();
          
        case 'EXTRACT_PROBLEM':
          return await handleProblemExtraction(message.data, sender);
        
        case 'REQUEST_HINT':
          return await handleHintRequest(message.data, sender);
        
        case 'ANALYZE_CODE':
          return await handleCodeAnalysis(message.data, sender);
        
        case 'PROBLEM_SOLVED':
          return await handleProblemSolved(message.data, sender);
        
        case 'MODE_CHANGED':
          return await handleModeChange(message.data, sender);
        
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
        
        case 'SET_USER_AUTH':
          return await handleSetAuth(message.data);
        
        case 'SIGN_IN':
          return await handleSignIn();
        
        case 'SIGN_OUT':
          return await handleSignOut();
        
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
 * Handle mode change (practice <-> interview)
 */
async function handleModeChange(data, sender) {
  const { mode, currentCode } = data;
  const session = await sessionManager.getCurrentSession(sender.tab.id);
  
  session.mode = mode;
  
  if (mode === 'interview') {
    console.log('🎤 Starting interview mode');
    console.log('📋 Current session state:', {
      hasProblem: !!session.currentProblem,
      problemTitle: session.currentProblem?.title,
      tabId: sender.tab.id
    });
    
    // Check if problem has been extracted
    if (!session.currentProblem) {
      console.error('❌ Cannot start interview: No problem extracted yet');
      return {
        success: false,
        error: 'Please extract the problem first before starting interview mode'
      };
    }
    
    // Start interview mode - initialize everything
    session.interviewState.active = true;
    session.interviewState.questionsAsked = 0;
    session.interviewState.scores = [];
    session.interviewState.questionContext = [];
    session.interviewState.startTime = Date.now();
    session.interviewState.awaitingAnswer = false;
    
    console.log('📊 Interview state initialized:', session.interviewState);
    console.log('📚 Problem details for interview questions:');
    console.log('  • Title:', session.currentProblem.title);
    console.log('  • Difficulty:', session.currentProblem.difficulty);
    console.log('  • Topics:', session.currentProblem.analysis?.topics);
    
    // Generate first question immediately with full problem context
    const firstQuestion = await geminiService.generateInterviewQuestion({
      problem: session.currentProblem,
      questionNumber: 1,
      currentCode: currentCode || '',
      timeElapsed: 0,
      previousQuestions: []
    });
    
    console.log('❓ First question generated:', firstQuestion);
    
    session.interviewState.questionsAsked = 1;
    session.interviewState.currentQuestion = firstQuestion;
    session.interviewState.awaitingAnswer = true;
    session.interviewState.lastQuestionTime = Date.now();
    session.interviewState.questionContext.push(firstQuestion);
    
    // Schedule next 3 questions at 10-minute intervals
    scheduleInterviewQuestions(sender.tab.id);
    
    await sessionManager.saveSession(sender.tab.id, session);
    
    console.log('✅ Interview mode started, waiting for first answer');
    
    return {
      success: true,
      mode: 'interview',
      firstQuestion: firstQuestion
    };
  } else {
    // Switch to practice mode - clear interview state
    if (session.interviewState.active) {
      // Clear any scheduled questions
      clearInterviewQuestions(sender.tab.id);
    }
    
    session.interviewState.active = false;
    await sessionManager.saveSession(sender.tab.id, session);
    
    return {
      success: true,
      mode: 'practice'
    };
  }
}

/**
 * Schedule automated interview questions
 */
function scheduleInterviewQuestions(tabId) {
  const intervals = [10, 20, 30]; // minutes: 10, 20, 30
  
  intervals.forEach((minutes, index) => {
    const questionNumber = index + 2; // Questions 2, 3, 4
    const delay = minutes * 60 * 1000; // Convert to milliseconds
    
    const timer = setTimeout(async () => {
      try {
        const session = await sessionManager.getCurrentSession(tabId);
        
        // Check if still in interview mode
        if (!session.interviewState.active) return;
        
        // Get current code from content script
        chrome.tabs.sendMessage(tabId, { type: 'GET_CURRENT_CODE' }, async (response) => {
          if (chrome.runtime.lastError) return;
          
          const currentCode = response?.code || '';
          const timeElapsed = Math.floor((Date.now() - session.interviewState.startTime) / 60000);
          
          // Generate next question
          const question = await geminiService.generateInterviewQuestion({
            problem: session.currentProblem,
            questionNumber: questionNumber,
            currentCode: currentCode,
            timeElapsed: timeElapsed,
            previousQuestions: session.interviewState.questionContext
          });
          
          session.interviewState.questionsAsked = questionNumber;
          session.interviewState.currentQuestion = question;
          session.interviewState.awaitingAnswer = true;
          session.interviewState.lastQuestionTime = Date.now();
          session.interviewState.questionContext.push(question);
          
          await sessionManager.saveSession(tabId, session);
          
          // Send question to content script to display
          chrome.tabs.sendMessage(tabId, {
            type: 'INTERVIEW_QUESTION',
            question: question,
            questionNumber: questionNumber
          });
        });
      } catch (error) {
        console.error('Error in scheduled question:', error);
      }
    }, delay);
    
    // Store timer reference
    chrome.storage.local.get([`interview_timers_${tabId}`], (result) => {
      const timers = result[`interview_timers_${tabId}`] || [];
      timers.push(timer);
      chrome.storage.local.set({ [`interview_timers_${tabId}`]: timers });
    });
  });
}

/**
 * Clear interview question timers
 */
function clearInterviewQuestions(tabId) {
  chrome.storage.local.get([`interview_timers_${tabId}`], (result) => {
    const timers = result[`interview_timers_${tabId}`] || [];
    timers.forEach(timer => clearTimeout(timer));
    chrome.storage.local.remove(`interview_timers_${tabId}`);
  });
}

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
    console.error('❌ Problem not detected in session');
    console.log('📊 Current session state:', {
      hasProblem: !!session.currentProblem,
      problemTitle: session.currentProblem?.title,
      sessionId: session.id,
      tabId: sender.tab.id
    });
    
    return {
      success: false,
      error: 'Problem not detected. Please click "Extract Problem" button first, or refresh the page if you just loaded it.',
      hint: {
        question: 'Please extract the problem first by clicking the "Extract Problem" button in the Cognify panel.',
        type: 'system'
      }
    };
  }
  
  // INTERVIEW MODE HANDLING
  if (mode === 'interview' && session.interviewState.active) {
    console.log('\n┌──────────────────────────────────────────────────────────────────┐');
    console.log('│  🎤 INTERVIEW MODE: Processing User Interaction                 │');
    console.log('└──────────────────────────────────────────────────────────────────┘');
    console.log('📌 Interview State:');
    console.log('  • awaitingAnswer:', session.interviewState.awaitingAnswer);
    console.log('  • questionsAsked:', session.interviewState.questionsAsked);
    console.log('  • currentQuestion:', session.interviewState.currentQuestion?.substring(0, 60));
    console.log('  • userMessage:', userQuestion?.substring(0, 100));
    
    // Use unified interview response for ALL interactions (scores + responds)
    console.log('\n🚀 Calling unified AI interview handler...');
    
    const result = await geminiService.unifiedInterviewResponse({
      problem: session.currentProblem,
      questionsAsked: session.interviewState.questionsAsked,
      userMessage: userQuestion,
      currentCode: userCode,
      currentQuestion: session.interviewState.currentQuestion,
      isAnsweringQuestion: session.interviewState.awaitingAnswer
    });
    
    console.log('\n✅ UNIFIED RESPONSE RECEIVED!');
    console.log('📊 Scores:', JSON.stringify(result.scores, null, 2));
    console.log('💬 AI Response:', result.response);
    console.log('🏷️ Interaction Type:', result.interactionType);
    console.log('📝 Should Score:', result.shouldScore);
    
    // Always store the interaction with scores
    const interactionEntry = {
      questionNumber: session.interviewState.questionsAsked,
      question: session.interviewState.currentQuestion || 'General conversation',
      answer: userQuestion,
      scores: result.scores,
      timestamp: Date.now(),
      interactionType: result.interactionType
    };
    
    // If this was answering a direct question, mark it formally
    if (session.interviewState.awaitingAnswer && result.shouldScore) {
      console.log('✅ This was an ANSWER to interview question #' + session.interviewState.questionsAsked);
      session.interviewState.scores.push(interactionEntry);
      session.interviewState.awaitingAnswer = false;
      
      console.log('\n📊 ALL INTERVIEW SCORES SO FAR:');
      console.log('┌────────────────────────────────────────────────────────────────┐');
      session.interviewState.scores.forEach((s, idx) => {
        console.log(`│ Question ${idx + 1}:`, s.question.substring(0, 40) + '...');
        console.log('│   Communication:', s.scores.communication + '/100 |', 
                    'Technical:', s.scores.technical + '/100 |',
                    'Overall:', s.scores.overall + '/100');
        console.log('│   Feedback:', s.scores.brief_feedback.substring(0, 50) + '...');
        if (idx < session.interviewState.scores.length - 1) {
          console.log('├────────────────────────────────────────────────────────────────┤');
        }
      });
      console.log('└────────────────────────────────────────────────────────────────┘\n');
    } else {
      console.log('ℹ️ This was general CONVERSATION (not scoring as formal answer)');
      // Still track but don't add to formal scores
      session.interviewState.conversationScores = session.interviewState.conversationScores || [];
      session.interviewState.conversationScores.push(interactionEntry);
    }
    
    await sessionManager.saveSession(sender.tab.id, session);
    
    // Return AI response (scores hidden from user)
    return {
      success: true,
      hint: {
        question: result.response,
        metadata: { 
          scored: true, 
          hideScore: true,
          interactionType: result.interactionType
        }
      },
      mode: 'interview'
    };
  }
  
  // PRACTICE MODE (existing logic)
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
 * Handle problem solved event - sync to Firebase
 */
async function handleProblemSolved(data, sender) {
  try {
    const { problemData, sessionData } = data;
    const session = await sessionManager.getCurrentSession(sender.tab.id);
    const mode = await getMode();
    
    console.log('🎯 Problem solved!', problemData);
    console.log('📋 Mode:', mode);
    console.log('📋 Session interview state:', session.interviewState);
    
    // Prepare problem data with session stats
    const fullProblemData = {
      ...problemData,
      mode,
      timeSpent: sessionData?.timeSpent || 0,
      hintsUsed: session.hints?.length || 0,
      codeAnalyses: session.codeIterations?.length || 0,
      attempts: sessionData?.attempts || 1,
      platform: problemData.platform || 'leetcode',
      tags: session.currentProblem?.tags || problemData.tags || []
    };
    
    // If interview mode, calculate and save final scores
    if (mode === 'interview' && session.interviewState.active) {
      console.log('\n┌──────────────────────────────────────────────────────────────────┐');
      console.log('│  🎯 MARK AS SOLVED BUTTON CLICKED - Interview Completion       │');
      console.log('│  Calculating and displaying final scores...                    │');
      console.log('└──────────────────────────────────────────────────────────────────┘');
      
      // Clear any remaining timers
      clearInterviewQuestions(sender.tab.id);
      
      // Calculate final scores
      const finalScores = calculateInterviewScores(session.interviewState);
      
      console.log('📊 Calculating interview scores:', {
        questionsAsked: session.interviewState.questionsAsked,
        scoresCount: session.interviewState.scores.length,
        scores: session.interviewState.scores,
        finalScores: finalScores
      });
      
      // Save interview report to Firebase
      const interviewReport = {
        problemId: problemData.problemId || problemData.title,
        problemTitle: problemData.title,
        platform: problemData.platform || 'leetcode',
        difficulty: problemData.difficulty,
        tags: session.currentProblem?.tags || problemData.tags || [],
        hintsUsed: session.hints?.length || 0,
        timestamp: Date.now(),
        duration: Date.now() - session.interviewState.startTime, // milliseconds
        questionsAsked: session.interviewState.questionsAsked,
        questionScores: session.interviewState.scores,
        finalScores: finalScores,
        strengths: finalScores.strengths || [],
        areasToImprove: finalScores.improvements || [],
        feedback: `Interview completed with ${session.interviewState.questionsAsked} questions. Overall performance: ${finalScores.overall}/100`,
        // Add scores object for dashboard compatibility
        scores: {
          communication: finalScores.communication,
          technical: finalScores.technical,
          overall: finalScores.overall
        },
        overallScore: finalScores.overall
      };
      
      console.log('💾 Saving interview report to Firebase...');
      console.log('📦 Report data:', JSON.stringify(interviewReport, null, 2));
      
      const saveResult = await firebaseService.saveInterviewReport(interviewReport);
      
      console.log('📤 Firebase save result:', saveResult);
      
      if (saveResult.success) {
        console.log('✅✅✅ Interview report saved successfully:', saveResult.interviewId);
        
        // Update analytics with new interview data
        console.log('📊 Updating analytics...');
        await updateUserAnalytics(session, interviewReport, finalScores);
      } else {
        console.error('❌❌❌ Failed to save interview report:', saveResult.error);
      }
      
      // Mark interview as inactive
      session.interviewState.active = false;
      await sessionManager.saveSession(sender.tab.id, session);
      
      console.log('📊 Interview scores calculated and saved:', finalScores);
      
    // Analyze topic proficiency with AI
    const problemTags = session.currentProblem?.tags || problemData.tags || [];
    if (problemTags.length > 0) {
      console.log('🤖 Analyzing topic proficiency for:', problemTags);
      try {
        const topicAnalysis = await geminiService.analyzeTopicProficiency({
          problemTags,
          hintsUsed: session.hints?.length || 0,
          interviewScores: finalScores,
          userAnswer: session.interviewState.scores[0]?.answer || '',
          problemDifficulty: problemData.difficulty
        });
        
        console.log('✅ Topic analysis complete:', topicAnalysis);
        
        // Update user's topic proficiency in Firebase
        await firebaseService.updateTopicProficiency({
          topics: topicAnalysis,
          problemId: problemData.problemId || problemData.title,
          timestamp: Date.now()
        });
      } catch (error) {
        console.error('❌ Topic analysis failed:', error);
      }
    }
    
    // Update problemsToday counter for interview completion
    await updateProblemsToday();
    
    // Return scores to be displayed in UI
    return {
      success: true,
      interviewComplete: true,
      scores: finalScores,
      message: 'Interview completed! Scores saved to dashboard.',
      reportId: saveResult.interviewId
    };
  }
  
  // Update problemsToday counter for practice mode
  await updateProblemsToday();
  
  // Log to Firebase (for both practice and interview modes)
  console.log('💾 Logging problem to Firebase...');
  await firebaseService.logProblemSolved(fullProblemData);
  
  // Analyze topics for practice mode too
  if (mode === 'practice') {
    const problemTags = session.currentProblem?.tags || problemData.tags || [];
    if (problemTags.length > 0) {
      console.log('🤖 Analyzing topic proficiency for practice:', problemTags);
      try {
        const topicAnalysis = await geminiService.analyzeTopicProficiency({
          problemTags,
          hintsUsed: session.hints?.length || 0,
          problemDifficulty: problemData.difficulty
        });
        
        await firebaseService.updateTopicProficiency({
          topics: topicAnalysis,
          problemId: problemData.problemId || problemData.title,
          timestamp: Date.now()
        });
      } catch (error) {
        console.error('❌ Topic analysis failed:', error);
      }
    }
    
    const practiceAnalytics = await calculateTagPerformance(session, {
      tags: fullProblemData.tags,
      hintsUsed: fullProblemData.hintsUsed
    });
    
    await firebaseService.updateAnalytics({
      practiceCompleted: true,
      interviewCompleted: false,
      strengths: practiceAnalytics.strengths,
      weaknesses: practiceAnalytics.weaknesses
    });
  }
  
  // Clear session
  await sessionManager.clearSession(sender.tab.id);
  
  console.log('✅ Problem logged successfully');
  
  return {
    success: true,
    message: mode === 'interview' ? 'Interview completed! Scores saved to dashboard.' : 'Problem logged to dashboard!'
  };
} catch (error) {
  console.error('❌❌❌ CRITICAL ERROR in handleProblemSolved:', error);
  console.error('❌ Error stack:', error.stack);
  return {
    success: false,
    error: error.message
  };
}
}

/**
 * Update problems solved today counter
 */
async function updateProblemsToday() {
  const result = await chrome.storage.local.get(['problemsToday', 'lastResetDate']);
  const today = new Date().toDateString();
  
  // Check if we need to reset (in case alarm didn't fire)
  if (result.lastResetDate !== today) {
    await chrome.storage.local.set({
      problemsToday: 1,
      lastResetDate: today
    });
    console.log('🎯 Problems today: 1 (new day)');
  } else {
    const newCount = (result.problemsToday || 0) + 1;
    await chrome.storage.local.set({ problemsToday: newCount });
    console.log('🎯 Problems today:', newCount);
  }
}

/**
 * Calculate final interview scores from all question scores
 */
function calculateInterviewScores(interviewState) {
  const scores = interviewState.scores;
  
  if (!scores || scores.length === 0) {
    return {
      communication: 0,
      technical: 0,
      overall: 0,
      strengths: [],
      improvements: ['Complete more questions for detailed feedback']
    };
  }
  
  // Average all scores across all answers (already 0-100 from AI)
  const avgCommunication = Math.round(scores.reduce((sum, s) => sum + (s.scores.communication || 0), 0) / scores.length);
  const avgTechnical = Math.round(scores.reduce((sum, s) => sum + (s.scores.technical || 0), 0) / scores.length);
  const avgOverall = Math.round(scores.reduce((sum, s) => sum + (s.scores.overall || 0), 0) / scores.length);
  
  // Determine strengths and improvements based on averaged scores
  const strengths = [];
  const improvements = [];
  
  if (avgCommunication >= 70) strengths.push('Excellent communication skills');
  else if (avgCommunication >= 55) strengths.push('Good communication');
  else if (avgCommunication < 50) improvements.push('Work on explaining thoughts more clearly');
  
  if (avgTechnical >= 70) strengths.push('Strong technical knowledge');
  else if (avgTechnical >= 55) strengths.push('Decent technical understanding');
  else if (avgTechnical < 50) improvements.push('Strengthen technical fundamentals');
  
  if (avgOverall >= 70) strengths.push('Interview-ready performance');
  else if (avgOverall < 50) improvements.push('Needs more interview practice');
  
  return {
    communication: avgCommunication,
    technical: avgTechnical,
    overall: avgOverall,
    strengths: strengths,
    improvements: improvements,
    totalQuestions: scores.length
  };
}

/**
 * Update user analytics based on completed interview/practice
 */
async function updateUserAnalytics(session, report, scores) {
  try {
    console.log('📊 Calculating user analytics...');
    
    // Get all interview reports to calculate averages
    const userId = await chrome.storage.local.get(['user_id']);
    if (!userId.user_id) {
      console.warn('⚠️ No user ID, skipping analytics update');
      return;
    }
    
    // Calculate tag-based strengths and weaknesses
    const tagPerformance = await calculateTagPerformance(session, report);
    
    const analyticsData = {
      interviewCompleted: session.interviewState.active,
      practiceCompleted: !session.interviewState.active,
      avgCommunicationScore: scores.communication,
      avgTechnicalScore: scores.technical,
      avgOverallScore: scores.overall,
      strengths: tagPerformance.strengths,
      weaknesses: tagPerformance.weaknesses
    };
    
    await firebaseService.updateAnalytics(analyticsData);
    console.log('✅ Analytics updated successfully');
  } catch (error) {
    console.error('❌ Failed to update analytics:', error);
  }
}

/**
 * Calculate strengths and weaknesses based on problem tags and hint usage
 * Strengths: tags where hints < 2, Weaknesses: tags where hints >= 3
 * Zero intersection - tags can't be in both
 */
async function calculateTagPerformance(session, report) {
  try {
    const tags = report.tags || [];
    const hintsUsed = report.hintsUsed || 0;
    
    console.log('🎯 Calculating tag performance:');
    console.log('  Tags:', tags);
    console.log('  Hints used:', hintsUsed);
    
    // Get historical performance from Firebase
    const userId = await chrome.storage.local.get(['user_id']);
    if (!userId.user_id) return { strengths: [], weaknesses: [] };
    
    // Fetch all solved problems to analyze tag performance
    const activities = await firebaseService.readFromFirestore(`users/${userId.user_id}/activities`);
    
    // Track hints per tag
    const tagStats = {};
    
    // Add current problem
    tags.forEach(tag => {
      if (!tagStats[tag]) tagStats[tag] = { total: 0, totalHints: 0 };
      tagStats[tag].total += 1;
      tagStats[tag].totalHints += hintsUsed;
    });
    
    // Add historical data
    if (activities) {
      Object.values(activities).forEach(activity => {
        if (activity.type === 'problem_solved' && activity.tags) {
          activity.tags.forEach(tag => {
            if (!tagStats[tag]) tagStats[tag] = { total: 0, totalHints: 0 };
            tagStats[tag].total += 1;
            tagStats[tag].totalHints += (activity.hintsUsed || 0);
          });
        }
      });
    }
    
    // Calculate strengths and weaknesses
    const strengths = [];
    const weaknesses = [];
    
    Object.entries(tagStats).forEach(([tag, stats]) => {
      const avgHints = stats.totalHints / stats.total;
      
      console.log(`  ${tag}: ${stats.total} problems, avg ${avgHints.toFixed(1)} hints`);
      
      // Strength: low hint usage (< 2 hints on average)
      if (avgHints < 2) {
        strengths.push(tag);
      }
      // Weakness: high hint usage (>= 3 hints on average)
      else if (avgHints >= 3) {
        weaknesses.push(tag);
      }
      // Medium performance (2-3 hints): not counted as either
    });
    
    console.log('🎯 Strengths:', strengths);
    console.log('⚠️ Weaknesses:', weaknesses);
    
    return { strengths, weaknesses };
  } catch (error) {
    console.error('❌ Error calculating tag performance:', error);
    return { strengths: [], weaknesses: [] };
  }
}

/**
 * Set user authentication from dashboard
 */
async function handleSetAuth(data) {
  const { userId, token } = data;
  await firebaseService.setAuth(userId, token);
  console.log('✅ User authenticated:', userId);
  return { success: true };
}

/**
 * Handle sign-in request from popup
 */
async function handleSignIn() {
  console.log('🔐 Handling sign-in request...');
  
  // Make sure authService is initialized
  if (!authService) {
    console.log('⏳ Auth service not ready, initializing...');
    authService = new AuthService();
    await authService.init();
  }
  
  const result = await authService.signInWithGoogle();
  
  if (result.success) {
    // Reinitialize Firebase service with new user
    await firebaseService.init();
    console.log('✅ Sign-in successful:', result.user.displayName);
  }
  
  return result;
}

/**
 * Handle sign-out request from popup
 */
async function handleSignOut() {
  console.log('🚪 Handling sign-out request...');
  const result = await authService.signOut();
  
  if (result.success) {
    // Clear Firebase service
    await firebaseService.signOut();
    console.log('✅ Sign-out successful');
  }
  
  return result;
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
