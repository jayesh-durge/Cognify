/**
 * LeetCode Content Script - Extract problem context and inject mentor UI
 */

(function() {
  'use strict';

  console.log('Cognify: LeetCode content script loaded');

  let mentorPanel = null;
  let problemData = null;
  let codeObserver = null;

  // Initialize on page load
  init();

  function init() {
    // Wait for LeetCode's React app to render
    setTimeout(() => {
      extractProblemData();
      injectMentorPanel();
      observeCodeEditor();
      setupMessageListener();
    }, 2000);
  }

  /**
   * Extract problem details from LeetCode DOM
   */
  function extractProblemData() {
    try {
      // Problem title
      const titleElement = document.querySelector('[data-cy="question-title"]') || 
                          document.querySelector('.css-v3d350');
      const title = titleElement?.textContent.trim() || '';

      // Difficulty
      const difficultyElement = document.querySelector('[diff]') || 
                               document.querySelector('.css-dcmtd5');
      const difficulty = difficultyElement?.textContent.toLowerCase() || 'medium';

      // Description
      const descriptionElement = document.querySelector('[data-track-load="description_content"]') ||
                                document.querySelector('.content__u3I1');
      const description = descriptionElement?.textContent.trim() || '';

      // Examples
      const examples = [];
      document.querySelectorAll('pre').forEach((pre, index) => {
        if (index < 3) { // First 3 examples
          examples.push(pre.textContent.trim());
        }
      });

      // Constraints
      let constraints = '';
      const constraintsHeading = Array.from(document.querySelectorAll('p')).find(p => 
        p.textContent.includes('Constraints:')
      );
      if (constraintsHeading) {
        const constraintsList = constraintsHeading.nextElementSibling;
        constraints = constraintsList?.textContent || '';
      }

      // Tags
      const tags = [];
      document.querySelectorAll('[class*="TopicTag"]').forEach(tag => {
        tags.push(tag.textContent.trim());
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

      // Send to background for analysis
      chrome.runtime.sendMessage({
        type: 'EXTRACT_PROBLEM',
        data: {
          platform: 'leetcode',
          problemData
        }
      }, (response) => {
        if (response?.success) {
          console.log('Problem extracted and analyzed:', response.analysis);
          updateMentorPanel(response.analysis);
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

    addMessage(question, 'user');
    input.value = '';

    // Get current code
    const code = extractCodeFromEditor();

    chrome.runtime.sendMessage({
      type: 'REQUEST_HINT',
      data: {
        userQuestion: question,
        userCode: code,
        context: {
          platform: 'leetcode',
          problem: problemData
        }
      }
    }, (response) => {
      if (response?.success) {
        addMessage(response.hint.question, 'mentor');
      } else {
        addMessage('Sorry, I encountered an error. Please try again.', 'error');
      }
    });
  }

  /**
   * Request a hint
   */
  function requestHint() {
    const code = extractCodeFromEditor();
    
    addMessage('Requesting guidance...', 'system');

    chrome.runtime.sendMessage({
      type: 'REQUEST_HINT',
      data: {
        userQuestion: 'I need a hint',
        userCode: code,
        context: {
          platform: 'leetcode',
          problem: problemData
        }
      }
    }, (response) => {
      if (response?.success) {
        addMessage(response.hint.question, 'mentor');
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
    const code = extractCodeFromEditor();
    
    if (!code || code.length < 10) {
      addMessage('Please write some code first, then I can help analyze your approach.', 'mentor');
      return;
    }

    addMessage('Analyzing your approach...', 'system');

    // Detect language
    const language = detectLanguage();

    chrome.runtime.sendMessage({
      type: 'ANALYZE_CODE',
      data: {
        code,
        language,
        problem: problemData
      }
    }, (response) => {
      if (response?.success) {
        const analysis = response.analysis;
        addMessage(analysis.reasoning, 'mentor');
        
        if (analysis.questions && analysis.questions.length > 0) {
          addMessage(`Questions to consider:\n${analysis.questions.map((q, i) => `${i+1}. ${q}`).join('\n')}`, 'mentor');
        }
      }
    });
  }

  /**
   * Extract code from LeetCode's Monaco editor
   */
  function extractCodeFromEditor() {
    try {
      // Try multiple selectors for LeetCode's editor
      const editorElement = document.querySelector('.monaco-editor') ||
                           document.querySelector('[data-mode-id]');
      
      if (!editorElement) return '';

      // Access Monaco editor instance
      const editor = editorElement.querySelector('.view-lines');
      if (editor) {
        return editor.textContent;
      }

      // Fallback: try to get from textarea
      const textarea = document.querySelector('textarea.inputarea');
      if (textarea) {
        return textarea.value;
      }

      return '';
    } catch (error) {
      console.error('Error extracting code:', error);
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
    const messageEl = document.createElement('div');
    messageEl.className = `message message-${type}`;
    
    const icon = type === 'mentor' ? '🧠' : type === 'user' ? '👤' : 'ℹ️';
    messageEl.innerHTML = `<span class="message-icon">${icon}</span><span class="message-text">${text}</span>`;
    
    messagesDiv.appendChild(messageEl);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
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
