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
  }

  /**
   * Analyze problem to understand complexity, topics, and patterns
   */
  async analyzeProblem(problemData) {
    const prompt = GEMINI_PROMPTS.analyzeProblem
      .replace('{{title}}', problemData.title)
      .replace('{{description}}', problemData.description)
      .replace('{{constraints}}', problemData.constraints)
      .replace('{{examples}}', JSON.stringify(problemData.examples));

    const response = await this.callGemini(prompt, {
      temperature: 0.3,
      maxTokens: 500
    });

    return this.parseAnalysis(response);
  }

  /**
   * Generate Socratic hints - ASK, don't TELL
   */
  async generateHint(params) {
    const { problem, userCode, userQuestion, previousHints, mode, context } = params;

    // Build context-aware prompt
    let promptTemplate = mode === 'interview' 
      ? GEMINI_PROMPTS.interviewHint 
      : GEMINI_PROMPTS.practiceHint;

    const prompt = this.buildPrompt(promptTemplate, {
      problem_title: problem.title,
      problem_description: problem.description,
      user_code: userCode || 'No code yet',
      user_question: userQuestion,
      previous_hints_count: previousHints.length,
      hint_level: context.hintLevel || 'medium'
    });

    const response = await this.callGemini(prompt, {
      temperature: 0.7,
      maxTokens: 300,
      systemInstruction: GEMINI_PROMPTS.systemRules.noSolutionRule
    });

    return {
      question: response.text,
      type: response.metadata?.hintType || 'guiding_question',
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
      maxTokens: 600,
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
   * Generate interview questions based on progress
   */
  async generateInterviewQuestion(params) {
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
    // Check rate limit
    if (!await this.rateLimiter.allowRequest()) {
      throw new Error('Rate limit exceeded. Please wait before making more requests.');
    }

    if (!this.apiKey) {
      throw new Error('Gemini API key not configured. Please add it in settings.');
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
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Gemini API error: ${error.error?.message || response.statusText}`);
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
      console.error('Gemini API call failed:', error);
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
}

/**
 * Rate limiter to prevent API abuse
 */
class RateLimiter {
  constructor() {
    this.requests = [];
    this.maxRequests = 60; // 60 requests
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
