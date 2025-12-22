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
    
    // Create animated icon based on type
    const iconSvg = type === 'success' 
      ? `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
           <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
           <polyline points="22 4 12 14.01 9 11.01"></polyline>
         </svg>`
      : type === 'error'
      ? `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
           <circle cx="12" cy="12" r="10"></circle>
           <line x1="15" y1="9" x2="9" y2="15"></line>
           <line x1="9" y1="9" x2="15" y2="15"></line>
         </svg>`
      : `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
           <circle cx="12" cy="12" r="10"></circle>
           <line x1="12" y1="16" x2="12" y2="12"></line>
           <line x1="12" y1="8" x2="12.01" y2="8"></line>
         </svg>`;
    
    notification.innerHTML = `
      <div style="display: flex; align-items: center; gap: 14px; position: relative; z-index: 2;">
        <div class="icon-container" style="
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.25);
          backdrop-filter: blur(10px);
          display: flex;
          align-items: center;
          justify-content: center;
          animation: iconPop 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        ">
          ${iconSvg}
        </div>
        <div style="flex: 1;">
          <div style="font-size: 15px; font-weight: 600; margin-bottom: 2px;">${message}</div>
          <div style="font-size: 12px; opacity: 0.9;">Ready to start coding!</div>
        </div>
        <button class="close-btn" style="
          background: rgba(255, 255, 255, 0.2);
          border: none;
          color: white;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          transition: all 0.2s;
          opacity: 0.7;
        " onmouseover="this.style.opacity='1'; this.style.background='rgba(255,255,255,0.3)'" 
           onmouseout="this.style.opacity='0.7'; this.style.background='rgba(255,255,255,0.2)'">×</button>
      </div>
      <div class="progress-bar" style="
        position: absolute;
        bottom: 0;
        left: 0;
        height: 3px;
        background: rgba(255, 255, 255, 0.4);
        width: 100%;
        animation: progressShrink 3s linear forwards;
        border-radius: 0 0 12px 12px;
      "></div>
      <div class="particle-1" style="
        position: absolute;
        width: 6px;
        height: 6px;
        background: white;
        border-radius: 50%;
        opacity: 0;
        animation: particle1 0.8s ease-out;
      "></div>
      <div class="particle-2" style="
        position: absolute;
        width: 4px;
        height: 4px;
        background: white;
        border-radius: 50%;
        opacity: 0;
        animation: particle2 0.9s ease-out;
      "></div>
      <div class="particle-3" style="
        position: absolute;
        width: 5px;
        height: 5px;
        background: white;
        border-radius: 50%;
        opacity: 0;
        animation: particle3 1s ease-out;
      "></div>
    `;
    
    notification.style.cssText = `
      position: fixed;
      top: 24px;
      right: 24px;
      padding: 18px 20px;
      padding-bottom: 21px;
      background: ${type === 'success' 
        ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
        : type === 'error' 
        ? 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' 
        : 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'};
      color: white;
      border-radius: 12px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3), 
                  0 0 1px rgba(255, 255, 255, 0.6) inset,
                  0 1px 3px rgba(0, 0, 0, 0.1) inset;
      z-index: 10000;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      animation: slideInBounce 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
      min-width: 320px;
      max-width: 400px;
      backdrop-filter: blur(20px);
      position: relative;
      overflow: hidden;
      border: 1px solid rgba(255, 255, 255, 0.2);
    `;
    
    // Add keyframe animations
    if (!document.getElementById('cognify-notification-styles')) {
      const style = document.createElement('style');
      style.id = 'cognify-notification-styles';
      style.textContent = `
        @keyframes slideInBounce {
          0% {
            opacity: 0;
            transform: translateX(120px) scale(0.7) rotate(5deg);
          }
          50% {
            transform: translateX(-15px) scale(1.05) rotate(-2deg);
          }
          70% {
            transform: translateX(5px) scale(0.98) rotate(1deg);
          }
          100% {
            opacity: 1;
            transform: translateX(0) scale(1) rotate(0);
          }
        }
        @keyframes slideOutFade {
          0% {
            opacity: 1;
            transform: translateX(0) scale(1);
          }
          100% {
            opacity: 0;
            transform: translateX(80px) scale(0.9);
          }
        }
        @keyframes iconPop {
          0% {
            transform: scale(0) rotate(-180deg);
            opacity: 0;
          }
          60% {
            transform: scale(1.2) rotate(10deg);
          }
          100% {
            transform: scale(1) rotate(0);
            opacity: 1;
          }
        }
        @keyframes progressShrink {
          0% {
            width: 100%;
          }
          100% {
            width: 0%;
          }
        }
        @keyframes particle1 {
          0% {
            top: 50%;
            left: 50%;
            opacity: 1;
            transform: translate(-50%, -50%) scale(0);
          }
          100% {
            top: -20px;
            left: 20%;
            opacity: 0;
            transform: translate(-50%, -50%) scale(1);
          }
        }
        @keyframes particle2 {
          0% {
            top: 50%;
            left: 50%;
            opacity: 1;
            transform: translate(-50%, -50%) scale(0);
          }
          100% {
            top: 10px;
            left: 90%;
            opacity: 0;
            transform: translate(-50%, -50%) scale(1);
          }
        }
        @keyframes particle3 {
          0% {
            top: 50%;
            left: 50%;
            opacity: 1;
            transform: translate(-50%, -50%) scale(0);
          }
          100% {
            top: 80px;
            left: 10%;
            opacity: 0;
            transform: translate(-50%, -50%) scale(1);
          }
        }
      `;
      document.head.appendChild(style);
    }
    
    document.body.appendChild(notification);
    
    // Close button handler
    const closeBtn = notification.querySelector('.close-btn');
    closeBtn.addEventListener('click', () => {
      notification.style.animation = 'slideOutFade 0.3s ease-in';
      setTimeout(() => notification.remove(), 300);
    });
    
    // Auto remove after 3 seconds
    setTimeout(() => {
      notification.style.animation = 'slideOutFade 0.4s ease-in';
      setTimeout(() => notification.remove(), 400);
    }, 3000);
  }
})();
