/**
 * Welcome Page Script
 * Handles interactions on the welcome/onboarding page
 */

document.addEventListener('DOMContentLoaded', () => {
  console.log('Cognify Welcome Page loaded');

  // Close welcome button
  const closeBtn = document.getElementById('close-welcome');
  if (closeBtn) {
    closeBtn.addEventListener('click', (e) => {
      e.preventDefault();
      window.close();
    });
  }

  // Track that user has seen the welcome page
  chrome.storage.local.set({
    hasSeenWelcome: true,
    welcomePageViewedAt: new Date().toISOString()
  });

  // Add click tracking for action cards (optional analytics)
  document.querySelectorAll('.action-card').forEach(card => {
    card.addEventListener('click', (e) => {
      const title = card.querySelector('.action-title')?.textContent;
      console.log(`User clicked: ${title}`);
      
      // Store user action for analytics
      chrome.storage.local.get(['welcomeActions'], (result) => {
        const actions = result.welcomeActions || [];
        actions.push({
          action: title,
          timestamp: new Date().toISOString()
        });
        chrome.storage.local.set({ welcomeActions: actions });
      });
    });
  });

  // Platform card interactions
  document.querySelectorAll('.platform-card').forEach(card => {
    card.addEventListener('click', () => {
      const platformName = card.querySelector('.platform-name')?.textContent;
      
      // Open relevant platform when clicked
      const platformUrls = {
        'LeetCode': 'https://leetcode.com/problemset/',
        'CodeChef': 'https://www.codechef.com/practice',
        'Codeforces': 'https://codeforces.com/problemset',
        'GeeksforGeeks': 'https://practice.geeksforgeeks.org/'
      };

      const url = platformUrls[platformName];
      if (url) {
        chrome.tabs.create({ url });
      }
    });
  });

  // Check if API key is already configured
  chrome.storage.local.get(['geminiApiKey'], (result) => {
    if (result.geminiApiKey) {
      // Add a badge or indicator that API is configured
      const apiCard = document.querySelector('.action-card');
      if (apiCard) {
        const badge = document.createElement('span');
        badge.className = 'badge';
        badge.textContent = 'CONFIGURED';
        apiCard.querySelector('.action-title')?.appendChild(badge);
      }
    }
  });
});
