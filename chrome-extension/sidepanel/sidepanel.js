/**
 * Side Panel Script - Detailed analysis and recommendations
 */

let currentSession = null;

document.addEventListener('DOMContentLoaded', async () => {
  // Check authentication first
  const authCheck = await checkAuthentication();
  if (!authCheck) {
    return; // User needs to sign in
  }
  
  setupTabs();
  await loadSessionData();
  attachListeners();
  startSessionTimer();
});

async function checkAuthentication() {
  // Check if user is authenticated
  const result = await chrome.storage.local.get(['user_id', 'user_profile']);
  
  if (!result.user_id) {
    // Show login required message
    document.body.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; padding: 20px; text-align: center; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
        <div style="font-size: 64px; margin-bottom: 24px; filter: drop-shadow(0 4px 8px rgba(0,0,0,0.2));">🔒</div>
        <h2 style="margin: 0 0 12px 0; color: #ffffff; font-size: 24px; font-weight: 600; text-shadow: 0 2px 4px rgba(0,0,0,0.1);">Sign In Required</h2>
        <p style="margin: 0 0 28px 0; color: #ffffff; font-size: 15px; opacity: 0.95; text-shadow: 0 1px 2px rgba(0,0,0,0.1);">Please sign in to use Cognify Mentor features</p>
        <button id="loginBtn" style="background: #ffffff; color: #667eea; border: none; padding: 14px 28px; border-radius: 12px; font-size: 15px; font-weight: 600; cursor: pointer; margin-bottom: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); transition: all 0.3s; transform: scale(1);" onmouseover="this.style.transform='scale(1.05)'; this.style.boxShadow='0 6px 16px rgba(0,0,0,0.2)'" onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='0 4px 12px rgba(0,0,0,0.15)'">Open Dashboard to Sign In</button>
        <p style="font-size: 13px; color: #ffffff; margin: 0; opacity: 0.85; text-shadow: 0 1px 2px rgba(0,0,0,0.1);">A new tab will open for authentication</p>
      </div>
    `;
    
    // Add click handler to open dashboard
    document.getElementById('loginBtn').addEventListener('click', () => {
      chrome.tabs.create({ url: 'http://localhost:3000' });
    });
    
    // Listen for authentication
    chrome.storage.onChanged.addListener((changes, area) => {
      if (area === 'local' && changes.user_id) {
        // User signed in, reload the sidepanel
        window.location.reload();
      }
    });
    
    return false;
  }
  
  return true;
}

function setupTabs() {
  document.querySelectorAll('.sp-tab').forEach(tab => {
    tab.addEventListener('click', (e) => {
      const tabName = e.target.dataset.tab;
      switchTab(tabName);
    });
  });
}

function switchTab(tabName) {
  // Update tab buttons
  document.querySelectorAll('.sp-tab').forEach(tab => {
    tab.classList.remove('active');
  });
  document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

  // Update tab content
  document.querySelectorAll('.tab-content').forEach(content => {
    content.style.display = 'none';
  });
  document.getElementById(`tab-${tabName}`).style.display = 'block';

  // Load tab-specific data
  if (tabName === 'recommendations') {
    loadRecommendations();
  }
}

async function loadSessionData() {
  // Get current tab
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) return;

  // Request session data from background
  chrome.runtime.sendMessage({
    type: 'GET_SESSION_DATA',
    tabId: tab.id
  }, (response) => {
    if (response?.session) {
      currentSession = response.session;
      updateUI();
    }
  });
}

function updateUI() {
  if (!currentSession) return;

  // Update stats
  document.getElementById('hintsUsed').textContent = currentSession.hints?.length || 0;
  
  // Calculate time spent
  const timeSpent = Math.floor((Date.now() - currentSession.startTime) / 60000);
  document.getElementById('timeSpent').textContent = `${timeSpent}m`;

  // Update problem info
  if (currentSession.currentProblem) {
    const problemSection = document.getElementById('currentProblemSection');
    problemSection.style.display = 'block';

    document.getElementById('problemTitle').textContent = currentSession.currentProblem.title;
    document.getElementById('problemDifficulty').textContent = currentSession.currentProblem.difficulty;
    document.getElementById('problemPlatform').textContent = currentSession.currentProblem.platform;

    // Update difficulty badge class
    const diffBadge = document.getElementById('problemDifficulty');
    diffBadge.className = 'badge';
    const difficulty = currentSession.currentProblem.difficulty.toLowerCase();
    if (difficulty.includes('easy')) {
      diffBadge.classList.add('badge-easy');
    } else if (difficulty.includes('hard')) {
      diffBadge.classList.add('badge-hard');
    } else {
      diffBadge.classList.add('badge-medium');
    }
  }
}

function attachListeners() {
  // Analyze code button
  document.getElementById('analyzeCodeBtn').addEventListener('click', async () => {
    const btn = document.getElementById('analyzeCodeBtn');
    btn.textContent = 'Analyzing...';
    btn.disabled = true;

    // Get active tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    // Request code analysis
    chrome.tabs.sendMessage(tab.id, {
      type: 'REQUEST_CODE_ANALYSIS'
    }, async (response) => {
      btn.textContent = 'Analyze Code';
      btn.disabled = false;

      if (response?.code) {
        // Send to background for AI analysis
        const analysis = await analyzeCode(response.code, response.language);
        displayAnalysis(analysis);
        switchTab('analysis');
      }
    });
  });
}

async function analyzeCode(code, language) {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage({
      type: 'ANALYZE_CODE',
      data: { code, language }
    }, (response) => {
      resolve(response?.analysis || null);
    });
  });
}

function displayAnalysis(analysis) {
  if (!analysis) {
    document.getElementById('analysisContent').innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">⚠️</div>
        <div class="empty-state-text">Failed to analyze code</div>
      </div>
    `;
    return;
  }

  const html = `
    <div class="sp-section">
      <h3>Code Analysis</h3>
      <div class="analysis-section">
        <h4>Approach</h4>
        <p>${analysis.approach || 'N/A'}</p>
      </div>

      ${analysis.complexity ? `
        <div class="analysis-section">
          <h4>Complexity</h4>
          <ul>
            <li><strong>Time:</strong> ${analysis.complexity.time}</li>
            <li><strong>Space:</strong> ${analysis.complexity.space}</li>
          </ul>
        </div>
      ` : ''}

      ${analysis.considerations && analysis.considerations.length > 0 ? `
        <div class="analysis-section">
          <h4>Things to Consider</h4>
          <ul>
            ${analysis.considerations.map(c => `<li>${c}</li>`).join('')}
          </ul>
        </div>
      ` : ''}

      ${analysis.questions && analysis.questions.length > 0 ? `
        <div class="analysis-section">
          <h4>Questions to Ask Yourself</h4>
          <ul>
            ${analysis.questions.map(q => `<li>${q}</li>`).join('')}
          </ul>
        </div>
      ` : ''}

      <div class="analysis-section">
        <h4>Feedback</h4>
        <p>${analysis.reasoning}</p>
      </div>
    </div>
  `;

  document.getElementById('analysisContent').innerHTML = html;
}

