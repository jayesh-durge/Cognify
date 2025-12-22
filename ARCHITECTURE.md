# Cognify - Complete Project Structure

## 📁 Project Architecture

```
Cognify/
├── README.md                          # Complete documentation
├── QUICKSTART.md                      # Setup guide
├── project-info.json                  # Project metadata
│
├── chrome-extension/                  # 🔌 Chrome Extension (Manifest V3)
│   ├── manifest.json                  # Extension configuration
│   │
│   ├── background/
│   │   └── service-worker.js         # Core messaging & session management
│   │
│   ├── content-scripts/              # Platform integrations
│   │   ├── leetcode.js               # LeetCode problem extraction
│   │   ├── codechef.js               # CodeChef integration
│   │   ├── codeforces.js             # Codeforces integration
│   │   ├── geeksforgeeks.js          # GeeksforGeeks integration
│   │   ├── youtube.js                # YouTube learning mode
│   │   └── styles/
│   │       └── common.css            # Shared UI styles
│   │
│   ├── services/
│   │   ├── gemini-service.js         # AI interaction layer (Gemini API)
│   │   └── firebase-service.js       # Backend sync to Firestore
│   │
│   ├── config/
│   │   ├── prompts.js                # AI prompt templates (Socratic method)
│   │   └── config.js                 # Feature flags & constants
│   │
│   ├── popup/
│   │   ├── popup.html                # Extension popup UI
│   │   └── popup.js                  # Popup logic & mode switching
│   │
│   ├── sidepanel/
│   │   ├── sidepanel.html            # Detailed analysis view
│   │   └── sidepanel.js              # Session tracking & analytics
│   │
│   ├── utils/
│   │   └── session-manager.js        # Session state management
│   │
│   └── assets/
│       └── icons/
│           └── icon.svg              # Extension icon (placeholder)
│
└── web-dashboard/                     # 📊 React Dashboard
    ├── package.json                   # Dependencies
    ├── vite.config.js                 # Vite configuration
    ├── tailwind.config.js             # Tailwind CSS setup
    ├── index.html                     # Entry HTML
    ├── .env.example                   # Environment template
    │
    └── src/
        ├── main.jsx                   # React entry point
        ├── App.jsx                    # Main app component & routing
        ├── index.css                  # Global styles
        │
        ├── components/                # React components
        │   ├── Navbar.jsx             # Navigation bar
        │   ├── Login.jsx              # Google authentication
        │   ├── Dashboard.jsx          # Main analytics dashboard
        │   ├── InterviewReports.jsx   # Interview analysis view
        │   ├── Progress.jsx           # Progress tracking
        │   ├── Recommendations.jsx    # AI-generated recommendations
        │   └── Settings.jsx           # User settings
        │
        ├── contexts/
        │   └── AuthContext.jsx        # Firebase authentication context
        │
        └── services/
            └── firebase.js            # Firebase config & API functions
```

## 🎯 Key Components

### Chrome Extension Architecture

**1. Background Service Worker** (`service-worker.js`)
- Message routing between components
- AI API call management (Gemini)
- Session state persistence
- Firebase data synchronization

**2. Content Scripts** (Platform-specific)
- Problem context extraction (DOM parsing)
- Code editor monitoring (CodeMirror/Monaco/Ace)
- Mentor panel injection
- Real-time code analysis

**3. AI Service** (`gemini-service.js`)
- Gemini API integration
- Prompt engineering for mentor behavior
- Rate limiting (60 req/min)
- Response validation (no-solution enforcement)

**4. UI Components**
- **Popup**: Quick mode switching, stats overview
- **Side Panel**: Detailed analysis, session metrics
- **Mentor Panel**: Injected chat interface on problem pages

### Web Dashboard Architecture

**1. Authentication** (Firebase Auth)
- Google Sign-In integration
- User session management
- Protected routes

**2. Data Layer** (Firestore)
- User profiles & statistics
- Interview reports storage
- Progress tracking
- Recommendations cache

