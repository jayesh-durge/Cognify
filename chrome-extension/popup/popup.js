/**
 * Popup Script - Main popup UI logic
 */

document.addEventListener('DOMContentLoaded', async () => {
  // Load current state
  await loadState();

  // Attach event listeners
  attachListeners();

  // Check API key configuration
  await checkApiKey();

  // Update platform detection
  await detectPlatform();
});

async function loadState() {
  const result = await chrome.storage.local.get(['mode', 'problemsToday']);
  
  // Set active mode
  const mode = result.mode || 'practice';
  document.getElementById('activeMode').textContent = capitalizeFirst(mode);
  document.querySelector(`.mode-btn[data-mode="${mode}"]`)?.classList.add('active');

  // Set problems count
  document.getElementById('problemsToday').textContent = result.problemsToday || 0;
}

function attachListeners() {
  // Mode buttons
  document.querySelectorAll('.mode-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const mode = e.target.dataset.mode;
      await chrome.storage.local.set({ mode });
      
      // Update UI
      document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      document.getElementById('activeMode').textContent = capitalizeFirst(mode);

      // Notify content scripts
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab?.id) {
        chrome.tabs.sendMessage(tab.id, { type: 'MODE_CHANGED', mode });
      }
    });
  });

  // Open sidepanel
  document.getElementById('openSidepanel').addEventListener('click', async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab?.id) {
      chrome.sidePanel.open({ tabId: tab.id });
    }
  });

  // Open dashboard
  document.getElementById('openDashboard').addEventListener('click', () => {
    chrome.tabs.create({ url: 'https://cognify-ai.web.app/dashboard' });
  });

  // Open settings
  document.getElementById('openSettings').addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
    window.close();
  });

  // Help link
  document.getElementById('helpLink').addEventListener('click', (e) => {
    e.preventDefault();
    chrome.tabs.create({ url: 'https://docs.cognify-ai.com' });
  });
}

async function checkApiKey() {
  const result = await chrome.storage.local.get('gemini_api_key');
  const warningDiv = document.getElementById('warning');
  
  if (!result.gemini_api_key) {
    warningDiv.style.display = 'block';
  } else {
    warningDiv.style.display = 'none';
  }
}

async function detectPlatform() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
  if (!tab?.url) {
    document.getElementById('currentPlatform').textContent = 'None';
    return;
  }

  const url = tab.url;
  let platform = 'None';

  if (url.includes('leetcode.com')) {
    platform = 'LeetCode';
  } else if (url.includes('codechef.com')) {
    platform = 'CodeChef';
  } else if (url.includes('codeforces.com')) {
    platform = 'Codeforces';
  } else if (url.includes('geeksforgeeks.org')) {
    platform = 'GeeksforGeeks';
  } else if (url.includes('youtube.com')) {
    platform = 'YouTube';
  }

  document.getElementById('currentPlatform').textContent = platform;
}

function capitalizeFirst(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Listen for storage changes
chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === 'local') {
    if (changes.mode) {
      document.getElementById('activeMode').textContent = capitalizeFirst(changes.mode.newValue);
    }
    if (changes.problemsToday) {
      document.getElementById('problemsToday').textContent = changes.problemsToday.newValue;
    }
  }
});
