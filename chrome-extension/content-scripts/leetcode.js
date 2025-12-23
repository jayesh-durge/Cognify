/**
 * LeetCode Content Script - Extract problem context and inject mentor UI
 * 
 * SMART API USAGE:
 * - NO automatic API calls on page load
 * - Problem extraction uses LOCAL data only (title, difficulty, tags)
 * - API calls ONLY when user explicitly interacts:
 *   1. User sends chat message → calls API with conversation history
 *   2. User clicks "Get Hint" → calls API with problem context
 *   3. User clicks "Analyze Code" → calls API with code + problem context
 * - Conversation history maintained for context-aware responses
 * - 10-second cooldown between requests to prevent quota exhaustion
 */

(function() {
  'use strict';

  console.log('Cognify: LeetCode content script loaded');

  let mentorPanel = null;
  let problemData = null;
  let codeObserver = null;
  let lastRequestTime = 0;
  let requestCooldown = 10000; // 10 seconds between requests
  let quotaExhausted = false;
  let quotaResetTime = 0;
  let conversationHistory = []; // Track chat history for context

  // Initialize on page load
  init();

  async function init() {
    // Wait for LeetCode's React app to render
    setTimeout(async () => {
      // Check authentication first
      const isAuthenticated = await checkAuthentication();
      
      extractProblemData();
      injectMentorPanel(isAuthenticated);
      observeCodeEditor();
      setupMessageListener();
    }, 3000); // Increased to 3 seconds for slower connections
    
    // Also try again after 5 seconds if first attempt had issues
    setTimeout(() => {
      if (!problemData || problemData.title === 'Unknown Problem') {
        console.log('🔄 Retrying problem extraction...');
        extractProblemData();
      }
      
      // Make sure status text is not stuck on "Loading..."
      const statusText = document.querySelector('.status-text');
      if (statusText && statusText.textContent.includes('Loading')) {
        if (problemData && problemData.title) {
          statusText.innerHTML = `<strong>${problemData.title}</strong><br>Difficulty: ${problemData.difficulty}`;
        } else {
          statusText.innerHTML = `<strong>Ready</strong><br>Ask questions or click "Get Hint"`;
        }
      }
    }, 8000); // Check after 8 seconds
  }
  
  /**
   * Check if user is authenticated
   */
  async function checkAuthentication() {
    return new Promise((resolve) => {
      chrome.storage.local.get(['user_id'], (result) => {
        resolve(!!result.user_id);
      });
    });
  }

  /**
   * Check if user is authenticated
   */
  async function checkAuthentication() {
    return new Promise((resolve) => {
      chrome.storage.local.get(['user_id'], (result) => {
        resolve(!!result.user_id);
      });
    });
  }
  
  /**
   * Extract problem details from LeetCode DOM
   */
  function extractProblemData() {
    try {
      // Try to get problem from URL first
      const urlMatch = window.location.pathname.match(/\/problems\/([^/]+)/);
      const problemSlug = urlMatch?.[1] || '';
      
      console.log('🔍 Extracting from URL:', problemSlug);

      // Problem title - try multiple approaches
      let title = 'Unknown Problem';
      
      // Method 1: data-cy attribute (most reliable)
      let titleElement = document.querySelector('[data-cy="question-title"]');
      
      // Method 2: Look for heading with problem number pattern
      if (!titleElement || !titleElement.textContent.trim()) {
        const headings = document.querySelectorAll('div[class*="text"] a');
        for (const heading of headings) {
          if (heading.textContent.match(/^\d+\./)) {
            titleElement = heading;
            break;
          }
        }
      }
      
      // Method 3: Check meta tags
      if (!titleElement || !titleElement.textContent.trim()) {
        const metaTitle = document.querySelector('meta[property="og:title"]');
        if (metaTitle) {
          title = metaTitle.content.replace(' - LeetCode', '').trim();
        }
      }
      
      if (titleElement && titleElement.textContent.trim()) {
        title = titleElement.textContent.trim();
      }

      // Difficulty - look for Easy/Medium/Hard text
      let difficulty = 'medium';
      
      // Method 1: Look for colored difficulty badge
      let difficultyElement = document.querySelector('[class*="text-easy"], [class*="text-medium"], [class*="text-hard"]');
      
      // Method 2: Search all text for difficulty keywords
      if (!difficultyElement) {
        const allDivs = document.querySelectorAll('div');
        for (const div of allDivs) {
          const text = div.textContent.toLowerCase();
          if (text === 'easy' || text === 'medium' || text === 'hard') {
            difficultyElement = div;
            break;
          }
        }
      }
      
      if (difficultyElement) {
        const diffText = difficultyElement.textContent.toLowerCase();
        if (diffText.includes('easy')) difficulty = 'easy';
        else if (diffText.includes('hard')) difficulty = 'hard';
        else if (diffText.includes('medium')) difficulty = 'medium';
      }

      // Description - look for problem content
      const descriptionElement = document.querySelector('[data-track-load="description_content"]') ||
                                document.querySelector('[class*="elfjS"]') ||
                                document.querySelector('[class*="description"]') ||
                                document.querySelector('div[data-e2e-locator="console-question-description"]');
      const description = descriptionElement?.textContent.trim() || '';

      // Examples
      const examples = [];
      document.querySelectorAll('pre').forEach((pre, index) => {
        if (index < 3 && pre.textContent.trim().length > 0) { // First 3 non-empty examples
          examples.push(pre.textContent.trim());
        }
      });

      // Constraints
      let constraints = '';
      const constraintsHeading = Array.from(document.querySelectorAll('p, strong, b')).find(p => 
        p.textContent.includes('Constraints:') || p.textContent.includes('Constraint:')
      );
      if (constraintsHeading) {
        let constraintsList = constraintsHeading.nextElementSibling;
        if (!constraintsList) constraintsList = constraintsHeading.parentElement.nextElementSibling;
        constraints = constraintsList?.textContent || '';
      }

      // Tags
      const tags = [];
      document.querySelectorAll('[class*="TopicTag"], [class*="topic-tag"], a[href*="/tag/"]').forEach(tag => {
        const tagText = tag.textContent.trim();
        if (tagText && !tags.includes(tagText)) {
          tags.push(tagText);
        }
      });

      problemData = {
        platform: 'leetcode',
        title,
        difficulty,
        description: description.substring(0, 2000), // Limit size
        examples,
        constraints,
        tags,
        url: window.location.href
      };

      console.log('✅ Extracted problem data:', { title, difficulty, descLength: description.length, exampleCount: examples.length });

      // Update UI immediately with extracted data - ALWAYS show the problem info
      const statusText = document.querySelector('.status-text');
      if (statusText) {
        statusText.innerHTML = `<strong>${title}</strong><br>Difficulty: ${difficulty}${tags.length > 0 ? '<br>Topics: ' + tags.slice(0, 3).join(', ') : ''}`;
      }
      
      updateMentorPanel({
        difficulty,
        topics: tags,
        estimatedTime: difficulty === 'easy' ? 15 : difficulty === 'hard' ? 45 : 30
      });

      // Send to background for AI analysis (optional enhancement)
      chrome.runtime.sendMessage({
        type: 'EXTRACT_PROBLEM',
        data: {
          platform: 'leetcode',
          problemData
        }
      }, (response) => {
        if (chrome.runtime.lastError) {
          console.error('❌ Extension error:', chrome.runtime.lastError);
          // Don't show error - already have basic info displayed
          return;
        }
        if (response?.success && response.analysis) {
          console.log('✅ Problem analyzed by AI:', response.analysis);
          updateMentorPanel(response.analysis);
          // Update status with AI insights if available
          if (statusText && response.analysis.summary) {
            statusText.innerHTML = `<strong>${title}</strong><br>${response.analysis.summary.substring(0, 100)}...`;
          }
        } else if (response?.error) {
          console.error('❌ Analysis error:', response.error);
          // Keep showing basic problem info even if AI analysis fails
        }
      });

    } catch (error) {
      console.error('Error extracting LeetCode problem:', error);
      const statusText = document.querySelector('.status-text');
      if (statusText) {
        statusText.innerHTML = `<strong>Problem Detected</strong><br>Click "Get Hint" to start`;
      }
    }
  }

  /**
   * Inject floating mentor panel
   */
  async function injectMentorPanel(isAuthenticated) {
    if (mentorPanel) return;

    mentorPanel = document.createElement('div');
    mentorPanel.id = 'cognify-mentor-panel';
    
    if (!isAuthenticated) {
      // Show login required UI
      mentorPanel.innerHTML = `
        <div class="cognify-panel">
          <div class="cognify-header">
            <span class="cognify-logo">🧠 Cognify Mentor</span>
            <button class="cognify-minimize" title="Minimize">−</button>
          </div>
          <div class="cognify-content" style="display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 30px 20px; text-align: center;">
            <div style="font-size: 48px; margin-bottom: 15px;">🔒</div>
            <h3 style="margin: 0 0 10px 0; color: #333; font-size: 16px;">Sign In Required</h3>
            <p style="margin: 0 0 20px 0; color:white; font-size: 13px;">Please sign in to use Cognify Mentor features</p>
            <button id="cognify-login-btn" style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: white; border: none; padding: 10px 20px; border-radius: 8px; font-size: 13px; font-weight: 500; cursor: pointer; box-shadow: 0 2px 8px rgba(99, 102, 241, 0.3); transition: all 0.3s;">
              Open Dashboard to Sign In
            </button>
            <p style="font-size: 11px; color: #999; margin-top: 15px;">A new tab will open for authentication</p>
          </div>
        </div>
      `;
      
      document.body.appendChild(mentorPanel);
      
      // Setup minimize button
      document.querySelector('.cognify-minimize').addEventListener('click', () => {
        mentorPanel.classList.toggle('minimized');
      });
      
      // Setup login button
      document.getElementById('cognify-login-btn').addEventListener('click', () => {
        chrome.runtime.sendMessage({ type: 'SIGN_IN' }, (response) => {
          if (response?.success) {
            // Reload page to reinitialize with auth
            addMessage('Sign-in successful! Reloading page...', 'system');
            setTimeout(() => window.location.reload(), 1500);
          }
        });
      });
      
      // Listen for authentication changes
      chrome.storage.onChanged.addListener((changes, area) => {
        if (area === 'local' && changes.user_id) {
          // User signed in, reload the page
          window.location.reload();
        }
      });
      
      return;
    }
    
    // Show normal authenticated UI
    mentorPanel.innerHTML = `
      <div class="cognify-panel">
        <div class="cognify-header">
          <span class="cognify-logo">🧠 Cognify Mentor</span>
          <button class="cognify-minimize" title="Minimize">−</button>
        </div>
        <div class="cognify-content">
          <div class="cognify-mode-selector">
            <button class="mode-btn active" data-mode="practice">Practice</button>
            <button class="mode-btn" data-mode="interview">Interview</button>
          </div>
          <div class="cognify-status">
            <p class="status-text">Loading problem...</p>
          </div>
          <div class="cognify-chat">
            <div class="chat-messages" id="cognify-messages"></div>
            <div class="chat-input-wrapper">
              <textarea id="cognify-input" placeholder="Ask a guiding question (I won't give you the answer!)"></textarea>
              <button id="cognify-send">Ask</button>
            </div>
          </div>
          <div class="cognify-actions">
            <button id="cognify-hint">Get Hint</button>
            <button id="cognify-analyze">Analyze Code</button>
            <button id="cognify-solved">✓ Mark Solved</button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(mentorPanel);

    // Setup event listeners
    setupPanelListeners();
    
    // Set initial status visibility based on stored mode
    chrome.storage.local.get(['mode'], (result) => {
      const currentMode = result.mode || 'practice';
      const statusSection = document.querySelector('.cognify-status');
      if (statusSection) {
        statusSection.style.display = currentMode === 'practice' ? 'block' : 'none';
      }
    });
  }

  /**
   * Setup panel interaction listeners
   */
  function setupPanelListeners() {
    // Mode switching
    document.querySelectorAll('.mode-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        const mode = e.target.dataset.mode;
        chrome.storage.local.set({ mode });
        
        // Notify background about mode change
        const code = extractCodeFromEditor();
        chrome.runtime.sendMessage({
          type: 'MODE_CHANGED',
          data: { mode, currentCode: code }
        }, (response) => {
          console.log('MODE_CHANGED response:', response);
          
          if (response?.success) {
            if (mode === 'interview' && response.firstQuestion) {
              // Display first interview question
              addMessage(response.firstQuestion, 'interviewer');
              addMessage(`Switched to ${mode} mode. Please answer the question above.`, 'system');
            } else {
              addMessage(`Switched to ${mode} mode`, 'system');
            }
          } else if (response?.error) {
            // Handle error - likely problem not extracted
            console.error('Failed to switch to interview mode:', response.error);
            addMessage(`❌ ${response.error}`, 'system');
            
            // Revert to practice mode in UI
            document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
            document.querySelector('.mode-btn[data-mode="practice"]')?.classList.add('active');
            chrome.storage.local.set({ mode: 'practice' });
          }
        });
        
        // Show/hide status based on mode
        const statusSection = document.querySelector('.cognify-status');
        if (statusSection) {
          statusSection.style.display = mode === 'practice' ? 'block' : 'none';
        }
      });
    });

    // Minimize
    document.querySelector('.cognify-minimize').addEventListener('click', () => {
      mentorPanel.classList.toggle('minimized');
    });

    // Send message
    document.getElementById('cognify-send').addEventListener('click', sendUserQuestion);
    document.getElementById('cognify-input').addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendUserQuestion();
      }
    });

    // Get hint
    document.getElementById('cognify-hint').addEventListener('click', requestHint);

    // Analyze code
    document.getElementById('cognify-analyze').addEventListener('click', analyzeCode);

    // Mark as solved
    document.getElementById('cognify-solved').addEventListener('click', markProblemSolved);
  }

  /**
   * Send user question to AI mentor
   */
  function sendUserQuestion() {
    const input = document.getElementById('cognify-input');
    const question = input.value.trim();
    
    if (!question) return;

    // Check if quota is exhausted
    const now = Date.now();
    if (quotaExhausted && now < quotaResetTime) {
      const waitTime = Math.ceil((quotaResetTime - now) / 1000);
      addMessage(`🚫 API quota exhausted. Please wait ${waitTime} seconds before retrying.`, 'error');
      return;
    }

    // Check cooldown
    const timeSinceLastRequest = now - lastRequestTime;
    if (timeSinceLastRequest < requestCooldown) {
      const waitTime = Math.ceil((requestCooldown - timeSinceLastRequest) / 1000);
      addMessage(`⏰ Cooldown: Wait ${waitTime} seconds between requests (rate limit protection)`, 'system');
      return;
    }

    addMessage(question, 'user');
    input.value = '';
    lastRequestTime = now;

    // Add to conversation history
    conversationHistory.push({
      role: 'user',
      message: question,
      timestamp: now
    });

    // Get current code
    const code = extractCodeFromEditor();
    console.log('📤 Sending question with code:', { 
      questionLength: question.length, 
      codeLength: code.length,
      hasProblemData: !!problemData,
      conversationLength: conversationHistory.length
    });

    chrome.runtime.sendMessage({
      type: 'REQUEST_HINT',
      data: {
        userQuestion: question,
        userCode: code,
        conversationHistory: conversationHistory.slice(-5), // Last 5 messages for context
        actionType: 'chat', // User is chatting, not requesting specific hint
        context: {
          platform: 'leetcode',
          problem: problemData
        }
      }
    }, (response) => {
      if (chrome.runtime.lastError) {
        addMessage('Extension error: ' + chrome.runtime.lastError.message, 'error');
        return;
      }
      
      // Check if authentication is required
      if (response?.requiresAuth) {
        addMessage('🔒 Authentication required. Redirecting to dashboard...', 'error');
        setTimeout(() => {
          chrome.runtime.sendMessage({ type: 'SIGN_IN' });
        }, 1000);
        return;
      }
      
      if (response?.success) {
        // Check if interview was completed
        if (response.interviewComplete && response.scores) {
          console.log('🎉 Interview completed with scores:', response.scores);
          const mentorResponse = response.hint.question;
          addMessage(mentorResponse, 'interviewer');
          
          // Automatically mark as solved
          addMessage('🎉 Marking as solved and syncing to dashboard...', 'system');
          markProblemSolved();
          return;
        }
        
        // Check if this was a scored answer (interview mode)
        if (response.hint?.metadata?.scoredAnswer) {
          // Don't add message - answer was scored silently
          console.log('✅ Answer scored successfully');
          return;
        }
        
        const mentorResponse = response.hint.question;
        console.log('📩 Received mentor response:', {
          fullLength: mentorResponse?.length,
          preview: mentorResponse?.substring(0, 100),
          hasQuestion: !!response.hint.question
        });
        
        // Determine message type based on mode
        const messageType = response.mode === 'interview' ? 'interviewer' : 'mentor';
        addMessage(mentorResponse, messageType);
        
        // Add to conversation history
        conversationHistory.push({
          role: 'mentor',
          message: mentorResponse,
          timestamp: Date.now()
        });
        
        quotaExhausted = false; // Reset on success
      } else {
        const errorMsg = response?.error || 'Sorry, I encountered an error. Please try again.';
        
        // Check if it's a quota error
        if (errorMsg.includes('quota') || errorMsg.includes('Quota')) {
          const retryMatch = errorMsg.match(/(\d+\.\d+)s/);
          if (retryMatch) {
            const retrySeconds = Math.ceil(parseFloat(retryMatch[1]));
            quotaExhausted = true;
            quotaResetTime = Date.now() + (retrySeconds * 1000);
            addMessage(`🚫 API quota exhausted! Requests blocked for ${retrySeconds} seconds.`, 'error');
          } else {
            addMessage('🚫 API quota exhausted! Wait 60 seconds before trying again.', 'error');
            quotaExhausted = true;
            quotaResetTime = Date.now() + 60000;
          }
        } else {
          addMessage(errorMsg, 'error');
        }
        console.error('Hint request failed:', response);
      }
    });
  }

  /**
   * Request a hint
   */
  function requestHint() {
    const now = Date.now();
    
    // Check if quota is exhausted
    if (quotaExhausted && now < quotaResetTime) {
      const waitTime = Math.ceil((quotaResetTime - now) / 1000);
      addMessage(`🚫 API quota exhausted. Wait ${waitTime} seconds.`, 'error');
      return;
    }
    
    // Check cooldown
    const timeSinceLastRequest = now - lastRequestTime;
    if (timeSinceLastRequest < requestCooldown) {
      const waitTime = Math.ceil((requestCooldown - timeSinceLastRequest) / 1000);
      addMessage(`⏰ Cooldown: ${waitTime} seconds (rate limit protection)`, 'system');
      return;
    }

    const code = extractCodeFromEditor();
    lastRequestTime = now;
    
    addMessage('Requesting guidance...', 'system');

    chrome.runtime.sendMessage({
      type: 'REQUEST_HINT',
      data: {
        userQuestion: 'I need a hint',
        userCode: code,
        conversationHistory: conversationHistory.slice(-5),
        actionType: 'hint', // Specific hint request
        context: {
          platform: 'leetcode',
          problem: problemData
        }
      }
    }, (response) => {
      if (response?.success) {
        const hintText = response.hint.question;
        addMessage(hintText, 'mentor');
        
        // Add to conversation history
        conversationHistory.push({
          role: 'mentor',
          message: hintText,
          timestamp: Date.now(),
          actionType: 'hint'
        });
        
        if (response.remainingHints >= 0) {
          addMessage(`Hints remaining in this session: ${response.remainingHints}`, 'system');
        }
      }
    });
  }

  /**
   * Mark problem as solved and sync to Firebase
   */
  function markProblemSolved() {
    if (!problemData) {
      addMessage('❌ No problem detected. Please refresh the page.', 'error');
      return;
    }

    // Calculate session data
    const sessionData = {
      timeSpent: Math.floor((Date.now() - problemData.timestamp) / 1000 / 60), // minutes
      attempts: conversationHistory.filter(m => m.actionType === 'analyze').length + 1
    };

    addMessage('🎉 Marking as solved and syncing to dashboard...', 'system');

    chrome.runtime.sendMessage({
      type: 'PROBLEM_SOLVED',
      data: {
        problemData,
        sessionData,
        completedFromButton: true // Signal that user clicked the button
      }
    }, (response) => {
      if (response?.success) {
        // Check if this was an interview completion with scores
        if (response.interviewComplete && response.scores) {
          console.log('🎯 Interview completed with scores:', response.scores);
          
          // Display comprehensive score breakdown
          const scoreMessage = `🎉 Interview Complete!\n\n📊 Final Scores:\n` +
            `• Communication: ${response.scores.communication}/10\n` +
            `• Technical: ${response.scores.technical}/10\n` +
            `• Overall: ${response.scores.overall}/10\n\n` +
            (response.scores.strengths.length > 0 ? `💪 Strengths: ${response.scores.strengths.join(', ')}\n` : '') +
            (response.scores.improvements.length > 0 ? `📈 Areas to Improve: ${response.scores.improvements.join(', ')}\n\n` : '') +
            `✅ Report saved to your dashboard!`;
          
          addMessage(scoreMessage, 'interviewer');
        } else {
          addMessage('✅ Problem logged to your dashboard! Check your progress there.', 'mentor');
        }
        
        // Visual feedback
        const solvedBtn = document.getElementById('cognify-solved');
        if (solvedBtn) {
          solvedBtn.style.backgroundColor = '#22c55e';
          solvedBtn.textContent = '✓ Logged!';
          solvedBtn.disabled = true;
        }
      } else {
        addMessage(`⚠️ ${response?.error || 'Could not sync to dashboard. Data saved locally.'}`, 'system');
      }
    });
  }

  /**
   * Analyze user's code
   */
  function analyzeCode() {
    const now = Date.now();
    
    // Check if quota is exhausted
    if (quotaExhausted && now < quotaResetTime) {
      const waitTime = Math.ceil((quotaResetTime - now) / 1000);
      addMessage(`🚫 API quota exhausted. Wait ${waitTime} seconds.`, 'error');
      return;
    }
    
    // Check cooldown
    const timeSinceLastRequest = now - lastRequestTime;
    if (timeSinceLastRequest < requestCooldown) {
      const waitTime = Math.ceil((requestCooldown - timeSinceLastRequest) / 1000);
      addMessage(`⏰ Cooldown: ${waitTime} seconds (rate limit protection)`, 'system');
      return;
    }

    const code = extractCodeFromEditor();
    
    if (!code || code.length < 10) {
      addMessage('Please write some code first, then I can help analyze your approach.', 'mentor');
      return;
    }

    lastRequestTime = now;
    addMessage('Analyzing your approach...', 'system');

    // Detect language
    const language = detectLanguage();

    chrome.runtime.sendMessage({
      type: 'ANALYZE_CODE',
      data: {
        code,
        language,
        conversationHistory: conversationHistory.slice(-3), // Last 3 for context
        actionType: 'analyze', // Code analysis request
        problem: problemData
      }
    }, (response) => {
      if (response?.success) {
        const analysis = response.analysis;
        addMessage(analysis.reasoning, 'mentor');
        
        // Add to conversation history
        conversationHistory.push({
          role: 'mentor',
          message: analysis.reasoning,
          timestamp: Date.now(),
          actionType: 'analyze'
        });
        
        if (analysis.questions && analysis.questions.length > 0) {
          const questionsText = `Questions to consider:\n${analysis.questions.map((q, i) => `${i+1}. ${q}`).join('\n')}`;
          addMessage(questionsText, 'mentor');
          conversationHistory.push({
            role: 'mentor',
            message: questionsText,
            timestamp: Date.now()
          });
        }
      }
    });
  }

  /**
   * Extract code from LeetCode's Monaco editor
   */
  function extractCodeFromEditor() {
    try {
      console.log('🔍 Attempting to extract code...');
      
      // Method 1: Try to access Monaco editor directly via global
      if (window.monaco && window.monaco.editor) {
        const editors = window.monaco.editor.getEditors();
        if (editors && editors.length > 0) {
          const code = editors[0].getValue();
          console.log('✅ Got code from Monaco API:', code?.length || 0, 'chars');
          return code || '';
        }
      }
      
      // Method 2: Try to find Monaco editor instance in DOM
      const editorElement = document.querySelector('.monaco-editor');
      if (editorElement) {
        // Look for the editor model in React fiber
        const reactKey = Object.keys(editorElement).find(key => key.startsWith('__react'));
        if (reactKey) {
          let fiber = editorElement[reactKey];
          // Walk up the fiber tree to find editor instance
          while (fiber) {
            if (fiber.memoizedProps?.editor) {
              const code = fiber.memoizedProps.editor.getValue?.();
              if (code) {
                console.log('✅ Got code from React fiber:', code.length, 'chars');
                return code;
              }
            }
            fiber = fiber.return;
          }
        }
      }
      
      // Method 3: Parse visible lines from Monaco view-lines
      const viewLines = document.querySelector('.view-lines');
      if (viewLines) {
        const lines = [];
        const lineElements = viewLines.querySelectorAll('.view-line');
        lineElements.forEach(line => {
          // Get text content, preserving whitespace
          const spans = line.querySelectorAll('span');
          let lineText = '';
          spans.forEach(span => {
            lineText += span.textContent;
          });
          lines.push(lineText);
        });
        const code = lines.join('\n');
        if (code.trim()) {
          console.log('✅ Got code from view-lines:', code.length, 'chars');
          return code;
        }
      }
      
      // Method 4: Try textarea fallback
      const textarea = document.querySelector('textarea[data-mode-id]');
      if (textarea && textarea.value) {
        console.log('✅ Got code from textarea:', textarea.value.length, 'chars');
        return textarea.value;
      }
      
      // Method 5: Try to get from code mirror (older LeetCode versions)
      const codeLines = document.querySelectorAll('.CodeMirror-line');
      if (codeLines.length > 0) {
        const code = Array.from(codeLines).map(line => line.textContent).join('\n');
        console.log('✅ Got code from CodeMirror:', code.length, 'chars');
        return code;
      }

      console.warn('⚠️ No code found in editor');
      return '';
    } catch (error) {
      console.error('❌ Error extracting code:', error);
      return '';
    }
  }

  /**
   * Detect programming language
   */
  function detectLanguage() {
    try {
      const langSelect = document.querySelector('[data-cy="lang-select"]') ||
                        document.querySelector('#lang-select');
      return langSelect?.textContent.toLowerCase() || 'python';
    } catch {
      return 'python';
    }
  }

  /**
   * Observe code editor for changes
   */
  function observeCodeEditor() {
    const editor = document.querySelector('.monaco-editor');
    
    if (editor && !codeObserver) {
      codeObserver = new MutationObserver(() => {
        // Code changed - could trigger real-time hints (future feature)
      });

      codeObserver.observe(editor, {
        childList: true,
        subtree: true,
        characterData: true
      });
    }
  }

  /**
   * Add message to chat
   */
  function addMessage(text, type) {
    const messagesDiv = document.getElementById('cognify-messages');
    if (!messagesDiv) {
      console.error('❌ Chat messages container not found!');
      return;
    }
    
    const messageEl = document.createElement('div');
    messageEl.className = `message message-${type}`;
    
    // Create icon span
    const iconSpan = document.createElement('span');
    iconSpan.className = 'message-icon';
    iconSpan.textContent = type === 'mentor' ? '🧠' : type === 'user' ? '👤' : type === 'error' ? '❌' : 'ℹ️';
    
    // Create text span
    const textSpan = document.createElement('span');
    textSpan.className = 'message-text';
    textSpan.textContent = text; // Use textContent instead of innerHTML to prevent HTML issues
    
    messageEl.appendChild(iconSpan);
    messageEl.appendChild(textSpan);
    
    messagesDiv.appendChild(messageEl);
    
    // Smooth scroll to bottom
    setTimeout(() => {
      messagesDiv.scrollTop = messagesDiv.scrollHeight;
    }, 50);
    
    // Log full message for debugging
    if (type === 'mentor') {
      console.log('✅ Full mentor response:', text);
    } else {
      console.log('✅ Message added:', type, text.substring(0, 50) + (text.length > 50 ? '...' : ''));
    }
  }

  /**
   * Update mentor panel with problem analysis
   */
  function updateMentorPanel(analysis) {
    const statusText = document.querySelector('.status-text');
    if (statusText && analysis) {
      statusText.innerHTML = `
        <strong>Problem Analyzed</strong><br>
        Topics: ${analysis.topics?.join(', ') || 'Unknown'}<br>
        Difficulty: ${analysis.difficulty || 'Medium'}<br>
        Estimated Time: ${analysis.estimatedTime || '30'} min
      `;
    }
  }

  /**
   * Setup message listener for background communication
   */
  function setupMessageListener() {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.type === 'REFRESH_PROBLEM') {
        extractProblemData();
        sendResponse({ received: true });
      } else if (message.type === 'INTERVIEW_QUESTION') {
        // Automated interview question arrived
        const { question, questionNumber } = message;
        addMessage(`Question ${questionNumber}/4: ${question}`, 'interviewer');
        sendResponse({ received: true });
      } else if (message.type === 'GET_CURRENT_CODE') {
        // Background needs current code for question generation
        const code = extractCodeFromEditor();
        sendResponse({ code: code });
      }
      return true;
    });
  }
  
  /**
   * Add message to chat with special handling for interviewer
   */
  function addMessage(text, type) {
    // Don't display empty messages (from scoring responses)
    if (!text || text.trim() === '') return;
    
    const messagesDiv = document.getElementById('cognify-messages');
    if (!messagesDiv) {
      console.error('❌ Chat messages container not found!');
      return;
    }
    
    const messageEl = document.createElement('div');
    messageEl.className = `message message-${type}`;
    
    // Create icon span
    const iconSpan = document.createElement('span');
    iconSpan.className = 'message-icon';
    
    // Different icons for interviewer vs mentor
    if (type === 'interviewer') {
      iconSpan.textContent = '👔'; // Interviewer icon
    } else {
      iconSpan.textContent = type === 'mentor' ? '🧠' : type === 'user' ? '👤' : type === 'error' ? '❌' : 'ℹ️';
    }
    
    // Create text span
    const textSpan = document.createElement('span');
    textSpan.className = 'message-text';
    textSpan.textContent = text;
    
    messageEl.appendChild(iconSpan);
    messageEl.appendChild(textSpan);
    
    messagesDiv.appendChild(messageEl);
    
    // Smooth scroll to bottom
    setTimeout(() => {
      messagesDiv.scrollTop = messagesDiv.scrollHeight;
    }, 50);
    
    // Log full message for debugging
    console.log('✅ Message added:', type, text.substring(0, 100));
  }
})();