async function loadRecommendations() {
  const content = document.getElementById('recommendationsContent');
  content.innerHTML = '<div class="empty-state"><div class="empty-state-text">Loading recommendations...</div></div>';

  // Request recommendations from background
  chrome.runtime.sendMessage({
    type: 'GET_RECOMMENDATIONS',
    data: {}
  }, (response) => {
    if (response?.recommendations?.problems) {
      displayRecommendations(response.recommendations.problems);
    } else {
      content.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">🎯</div>
          <div class="empty-state-text">Solve a few problems to get personalized recommendations</div>
        </div>
      `;
    }
  });
}

function displayRecommendations(problems) {
  const html = problems.map(problem => `
    <div class="recommendation-card">
      <div class="rec-title">${problem.title}</div>
      <div class="rec-reason">${problem.reason || problem.relevance}</div>
      <div class="rec-tags">
        <span class="tag">${problem.platform}</span>
        <span class="tag">${problem.difficulty}</span>
      </div>
    </div>
  `).join('');

  document.getElementById('recommendationsContent').innerHTML = html;
}

function startSessionTimer() {
  setInterval(() => {
    if (currentSession) {
      const timeSpent = Math.floor((Date.now() - currentSession.startTime) / 60000);
      document.getElementById('timeSpent').textContent = `${timeSpent}m`;
    }
  }, 60000); // Update every minute
}

// Listen for session updates
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'SESSION_UPDATED') {
    currentSession = message.session;
    updateUI();
  }
});
