/**
 * GeeksforGeeks Content Script
 * Extracts problem context and injects AI mentor interface
 */

(function() {
  'use strict';

  let mentorPanel = null;
  let currentProblem = null;

  // Initialize when page loads
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  function init() {
    console.log('Cognify: GeeksforGeeks content script loaded');
    
    // Check if we're on a problem page
    if (isProblemPage()) {
      extractAndSendProblem();
      injectMentorPanel();
      observeCodeEditor();
    }
  }

  function isProblemPage() {
    // GFG problem URLs: /problems/problem-name or /batch/problem-solving
    return window.location.pathname.includes('/problems/') ||
           window.location.pathname.includes('/batch/');
  }

  function extractAndSendProblem() {
    try {
      const problemData = {
        title: extractTitle(),
        difficulty: extractDifficulty(),
        description: extractDescription(),
        constraints: extractConstraints(),
        examples: extractExamples(),
        tags: extractTags(),
        expectedComplexity: extractExpectedComplexity()
      };

      currentProblem = problemData;

      // Send to background script
      chrome.runtime.sendMessage({
        type: 'EXTRACT_PROBLEM',
        data: {
          platform: 'geeksforgeeks',
          problemData
        }
      }, (response) => {
        if (response?.success) {
          console.log('Problem extracted and analyzed:', response.analysis);
        }
      });

    } catch (error) {
      console.error('Failed to extract problem:', error);
    }
  }

  function extractTitle() {
    const titleEl = document.querySelector('.problem-title, h1, [class*="problemTitle"]');
    return titleEl?.textContent?.trim() || 'Unknown Problem';
  }

  function extractDifficulty() {
    const diffEl = document.querySelector('.difficulty, [class*="difficulty"]');
    return diffEl?.textContent?.trim() || 'Unknown';
  }

  function extractDescription() {
    const descEl = document.querySelector('.problem-description, .problemstatement, [class*="problemDescription"]');
    return descEl?.textContent?.trim() || '';
  }

  function extractConstraints() {
    const constraintsEl = document.querySelector('.constraints, [class*="constraint"]');
    return constraintsEl?.textContent?.trim() || '';
  }

  function extractExamples() {
    const examples = [];
    const exampleSections = document.querySelectorAll('.example, [class*="example"]');
    
    exampleSections.forEach(section => {
      const inputEl = section.querySelector('.input, [class*="input"]');
      const outputEl = section.querySelector('.output, [class*="output"]');
      
      if (inputEl && outputEl) {
        examples.push({
          input: inputEl.textContent.trim(),
          output: outputEl.textContent.trim()
        });
      }
    });

    return examples;
  }

  function extractTags() {
    const tags = [];
    document.querySelectorAll('.tags a, [class*="tag"]').forEach(tag => {
      tags.push(tag.textContent.trim());
    });
    return tags;
  }

  function extractExpectedComplexity() {
    const complexityEl = document.querySelector('.expected-complexity, [class*="complexity"]');
    return complexityEl?.textContent?.trim() || '';
  }

  function injectMentorPanel() {
    // Create floating mentor panel
    mentorPanel = document.createElement('div');
    mentorPanel.id = 'cognify-mentor-panel';
    mentorPanel.className = 'cognify-panel';
    mentorPanel.innerHTML = `
      <div class="cognify-header">
        <span style="font-size: 24px;">🧠</span>
        <span>AI Mentor</span>
        <button id="cognify-toggle" title="Toggle Panel">−</button>
      </div>
      <div class="cognify-content">
        <div class="cognify-mode-selector">
          <button class="mode-btn active" data-mode="practice">Practice</button>
          <button class="mode-btn" data-mode="interview">Interview</button>
          <button class="mode-btn" data-mode="learning">Learning</button>
        </div>
        <div id="cognify-chat" class="cognify-chat"></div>
        <div class="cognify-input-area">
          <textarea id="cognify-input" placeholder="Ask for guidance (not solutions)..."></textarea>
          <button id="cognify-send">Send</button>
        </div>
      </div>
    `;

    document.body.appendChild(mentorPanel);

    // Attach event listeners
    attachPanelListeners();
  }

  function attachPanelListeners() {
    // Toggle panel
    document.getElementById('cognify-toggle')?.addEventListener('click', () => {
      const content = mentorPanel.querySelector('.cognify-content');
      content.style.display = content.style.display === 'none' ? 'block' : 'none';
      document.getElementById('cognify-toggle').textContent = 
        content.style.display === 'none' ? '+' : '−';
    });

    // Mode switcher
    document.querySelectorAll('.mode-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        const mode = e.target.dataset.mode;
        chrome.storage.local.set({ mode });
        addChatMessage(`Switched to ${mode} mode`, 'system');
      });
    });

    // Send message
    const sendBtn = document.getElementById('cognify-send');
    const input = document.getElementById('cognify-input');

    sendBtn?.addEventListener('click', handleSendMessage);
    input?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSendMessage();
      }
    });
  }

  function handleSendMessage() {
    const input = document.getElementById('cognify-input');
    const userMessage = input.value.trim();
    
    if (!userMessage) return;

    // Display user message
    addChatMessage(userMessage, 'user');
    input.value = '';

    // Get current code
    const currentCode = extractCodeFromEditor();

    // Request hint from AI
    chrome.runtime.sendMessage({
      type: 'REQUEST_HINT',
      data: {
        userCode: currentCode,
        userQuestion: userMessage,
        context: {
          platform: 'geeksforgeeks',
          problem: currentProblem
        }
      }
    }, (response) => {
      if (response?.success) {
        addChatMessage(response.hint.question, 'mentor');
      } else {
        addChatMessage('Failed to get response. Please try again.', 'error');
      }
    });
  }

  function extractCodeFromEditor() {
    // GFG uses Monaco editor
    if (window.monaco && window.monaco.editor) {
      const models = window.monaco.editor.getModels();
      if (models.length > 0) {
        return models[0].getValue();
      }
    }

    // Fallback: textarea
    const textarea = document.querySelector('textarea[name="code"], #code, .monaco-editor textarea');
    return textarea?.value || '';
  }

  function addChatMessage(message, type) {
    const chatDiv = document.getElementById('cognify-chat');
    if (!chatDiv) return;

    const msgDiv = document.createElement('div');
    msgDiv.className = `cognify-message cognify-${type}`;
    msgDiv.textContent = message;
    
    chatDiv.appendChild(msgDiv);
    chatDiv.scrollTop = chatDiv.scrollHeight;
  }

  function observeCodeEditor() {
    // Monitor code changes for analysis
    let codeChangeTimeout;
    const observer = new MutationObserver(() => {
      clearTimeout(codeChangeTimeout);
      codeChangeTimeout = setTimeout(() => {
        const code = extractCodeFromEditor();
        if (code && code.length > 50) {
          // Code has meaningful content
          // Could trigger auto-analysis in interview mode
        }
      }, 2000);
    });

    const editorContainer = document.querySelector('.monaco-editor, #editor');
    if (editorContainer) {
      observer.observe(editorContainer, {
        childList: true,
        subtree: true,
        characterData: true
      });
    }
  }

  // Listen for messages from background
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'INTERVIEW_QUESTION') {
      addChatMessage(message.question, 'interviewer');
    }
    return true;
  });

})();
