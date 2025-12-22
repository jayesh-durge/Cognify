# Cognify - Quick Start Guide

## 🚀 Getting Started

### 1. Chrome Extension Setup

**Step 1: Load the Extension**
```bash
1. Open Chrome/Edge browser
2. Navigate to chrome://extensions/
3. Enable "Developer mode" (toggle in top-right)
4. Click "Load unpacked"
5. Select: Cognify/chrome-extension folder
```

**Step 2: Configure Gemini API**
```bash
1. Get API key from: https://aistudio.google.com/app/apikey
2. Click Cognify extension icon in browser
3. Click "Settings" (gear icon)
4. Paste your API key
5. Click "Save"
```

**Step 3: Start Practicing**
```bash
1. Visit leetcode.com/problems/two-sum
2. Cognify panel appears automatically
3. Select mode: Practice / Interview / Learning
4. Start coding and ask questions when stuck
```

---

### 2. Web Dashboard Setup

**Step 1: Install Dependencies**
```bash
cd Cognify/web-dashboard
npm install
```

**Step 2: Configure Firebase**
```bash
# Create .env file
cp .env.example .env

# Edit .env with your Firebase config
# Get config from: https://console.firebase.google.com
```

**Step 3: Run Development Server**
```bash
npm run dev
# Opens at http://localhost:3000
```

**Step 4: Build for Production**
```bash
npm run build
# Outputs to /dist folder
```

---

## 🎯 Usage Examples

### Practice Mode
**Scenario:** Solving "Two Sum" on LeetCode

1. **Read the problem**
2. **Start thinking**, write initial code
3. **Ask Cognify:** "What data structure could help me find pairs efficiently?"
4. **Cognify responds:** "Think about what you need to store. If you've seen a number, how can you quickly check if its complement exists?"
5. **Implement solution** based on your understanding
6. **Verify:** Click "Analyze Code" for complexity feedback

### Interview Mode
**Scenario:** Simulated 45-minute interview

1. Click "Start Interview" button
2. **Cognify asks:** "Can you explain the problem in your own words?"
3. **You respond** verbally or via text
4. **Code your solution** while Cognify asks follow-ups:
   - "What's the time complexity?"
   - "How would this handle empty input?"
   - "Can you optimize this further?"
5. **Get report** with scores on:
   - Problem-solving (0-100)
   - Communication (0-100)
   - Technical skill (0-100)

### Learning Mode (YouTube)
**Scenario:** Watching "Dynamic Programming Tutorial"

1. Open any programming tutorial on YouTube
2. Cognify activates automatically
3. **Ask:** "Explain memoization in simple terms"
4. **Get:** Intuitive explanation + related LeetCode problems
5. **Practice** recommended problems immediately

---

## 🛠️ Troubleshooting

### Extension won't load
```
Error: Could not load javascript 'content-scripts/codechef.js'
Solution: Make sure all files are present. Re-download the extension.
```

### API key not working
```
Error: API key invalid
Solution: 
1. Check API key has no extra spaces
2. Ensure Gemini API is enabled in Google Cloud
3. Check API quotas haven't been exceeded
```

### Dashboard shows "Loading..."
```
Issue: Firebase not configured
Solution:
1. Create Firebase project
2. Add config to .env file
3. Enable Firestore + Authentication
4. Restart dev server
```

### Mentor panel not appearing
```
Issue: Content script not injecting
Solution:
1. Refresh the problem page
2. Check you're on a supported platform:
   ✅ leetcode.com/problems/*
   ✅ codechef.com/problems/*
   ✅ codeforces.com/problem/*
   ✅ geeksforgeeks.org/problems/*
   ✅ youtube.com/watch*
```

---

## 📋 Features Checklist

### Extension Features
- [x] Problem context extraction
- [x] AI-powered hints (Socratic method)
- [x] Code analysis (no solutions)
- [x] Interview simulation mode
- [x] YouTube learning mode
- [x] Side panel analytics
- [x] Session persistence
- [ ] Voice interview (coming soon)
- [ ] Offline mode (coming soon)

### Dashboard Features
- [x] Authentication (Google)
- [x] Performance analytics
- [x] Interview reports
- [x] Progress tracking
- [x] Topic strength/weakness
- [ ] Personalized recommendations (partial)
- [ ] Study plan generation (coming soon)
- [ ] Peer comparison (coming soon)

---

## 🔗 Important Links

- **Documentation:** https://docs.cognify-ai.com
- **Get API Key:** https://aistudio.google.com/app/apikey
- **Firebase Console:** https://console.firebase.google.com
- **GitHub Repo:** https://github.com/jayesh-durge/Cognify
- **Report Issues:** https://github.com/jayesh-durge/Cognify/issues

---

## 💡 Pro Tips

1. **Ask conceptual questions**, not "what's the answer?"
   - ✅ "What pattern does this problem follow?"
   - ❌ "Give me the solution"

2. **Use Interview Mode weekly** to track improvement
   - Simulates real interview pressure
   - Builds communication skills
   - Provides actionable feedback

3. **Review your Dashboard** after each session
   - Identify weak topics
   - Track score trends
   - Follow AI recommendations

4. **Practice explaining** your thought process
   - Interview Mode evaluates communication
   - Verbalize your approach
   - Justify data structure choices

5. **Don't over-rely on hints**
   - Try for 15-20 minutes first
   - Use hints to unblock, not to solve
   - Review solution logic after solving

---

## 📞 Support

Need help? Contact us:
- Email: support@cognify-ai.com
- Discord: discord.gg/cognify
- Twitter: @CognifyAI

**Happy learning! 🧠🚀**
