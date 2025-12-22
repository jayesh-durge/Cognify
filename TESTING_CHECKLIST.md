# 🧪 Testing Checklist - Data Sync

## Critical Fix Applied ✅

**Issue:** Extension was writing to Firebase without authentication token
**Solution:** Added `Authorization: Bearer <token>` header to all Firestore write requests

---

## 🔄 What Changed

### 1. **Firebase Service (Extension)**
- ✅ All `writeToFirestore()` calls now include auth token
- ✅ Enhanced error logging with full error details
- ✅ Added comprehensive activity tracking
- ✅ Added progress metrics calculation
- ✅ Added interview status/score tracking
- ✅ Added streak and efficiency calculations

### 2. **Dashboard Components**
- ✅ Added real-time activity feed (auto-refresh every 30s)
- ✅ Added progress metrics card (streak, efficiency)
- ✅ Enhanced interview display (status, score, feedback, duration)
- ✅ Added activity timeline with icons
- ✅ Improved data structure handling

### 3. **Data Sync Architecture**
- ✅ Problems → `users/{userId}/problems/{problemId}`
- ✅ Interviews → `users/{userId}/interviews/{interviewId}`
- ✅ Activities → `users/{userId}/activities/{activityId}`
- ✅ Progress → `users/{userId}/progress/current`
- ✅ Stats → `users/{userId}/stats/summary`

---

## 📋 Step-by-Step Testing

### Phase 1: Authentication (5 min)

**Test 1: Sign In**
```
1. Reload Chrome Extension
   - Go to chrome://extensions/
   - Click "Reload" under Cognify

2. Open Extension Popup
   - Click extension icon
   - Should see "🔐 Sign in (Opens Dashboard)"

3. Sign In
   - Click sign in button
   - Dashboard opens at localhost:3000
   - Sign in with Google
   - Wait for redirect back to home

4. Verify Auth Sync
   - Go back to extension popup
   - Should now show "✓ Your Name"
   - Should show "Sign out" button

✅ PASS if: Extension shows your name
❌ FAIL if: Still shows "Sign in" or error
```

**Debug Commands (if auth fails):**
```javascript
// In extension popup console:
chrome.storage.local.get(['user_id', 'auth_token', 'user_profile'], console.log)

// Should show:
// user_id: "some-firebase-uid"
// auth_token: "ya29...."
// user_profile: { displayName: "...", email: "..." }
```

---

### Phase 2: Problem Solving (10 min)

**Test 2: Mark Problem as Solved**
```
1. Go to a LeetCode problem
   - Example: https://leetcode.com/problems/two-sum/
   - Wait 3-5 seconds for extension to load

2. Check Extension UI
   - Should see AI chatbot panel
   - Should see "✓ Mark Solved" button

3. Mark as Solved
   - Click "✓ Mark Solved" button
   - Should see success message

4. Check Console Logs
   - Open browser console (F12)
   - Look for these messages:
     ✅ "📊 Logging problem solved: ..."
     ✅ "✅ Problem logged to Firebase"
     ✅ "✅ Stats updated"
     ✅ "✅ Activity logged: problem_solved"

✅ PASS if: All console messages appear
❌ FAIL if: See error messages or "permission denied"
```

**Debug Commands (if write fails):**
```javascript
// Check auth token exists
chrome.storage.local.get('auth_token', (result) => {
  console.log('Token exists:', !!result.auth_token)
  console.log('Token length:', result.auth_token?.length)
})

// Check user ID
chrome.storage.local.get('user_id', console.log)
```

---

### Phase 3: Dashboard Verification (5 min)

**Test 3: Data Appears on Dashboard**
```
1. Open Dashboard
   - Go to http://localhost:3000
   - Should be signed in

2. Check Home Page
   - Look at "Recent Activity" section
   - Should see activity: "Solved {problem-name}"
   - Should have green checkmark icon
   - Should show difficulty badge

3. Go to Progress Page
   - Click "Progress" in navigation
   - Should see your solved problem listed
   - Should show: title, difficulty, date, time, hints

4. Check Stats
   - Back to home page
   - "Problems Solved" should be 1 (or more)
   - Pie chart should show difficulty breakdown

✅ PASS if: Problem appears in all locations
❌ FAIL if: Dashboard is empty or shows 0 problems
```

**Debug Commands (if dashboard empty):**
```javascript
// In browser console on dashboard:
// Check if user is logged in
console.log('User:', user)

// Manually fetch problems
import { getUserProblems } from './services/firebase'
getUserProblems('your-user-id').then(console.log)
```

---

### Phase 4: Auto-Sync (5 min)

