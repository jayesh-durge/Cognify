/**
 * Gemini AI Service - All AI interactions with strict mentor rules
 * CRITICAL: Never generate full solutions, only guide reasoning
 */

import { GEMINI_PROMPTS } from '../config/prompts.js';
import { config } from '../config/config.js';

export class GeminiService {
  constructor() {
    this.apiKey = null;
    this.baseUrl = 'https://generativelanguage.googleapis.com/v1beta';
    this.model = 'gemini-2.5-flash';
    this.rateLimiter = new RateLimiter();
    this.init();
  }

  async init() {
    // Load API key from storage (user provides in settings)
    const result = await chrome.storage.local.get('gemini_api_key');
    this.apiKey = result.gemini_api_key || config.GEMINI_API_KEY;
    
    if (this.apiKey) {
      console.log('✅ Gemini API key loaded successfully');
    } else {
      console.warn('⚠️ No Gemini API key found. Please configure in extension settings.');
    }
  }

  /**
   * Analyze problem to understand complexity, topics, and patterns
   */
  async analyzeProblem(problemData) {
    try {
      // Check API key first
      if (!this.apiKey) {
        await this.init(); // Try to reload
        if (!this.apiKey) {
          console.warn('⚠️ No API key - using fallback analysis');
          return this.getFallbackAnalysis(problemData);
        }
      }

      const prompt = GEMINI_PROMPTS.analyzeProblem
        .replace('{{title}}', problemData.title || 'Unknown')
        .replace('{{description}}', problemData.description || '')
        .replace('{{constraints}}', problemData.constraints || '')
        .replace('{{examples}}', JSON.stringify(problemData.examples || []));

      const response = await this.callGemini(prompt, {
        temperature: 0.3,
        maxTokens: 500
      });

      return this.parseAnalysis(response);
    } catch (error) {
      console.error('❌ Analysis failed:', error.message);
      // Return fallback analysis so UI doesn't hang
      return this.getFallbackAnalysis(problemData);
    }
  }

  /**
   * Generate automated interview question
   */
  async generateInterviewQuestion(params) {
    const { problem, questionNumber, currentCode, timeElapsed, previousQuestions } = params;

    const prompt = GEMINI_PROMPTS.interviewAutoQuestion
      .replace('{{problem_title}}', problem?.title || 'Unknown')
      .replace('{{problem_difficulty}}', problem?.difficulty || 'Medium')
      .replace('{{problem_description}}', (problem?.description || 'No description').substring(0, 800))
      .replace('{{problem_constraints}}', (problem?.constraints || 'No constraints').substring(0, 300))
      .replace('{{problem_topics}}', (problem?.analysis?.topics || ['DSA']).join(', '))
      .replace('{{question_number}}', questionNumber)
      .replace('{{current_code}}', currentCode?.substring(0, 500) || 'No code yet')
      .replace('{{time_elapsed}}', timeElapsed)
      .replace('{{previous_questions}}', previousQuestions.join('; ') || 'None');

    try {
      const response = await this.callGemini(prompt + '\n\nIMPORTANT: Keep your question concise (1-2 sentences max).', {
        temperature: 0.7,
        maxTokens: 150
      });

      return response.text;
    } catch (error) {
      console.error('Error generating interview question:', error);
      return this.getFallbackInterviewQuestion(questionNumber);
    }
  }

