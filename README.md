# 🧠 Cognify - AI-Powered Interview Mentor

<div align="center">

**Your Personal AI Companion for Mastering Technical Interviews**

[![Made with React](https://img.shields.io/badge/React-18.2.0-61DAFB?logo=react)](https://reactjs.org/)
[![Firebase](https://img.shields.io/badge/Firebase-10.14.1-FFCA28?logo=firebase)](https://firebase.google.com/)
[![Chrome Extension](https://img.shields.io/badge/Chrome-Extension-4285F4?logo=googlechrome)](https://chrome.google.com/)
[![Powered by Gemini](https://img.shields.io/badge/Powered%20by-Gemini%20AI-8E75B2)](https://ai.google.dev/)

*Learn to think, not just memorize solutions* 🚀

</div>

---

## 💡 The Problem

Every year, millions of students and professionals struggle with technical interview preparation:
- **Passive Learning:** Simply reading solutions doesn't build problem-solving skills
- **Lack of Guidance:** Stuck on problems with no mentor to guide your thinking
- **Fragmented Tools:** Progress tracking scattered across multiple platforms
- **No Real Feedback:** Mock interviews lack personalized, actionable insights
- **Lost Context:** Can't track learning journey across LeetCode, CodeChef, Codeforces, etc.

## ✨ Our Solution

**Cognify** is an AI-powered ecosystem that transforms how you prepare for technical interviews. Instead of giving you answers, it teaches you **how to think** through problems like a senior engineer.

### 🎯 Core Innovation

1. **Socratic Learning Approach:** Progressive hints that guide your thinking without spoiling solutions
2. **Multi-Platform Integration:** Seamlessly works across LeetCode, CodeChef, Codeforces, GeeksforGeeks, and YouTube
3. **Real-Time AI Mentorship:** Get instant help exactly when you need it, right where you code
4. **Intelligent Analytics:** Track patterns in your learning and get personalized recommendations

---

## 🏗️ Architecture

Cognify consists of two main components working in perfect harmony:

```
┌─────────────────────────────────────────────────────────────┐
│                    COGNIFY ECOSYSTEM                          │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────────────┐      ┌──────────────────────┐    │
│  │  Chrome Extension    │◄────►│   Web Dashboard      │    │
│  │  (Learning Interface)│      │   (Analytics & Insights)   │
│  └──────────────────────┘      └──────────────────────┘    │
│           │                              │                   │
│           └──────────┬───────────────────┘                  │
│                      │                                       │
│              ┌───────▼────────┐                             │
│              │  Firebase Cloud │                             │
│              │  (Auth & Data)  │                             │
│              └────────┬────────┘                             │
│                       │                                      │
│              ┌────────▼────────┐                            │
│              │   Gemini AI     │                             │
│              │  (Intelligence)  │                             │
│              └─────────────────┘                             │
└─────────────────────────────────────────────────────────────┘
```

### 🔧 Tech Stack

**Frontend:**
- React 18 with Vite
- TailwindCSS for modern UI
- React Router for navigation
- Recharts for data visualization

**Backend & Services:**
- Firebase Authentication
- Cloud Firestore Database
- Firebase Hosting
- Google Gemini AI API

**Extension:**
- Chrome Extension Manifest V3
- Content Scripts for platform integration
- Side Panel API for seamless UX

---

## 🚀 Key Features

### For Students & Interview Candidates

#### 📚 Smart Learning Mode
- Get **progressive hints** that build your problem-solving skills
- Learn **patterns and approaches**, not just memorize solutions
- AI adapts to your skill level and provides personalized guidance

#### 🎯 Multi-Platform Support
Works seamlessly on:
- **LeetCode** - Practice DSA problems
- **CodeChef** - Competitive programming
- **Codeforces** - Contest preparation
- **GeeksforGeeks** - Concept learning
- **YouTube** - Video tutorial assistance

#### 📊 Comprehensive Analytics
- Track progress across **all platforms in one dashboard**
- Visualize your **performance trends** over time
- Get **personalized recommendations** on what to study next
- Monitor **time spent** and **efficiency metrics**

#### ⏱️ Session Management
- Automatic **time tracking** for each problem
- **Session history** to review your journey

---

## 🎬 Use Cases

### 1️⃣ Interview Preparation (Primary Use Case)
**Scenario:** CS student preparing for tech interviews at Google, Microsoft, Amazon

**How Cognify Helps:**
- Practice on LeetCode with real-time AI hints
- Get feedback on approach before writing code
- Track weak topics and get targeted practice
- Dashboard shows readiness across topics

**Result:** Structured preparation with measurable progress

---

### 2️⃣ Competitive Programming Training
**Scenario:** Participating in CodeChef/Codeforces contests

**How Cognify Helps:**
- Analyze time spent per problem during practice
- Learn optimization techniques through guided hints
- Track contest performance trends
- Get recommendations for similar problems

**Result:** Improved problem-solving speed and accuracy

---

### 3️⃣ Learning from Video Tutorials
**Scenario:** Watching coding tutorials on YouTube

**How Cognify Helps:**
- AI assistant answers questions about video content
- Get code explanations in real-time
- Request practice problems related to the topic
- Track concepts learned from videos

**Result:** Active learning instead of passive watching

---

### 4️⃣ Self-Paced Skill Building
**Scenario:** Developer wanting to level up DSA skills

**How Cognify Helps:**
- Personalized learning paths based on current skill
- Daily recommendations keep learning consistent
- Progress tracking provides motivation
- AI mentor available 24/7 for guidance

**Result:** Continuous improvement with clear milestones

---

## 📦 Components

### [🧩 Chrome Extension](chrome-extension/README.md)
Your AI mentor that lives in your browser. Get help exactly where you code.

**Key Features:**
- Side panel AI assistant
- Real-time hints and guidance
- Automatic problem detection
- Session tracking
- Multi-platform integration

📖 **[Read Full Documentation →](chrome-extension/README.md)**

---

### [📊 Web Dashboard](web-dashboard/README.md)
Comprehensive analytics and insights dashboard for tracking your entire learning journey.

**Key Features:**
- Progress visualization
- Interview report analysis
- Personalized recommendations
- Performance metrics
- Multi-device sync

📖 **[Read Full Documentation →](web-dashboard/README.md)**

---

## 🚀 Quick Start

### Prerequisites
- Node.js (v16+)
- Google Chrome browser
- Firebase account
- Gemini API key

### Installation

1. **Clone the repository:**
```bash
git clone https://github.com/jayesh-durge/Cognify.git
cd Cognify
```

2. **Set up Chrome Extension:**
```bash
cd chrome-extension
# Follow instructions in chrome-extension/README.md
```

3. **Set up Web Dashboard:**
```bash
cd web-dashboard
npm install
# Follow instructions in web-dashboard/README.md
```

4. **Configure Firebase:**
   - Create a Firebase project
   - Enable Authentication (Google provider)
   - Set up Firestore Database
   - Add Firebase config to both components

5. **Get Gemini API Key:**
   - Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Create and copy your API key
   - Add to extension config

📚 **Detailed setup instructions available in component READMEs**

---

## 🎥 Demo & Screenshots

### Chrome Extension in Action
*Side panel providing hints while solving a LeetCode problem*

### Web Dashboard
*Analytics showing progress across multiple coding platforms*

### Mock Interview
*AI conducting a technical interview with real-time feedback*

---

## 🏆 Hackathon Highlights

### Innovation
- **Novel Approach:** Socratic method applied to coding education
- **Seamless Integration:** Works within existing platforms, no context switching
- **AI-First Design:** Leverages Gemini AI for intelligent mentorship

### Technical Complexity
- Multi-platform content script injection
- Real-time AI integration with streaming responses
- Complex state management across extension and web app
- Firestore data modeling for scalable analytics

### Impact & Scalability
- **Addresses Real Problem:** 50M+ people prepare for tech interviews annually
- **Growing Market:** $5B+ spent on interview prep courses
- **Easy to Scale:** Cloud-first architecture ready for millions of users
- **Monetization Ready:** Freemium model with premium features

### User Experience
- **Zero Learning Curve:** Works on platforms students already use
- **Non-Intrusive:** Side panel doesn't disrupt coding flow
- **Beautiful UI:** Modern, responsive design with smooth animations
- **Accessible:** Works on any device with Chrome

---

## 📈 Future Roadmap

### Phase 1 (Current)
- ✅ Multi-platform support (LeetCode, CodeChef, Codeforces, GFG)
- ✅ AI hint system
- ✅ Progress tracking dashboard

### Phase 2 (Q1 2026)
- 🔄 System design interview practice
- 🔄 Peer comparison and leaderboards
- 🔄 Study groups and collaboration
- 🔄 Mobile app (iOS & Android)

### Phase 3 (Q2 2026)
- 📋 Company-specific preparation tracks
- 📋 Resume analysis and improvement
- 📋 Behavioral interview practice
- 📋 Job application tracking

### Phase 4 (Q3 2026)
- 📋 Marketplace for custom problem sets
- 📋 Mentor matching platform
- 📋 Corporate training partnerships
- 📋 API for third-party integrations

---

## 🤝 Contributing

We welcome contributions! Please see our contributing guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 👥 Team

Built with ❤️ by passionate developers who understand the struggle of interview preparation.

---

## 🙏 Acknowledgments

- **Google Gemini AI** for providing the AI capabilities
- **Firebase** for reliable backend infrastructure
- **Open Source Community** for amazing tools and libraries
- **All the Interview Candidates** who inspired this solution

---

## 📞 Contact & Support

- **GitHub Issues:** [Report bugs or request features](https://github.com/jayesh-durge/Cognify/issues)
- **Email:** jayeshkishordurge@gmail.com
- **Website:** Coming soon!

---

<div align="center">

**Made for developers, by developers** 💻

**Star ⭐ this repo if you find it helpful!**

[Get Started](chrome-extension/README.md) | [View Dashboard Docs](web-dashboard/README.md) | [Report Bug](https://github.com/jayesh-durge/Cognify/issues)

</div>