**Test 4: Real-Time Updates**
```
1. Keep Dashboard Open
   - Stay on home page

2. Solve Another Problem
   - Go to different LeetCode problem
   - Click "✓ Mark Solved"

3. Watch Dashboard
   - Don't refresh!
   - Wait ~30 seconds
   - Activity feed should auto-update
   - New problem should appear
   - Stats should increment

✅ PASS if: Dashboard updates without refresh
❌ FAIL if: Need to manually refresh
```

---

### Phase 5: Interview Tracking (Optional)

**Test 5: Interview Session**
```
1. Start Interview Mode
   - On problem page, click "Start Interview"
   - Answer interviewer questions
   - Write code
   - Complete interview

2. Check Dashboard
   - Go to home page
   - Look at "Recent Interviews" section
   - Should see interview with score
   - Should show status (completed)
   - Should show duration

✅ PASS if: Interview appears with score
❌ FAIL if: Interview not recorded
```

---

## 🐛 Common Issues & Fixes

### Issue 1: "Permission Denied" in Console

**Cause:** Auth token not being sent or invalid

**Fix:**
```bash
# 1. Check token in extension storage
chrome.storage.local.get('auth_token', console.log)

# 2. If missing, sign in again
# Click "Sign out" in popup → Sign in again

# 3. If present but invalid, get new token:
# Sign out from dashboard → Sign in again
```

---

### Issue 2: Dashboard Empty After Solving Problems

**Cause:** Firebase collection path mismatch or auth not synced

**Check:**
```javascript
// In Firebase Console
// Go to Firestore Database
// Check if data exists at: users/{your-uid}/problems/

// In dashboard console:
getUserStats('your-user-id').then(console.log)
// Should show solvedCount > 0
```

**Fix:**
```bash
# Verify Firebase project ID matches
# Extension: chrome-extension/config/config.js
# Dashboard: web-dashboard/.env

# Both should have:
projectId: "cognify-68642"
```

---

### Issue 3: Auth Not Syncing from Dashboard

**Cause:** postMessage not working or localhost permission missing

**Check:**
```javascript
// In dashboard console (localhost:3000)
// After signing in, check:
window.addEventListener('message', (e) => {
  console.log('Message sent:', e.data)
})

// Should see: { type: 'COGNIFY_AUTH', userId: '...', ... }
```

**Fix:**
```json
// Verify manifest.json has:
"content_scripts": [
  {
    "matches": ["http://localhost/*", "http://127.0.0.1/*"],
    "js": ["popup/auth-sync.js"]
  }
]
```

---

### Issue 4: Activity Feed Not Auto-Refreshing

**Expected:** Dashboard refreshes every 30 seconds

**Check:**
```javascript
// In Dashboard.jsx, verify:
useEffect(() => {
  loadDashboardData()
  
  // This should exist:
  const interval = setInterval(loadDashboardData, 30000)
  return () => clearInterval(interval)
}, [user])
```

**Manual Refresh:** Press F5 or Ctrl+R

---

## 📊 Success Metrics

After all tests pass, you should have:

- ✅ Extension signed in with your name
- ✅ Problems marked as solved in extension
- ✅ Problems appearing on dashboard Progress page
- ✅ Activity feed showing recent actions
- ✅ Stats updating (solved count, difficulty breakdown)
- ✅ Progress metrics showing (streak, efficiency)
- ✅ Dashboard auto-refreshing every 30 seconds
- ✅ No console errors on problem mark
- ✅ Interview sessions (if tested) appearing on dashboard

---

## 🎯 Final Verification Command

Run this in extension service worker console to verify everything:

```javascript
// Check auth status
chrome.storage.local.get([
  'user_id',
  'auth_token', 
  'user_profile',
  'local_progress'
], (result) => {
  console.log('=== Extension State ===')
  console.log('User ID:', result.user_id)
  console.log('Has Auth Token:', !!result.auth_token)
  console.log('User Name:', result.user_profile?.displayName)
  console.log('Local Progress Items:', result.local_progress?.length || 0)
  
  if (!result.user_id) {
    console.error('❌ NOT SIGNED IN')
  } else if (!result.auth_token) {
    console.error('❌ NO AUTH TOKEN')
  } else {
    console.log('✅ FULLY AUTHENTICATED')
  }
})
```

---

## 📞 Report Issues

If tests fail after following all debugging steps:

1. Copy all console error messages
2. Check Firebase Console for Firestore errors
3. Verify Firestore security rules allow authenticated writes
4. Check network tab for failed requests
5. Confirm both extension and dashboard use same Firebase project

**Most Common Fix:** Sign out → Sign in again → Try marking problem as solved

---

## ✅ You're Ready!

Once all tests pass:
- Extension writes to Firebase ✅
- Dashboard reads from Firebase ✅
- Authentication works ✅
- Data syncs in real-time ✅
- Activity, progress, interviews all tracked ✅

Start solving problems and watch your progress grow! 🚀