  /**
   * Score user's answer to interview question
   */
  async scoreInterviewAnswer(params) {
    const { question, answer, code } = params;

    console.log('\n=================================================================');
    console.log('  🤖 AI INTERVIEW SCORING SESSION');
    console.log('=================================================================\n');
    
    console.log('📝 INPUT RECEIVED:');
    console.log('  Question: ' + question);
    console.log('  Answer: ' + answer);
    console.log('  Code: ' + (code ? code.substring(0, 100) + '...' : 'No code'));
    console.log('\n-----------------------------------------------------------------');

    const prompt = GEMINI_PROMPTS.scoreInterviewAnswer
      .replace('{{question}}', question)
      .replace('{{answer}}', answer)
      .replace('{{code}}', code?.substring(0, 500) || 'No code');

    console.log('🚀 Sending request to Gemini AI...');
    console.log('⏱️ Timestamp:', new Date().toLocaleTimeString());

    try {
      const response = await this.callGemini(prompt + '\n\nIMPORTANT: Keep brief_feedback to 1 sentence only.', {
        temperature: 0.3,
        maxTokens: 250
      });

      console.log('\n📥 RAW AI RESPONSE:');
      console.log('-----------------------------------------------------------------');
      console.log(response.text);
      console.log('-----------------------------------------------------------------\n');

      // Parse JSON from response - handle markdown blocks
      let jsonString = response.text.trim();
      const jsonMatch = jsonString.match(/```json\s*([\s\S]*?)```/);
      
      if (jsonMatch) {
        jsonString = jsonMatch[1].trim();
        console.log('✅ Extracted JSON from markdown block');
      }
      
      const scores = JSON.parse(jsonString);
      console.log('✅ Successfully parsed JSON');

      console.log('\n=================================================================');
      console.log('  ⭐ AI GENERATED EVALUATION SCORES');
      console.log('=================================================================\n');
      
      const commScore = scores.communication || 0;
      const corrScore = scores.correctness || 0;
      const depthScore = scores.depth || 0;
      const avgScore = ((commScore + corrScore + depthScore) / 3).toFixed(1);
      
      console.log('  📊 COMMUNICATION SKILLS: ' + commScore + '/10');
      console.log('     ' + '█'.repeat(commScore) + '░'.repeat(10 - commScore));
      console.log('     How clearly and effectively the answer is communicated\n');
      
      console.log('  ✓  CORRECTNESS: ' + corrScore + '/10');
      console.log('     ' + '█'.repeat(corrScore) + '░'.repeat(10 - corrScore));
      console.log('     Accuracy and validity of the technical content\n');
      
      console.log('  🎯 DEPTH OF UNDERSTANDING: ' + depthScore + '/10');
      console.log('     ' + '█'.repeat(depthScore) + '░'.repeat(10 - depthScore));
      console.log('     Demonstrates thorough grasp of concepts\n');
      
      console.log('  🏆 AVERAGE SCORE: ' + avgScore + '/10');
      console.log('     Overall performance rating\n');
      
      console.log('-----------------------------------------------------------------');
      console.log('💬 AI FEEDBACK:');
      console.log('   ' + (scores.brief_feedback || 'No feedback provided'));
      console.log('-----------------------------------------------------------------\n');
      
      console.log('📦 COMPLETE SCORE OBJECT:');
      console.log(JSON.stringify(scores, null, 2));
      console.log('\n=================================================================\n');
      
      return scores;
    } catch (error) {
      console.error('❌ Error scoring answer:', error);
      const fallbackScores = {
        communication: 5,
        correctness: 5,
        depth: 5,
        brief_feedback: 'Unable to evaluate - using default scores'
      };
      console.log('⚠️ Using fallback scores:', fallbackScores);
      return fallbackScores;
    }
  }

