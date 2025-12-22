/**
 * YouTube Content Script - Learning Mode
 * Enhances CS/Interview prep videos with interactive explanations
 */

(function() {
  'use strict';

  console.log('Cognify: YouTube Learning Mode activated');

  let currentVideo = null;
  let learningPanel = null;
  let conceptKeywords = [
    'algorithm', 'data structure', 'big o', 'complexity', 'dynamic programming',
    'recursion', 'graph', 'tree', 'sorting', 'searching', 'interview', 'leetcode',
    'binary search', 'depth first', 'breadth first', 'hash', 'stack', 'queue'
  ];

  init();

  function init() {
    // Detect if this is a programming/CS video
    setTimeout(() => {
      if (isProgrammingVideo()) {
        injectLearningPanel();
        setupVideoMonitoring();
      }
    }, 2000);
  }

  /**
   * Check if current video is programming-related
   */
  function isProgrammingVideo() {
    const title = document.querySelector('h1.ytd-watch-metadata')?.textContent.toLowerCase() || '';
    const description = document.querySelector('#description')?.textContent.toLowerCase() || '';
    const tags = Array.from(document.querySelectorAll('meta[property="og:video:tag"]'))
      .map(tag => tag.content.toLowerCase()).join(' ');

    const fullText = `${title} ${description} ${tags}`;

    return conceptKeywords.some(keyword => fullText.includes(keyword));
  }

  /**
   * Inject learning enhancement panel
   */
  function injectLearningPanel() {
    if (learningPanel) return;

    learningPanel = document.createElement('div');
    learningPanel.id = 'cognify-learning-panel';
    learningPanel.innerHTML = `
      <div class="cognify-learning">
        <div class="learning-header">
          <span>🎓 Cognify Learning Mode</span>
          <button class="learning-close">×</button>
        </div>
        <div class="learning-content">
          <div class="concept-tracker">
            <h4>Concepts Explained</h4>
            <ul id="concept-list"></ul>
          </div>
          <div class="learning-actions">
            <button id="explain-concept">Explain This Concept</button>
            <button id="find-problems">Find Related Problems</button>
            <button id="take-notes">Add to My Notes</button>
          </div>
          <div class="learning-chat">
            <div id="learning-messages"></div>
            <textarea id="learning-input" placeholder="Ask about a concept from the video..."></textarea>
            <button id="learning-send">Ask</button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(learningPanel);
    setupLearningListeners();
  }

  /**
   * Setup learning panel event listeners
   */
  function setupLearningListeners() {
    // Close panel
    document.querySelector('.learning-close').addEventListener('click', () => {
      learningPanel.style.display = 'none';
    });

    // Explain concept
    document.getElementById('explain-concept').addEventListener('click', () => {
      const concept = prompt('What concept from the video would you like me to explain?');
      if (concept) {
        explainConcept(concept);
      }
    });

    // Find related problems
    document.getElementById('find-problems').addEventListener('click', findRelatedProblems);

    // Send question
    document.getElementById('learning-send').addEventListener('click', sendLearningQuestion);
  }

  /**
   * Explain concept with mental models
   */
  function explainConcept(concept) {
    addLearningMessage(`Explaining "${concept}"...`, 'system');

    const videoContext = {
      title: document.querySelector('h1.ytd-watch-metadata')?.textContent || '',
      timestamp: getCurrentTimestamp(),
      channel: document.querySelector('#channel-name')?.textContent || ''
    };

    chrome.runtime.sendMessage({
      type: 'EXPLAIN_CONCEPT',
      data: {
        concept,
        videoContext,
        timestamp: videoContext.timestamp
      }
    }, (response) => {
      if (response?.success) {
        const explanation = response.explanation;
        
        addLearningMessage(explanation.simpleExplanation, 'mentor');
        
        if (explanation.analogy) {
          addLearningMessage(`💡 Think of it like: ${explanation.analogy}`, 'mentor');
        }

        if (explanation.whenToUse) {
          addLearningMessage(`🎯 When to use: ${explanation.whenToUse}`, 'mentor');
        }

        // Add to concept tracker
        addToConceptTracker(concept, videoContext.timestamp);
      }
    });
  }

  /**
   * Find problems related to video content
   */
  function findRelatedProblems() {
    const videoTitle = document.querySelector('h1.ytd-watch-metadata')?.textContent || '';
    
    // Extract concepts from title
    const detectedConcepts = conceptKeywords.filter(kw => 
      videoTitle.toLowerCase().includes(kw)
    );

    if (detectedConcepts.length === 0) {
      addLearningMessage('Could not detect specific concepts. Please use "Explain Concept" first.', 'system');
      return;
    }

    addLearningMessage(`Finding problems for: ${detectedConcepts.join(', ')}`, 'system');

    chrome.runtime.sendMessage({
      type: 'EXPLAIN_CONCEPT',
      data: {
        concept: detectedConcepts[0],
        videoContext: {}
      }
    }, (response) => {
      if (response?.success && response.relatedProblems) {
        const problems = response.relatedProblems;
        
        let problemList = '<strong>Try these problems:</strong><ul>';
        problems.forEach(p => {
          problemList += `<li><a href="${p.url || '#'}" target="_blank">${p.title}</a> (${p.difficulty})</li>`;
        });
        problemList += '</ul>';
        
        addLearningMessage(problemList, 'mentor', true);
      }
    });
  }

  /**
   * Send learning question
   */
  function sendLearningQuestion() {
    const input = document.getElementById('learning-input');
    const question = input.value.trim();
    
    if (!question) return;

    addLearningMessage(question, 'user');
    input.value = '';

    explainConcept(question);
  }

  /**
   * Monitor video playback for automatic concept detection
   */
  function setupVideoMonitoring() {
    const video = document.querySelector('video');
    if (!video) return;

    currentVideo = video;

    // Monitor captions/subtitles for concept keywords
    const captionTracker = setInterval(() => {
      const captionText = document.querySelector('.ytp-caption-segment')?.textContent.toLowerCase() || '';
      
      conceptKeywords.forEach(keyword => {
        if (captionText.includes(keyword)) {
          notifyConceptDetected(keyword);
        }
      });
    }, 5000);

    // Cleanup on navigation
    window.addEventListener('beforeunload', () => {
      clearInterval(captionTracker);
    });
  }

  /**
   * Notify when a concept is detected in video
   */
  function notifyConceptDetected(concept) {
    // Check if already notified recently
    const timestamp = getCurrentTimestamp();
    const key = `concept_${concept}_${Math.floor(timestamp / 60)}`;
    
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, 'true');

    // Show subtle notification
    const notification = document.createElement('div');
    notification.className = 'cognify-concept-notify';
    notification.innerHTML = `
      💡 Concept detected: <strong>${concept}</strong>
      <button onclick="this.parentElement.remove()">×</button>
      <button onclick="window.postMessage({type: 'cognify-explain', concept: '${concept}'}, '*')">Explain</button>
    `;
    document.body.appendChild(notification);

    setTimeout(() => notification.remove(), 10000);
  }

  /**
   * Get current video timestamp
   */
  function getCurrentTimestamp() {
    return currentVideo?.currentTime || 0;
  }

  /**
   * Add message to learning chat
   */
  function addLearningMessage(text, type, isHTML = false) {
    const messagesDiv = document.getElementById('learning-messages');
    const messageEl = document.createElement('div');
    messageEl.className = `learning-message learning-message-${type}`;
    
    if (isHTML) {
      messageEl.innerHTML = text;
    } else {
      messageEl.textContent = text;
    }
    
    messagesDiv.appendChild(messageEl);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  }

  /**
   * Add concept to tracker
   */
  function addToConceptTracker(concept, timestamp) {
    const conceptList = document.getElementById('concept-list');
    const item = document.createElement('li');
    item.innerHTML = `
      <strong>${concept}</strong> 
      <span class="timestamp">${formatTime(timestamp)}</span>
    `;
    conceptList.appendChild(item);
  }

  /**
   * Format timestamp
   */
  function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  // Listen for concept explain requests
  window.addEventListener('message', (event) => {
    if (event.data.type === 'cognify-explain') {
      explainConcept(event.data.concept);
    }
  });

})();
