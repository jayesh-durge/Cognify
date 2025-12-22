/**
 * Auth Sync - Handles authentication between dashboard and extension
 * When user logs in on dashboard, this syncs the auth to extension
 */

(function() {
  'use strict';

  // Listen for messages from dashboard
  window.addEventListener('message', async (event) => {
    // Only accept messages from our dashboard domain
    if (event.origin !== window.location.origin) {
      return;
    }

    if (event.data.type === 'COGNIFY_AUTH') {
      const { userId, token, displayName, email } = event.data;
      
      console.log('🔐 Auth received from dashboard:', { userId, displayName, email });
      
      // Store in extension storage
      await chrome.storage.local.set({
        user_id: userId,
        auth_token: token,
        user_profile: {
          displayName,
          email
        }
      });
      
      // Notify background script
      chrome.runtime.sendMessage({
        type: 'SET_USER_AUTH',
        data: { userId, token }
      });
      
      // Show success
      showNotification('✅ Logged in successfully!', 'success');
    } else if (event.data.type === 'COGNIFY_LOGOUT') {
      console.log('🚪 Logout received from dashboard');
      
      // Clear extension storage
      await chrome.storage.local.remove(['user_id', 'auth_token', 'user_profile']);
      
      showNotification('👋 Logged out', 'info');
    }
  });

  function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `cognify-notification ${type}`;
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 12px 20px;
      background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
      color: white;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 10000;
      font-family: -apple-system, system-ui, sans-serif;
      animation: slideIn 0.3s ease-out;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.animation = 'slideOut 0.3s ease-in';
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }
})();