  /**
   * Handle interview mode conversation (not answering a question)
   */
  async handleInterviewConversation(params) {
    console.log('🎯 handleInterviewConversation called');
    console.log('📥 Parameters received:', {
      problemTitle: params.problem?.title,
      questionsAsked: params.questionsAsked,
      userMessage: params.userMessage,
      hasCode: !!params.currentCode
    });
    
    const { problem, questionsAsked, userMessage, currentCode } = params;

    const prompt = GEMINI_PROMPTS.interviewConversation
      .replace('{{problem_title}}', problem?.title || 'Unknown')
      .replace('{{questions_asked}}', questionsAsked)
      .replace('{{user_message}}', userMessage)
      .replace('{{current_code}}', currentCode?.substring(0, 500) || 'No code yet');

    console.log('📝 Prompt prepared (first 200 chars):', prompt.substring(0, 200));
    console.log('🚀 Calling Gemini API...');

    try {
      const response = await this.callGemini(prompt + '\n\nIMPORTANT: Be concise and direct. Maximum 2-3 sentences.', {
        temperature: 0.8,
        maxTokens: 200
      });

      console.log('✅ Gemini API response received');
      console.log('📤 Response:', response.text);
      console.log('📏 Response length:', response.text?.length || 0);

      return response.text;
    } catch (error) {
      console.error('❌ Error in interview conversation:', error);
      console.error('📋 Error details:', {
        message: error.message,
        name: error.name,
        stack: error.stack
      });
      console.error('🔍 Full error object:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
      return "I see. Can you explain your thought process further?";
    }
  }

  /**
   * Fallback interview questions
   */
  getFallbackInterviewQuestion(questionNumber) {
    const questions = [
      "How would you approach solving this problem? What's your initial thought?",
      "Can you walk me through your current approach? What's the time complexity you're aiming for?",
      "Have you considered any edge cases? How would you handle them?",
      "How would you test your solution? Are there any trade-offs in your approach?"
    ];
    return questions[questionNumber - 1] || questions[0];
  }

  /**
   * Generate Socratic hints - ASK, don't TELL
   */
  async generateHint(params) {
    const { problem, userCode, userQuestion, previousHints, mode, context, conversationHistory, actionType } = params;

    // Build context string from conversation history
    let conversationContext = '';
    if (conversationHistory && conversationHistory.length > 0) {
      conversationContext = '\n\nPrevious conversation:\n' + 
        conversationHistory.map(msg => `${msg.role === 'user' ? 'Student' : 'Mentor'}: ${msg.message}`).join('\n');
    }

    // Choose prompt based on action type
    let promptTemplate;
    let systemInstruction = GEMINI_PROMPTS.systemRules.noSolutionRule;
    
    if (actionType === 'hint') {
      // User clicked "Get Hint" button - give structured guidance
      promptTemplate = mode === 'interview' 
        ? GEMINI_PROMPTS.interviewHint 
        : GEMINI_PROMPTS.practiceHint;
      systemInstruction += '\n\nThe user specifically requested a hint. Guide them with Socratic questions about the approach.';
    } else if (actionType === 'chat') {
      // User is chatting - respond conversationally based on their question
      promptTemplate = `You are a coding mentor helping with: {{problem_title}}
      
Problem context:
{{problem_description}}

Student's code:
{{user_code}}

${conversationContext}

Student's question: {{user_question}}

RESPOND NATURALLY to their question. If they're stuck, ask guiding questions. If they're on the right track, encourage and probe deeper. Never give the solution directly.`;
      systemInstruction += '\n\nThis is a conversational exchange. Respond naturally to what the student asked, considering previous messages.';
    } else {
      // Default to practice mode
      promptTemplate = GEMINI_PROMPTS.practiceHint;
    }

    const prompt = this.buildPrompt(promptTemplate, {
      problem_title: problem.title,
      problem_description: problem.description,
      user_code: userCode || 'No code yet',
      user_question: userQuestion,
      previous_hints_count: previousHints?.length || 0,
      hint_level: context?.hintLevel || 'medium'
    });

    const response = await this.callGemini(prompt, {
      temperature: 0.7,
      maxTokens: 800,
      systemInstruction: systemInstruction
    });

    return {
      question: response.text,
      type: response.metadata?.hintType || (actionType === 'chat' ? 'conversation' : 'guiding_question'),
      followUp: response.metadata?.followUp
    };
  }

  /**
   * Analyze user code - focus on reasoning, not correctness
   */
  async analyzeCode(params) {
    const { code, language, problem, mode } = params;

    const prompt = this.buildPrompt(GEMINI_PROMPTS.analyzeCode, {
      code,
      language,
      problem_title: problem.title,
      problem_description: problem.description,
      mode
    });

    const response = await this.callGemini(prompt, {
      temperature: 0.4,
      maxTokens: 1000,
      systemInstruction: GEMINI_PROMPTS.systemRules.explainWhyNotHow
    });

    return {
      reasoning: response.text,
      complexity: response.metadata?.complexity,
      approach: response.metadata?.approach,
      considerations: response.metadata?.considerations,
      questions: response.metadata?.questions // Questions to ask user
    };
  }

  /**
   * Generate interview questions based on progress (Phase-based)
   */
  async generatePhaseBasedInterviewQuestion(params) {
    const { problem, phase, context } = params;

    const promptTemplate = GEMINI_PROMPTS.interviewQuestions[phase];
    const prompt = this.buildPrompt(promptTemplate, {
      problem_title: problem.title,
      problem_description: problem.description,
      previous_evaluations: JSON.stringify(context.previousEvaluations || []),
      strengths: context.userStrengths?.join(', ') || '',
      weaknesses: context.userWeaknesses?.join(', ') || ''
    });

    const response = await this.callGemini(prompt, {
      temperature: 0.8,
      maxTokens: 200
    });

    return {
      question: response.text,
      phase,
      timestamp: Date.now(),
      expectedFocus: response.metadata?.focus
    };
  }

  /**
   * Evaluate interview response quality
   */
  async evaluateInterviewResponse(params) {
    const { problem, userResponse, currentCode, interviewPhase, previousQuestions } = params;

    const prompt = this.buildPrompt(GEMINI_PROMPTS.evaluateResponse, {
      phase: interviewPhase,
      problem_title: problem.title,
      user_response: userResponse,
      code_snippet: currentCode?.substring(0, 500) || 'No code yet',
      context: JSON.stringify(previousQuestions.slice(-3))
    });

    const response = await this.callGemini(prompt, {
      temperature: 0.3,
      maxTokens: 400
    });

    return {
      score: response.metadata?.score || 50, // 0-100
      strengths: response.metadata?.strengths || [],
      weaknesses: response.metadata?.weaknesses || [],
      clarity: response.metadata?.clarity || 50,
      confidence: response.metadata?.confidence || 50,
      technicalDepth: response.metadata?.technicalDepth || 50,
      feedback: response.text
    };
  }

  /**
   * Generate comprehensive interview report
   */
  async generateInterviewReport(params) {
    const { problem, interview, codeIterations } = params;

    const prompt = this.buildPrompt(GEMINI_PROMPTS.interviewReport, {
      problem_title: problem.title,
      duration_minutes: Math.floor(interview.totalDuration / 60000),
      total_questions: interview.questions.length,
      evaluations: JSON.stringify(interview.evaluations),
      code_iterations: codeIterations.length,
      phases_completed: interview.currentPhase
    });

    const response = await this.callGemini(prompt, {
      temperature: 0.5,
      maxTokens: 1000
    });

    return {
      overallScore: response.metadata?.overallScore || 0,
      problemSolving: response.metadata?.problemSolving || 0,
      communication: response.metadata?.communication || 0,
      technicalSkill: response.metadata?.technicalSkill || 0,
      strengths: response.metadata?.strengths || [],
      improvements: response.metadata?.improvements || [],
      readinessLevel: response.metadata?.readinessLevel || 'beginner',
      detailedFeedback: response.text,
      nextSteps: response.metadata?.nextSteps || []
    };
  }

  /**
   * Explain concepts with mental models (Learning Mode)
   */
  async explainConcept(params) {
    const { concept, videoContext, style } = params;

    const prompt = this.buildPrompt(GEMINI_PROMPTS.explainConcept, {
      concept,
      video_context: videoContext || '',
      style
    });

    const response = await this.callGemini(prompt, {
      temperature: 0.7,
      maxTokens: 600
    });

    return {
      simpleExplanation: response.text,
      mentalModel: response.metadata?.mentalModel,
      analogy: response.metadata?.analogy,
      whenToUse: response.metadata?.whenToUse,
      commonMistakes: response.metadata?.commonMistakes
    };
  }

  /**
   * Find related problems for concept practice
   */
  async findRelatedProblems(params) {
    const { concept, difficulty } = params;

    const prompt = this.buildPrompt(GEMINI_PROMPTS.relatedProblems, {
      concept,
      difficulty
    });

    const response = await this.callGemini(prompt, {
      temperature: 0.4,
      maxTokens: 400
    });

    return response.metadata?.problems || [];
  }

  /**
   * Generate personalized recommendations
   */
  async generateRecommendations(params) {
    const { userStats, userProfile, focus } = params;

    const prompt = this.buildPrompt(GEMINI_PROMPTS.recommendations, {
      solved_count: userStats.solvedCount,
      weak_topics: userStats.weakTopics?.join(', ') || '',
      strong_topics: userStats.strongTopics?.join(', ') || '',
      avg_interview_score: userStats.avgInterviewScore || 0,
      focus
    });

    const response = await this.callGemini(prompt, {
      temperature: 0.6,
      maxTokens: 500
    });

    return {
      problems: response.metadata?.problems || [],
      topics: response.metadata?.topics || [],
      studyPlan: response.text,
      estimatedTimeWeeks: response.metadata?.estimatedTime || 4
    };
  }

  // Core Gemini API call with error handling and rate limiting
  async callGemini(prompt, options = {}) {
    // Ensure API key is loaded
    if (!this.apiKey) {
      await this.init(); // Try to reload
      if (!this.apiKey) {
        throw new Error('Gemini API key not configured. Please add it in settings.');
      }
    }

    // Check rate limit
    if (!await this.rateLimiter.allowRequest()) {
      throw new Error('Rate limit exceeded. Please wait before making more requests.');
    }

    const url = `${this.baseUrl}/models/${this.model}:generateContent?key=${this.apiKey}`;

    const requestBody = {
      contents: [{
        parts: [{
          text: prompt
        }]
      }],
      generationConfig: {
        temperature: options.temperature || 0.7,
        maxOutputTokens: options.maxTokens || 500,
        topP: 0.8,
        topK: 40
      },
      safetySettings: [
        {
          category: "HARM_CATEGORY_HARASSMENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_HATE_SPEECH",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        }
      ]
    };

    // Add system instruction if provided
    if (options.systemInstruction) {
      requestBody.systemInstruction = {
        parts: [{ text: options.systemInstruction }]
      };
    }

    try {
      // Add 10 second timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const error = await response.json();
        const errorMsg = error.error?.message || response.statusText;
        console.error('❌ Gemini API error:', errorMsg);
        throw new Error(errorMsg);
      }

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

      // Try to extract JSON metadata if present
      const metadata = this.extractMetadata(text);

      return {
        text: text.replace(/```json[\s\S]*?```/g, '').trim(),
        metadata,
        raw: data
      };

    } catch (error) {
      if (error.name === 'AbortError') {
        console.error('❌ Request timeout after 10 seconds');
        throw new Error('Request timed out. Please try again.');
      }
      console.error('❌ Gemini API call failed:', error.message);
      throw error;
    }
  }

