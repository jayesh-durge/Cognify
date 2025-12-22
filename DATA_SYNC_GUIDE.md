# Data Sync Guide - Extension ↔️ Dashboard

## 🔄 How Data Syncs Between Extension and Dashboard

### Overview
The Chrome Extension and Web Dashboard communicate through **Firebase Firestore**. When you solve problems, mark questions, or complete interviews in the extension, that data automatically syncs to the dashboard in real-time.

---

## 📊 What Data Gets Synced?

### 1. **Problem Solving Activity** ✅
When you mark a problem as solved in the extension:

**Extension → Firebase:**
- Problem title, difficulty, topics
- Platform (LeetCode, CodeChef, Codeforces, etc.)
- Time spent on problem
- Number of hints used
- Number of code analyses requested
- Solve timestamp

**Dashboard Shows:**
- All solved problems in Progress page
- Real-time activity feed on Dashboard
- Statistics by difficulty (Easy/Medium/Hard)
- Topic breakdown (which topics you've practiced)

### 2. **Interview Sessions** 🎤
When you complete an interview practice:

**Extension → Firebase:**
- Interview ID and timestamp
- Problem details
- Your score (0-100)
- Status (completed, in-progress)
- Duration (in seconds)
- Feedback and evaluation
- Communication score
- Technical skill score

**Dashboard Shows:**
- Interview history with scores
- Performance trends over time
- Status of each interview
- Detailed feedback for each session

### 3. **Activity Timeline** ⚡
Every interaction is logged:

**Extension → Firebase:**
- Type: problem_solved, interview_completed, hint_request
- Timestamp of activity
- Related metadata (problem ID, difficulty, score, etc.)

**Dashboard Shows:**
- Live activity feed (refreshes every 30 seconds)
- Recent actions with timestamps
- Activity icons and categorization
- Platform information

### 4. **Progress Metrics** 📈
Calculated and synced automatically:

**Extension → Firebase:**
- Total problems solved
- Current streak (days of consecutive solving)
- Efficiency score (based on time and hints)
- Last activity timestamp

**Dashboard Shows:**
- Current progress card
- Streak counter
- Efficiency rating
- Last updated timestamp

### 5. **User Statistics** 📊
Aggregated data for insights:

**Extension → Firebase:**
- Solved count by difficulty
- Topics practiced (Arrays, Graphs, DP, etc.)
- Strong topics (solved frequently)
- Weak topics (need practice)
- Average interview score
- Total interview count

**Dashboard Shows:**
- Pie chart of difficulty distribution
- Strong topics (green badges)
- Focus areas (orange badges)
- Readiness level assessment

---

## 🔐 Authentication & Security

### How Auth Works:
1. **Sign In Flow:**
   - Click "Sign in" in extension popup
   - Dashboard opens in new tab (localhost:3000)
   - Sign in with Google on dashboard
   - Auth automatically syncs back to extension
   - Extension shows "✓ Your Name"

2. **Auth Token:**
   - Extension stores auth token from Firebase
   - All Firestore writes include `Authorization: Bearer <token>`
   - Ensures only you can write to your data
   - Token refreshes automatically

3. **Data Privacy:**
   - All data stored under `users/{your-user-id}/`
   - Only you can read/write your data
   - Firestore security rules enforce access control

---

## 🛠️ Testing Data Sync

### Step 1: Sign In
```
1. Open extension popup
2. Click "🔐 Sign in (Opens Dashboard)"
3. Dashboard opens → Sign in with Google
4. Extension popup shows "✓ Your Name"
```

### Step 2: Mark Problem as Solved
```
1. Go to LeetCode/CodeChef/etc. problem page
2. Wait for extension UI to appear
3. Click "✓ Mark Solved" button
4. Extension shows success message
```

### Step 3: Check Dashboard
```
1. Open dashboard at http://localhost:3000
2. Navigate to "Progress" page
3. Should see your solved problem listed
4. Dashboard home shows activity feed
```

### Step 4: Verify Real-Time Sync
```
1. Solve another problem in extension
2. Go back to dashboard (don't refresh)
3. Wait ~30 seconds (auto-refresh interval)
4. Activity feed updates automatically
5. Stats update (solved count, difficulty breakdown)
```

---

## 🐛 Troubleshooting Data Sync Issues

### Problem: "Data not syncing to dashboard"

**Check 1: Authentication**
```
- Extension popup shows "✓ Your Name"?
- If not, sign in again
- Check chrome.storage.local for user_id
```

**Check 2: Firebase Connection**
```
1. Open browser console (F12) on LeetCode page
2. Mark problem as solved
3. Look for console logs:
   - "✅ Problem logged to Firebase"
   - "✅ Stats updated"
   - "✅ Activity logged"
```

**Check 3: Auth Token**
```
1. Open extension service worker console
   (chrome://extensions → Inspect service worker)
2. Check logs for auth errors
3. Should see auth token being sent with requests
```

**Check 4: Firestore Rules**
```
- Dashboard must have correct Firebase config
- Firestore security rules must allow authenticated writes
- Check Firebase Console for write errors
```

### Problem: "Dashboard shows old data"

**Solution: Force Refresh**
```
1. Dashboard auto-refreshes every 30 seconds
2. Manual refresh: Click browser refresh (F5)
3. Check "Last updated" timestamp in Progress Metrics
```

### Problem: "Auth not syncing from dashboard to extension"

**Check auth-sync.js:**
```
1. Dashboard must be on localhost:3000
2. Extension must have localhost permission in manifest
3. postMessage must use correct origin
4. Check browser console for COGNIFY_AUTH messages
```

---

## 📁 Firebase Data Structure

```
users/
  {userId}/
    problems/
      {problemId}/
        - title
        - difficulty
        - topics
        - platform
        - solvedAt
        - timeSpent
        - hintsUsed
        - codeAnalyses
        - mode (practice/interview)
    
    interviews/
      {interviewId}/
        - timestamp
        - problemId
        - score
        - status
        - duration
        - feedback
        - communication
        - technical
    
    activities/
      {activityId}/
        - type
        - timestamp
        - problemId (if applicable)
        - difficulty
        - score
        - platform
    
    progress/
      current/
        - totalSolved
        - recentActivity
        - streak
        - efficiency
        - lastUpdated
    
    stats/
      summary/
        - solvedCount
        - problemsByDifficulty (easy/medium/hard)
        - topicsSolved
        - strongTopics
        - weakTopics
        - avgInterviewScore
        - totalInterviews
```

---

## 🚀 Advanced Features

### 1. Offline Support
- Extension stores data locally if offline
- Syncs to Firebase when connection restored
- Check `chrome.storage.local.get('local_progress')`

### 2. Auto-Refresh
- Dashboard refreshes every 30 seconds
- Keeps activity feed and stats current
- No manual refresh needed

### 3. Interaction Logging
- Every hint request logged
- Code analysis tracked
- Interview questions recorded
- Helps build learning profile

### 4. Smart Statistics
- Efficiency calculated: 100 - (hints×5 + time penalty)
- Streak tracking (consecutive days)
- Strong/weak topic detection
- Readiness level based on interview scores

---

## 🎯 Next Steps

1. **Test the flow:**
   - Sign in → Solve problem → Check dashboard

2. **Verify all data types:**
   - Problems ✓
   - Interviews ✓
   - Activities ✓
   - Progress ✓
   - Stats ✓

3. **Monitor sync:**
   - Check browser console for errors
   - Verify Firebase write success
   - Confirm dashboard updates

4. **Start practicing:**
   - Use extension on coding platforms
   - Track your interview prep journey
   - Watch your progress grow!

---

## 📞 Support

If data sync issues persist:
1. Check all console logs (page, extension, service worker)
2. Verify Firebase configuration matches
3. Check Firestore security rules
4. Ensure auth token is valid
5. Look for CORS or network errors

**Common Issues:**
- Missing auth token → Sign in again
- Firestore permission denied → Check security rules
- Data not appearing → Wait for auto-refresh or manual refresh
- Old data showing → Clear browser cache

---

## 🔥 Firebase Configuration

Both extension and dashboard must use the same Firebase project:

**Extension:** `chrome-extension/config/config.js`
```javascript
export const config = {
  projectId: "cognify-68642",
  // ... other config
}
```

**Dashboard:** `web-dashboard/.env` or `.env.local`
```
VITE_FIREBASE_PROJECT_ID=cognify-68642
VITE_FIREBASE_API_KEY=your-api-key
# ... other env vars
```

**Verify Match:**
- Both must point to same `projectId`
- API keys must be valid for that project
- Firestore must be enabled in Firebase Console

---

✨ **Ready to go!** Mark some problems as solved and watch them appear on your dashboard in real-time!
