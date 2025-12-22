/**
 * Popup Script - Simplified UI
 */

document.addEventListener('DOMContentLoaded', async () => {
  // Load problems count
  await loadProblemsCount();

  // Check API key
  await checkApiKey();

  // Check authentication
  await checkAuth();

  // Attach event listeners
  attachListeners();
});

async function loadProblemsCount() {
  const result = await chrome.storage.local.get(['problemsToday']);
  document.getElementById('problemsToday').textContent = result.problemsToday || 0;
}

function attachListeners() {
  // Sign in button
  document.getElementById('signInBtn').addEventListener('click', handleSignIn);
  
  // Sign out button
  document.getElementById('signOutBtn').addEventListener('click', handleSignOut);

  // Open dashboard
  document.getElementById('openDashboard').addEventListener('click', (e) => {
    e.preventDefault();
    chrome.tabs.create({ url: 'http://localhost:3000' });
  });

  // Open settings
  document.getElementById('openSettings').addEventListener('click', (e) => {
    e.preventDefault();
    chrome.runtime.openOptionsPage();
  });

  // Help link
  document.getElementById('helpLink').addEventListener('click', (e) => {
    e.preventDefault();
    chrome.tabs.create({ url: 'https://github.com/jayesh-durge/Cognify#readme' });
  });
}

async function handleSignIn() {
  const signInBtn = document.getElementById('signInBtn');
  const originalHTML = signInBtn.innerHTML;
  
  signInBtn.innerHTML = '<span>⏳</span><span>Waiting for sign-in...</span>';
  signInBtn.disabled = true;

  // Send message to background to handle sign-in
  chrome.runtime.sendMessage({ type: 'SIGN_IN' }, (response) => {
    if (response?.success) {
      checkAuth();
      showNotification('Signed in successfully! You can close the dashboard tab.', 'success');
    } else {
      showNotification('Sign-in failed: ' + (response?.error || 'Unknown error'), 'error');
    }
    signInBtn.innerHTML = originalHTML;
    signInBtn.disabled = false;
  });
}

async function handleSignOut() {
  if (!confirm('Are you sure you want to sign out?')) {
    return;
  }

  const signOutBtn = document.getElementById('signOutBtn');
  signOutBtn.disabled = true;

  chrome.runtime.sendMessage({ type: 'SIGN_OUT' }, (response) => {
    if (response?.success) {
      checkAuth();
      showNotification('Signed out successfully', 'success');
    } else {
      showNotification('Sign-out failed: ' + (response?.error || 'Unknown error'), 'error');
    }
    signOutBtn.disabled = false;
  });
}

async function checkApiKey() {
  const result = await chrome.storage.local.get('gemini_api_key');
  const apiWarning = document.getElementById('apiWarning');
  
  if (!result.gemini_api_key || result.gemini_api_key.trim() === '') {
    apiWarning.style.display = 'flex';
  } else {
    apiWarning.style.display = 'none';
  }
}

async function checkAuth() {
  const result = await chrome.storage.local.get(['user_id', 'user_profile']);
  
  const authStatus = document.getElementById('authStatus');
  const signInBtn = document.getElementById('signInBtn');
  const signInHelp = document.getElementById('signInHelp');
  const signOutBtn = document.getElementById('signOutBtn');
  
  if (result.user_id && result.user_profile) {
    // Authenticated
    authStatus.className = 'auth-status authenticated';
    authStatus.innerHTML = `
      <div class="auth-icon">✓</div>
      <div class="auth-text">Signed in as</div>
      <div class="auth-email">${result.user_profile.displayName || result.user_profile.email}</div>
    `;
    
    signInBtn.style.display = 'none';
    signInHelp.style.display = 'none';
    signOutBtn.style.display = 'flex';
  } else {
    // Not authenticated
    authStatus.className = 'auth-status unauthenticated';
    authStatus.innerHTML = `
      <div class="auth-icon">✗</div>
      <div class="auth-text">Not signed in</div>
      <div class="auth-email">Sign in to sync your progress</div>
    `;
    
    signInBtn.style.display = 'flex';
    signInHelp.style.display = 'block';
    signOutBtn.style.display = 'none';
  }
}

function showNotification(message, type) {
  // Simple alert for now - could be enhanced with custom notifications
  alert(message);
}

// Listen for storage changes
chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === 'local') {
    if (changes.problemsToday) {
      document.getElementById('problemsToday').textContent = changes.problemsToday.newValue || 0;
    }
    if (changes.user_id || changes.user_profile) {
      checkAuth();
    }
    if (changes.gemini_api_key) {
      checkApiKey();
    }
  }
});
