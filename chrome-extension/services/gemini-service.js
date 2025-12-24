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
        maxTokens: 500,
        responseFormat: 'json'
      });

      const parsed = this.parseJSON(response.text, 'analyzeProblem');
      return {
        difficulty: parsed.difficulty || 'medium',
        topics: parsed.topics || [],
        patterns: parsed.patterns || [],
        estimatedTime: parsed.estimatedTime || 30,
        prerequisites: parsed.prerequisites || [],
        summary: parsed.summary || 'Unable to analyze',
        commonTraps: parsed.commonTraps || []
      };
    } catch (error) {
      console.error('❌ Analysis failed:', error.message);
      
      // Check if it's a quota error
      if (error.message.includes('credits exhausted') || error.message.includes('quota')) {
        return {
          difficulty: problemData.difficulty || 'medium',
          topics: problemData.tags || [],
          patterns: ['⚠️ AI credits exhausted'],
          estimatedTime: 30,
          prerequisites: [],
          summary: `⚠️ AI analysis unavailable - credits exhausted.\\n\\nCreate new Google AI Studio project and update API key in settings, or wait 24 hours for quota reset.`
        };
      }
      
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

    // Add JSON format instruction
    const jsonPrompt = prompt + '\n\n⚠️ Return ONLY valid JSON: {"question": "<your interview question>"}';

    try {
      const response = await this.callGemini(jsonPrompt, {
        temperature: 0.7,
        maxTokens: 400,
        responseFormat: 'json'
      });

      const parsed = this.parseJSON(response.text, 'generateInterviewQuestion');
      return parsed.question || response.text;
    } catch (error) {
      console.error('Error generating interview question:', error);
      
      // Check if it's a quota error
      if (error.message.includes('credits exhausted') || error.message.includes('quota')) {
        return `⚠️ AI credits exhausted. Update API key in settings or wait 24 hours.`;
      }
      
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
      const response = await this.callGemini(prompt, {
        temperature: 0.3,
        maxTokens: 400,
        responseFormat: 'json'
      });

      console.log('\n📥 RAW AI RESPONSE:');
      console.log('-----------------------------------------------------------------');
      console.log(response.text);
      console.log('-----------------------------------------------------------------\n');

      // Parse JSON from response
      const scores = this.parseJSON(response.text, 'scoreInterviewAnswer');
      
      // Validate scores are in 0-100 range
      const validateScore = (score) => Math.min(100, Math.max(0, score || 50));
      scores.communication = validateScore(scores.communication);
      scores.technical = validateScore(scores.technical);
      scores.overall = validateScore(scores.overall);

      console.log('\n=================================================================');
      console.log('  ⭐ AI GENERATED EVALUATION SCORES (0-100 scale)');
      console.log('=================================================================\n');
      
      const commScore = scores.communication;
      const techScore = scores.technical;
      const overallScore = scores.overall;
      
      console.log('  💬 COMMUNICATION SKILLS: ' + commScore + '/100');
      console.log('     ' + '█'.repeat(Math.floor(commScore / 10)) + '░'.repeat(10 - Math.floor(commScore / 10)));
      console.log('     How clearly and professionally they communicate\n');
      
      console.log('  🔧 TECHNICAL CORRECTNESS: ' + techScore + '/100');
      console.log('     ' + '█'.repeat(Math.floor(techScore / 10)) + '░'.repeat(10 - Math.floor(techScore / 10)));
      console.log('     Technical accuracy and problem-solving ability\n');
      
      console.log('  🎯 OVERALL PERFORMANCE: ' + overallScore + '/100');
      console.log('     ' + '█'.repeat(Math.floor(overallScore / 10)) + '░'.repeat(10 - Math.floor(overallScore / 10)));
      console.log('     Holistic interview readiness assessment\n');
      
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
      
      // Check if it's a quota error
      if (error.message.includes('credits exhausted') || error.message.includes('quota')) {
        const quotaError = {
          communication: 0,
          technical: 0,
          overall: 0,
          brief_feedback: '⚠️ AI credits exhausted. Create new Google AI Studio project and update API key in settings, or wait 24 hours.'
        };
        console.log('⚠️ Using quota error response:', quotaError);
        return quotaError;
      }
      
      const fallbackScores = {
        communication: 50,
        technical: 50,
        overall: 50,
        brief_feedback: 'Unable to evaluate - using default scores'
      };
      console.log('⚠️ Using fallback scores:', fallbackScores);
      return fallbackScores;
    }
  }

  /**
   * Score interview answer AND generate follow-up response
   * Returns both scores (hidden) and a conversational follow-up
   */
  async scoreAndRespond(params) {
    const { question, answer, code, problem, questionsAsked } = params;

    console.log('\n=================================================================');
    console.log('  🤖 AI INTERVIEW: SCORE + FOLLOW-UP GENERATION');
    console.log('=================================================================\n');

    // First, generate the scores
    const scores = await this.scoreInterviewAnswer({ question, answer, code });

    console.log('✅ Scores generated');
    console.log('📊 Communication:', scores.communication, '| Technical:', scores.technical, '| Overall:', scores.overall);

    // Now generate a follow-up response based on the answer
    const followUpPrompt = `You are a professional interviewer conducting a DSA interview. The candidate just answered your question.

**Problem:** ${problem?.title || 'Unknown'}
**Your Question:** "${question}"
**Candidate's Answer:** "${answer}"
**Their Code:** ${code?.substring(0, 500) || 'No code yet'}
**Questions Asked So Far:** ${questionsAsked}/4

Based on their answer, provide ONE of the following:
1. A brief counter-question to probe deeper (if their answer was partial or you want to explore more)
2. A short acknowledgment asking them to continue (if answer was good)

Examples:
- "Interesting. How would you handle the case when...?"
- "Good point. What about the time complexity?"
- "I see. Can you elaborate on why you chose that approach?"
- "Noted. Feel free to continue with your solution."
- "Understood. What edge cases are you considering?"

Keep it VERY brief (1-2 sentences max). Be professional and natural.

⚠️ Return ONLY valid JSON: {"followUp": "<your 1-2 sentence response>"}`;

    try {
      const response = await this.callGemini(followUpPrompt, {
        temperature: 0.7,
        maxTokens: 400,
        responseFormat: 'json'
      });

      const parsed = this.parseJSON(response.text, 'scoreAndRespond');
      const followUpMsg = parsed.followUp || response.text || "Noted. Feel free to continue.";
      
      console.log('✅ Follow-up response generated:', followUpMsg);
      console.log('=================================================================\n');

      return {
        scores: scores,
        followUpMessage: followUpMsg
      };
    } catch (error) {
      console.error('❌ Error generating follow-up:', error);
      
      // Return scores with a default follow-up
      return {
        scores: scores,
        followUpMessage: "Noted. Feel free to continue with your solution."
      };
    }
  }

  /**
   * UNIFIED Interview Response - Scores AND responds in one call
   * This is the primary method for ALL interview mode interactions
   */
  async unifiedInterviewResponse(params) {
    const { problem, questionsAsked, userMessage, currentCode, currentQuestion, isAnsweringQuestion } = params;

    console.log('\n=================================================================');
    console.log('  🎤 UNIFIED INTERVIEW RESPONSE - Score + Reply');
    console.log('=================================================================\n');
    console.log('📥 Input:');
    console.log('  Problem:', problem?.title);
    console.log('  Questions asked:', questionsAsked);
    console.log('  User message:', userMessage?.substring(0, 100));
    console.log('  Is answering question:', isAnsweringQuestion);
    console.log('  Current question:', currentQuestion?.substring(0, 60));

    // Determine context
    let context = 'General interview conversation';
    if (isAnsweringQuestion && currentQuestion) {
      context = `Candidate is responding to interview question: "${currentQuestion}"`;
    } else if (questionsAsked === 0) {
      context = 'Interview just started, candidate is explaining their initial approach';
    } else {
      context = 'Candidate is thinking aloud or explaining their progress';
    }

    const prompt = GEMINI_PROMPTS.unifiedInterviewResponse
      .replace('{{problem_title}}', problem?.title || 'Unknown Problem')
      .replace('{{questions_asked}}', questionsAsked || 0)
      .replace('{{context}}', context)
      .replace('{{user_message}}', userMessage || 'No message')
      .replace('{{current_code}}', currentCode?.substring(0, 500) || 'No code yet');

    console.log('🚀 Sending unified request to Gemini...');
    
    try {
      const response = await this.callGemini(prompt, {
        temperature: 0.5,
        maxTokens: 400,
        responseFormat: 'json'
      });

      console.log('\n📥 RAW AI RESPONSE:');
      console.log(response.text);

      // Parse JSON response using universal parser
      const result = this.parseJSON(response.text, 'unifiedInterviewResponse');

      // Validate and sanitize scores
      const validateScore = (score) => Math.min(100, Math.max(0, score || 50));
      result.scores.communication = validateScore(result.scores.communication);
      result.scores.technical = validateScore(result.scores.technical);
      result.scores.overall = validateScore(result.scores.overall);

      console.log('\n✅ Parsed Response:');
      console.log('📊 Scores:', result.scores);
      console.log('💬 Interviewer response:', result.interviewer_response);
      console.log('🏷️ Interaction type:', result.interaction_type);
      console.log('=================================================================\n');

      return {
        scores: result.scores,
        response: result.interviewer_response,
        interactionType: result.interaction_type || 'conversation',
        shouldScore: result.interaction_type === 'answer'
      };

    } catch (error) {
      console.error('❌ Error in unified interview response:', error);
      
      // Fallback response
      return {
        scores: {
          communication: 60,
          technical: 60,
          overall: 60,
          brief_feedback: 'AI response parsing failed'
        },
        response: "I see. Please continue with your solution.",
        interactionType: 'conversation',
        shouldScore: false
      };
    }
  }
            brief_feedback: 'Conversational interaction'
          },
          response: response.text.trim().substring(0, 300), // Use AI's actual response
          interactionType: 'conversation',
          shouldScore: false
        };
      }
      
      // Complete fallback if no response at all
      console.error('🔴 No response available, using hard fallback');
      return {
        scores: {
          communication: 50,
          technical: 50,
          overall: 50,
          brief_feedback: 'Unable to evaluate'
        },
        response: "I see. Can you elaborate on your approach?",
        interactionType: 'conversation',
        shouldScore: false
      };
    }
  }

  /**
   * Handle interview mode conversation (not answering a question)
   * @deprecated Use unifiedInterviewResponse instead
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
      const response = await this.callGemini(prompt + '\n\nBe professional and complete your thought. 1-2 sentences.', {
        temperature: 0.8,
        maxTokens: 400
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
      
      // Check if it's a quota/rate limit error
      if (error.message.includes('quota') || error.message.includes('limit') || error.message.includes('429') || error.message.includes('RESOURCE_EXHAUSTED')) {
        return "⚠️ AI credits exhausted. Please either:\n1. Create a new Google AI Studio project and update API key in settings\n2. Wait 24 hours for quota to reset";
      }
      
      return "Unable to process your message. Please check your API key in settings.";
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

    try {
      const response = await this.callGemini(prompt, {
        temperature: 0.7,
        maxTokens: 400,
        systemInstruction: systemInstruction,
        responseFormat: 'json'
      });

      const parsed = this.parseJSON(response.text, 'generateHint');
      
      return {
        question: parsed.hint || parsed.response || response.text,
        type: parsed.hintType || (actionType === 'chat' ? 'conversation' : 'guiding_question'),
        followUp: parsed.followUp
      };
    } catch (error) {
      console.error('❌ Hint generation error:', error.message);
      
      // Check if it's a quota error
      if (error.message.includes('credits exhausted') || error.message.includes('quota')) {
        return {
          question: "⚠️ AI credits exhausted. Please create new Google AI Studio project and update API key in settings, or wait 24 hours for quota reset.",
          type: 'error',
          followUp: null
        };
      }
      
      // Return helpful fallback that doesn't give solution
      return {
        question: "Let's break this down. What data structure would help you track the information you need?",
        type: 'fallback',
        followUp: null
      };
    }
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

    // Add JSON format instruction
    const jsonPrompt = prompt + '\n\n⚠️ Return ONLY valid JSON: {"reasoning": "<analysis>", "complexity": "<time/space>", "approach": "<description>", "questions": ["q1", "q2"]}';

    const response = await this.callGemini(jsonPrompt, {
      temperature: 0.4,
      maxTokens: 400,
      systemInstruction: GEMINI_PROMPTS.systemRules.explainWhyNotHow,
      responseFormat: 'json'
    });

    const parsed = this.parseJSON(response.text, 'analyzeCode');

    return {
      reasoning: parsed.reasoning || response.text,
      complexity: parsed.complexity,
      approach: parsed.approach,
      considerations: parsed.considerations,
      questions: parsed.questions || []
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

    const jsonPrompt = prompt + '\n\n⚠️ Return ONLY valid JSON: {"question": "<your question>", "focus": "<focus area>"}';

    const response = await this.callGemini(jsonPrompt, {
      temperature: 0.8,
      maxTokens: 400,
      responseFormat: 'json'
    });

    const parsed = this.parseJSON(response.text, 'generatePhaseBasedInterviewQuestion');

    return {
      question: parsed.question || response.text,
      phase,
      timestamp: Date.now(),
      expectedFocus: parsed.focus
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
      maxTokens: 400,
      responseFormat: 'json'
    });

    const parsed = this.parseJSON(response.text, 'evaluateInterviewResponse');

    return {
      score: parsed.score || 50,
      strengths: parsed.strengths || [],
      weaknesses: parsed.weaknesses || [],
      clarity: parsed.clarity || 50,
      confidence: parsed.confidence || 50,
      technicalDepth: parsed.technicalDepth || 50,
      feedback: parsed.feedback || response.text
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
      maxTokens: 400,
      responseFormat: 'json'
    });

    const parsed = this.parseJSON(response.text, 'generateInterviewReport');

    return {
      overallScore: parsed.overallScore || 0,
      problemSolving: parsed.problemSolving || 0,
      communication: parsed.communication || 0,
      technicalSkill: parsed.technicalSkill || 0,
      strengths: parsed.strengths || [],
      improvements: parsed.improvements || [],
      readinessLevel: parsed.readinessLevel || 'beginner',
      detailedFeedback: parsed.detailedFeedback || response.text,
      nextSteps: parsed.nextSteps || []
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
      maxTokens: 400,
      responseFormat: 'json'
    });

    const parsed = this.parseJSON(response.text, 'explainConcept');

    return {
      simpleExplanation: parsed.explanation || response.text,
      mentalModel: parsed.mentalModel,
      analogy: parsed.analogy,
      whenToUse: parsed.whenToUse,
      commonMistakes: parsed.commonMistakes || []
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
      maxTokens: 400,
      responseFormat: 'json'
    });

    const parsed = this.parseJSON(response.text, 'findRelatedProblems');
    return parsed.problems || [];
  }

  /**
   * Analyze user's proficiency in specific topics based on their performance
   */
  async analyzeTopicProficiency(params) {
    const { problemTags, hintsUsed, interviewScores, userAnswer, problemDifficulty } = params;

    const prompt = `Analyze a user's proficiency in these coding topics based on their problem-solving performance.

Problem Topics: ${problemTags.join(', ')}
Problem Difficulty: ${problemDifficulty}
Hints Used: ${hintsUsed}
${interviewScores ? `Interview Scores: Communication ${interviewScores.communication}/100, Technical ${interviewScores.technical}/100, Overall ${interviewScores.overall}/100` : ''}
${userAnswer ? `User's Answer: ${userAnswer.substring(0, 200)}` : ''}

Based on this performance, classify each topic as either "strong" or "needs_practice":
- Strong: User solved with minimal help (0-1 hints), good interview scores (>70/100), correct understanding
- Needs Practice: User needed significant help (3+ hints), low scores (<50/100), or struggled with concepts

Return ONLY a JSON object with this exact format:
{
  "topicClassifications": [
    {"topic": "topic_name", "proficiency": "strong" or "needs_practice", "confidence": 0.0-1.0}
  ]
}`;

    try {
      const response = await this.callGemini(prompt, {
        temperature: 0.3,
        maxTokens: 400
      });

      let jsonString = response.text.trim();
      const jsonMatch = jsonString.match(/```json\s*([\s\S]*?)```/);
      if (jsonMatch) {
        jsonString = jsonMatch[1].trim();
      }
      
      const result = JSON.parse(jsonString);
      return result.topicClassifications || [];
    } catch (error) {
      console.error('❌ Error analyzing topic proficiency:', error);
      // Fallback: simple rule-based classification
      return problemTags.map(topic => ({
        topic,
        proficiency: hintsUsed <= 1 ? 'strong' : 'needs_practice',
        confidence: hintsUsed <= 1 ? 0.8 : 0.7
      }));
    }
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
      maxTokens: 400
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
      throw new Error('Rate limit exceeded (15 requests/min). Please wait a minute before continuing.');
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
        maxOutputTokens: options.maxTokens || 400,
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

    // Add JSON mode instruction if requested
    if (options.responseFormat === 'json') {
      // Gemini 2.0+ supports response_mime_type for JSON mode
      requestBody.generationConfig.responseMimeType = 'application/json';
    }

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
        const errorStatus = error.error?.status || '';
        
        console.error('❌ Gemini API error:', errorMsg, 'Status:', errorStatus);
        
        // Check for quota/rate limit errors
        if (errorStatus === 'RESOURCE_EXHAUSTED' || response.status === 429 || errorMsg.includes('quota') || errorMsg.includes('limit')) {
          throw new Error('AI credits exhausted. Create new Google AI Studio project and update API key in settings, or wait 24 hours for quota reset.');
        }
        
        throw new Error(errorMsg);
      }

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

      // Return text directly - parseJSON will handle extraction if needed
      return {
        text: text,
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

  /**
   * Universal JSON parser with multiple fallback strategies
   * Handles various formats: plain JSON, markdown code blocks, mixed text
   */
  parseJSON(text, context = 'unknown') {
    console.log(`🔍 Parsing JSON for context: ${context}`);
    
    let jsonString = text.trim();
    
    // Strategy 1: Try extracting from ```json ... ``` blocks
    let jsonMatch = jsonString.match(/```json\s*([\s\S]*?)```/);
    if (jsonMatch) {
      jsonString = jsonMatch[1].trim();
      console.log('✅ Extracted from ```json block');
    } else {
      // Strategy 2: Try extracting from ``` ... ``` blocks without "json" tag
      jsonMatch = jsonString.match(/```\s*([\s\S]*?)```/);
      if (jsonMatch) {
        jsonString = jsonMatch[1].trim();
        console.log('✅ Extracted from ``` block');
      } else {
        // Strategy 3: Remove leading/trailing backticks
        jsonString = jsonString.replace(/^`+|`+$/g, '').trim();
      }
    }
    
    // Strategy 4: Find JSON object if embedded in text
    if (!jsonString.startsWith('{')) {
      const jsonObjMatch = jsonString.match(/\{[\s\S]*\}/);
      if (jsonObjMatch) {
        jsonString = jsonObjMatch[0];
        console.log('✅ Extracted JSON object from text');
      }
    }
    
    // Strategy 5: Try to parse
    try {
      const parsed = JSON.parse(jsonString);
      console.log('✅ Successfully parsed JSON');
      return parsed;
    } catch (error) {
      console.error(`❌ JSON parse failed for ${context}:`, error.message);
      console.error('Raw text:', text.substring(0, 200));
      
      // Last resort: return a safe default based on context
      if (context === 'scoreInterviewAnswer') {
        return {
          communication: 50,
          technical: 50,
          overall: 50,
          brief_feedback: 'Unable to parse AI response - using default scores'
        };
      } else if (context === 'analyzeProblem') {
        return {
          difficulty: 'medium',
          topics: [],
          patterns: [],
          estimatedTime: 30,
          prerequisites: [],
          summary: 'Unable to parse analysis'
        };
      }
      
      // Generic fallback
      return { error: 'Parse failed', raw: text.substring(0, 100) };
    }
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
