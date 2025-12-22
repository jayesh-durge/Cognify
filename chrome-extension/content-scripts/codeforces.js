/**
 * Codeforces Content Script
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
    console.log('Cognify: Codeforces content script loaded');
    
    // Check if we're on a problem page
    if (isProblemPage()) {
      extractAndSendProblem();
      injectMentorPanel();
      observeCodeEditor();
    }
  }

  function isProblemPage() {
    // Codeforces problem URLs: /problemset/problem/CONTEST/INDEX or /contest/CONTEST/problem/INDEX
    return window.location.pathname.includes('/problem/') ||
           window.location.pathname.includes('/problemset/');
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
        timeLimit: extractTimeLimit(),
        memoryLimit: extractMemoryLimit()
      };

      currentProblem = problemData;

      // Send to background script
      chrome.runtime.sendMessage({
        type: 'EXTRACT_PROBLEM',
        data: {
          platform: 'codeforces',
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
    const titleEl = document.querySelector('.problem-statement .title, .header .title');
    return titleEl?.textContent?.trim() || 'Unknown Problem';
  }

  function extractDifficulty() {
    const tagsDiv = document.querySelector('.tag-box');
    if (tagsDiv) {
      const ratingEl = Array.from(tagsDiv.querySelectorAll('.tag')).find(el => 
        el.textContent.match(/\d{3,4}/)
      );
      if (ratingEl) {
        const rating = parseInt(ratingEl.textContent.match(/\d{3,4}/)[0]);
        if (rating < 1200) return 'Easy';
        if (rating < 1600) return 'Medium';
        return 'Hard';
      }
    }
    return 'Unknown';
  }

  function extractDescription() {
    const descEl = document.querySelector('.problem-statement');
    const header = descEl?.querySelector('.header');
    if (header) header.remove();
    return descEl?.textContent?.trim() || '';
  }

  function extractConstraints() {
    const inputSection = document.querySelector('.input-specification');
    const outputSection = document.querySelector('.output-specification');
    return `Input: ${inputSection?.textContent || ''}\nOutput: ${outputSection?.textContent || ''}`;
  }

  function extractExamples() {
    const examples = [];
    const sampleTests = document.querySelector('.sample-test');
    
    if (sampleTests) {
      const inputs = sampleTests.querySelectorAll('.input pre');
      const outputs = sampleTests.querySelectorAll('.output pre');
      
      for (let i = 0; i < Math.min(inputs.length, outputs.length); i++) {
        examples.push({
          input: inputs[i].textContent.trim(),
          output: outputs[i].textContent.trim()
        });
      }
    }

    return examples;
  }

  function extractTags() {
    const tags = [];
    document.querySelectorAll('.tag-box .tag').forEach(tag => {
      const text = tag.textContent.trim();
      if (!text.match(/^\d+$/)) { // Exclude ratings
        tags.push(text);
      }
    });
    return tags;
  }

  function extractTimeLimit() {
    const timeLimitEl = document.querySelector('.time-limit');
    return timeLimitEl?.textContent?.replace('time limit per test', '')?.trim() || '1s';
  }

  function extractMemoryLimit() {
    const memLimitEl = document.querySelector('.memory-limit');
    return memLimitEl?.textContent?.replace('memory limit per test', '')?.trim() || '256MB';
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
          platform: 'codeforces',
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
    // Codeforces uses textarea or Ace editor
    
    // Ace Editor
    if (window.ace) {
      const editor = ace.edit('editor');
      if (editor) {
        return editor.getValue();
      }
    }

    // Fallback: textarea
    const textarea = document.querySelector('textarea[name="source"], #sourceCodeTextarea, .ace_text-input');
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

    const editorContainer = document.querySelector('#editor, .ace_editor');
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
