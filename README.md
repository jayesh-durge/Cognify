# Cognify - AI Interview Mentor

> 🧠 **Think like a pro. Learn like a beginner. Interview like an expert.**

Cognify is a production-grade Chrome Extension + Web Dashboard that acts as your personal AI mentor for technical interview preparation. Unlike solution generators, Cognify teaches you **how to think**, not what to code.

---

## 🎯 Core Philosophy

**We don't give answers. We guide discovery.**

- ✅ Socratic questioning that builds problem-solving skills
- ✅ Real-time interview simulation with behavioral analysis
- ✅ Code analysis that explains WHY, not HOW to fix
- ❌ No direct solutions or code snippets
- ❌ No answer reveals or shortcuts

---

## 🚀 Features

### 1. **AI-Guided Practice Mode**
- Automatic problem context extraction
- Intelligent hints that preserve learning
- Approach validation without revealing solutions
- Trade-off analysis and complexity discussions

### 2. **Interview Simulation Mode**
- Timed real interview experience
- Dynamic follow-up questions based on your progress
- Communication skill evaluation
- Comprehensive post-interview reports

### 3. **Learning Mode (YouTube)**
- Concept explanations using mental models
- Theory-to-practice problem connections
- Interactive learning from video content

### 4. **Personalization Engine**
- Track weak/strong topics automatically
- Generate custom problem lists
- Adjust difficulty dynamically
- Readiness score calculation

### 5. **Web Dashboard**
- Interview performance analytics
- Topic-wise strength/weakness visualization
- Progress tracking across platforms
- Communication skill insights

---

## 📦 Installation

