# 🧠 Cognify - AI-Powered Interview Mentor

<div align="center">

**Your Personal AI Companion for Mastering Technical Interviews**

[![Made with React](https://img.shields.io/badge/React-18.2.0-61DAFB?logo=react)](https://reactjs.org/)
[![Firebase](https://img.shields.io/badge/Firebase-10.14.1-FFCA28?logo=firebase)](https://firebase.google.com/)
[![Chrome Extension](https://img.shields.io/badge/Chrome-Extension-4285F4?logo=googlechrome)](https://chrome.google.com/)
[![Powered by Gemini](https://img.shields.io/badge/Powered%20by-Gemini%20AI-8E75B2)](https://ai.google.dev/)

*Learn to think, not just memorize solutions* 🚀

[🚀 Quick Start](#-quick-start-for-users) | [📊 View Dashboard](https://cognify-68642.web.app/) | [📥 Download Extension](#-quick-start-for-users) | [🛠️ For Developers](#-setup-for-developers)

</div>

---

> ### ⚡ Two Components, Two Setup Methods:
> 
> | Component | Setup Method | Link |
> |-----------|--------------|------|
> | 🧩 **Chrome Extension** | ⬇️ Download & Install Locally | [Download](#step-1-download--install-chrome-extension-local-setup) |
> | 📊 **Web Dashboard** | 🌐 Use Online (Already Hosted) | [Open Dashboard](https://cognify-68642.web.app/) |

---

## 🎯 Quick Start (For Users)

### Step 1: Download & Install Chrome Extension (Local Setup)

**The Chrome Extension runs on YOUR computer:**

1. **Download the Extension**
   - [📥 Download Cognify Extension ZIP](https://github.com/jayesh-durge/Cognify/archive/refs/heads/main.zip)
   - Extract the ZIP file to a permanent folder on your computer
   - ⚠️ **Important:** Keep this folder - don't delete it after installation!

2. **Install in Chrome**
   - Open Chrome browser
   - Go to `chrome://extensions/`
   - Turn on **"Developer mode"** (toggle in top-right)
   - Click **"Load unpacked"**
   - Navigate to and select the `Cognify-main/chrome-extension` folder
   - Extension will appear in your toolbar!

3. **Get Free Gemini API Key**
   - Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Sign in with your Google account
   - Click **"Create API Key"** (completely FREE!)
   - Copy the API key

4. **Configure Your Extension**
   - Click the Cognify extension icon in Chrome
   - Click the ⚙️ Settings icon
   - Paste your Gemini API key
   - Click **Save**

5. **Sign In**
   - Click the Cognify extension icon
   - Click **"Sign in with Google"**
   - Authorize the extension

📖 **[Detailed Chrome Extension Guide →](chrome-extension/README.md)**

---

### Step 2: Access Your Dashboard (Online - No Setup Required!)

**The Dashboard is already hosted online - just visit it:**

🌐 **[Open Your Dashboard →](https://cognify-68642.web.app/)**

- ✅ No installation needed
- ✅ No local setup required
- ✅ Works on any device with internet
- ✅ Just sign in with the same Google account you used in the extension

📖 **[Dashboard Documentation →](web-dashboard/README.md)**

---

### Step 3: Start Learning!

1. Go to any supported platform:
   - 💻 [LeetCode](https://leetcode.com)
   - 🏆 [CodeChef](https://codechef.com)
   - 🎯 [Codeforces](https://codeforces.com)
   - 📚 [GeeksforGeeks](https://geeksforgeeks.org)

2. Open any coding problem
3. Click the Cognify extension icon
4. Get AI-powered hints and guidance!
5. Track your progress on the [Dashboard](https://cognify-68642.web.app/)

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

### 🧩 Chrome Extension (Local Installation)
Your AI mentor that lives in your browser and runs on your computer.

**What it does:**
- Provides AI hints while you solve problems
- Tracks your progress automatically
- Works on LeetCode, CodeChef, Codeforces, GeeksforGeeks, YouTube
- Side panel AI assistant
- Session timing and management

**Setup:** Download and install locally on your machine

💾 **[Download Extension](https://github.com/jayesh-durge/Cognify/archive/refs/heads/main.zip)** | 📖 **[Installation Guide →](chrome-extension/README.md)**

---

### 📊 Web Dashboard (Online - Already Hosted!)
Cloud-based analytics dashboard accessible from anywhere.

**What it does:**
- Visualizes your learning progress
- Shows performance analytics
- Provides interview reports
- Personalized recommendations
- Works on any device

**Setup:** None! Just visit the link and sign in

🌐 **[Open Dashboard →](https://cognify-68642.web.app/)** | 📖 **[Learn More →](web-dashboard/README.md)**

---

## �️ Setup (For Developers)

### Prerequisites
- Node.js (v16+)
- Google Chrome browser
- Firebase account
- Gemini API key (free)

### Installation

1. **Clone the repository:**
```bash
git clone https://github.com/jayesh-durge/Cognify.git
cd Cognify
```

2. **Set up Chrome Extension:**
```bash
cd chrome-extension
# Follow detailed instructions in chrome-extension/README.md
```
📖 **[Chrome Extension Setup Guide →](chrome-extension/README.md)**

3. **Set up Web Dashboard:**
```bash
cd web-dashboard
npm install
npm run dev
# Dashboard will run at http://localhost:5173
```
📖 **[Web Dashboard Setup Guide →](web-dashboard/README.md)**

4. **Configure Firebase:**
   - Create a [Firebase project](https://console.firebase.google.com/)
   - Enable Authentication (Google provider)
   - Set up Firestore Database
   - Add Firebase config to both components
   - See detailed guides in component READMEs

5. **Get Gemini API Key (Free):**
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

**Project Maintainer:** [Jayesh Durge](https://github.com/jayesh-durge)

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
- **Dashboard:** [https://cognify-68642.web.app/](https://cognify-68642.web.app/)

---

<div align="center">

**Made for developers, by developers** 💻

**Star ⭐ this repo if you find it helpful!**

### Quick Links

🚀 [Download Extension](https://github.com/jayesh-durge/Cognify/archive/refs/heads/main.zip) | 📊 [Open Dashboard](https://cognify-68642.web.app/) | 📖 [Extension Guide](chrome-extension/README.md) | 📈 [Dashboard Docs](web-dashboard/README.md) | 🐛 [Report Bug](https://github.com/jayesh-durge/Cognify/issues)

</div>
