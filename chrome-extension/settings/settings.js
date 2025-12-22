/**
 * Settings Page Script
 * Handles API key configuration
 */

document.addEventListener('DOMContentLoaded', async () => {
  const apiKeyInput = document.getElementById('apiKey');
  const saveButton = document.getElementById('saveButton');
  const successMessage = document.getElementById('successMessage');
  const errorMessage = document.getElementById('errorMessage');

  // Load existing API key
  await loadSettings();

  // Save button handler
  saveButton.addEventListener('click', async () => {
    const apiKey = apiKeyInput.value.trim();

    if (!apiKey) {
      showError('Please enter an API key');
      return;
    }

    if (!apiKey.startsWith('AIza')) {
      showError('Invalid API key format. It should start with "AIza"');
      return;
    }

    // Save to storage
    try {
      await chrome.storage.local.set({ gemini_api_key: apiKey });
      showSuccess();
      
      // Test the API key
      setTimeout(() => {
        testApiKey(apiKey);
      }, 1000);
    } catch (error) {
      showError('Failed to save API key: ' + error.message);
    }
  });

  // Enter key to save
  apiKeyInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      saveButton.click();
    }
  });
});

async function loadSettings() {
  try {
    const result = await chrome.storage.local.get('gemini_api_key');
    if (result.gemini_api_key) {
      document.getElementById('apiKey').value = result.gemini_api_key;
    }
  } catch (error) {
    console.error('Failed to load settings:', error);
  }
}

function showSuccess() {
  const successMsg = document.getElementById('successMessage');
  const errorMsg = document.getElementById('errorMessage');
  
  errorMsg.classList.remove('show');
  successMsg.classList.add('show');
  
  setTimeout(() => {
    successMsg.classList.remove('show');
  }, 3000);
}

function showError(message) {
  const successMsg = document.getElementById('successMessage');
  const errorMsg = document.getElementById('errorMessage');
  
  successMsg.classList.remove('show');
  errorMsg.textContent = message;
  errorMsg.classList.add('show');
  
  setTimeout(() => {
    errorMsg.classList.remove('show');
  }, 5000);
}

async function testApiKey(apiKey) {
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: 'Hello' }] }]
        })
      }
    );

    if (response.ok) {
      console.log('API key validated successfully!');
    } else {
      const error = await response.json();
      const errorMsg = error.error?.message || 'Unknown error';
      
      // Check if it's a quota error - key is valid but quota exceeded
      if (errorMsg.includes('quota') || errorMsg.includes('Quota')) {
        console.warn('⚠️ Quota exceeded but API key is valid');
        // Still show success since the key itself is valid
      } else {
        showError('API key validation failed: ' + errorMsg);
      }
    }
  } catch (error) {
    console.error('API key test failed:', error);
  }
}
