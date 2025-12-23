/**
 * Welcome page functionality
 */

document.addEventListener('DOMContentLoaded', () => {
  const startBtn = document.getElementById('startBtn');

  // Handle start practicing button
  startBtn.addEventListener('click', () => {
    // Open LeetCode in a new tab
    chrome.tabs.create({ url: 'https://leetcode.com/problemset/' }, () => {
      // Close the welcome page
      window.close();
    });
  });

  // Track that onboarding was completed
  chrome.storage.local.set({ 
    onboardingCompleted: true,
    onboardingCompletedAt: Date.now()
  });

  console.log('✅ Cognify welcome page loaded');
});