### Prerequisites
- Chrome/Edge browser (Manifest V3 support)
- Google Gemini API key ([Get it here](https://aistudio.google.com/app/apikey))
- Node.js 18+ (for dashboard)

### Chrome Extension

1. **Clone the repository:**
   ```bash
   git clone https://github.com/jayesh-durge/Cognify.git
   cd Cognify/chrome-extension
   ```

2. **Load extension in Chrome:**
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode" (top right)
   - Click "Load unpacked"
   - Select the `chrome-extension` folder

3. **Configure API Key:**
   - Click the Cognify extension icon
   - Go to Settings
   - Enter your Gemini API key
   - Save settings

4. **Start practicing:**
   - Visit LeetCode, CodeChef, Codeforces, or GeeksforGeeks
   - Open a problem
   - Click the Cognify panel to start mentoring

### Web Dashboard

1. **Navigate to dashboard folder:**
   ```bash
   cd ../web-dashboard
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Firebase:**
   - Create a Firebase project at [firebase.google.com](https://firebase.google.com)
   - Enable Firestore and Authentication
   - Copy your config to `.env`:
     ```env
     VITE_FIREBASE_API_KEY=your_api_key
     VITE_FIREBASE_AUTH_DOMAIN=your_domain
     VITE_FIREBASE_PROJECT_ID=your_project_id
     ```

4. **Run development server:**
   ```bash
   npm run dev
   ```

5. **Build for production:**
   ```bash
   npm run build
   ```

---

## 🎨 Supported Platforms

| Platform | Practice Mode | Interview Mode | Learning Mode |
|----------|--------------|----------------|---------------|
| LeetCode | ✅ | ✅ | ❌ |
| CodeChef | ✅ | ✅ | ❌ |
| Codeforces | ✅ | ✅ | ❌ |
| GeeksforGeeks | ✅ | ✅ | ❌ |
| YouTube | ❌ | ❌ | ✅ |

---

## 🧪 Usage Examples

### Practice Mode
1. Open a LeetCode problem
2. Try solving it yourself
3. When stuck, ask Cognify: "I'm not sure how to approach this"
4. Cognify responds with questions like: "What data structure could help you track seen elements?"
5. Continue the dialogue until you discover the solution

### Interview Mode
1. Click "Start Interview" in Cognify
2. Explain your approach out loud
3. Cognify asks: "What's the time complexity of your approach?"
4. Code your solution while being questioned
5. Get a comprehensive interview report with scores

### Learning Mode (YouTube)
1. Watch a DSA tutorial on YouTube
2. Cognify automatically activates
3. Ask: "Explain binary search in simple terms"
4. Get intuitive explanations + related problems

---

## 🛠️ Architecture

### Chrome Extension
```
chrome-extension/
├── manifest.json                 # Extension configuration
├── background/
│   └── service-worker.js        # Message routing, session management
├── content-scripts/
│   ├── leetcode.js              # LeetCode integration
│   ├── codechef.js              # CodeChef integration
│   ├── codeforces.js            # Codeforces integration
│   ├── geeksforgeeks.js         # GFG integration
│   ├── youtube.js               # YouTube learning mode
│   └── styles/common.css        # Shared UI styles
├── services/
│   ├── gemini-service.js        # AI interaction layer
│   └── firebase-service.js      # Backend sync
├── config/
│   ├── prompts.js               # AI prompt templates
│   └── config.js                # Feature flags & settings
├── popup/
│   ├── popup.html               # Extension popup UI
│   └── popup.js                 # Popup logic
├── sidepanel/
│   ├── sidepanel.html           # Detailed analysis view
│   └── sidepanel.js             # Side panel logic
└── utils/
    └── session-manager.js       # Session state management
```

### Web Dashboard
```
web-dashboard/
├── src/
│   ├── components/              # React components
│   │   ├── Dashboard.jsx
│   │   ├── InterviewReports.jsx
│   │   ├── ProgressCharts.jsx
│   │   └── RecommendedProblems.jsx
│   ├── services/
│   │   ├── firebase.js          # Firebase config
│   │   └── api.js               # API client
│   ├── hooks/                   # Custom React hooks
│   ├── utils/                   # Utility functions
│   └── App.jsx                  # Main app component
├── public/
└── package.json
```

---

## 🧠 AI Integration (Google Gemini)

### Prompt Engineering
All prompts enforce the **no-solution rule**:
- System instructions prevent code generation
- Temperature tuned for reasoning (0.3-0.7)
- Response validation to block solutions

### Rate Limiting
- 60 requests per minute
- Prevents API abuse
- Graceful degradation

### Safety
- Content filtering enabled
- User privacy respected (minimal data sent)
- No problem solutions stored

---

## 🔒 Privacy & Ethics

- **No Cheating:** Cannot be used during real interviews (detection coming)
- **Data Privacy:** Minimal personal data collected
- **Transparent AI:** All AI responses logged for review
- **Open Source:** Full transparency in implementation

---

## 🚧 Roadmap

- [ ] Voice interview mode (Google Speech-to-Text)
- [ ] Multi-language support (Python, Java, C++, JavaScript)
- [ ] Collaborative practice sessions
- [ ] Mobile companion app
- [ ] Advanced analytics with ML insights
- [ ] Integration with HackerRank, AtCoder

---

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

### Development Setup
```bash
# Clone repo
git clone https://github.com/jayesh-durge/Cognify.git

# Install dependencies
cd Cognify/web-dashboard
npm install

# Run tests
npm test

# Start dev server
npm run dev
```

---

## 📄 License

MIT License - see [LICENSE](LICENSE) for details

---

## 🙏 Acknowledgments

- **Google Gemini API** for AI-powered mentoring
- **Firebase** for backend infrastructure
- **Chrome Extensions Team** for Manifest V3
- **LeetCode, CodeChef, Codeforces, GFG** for hosting practice problems

---

## 📧 Contact & Support

- **Issues:** [GitHub Issues](https://github.com/jayesh-durge/Cognify/issues)
- **Documentation:** [docs.cognify-ai.com](https://docs.cognify-ai.com)
- **Email:** support@cognify-ai.com
- **Twitter:** [@CognifyAI](https://twitter.com/CognifyAI)

---

## 🎓 Educational Philosophy

> "Give a person a solution, they solve one problem. Teach them to think, they solve a thousand."

Cognify is built on the principle that **understanding beats memorization**. We focus on:
- **Reasoning skills** over pattern matching
- **Communication** over silent coding
- **Learning** over acceptance rates
- **Growth** over shortcuts

---

**Built with ❤️ for interview preparation. Think better, code smarter.**
