/**
 * Dashboard Bridge Content Script
 * Bridges authentication between web dashboard and Chrome extension
 * 
 * SETUP:
 * - Hosted Dashboard: cognify-68642.web.app (Firebase Hosting)
 * - Unpacked Extension: Loaded locally from chrome-extension folder
 * 
 * This script is injected by the extension into the dashboard page
 * to relay authentication messages from the web page to the extension.
 */

(function() {
  'use strict';

  console.log('🌉 Cognify Dashboard Bridge loaded');
  console.log('📍 Page origin:', window.location.origin);
  console.log('🔌 Extension ID:', chrome.runtime.id);

  // Listen for messages from the dashboard web page
  window.addEventListener('message', (event) => {
    // Verify origin - accept from Firebase hosting and local development
    const allowedOrigins = [
      'https://cognify-68642.web.app',
      'https://cognify-68642.firebaseapp.com',
      'http://localhost:5173',
      'http://localhost:3000',
      'http://127.0.0.1:5173',
      'http://localhost:5174' // Vite sometimes uses this
    ];

    if (!allowedOrigins.includes(event.origin)) {
      console.log('⚠️ Ignoring message from unauthorized origin:', event.origin);
      return;
    }

    // Handle auth messages
    if (event.data.type === 'COGNIFY_AUTH') {
      const { userId, token, displayName, email } = event.data;
      
      console.log('🔐 Auth message received from dashboard');
      console.log('👤 User:', displayName, '(' + email + ')');
      console.log('🆔 User ID:', userId);
      console.log('📡 From:', event.origin);
      console.log('🎯 Forwarding to extension...');
      
      // Forward to background service worker via chrome.runtime
      chrome.runtime.sendMessage({
        type: 'COGNIFY_AUTH',
        data: {
          userId,
          token,
          displayName,
          email
        }
      }, (response) => {
        if (chrome.runtime.lastError) {
          console.error('❌ Error sending auth to extension:', chrome.runtime.lastError);
          showErrorNotification('Extension communication failed. Please reload the extension.');
        } else {
          console.log('✅ Auth successfully forwarded to extension');
          console.log('📥 Extension response:', response);
          
          // Show success notification on the dashboard page
          showAuthSuccessNotification();
        }
      });
    } else if (event.data.type === 'COGNIFY_LOGOUT') {
      console.log('🚪 Logout message received from dashboard');
      console.log('📡 From:', event.origin);
      console.log('🎯 Forwarding to extension...');
      
      // Forward logout to background
      chrome.runtime.sendMessage({
        type: 'COGNIFY_LOGOUT'
      }, (response) => {
        if (chrome.runtime.lastError) {
          console.error('❌ Error sending logout to extension:', chrome.runtime.lastError);
        } else {
          console.log('✅ Logout successfully forwarded to extension');
          console.log('📥 Extension response:', response);
        }
      });
    }
  });

  // Listen for messages from the extension background
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'AUTH_STATUS_UPDATED') {
      console.log('📢 Auth status updated from extension:', message.authenticated);
      sendResponse({ received: true });
    }
    return true;
  });

  /**
   * Show a success notification on the dashboard page
   */
  function showAuthSuccessNotification() {
    // Check if notification already exists
    if (document.getElementById('cognify-auth-notification')) {
      return;
    }

    const notification = document.createElement('div');
    notification.id = 'cognify-auth-notification';
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      color: white;
      padding: 16px 24px;
      border-radius: 12px;
      box-shadow: 0 8px 24px rgba(16, 185, 129, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.1);
      z-index: 10000;
      display: flex;
      align-items: center;
      gap: 12px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 14px;
      font-weight: 500;
      animation: slideInRight 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
      min-width: 320px;
    `;

    notification.innerHTML = `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink: 0;">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
        <polyline points="22 4 12 14.01 9 11.01"></polyline>
      </svg>
      <div style="flex: 1;">
        <div style="font-weight: 600; margin-bottom: 2px;">🎉 Extension Connected!</div>
        <div style="font-size: 12px; opacity: 0.95;">Your Cognify extension is now synced and ready to use</div>
      </div>
      <button style="background: rgba(255, 255, 255, 0.2); border: none; color: white; width: 28px; height: 28px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 20px; line-height: 1; transition: all 0.2s; flex-shrink: 0;" onmouseover="this.style.background='rgba(255,255,255,0.3)'" onmouseout="this.style.background='rgba(255,255,255,0.2)'" onclick="this.parentElement.remove()">×</button>
    `;

    // Add animation styles
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideInRight {
        from {
          transform: translateX(400px);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
      @keyframes slideOutRight {
        from {
          transform: translateX(0);
          opacity: 1;
        }
        to {
          transform: translateX(400px);
          opacity: 0;
        }
      }
    `;
    document.head.appendChild(style);

    document.body.appendChild(notification);

    // Auto-remove after 6 seconds
    setTimeout(() => {
      if (notification.parentElement) {
        notification.style.animation = 'slideOutRight 0.3s ease-in-out';
        setTimeout(() => notification.remove(), 300);
      }
    }, 6000);
  }

  /**
   * Show error notification
   */
  function showErrorNotification(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
      color: white;
      padding: 16px 24px;
      border-radius: 12px;
      box-shadow: 0 8px 24px rgba(239, 68, 68, 0.3);
      z-index: 10001;
      display: flex;
      align-items: center;
      gap: 12px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 14px;
      font-weight: 500;
      animation: slideInRight 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
      min-width: 320px;
    `;

    notification.innerHTML = `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink: 0;">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="15" y1="9" x2="9" y2="15"></line>
        <line x1="9" y1="9" x2="15" y2="15"></line>
      </svg>
      <div style="flex: 1;">
        <div style="font-weight: 600; margin-bottom: 2px;">Connection Error</div>
        <div style="font-size: 12px; opacity: 0.95;">${message}</div>
      </div>
      <button style="background: rgba(255, 255, 255, 0.2); border: none; color: white; width: 28px; height: 28px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 20px; line-height: 1; flex-shrink: 0;" onclick="this.parentElement.remove()">×</button>
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
      if (notification.parentElement) {
        notification.remove();
      }
    }, 8000);
  }

  // Notify that bridge is ready
  console.log('✅ Dashboard bridge ready and listening');
  console.log('💡 Waiting for authentication messages from dashboard...');
})();
