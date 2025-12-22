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

  function init() {
    // Wait for LeetCode's React app to render
    setTimeout(() => {
      extractProblemData();
      injectMentorPanel();
      observeCodeEditor();
      setupMessageListener();
    }, 3000); // Increased to 3 seconds for slower connections
    
    // Also try again after 5 seconds if first attempt had issues
    setTimeout(() => {
      if (!problemData || problemData.title === 'Unknown Problem') {
        console.log('🔄 Retrying problem extraction...');
        extractProblemData();
      }
    }, 5000);
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

      // Update UI immediately with extracted data
      updateMentorPanel({
        difficulty,
        topics: tags,
        estimatedTime: difficulty === 'easy' ? 15 : difficulty === 'hard' ? 45 : 30
      });

      // Send to background for AI analysis (may take a few seconds)
      chrome.runtime.sendMessage({
        type: 'EXTRACT_PROBLEM',
        data: {
          platform: 'leetcode',
          problemData
        }
      }, (response) => {
        if (chrome.runtime.lastError) {
          console.error('❌ Extension error:', chrome.runtime.lastError);
          const statusText = document.querySelector('.status-text');
          if (statusText) {
            statusText.innerHTML = `<strong>Extension Error</strong><br>Please reload the page`;
          }
          return;
        }
        if (response?.success) {
          console.log('✅ Problem analyzed by AI:', response.analysis);
          updateMentorPanel(response.analysis);
        } else if (response?.error) {
          console.error('❌ Analysis error:', response.error);
          const statusText = document.querySelector('.status-text');
          if (statusText) {
            statusText.innerHTML = `<strong>Problem Detected</strong><br>Difficulty: ${difficulty}<br>${response.error}`;
          }
        }
      });

    } catch (error) {
      console.error('Error extracting LeetCode problem:', error);
    }
  }

  /**
   * Inject floating mentor panel
   */
  function injectMentorPanel() {
    if (mentorPanel) return;

    mentorPanel = document.createElement('div');
    mentorPanel.id = 'cognify-mentor-panel';
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
            <button class="mode-btn" data-mode="learning">Learning</button>
          </div>
          <div class="cognify-status">
            <p class="status-text">Analyzing problem...</p>
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
            <button id="cognify-analyze">Analyze My Code</button>
            <button id="cognify-sidepanel">Open Full Panel</button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(mentorPanel);

    // Setup event listeners
    setupPanelListeners();
  }

  /**
   * Setup panel interaction listeners
   */
  function setupPanelListeners() {
    // Mode switching
    document.querySelectorAll('.mode-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        const mode = e.target.dataset.mode;
        chrome.storage.local.set({ mode });
        addMessage(`Switched to ${mode} mode`, 'system');
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

    // Open side panel
    document.getElementById('cognify-sidepanel').addEventListener('click', () => {
      chrome.runtime.sendMessage({ type: 'OPEN_SIDEPANEL' });
    });
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
      if (response?.success) {
        const mentorResponse = response.hint.question;
        console.log('📩 Received mentor response:', {
          fullLength: mentorResponse?.length,
          preview: mentorResponse?.substring(0, 100),
          hasQuestion: !!response.hint.question
        });
        addMessage(mentorResponse, 'mentor');
        
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
      }
      sendResponse({ received: true });
      return true;
    });
  }

})();