  // Helper: Build prompt from template
  buildPrompt(template, variables) {
    let prompt = template;
    for (const [key, value] of Object.entries(variables)) {
      prompt = prompt.replace(new RegExp(`{{${key}}}`, 'g'), value);
    }
    return prompt;
  }

  // Helper: Extract JSON metadata from response
  extractMetadata(text) {
    const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[1]);
      } catch (e) {
        console.warn('Failed to parse metadata JSON:', e);
      }
    }
    return null;
  }

  // Helper: Parse problem analysis response
  parseAnalysis(response) {
    return {
      difficulty: response.metadata?.difficulty || 'medium',
      topics: response.metadata?.topics || [],
      patterns: response.metadata?.patterns || [],
      estimatedTime: response.metadata?.estimatedTime || 30,
      prerequisites: response.metadata?.prerequisites || [],
      summary: response.text
    };
  }

  // Fallback analysis when API fails or no key configured
  getFallbackAnalysis(problemData) {
    const difficulty = problemData.difficulty || 'medium';
    const topics = problemData.tags || [];
    
    return {
      difficulty,
      topics,
      patterns: ['Unknown - API key required for analysis'],
      estimatedTime: difficulty === 'easy' ? 15 : difficulty === 'hard' ? 45 : 30,
      prerequisites: [],
      summary: `Problem: ${problemData.title}\nDifficulty: ${difficulty}\nTo get AI analysis, please configure your Gemini API key in extension settings.`
    };
  }
}

/**
 * Rate limiter to prevent API abuse
 */
class RateLimiter {
  constructor() {
    this.requests = [];
    this.maxRequests = 15; // Conservative limit for free tier (Gemini allows 20/min)
    this.windowMs = 60000; // per minute
  }

  async allowRequest() {
    const now = Date.now();
    
    // Remove old requests outside window
    this.requests = this.requests.filter(time => now - time < this.windowMs);
    
    if (this.requests.length >= this.maxRequests) {
      return false;
    }
    
    this.requests.push(now);
    return true;
  }
}
