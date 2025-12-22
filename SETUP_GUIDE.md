# 🔥 Cognify - Complete Setup & Usage Guide

## 🎯 What This Does

Your **Chrome Extension** and **Web Dashboard** are now fully connected! Here's what happens:

1. **Solve problems on LeetCode** → Click "✓ Mark Solved" → Data syncs to Firebase
2. **Open Dashboard** → See all your progress, problems solved, stats updated in real-time
3. **Interviews tracked** → All your interview sessions save automatically  
4. **Progress charts** → Visual breakdown by difficulty, topics, performance trends

---

## 📋 Setup Instructions

### 1. **Install & Configure Extension**

```bash
# 1. Go to chrome://extensions/
# 2. Enable "Developer mode" (top right)
# 3. Click "Load unpacked"
# 4. Select: D:\hackathon\Cognify\chrome-extension
```

### 2. **Configure API Key**

```bash
# 1. Click Cognify extension icon
# 2. Click "Settings" (gear icon)
# 3. Enter your Gemini API key
# 4. Click "Test & Save"
```

### 3. **Start Dashboard**

```bash
cd D:\hackathon\Cognify\web-dashboard
npm install
npm run dev
```

Dashboard opens at: `http://localhost:3000`

### 4. **Sign In to Dashboard**

1. Open dashboard
2. Click "Sign in with Google"
3. **Your auth automatically syncs to extension!**
4. Extension now knows who you are

---

## 🚀 How to Use

### **On LeetCode (or any supported platform):**

1. **Open any problem** → Extension appears on right side
2. **Work on the problem** → Use these features:
   - 💬 **Chat**: Ask questions (AI guides, doesn't solve)
   - 💡 **Get Hint**: Request structured hints
   - 🔍 **Analyze Code**: Get feedback on your approach
3. **When you solve it** → Click **"✓ Mark Solved"** button
4. **Data syncs to Firebase** automatically!

### **On Web Dashboard:**

1. **Dashboard Tab**: See overview, charts, stats
2. **Progress Tab**: View all solved problems with filters
3. **Interview Reports**: See detailed interview sessions
4. **Settings**: Manage account and preferences

---

## 📊 What Data is Tracked?

When you mark a problem as solved:

```javascript
{
  problemId: "leetcode_two-sum",
  title: "Two Sum",
  difficulty: "Easy",
  topics: ["Array", "Hash Table"],
  platform: "leetcode",
  solvedAt: 1703234567890,
  timeSpent: 15, // minutes
  hintsUsed: 2,
  codeAnalyses: 1,
  mode: "practice" // or "interview", "learning"
}
```

### **Firebase Structure:**

```
users/
  {userId}/
    problems/
      {problemId}: { title, difficulty, topics, solvedAt, ... }
    stats/
      summary: { solvedCount, problemsByDifficulty, topicsSolved, ... }
    interviews/
      {interviewId}: { timestamp, report, questions, ... }
```

---

## 🔐 Authentication Flow

1. **Sign in on Dashboard** → Firebase Auth
2. **Auth auto-syncs to Extension** → Via window.postMessage
3. **Extension stores userId** → chrome.storage.local
4. **All problems linked to your account** → Firestore

### **Check Auth Status:**

```javascript
// In extension console:
chrome.storage.local.get(['user_id', 'user_profile'], console.log)

// Expected output:
// { user_id: "abc123...", user_profile: { displayName: "...", email: "..." } }
```

---

## 🎨 Features

### **Extension Features:**
- ✅ Problem extraction (title, difficulty, tags)
- ✅ AI mentor chat (context-aware with history)
- ✅ Hint generation (Socratic method)
- ✅ Code analysis (approach, complexity, edge cases)
- ✅ Mark as solved (syncs to dashboard)
- ✅ Rate limiting (10s cooldown, quota management)
- ✅ Multi-platform support (LeetCode, CodeChef, Codeforces, GeeksforGeeks, YouTube)

### **Dashboard Features:**
- ✅ Real-time stats (problems solved, difficulty breakdown)
- ✅ Progress tracking (all solved problems with filters)
- ✅ Interview reports (detailed session analysis)
- ✅ Charts & visualizations (Recharts)
- ✅ Topic analysis (strong vs weak topics)
- ✅ Firebase sync (automatic data sync)

---

## 🐛 Troubleshooting

### **Problem not syncing to dashboard?**

1. **Check authentication:**
   ```javascript
   // Extension console
   chrome.storage.local.get('user_id', (r) => console.log('User ID:', r.user_id))
   ```

2. **Check Firebase connection:**
   - Open dashboard → F12 console
   - Should see: "✅ Auth synced to extension"

3. **Verify problem was logged:**
   ```javascript
   // After clicking "Mark Solved", check console:
   // Should see: "🎯 Problem solved!", "📊 Logging problem solved:", "✅ Problem logged to Firebase"
   ```

### **Extension not loading?**

1. Reload extension: `chrome://extensions/` → Reload button
2. Check console for errors: Right-click extension icon → Inspect popup
3. Refresh LeetCode page

### **Dashboard not showing data?**

1. **Sign out and sign in again**
2. **Check Firestore rules** (must allow read/write for authenticated users)
3. **Check console for errors**

---

## 📝 Example Workflow

### **Day 1: Solve 3 Problems**

```
1. Open LeetCode "Two Sum"
   → Extension loads
   → Chat: "What pattern should I look for?"
   → AI: "Consider how you can store seen elements..."
   → Solve it
   → Click "✓ Mark Solved"
   
2. Open "Valid Parentheses"
   → Click "Get Hint"
   → AI: "Think about LIFO data structure..."
   → Solve it
   → Click "✓ Mark Solved"
   
3. Open "Merge Two Sorted Lists"
   → Click "Analyze Code"
   → AI gives complexity feedback
   → Solve it
   → Click "✓ Mark Solved"
```

### **Check Dashboard:**

```
Dashboard shows:
- Solved Count: 3
- Easy: 2, Medium: 1, Hard: 0
- Strong Topics: Array, Stack, Linked List
- Progress bar: 3 problems listed with details
```

---

## 🔧 Configuration Files

### **Extension Config:**
- `chrome-extension/config/config.js` → API keys, models
- `chrome-extension/manifest.json` → Permissions, scripts

### **Dashboard Config:**
- `web-dashboard/.env` → Firebase credentials
- `web-dashboard/vite.config.js` → Dev server settings

### **Firebase Config:**
Both apps use the same Firebase project: `cognify-68642`

---

## 📈 Data Privacy

- ✅ **All data stored in YOUR Firebase**
- ✅ **Code NOT sent to Firebase** (only metadata)
- ✅ **Gemini API calls are private** (your API key)
- ✅ **No telemetry or tracking**

---

## 🎯 Next Steps

1. ✅ **Test the flow**: Solve a problem → Mark solved → Check dashboard
2. ✅ **Customize**: Adjust colors, add more platforms
3. ✅ **Deploy dashboard**: Use Firebase Hosting or Vercel
4. ✅ **Publish extension**: Submit to Chrome Web Store

---

## 📞 Support

If data not syncing:
1. Check browser console (F12)
2. Check extension background console (chrome://extensions → Inspect service worker)
3. Verify Firebase Firestore rules allow your user to write

**Everything is set up! Just reload the extension and start solving!** 🚀
