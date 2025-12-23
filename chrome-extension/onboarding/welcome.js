/**
 * Welcome page functionality
 */

document.addEventListener('DOMContentLoaded', () => {
  const dashboardLink = document.getElementById('dashboardLink');
  const platformBtns = document.querySelectorAll('.platform-btn');

  // Get dashboard URL from storage or use default
  chrome.storage.local.get(['dashboardUrl'], (result) => {
    const dashboardUrl = result.dashboardUrl || 'http://localhost:3000';
    dashboardLink.href = dashboardUrl;
  });

  // Handle dashboard link click
  dashboardLink.addEventListener('click', (e) => {
    e.preventDefault();
    chrome.storage.local.get(['dashboardUrl'], (result) => {
      const dashboardUrl = result.dashboardUrl || 'http://localhost:3000';
      chrome.tabs.create({ url: dashboardUrl });
    });
  });

  // Handle platform button clicks
  platformBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const url = btn.getAttribute('data-url');
      chrome.tabs.create({ url: url }, () => {
        // Close the welcome page
        window.close();
      });
    });
  });

  // Track that onboarding was completed
  chrome.storage.local.set({ 
    onboardingCompleted: true,
    onboardingCompletedAt: Date.now()
  });

  console.log('✅ Cognify welcome page loaded');
});