**3. Visualizations** (Recharts)
- Interview performance trends (Line charts)
- Problems by difficulty (Pie charts)
- Topic strength heatmaps
- Score breakdowns

**4. Pages**
- **Dashboard**: Overview with key metrics
- **Interviews**: Detailed interview reports
- **Progress**: Topic-wise learning curves
- **Recommendations**: AI-generated problem lists

## 🔄 Data Flow

```
User Solves Problem on LeetCode
         ↓
Content Script Extracts Context
         ↓
Background Worker Receives Message
         ↓
Gemini API Generates Hint
         ↓
Response Displayed in Mentor Panel
         ↓
Session Data Saved Locally
         ↓
Firebase Sync in Background
         ↓
Dashboard Shows Updated Stats
```

## 🧠 AI Prompt Strategy

### Core Principles (Enforced in ALL prompts)
1. **Never provide complete solutions**
2. **Ask guiding questions (Socratic method)**
3. **Explain WHY approaches fail, not HOW to fix**
4. **Validate user thinking, don't do it for them**
5. **Focus on reasoning over correctness**

### Prompt Templates
- `analyzeProblem`: Extract topics, patterns, difficulty
- `practiceHint`: Socratic hints for practice mode
- `interviewHint`: Stricter hints for interview simulation
- `analyzeCode`: Complexity analysis + reasoning feedback
- `evaluateResponse`: Score communication & technical skills
- `explainConcept`: Mental model explanations (learning mode)

## 🔒 Security & Privacy

### Extension
- Minimal permissions (storage, tabs, scripting)
- No code execution on user behalf
- API keys stored locally (chrome.storage.local)
- HTTPS-only API calls

### Dashboard
- Firebase Authentication (Google OAuth)
- Firestore security rules (user-specific reads/writes)
- No PII collected beyond Google profile
- Analytics opt-out available

## 📦 Deployment

### Extension
```bash
# Load unpacked for development
chrome://extensions/ → Load unpacked → Select chrome-extension/

# Build for production (future)
# - Zip chrome-extension folder
# - Submit to Chrome Web Store
```

### Dashboard
```bash
# Development
npm run dev

# Production build
npm run build

# Deploy to Firebase Hosting
firebase deploy
```

## 🚀 Future Enhancements

### Planned Features
- [ ] Voice interview mode (Google Speech-to-Text)
- [ ] Multi-language code support (Python, Java, C++)
- [ ] Collaborative practice sessions
- [ ] Mobile companion app
- [ ] Advanced ML-based recommendations
- [ ] HackerRank, AtCoder integration
- [ ] Offline mode with local LLM
- [ ] Custom interview question sets
- [ ] Company-specific interview prep
- [ ] Peer performance comparison

### Technical Debt
- [ ] Add unit tests (Vitest)
- [ ] Implement proper error boundaries
- [ ] Add loading skeletons
- [ ] Optimize bundle size
- [ ] Add service worker caching
- [ ] Implement retry logic for API failures

## 📊 Metrics & Analytics

### Extension Metrics
- Hints requested per session
- Code iterations count
- Time spent on problem
- Mode usage distribution
- Platform usage stats

### Dashboard Metrics
- Interview completion rate
- Average scores by topic
- Learning velocity
- Recommendation follow-through
- Session duration trends

## 🎓 Educational Philosophy

**Core Belief**: Understanding > Memorization

**Implementation**:
1. **Socratic Method**: Questions before answers
2. **Reasoning Focus**: Explain trade-offs, not just complexity
3. **Iterative Learning**: Allow mistakes, guide correction
4. **Communication Skills**: Evaluate explanation quality
5. **Real Interviews**: Simulate actual pressure & questions

---

**Built with ❤️ by Jayesh Durge**
**Tech Stack**: Manifest V3 + Gemini API + Firebase + React + Tailwind
**Purpose**: Make interview prep about learning, not memorizing
