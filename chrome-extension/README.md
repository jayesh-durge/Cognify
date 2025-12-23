# Cognify Chrome Extension 🧩

> **⚠️ INSTALLATION REQUIRED**: This extension is **pending Chrome Web Store approval**. For now, please install it manually as an unpacked extension (takes 2 minutes). See detailed guide: [USER_INSTALLATION_GUIDE.md](./USER_INSTALLATION_GUIDE.md)

**Local Installation Required** - This extension runs on YOUR computer to provide AI assistance while you code.

Get real-time AI hints, learn problem-solving approaches, and track your progress across multiple coding platforms - all from your browser!

🌐 **Web Dashboard (Hosted & Live):** [https://cognify-68642.web.app/](https://cognify-68642.web.app/)

---

## 🚀 Quick Start for Users

**Two Components:**
1. ✅ **Web Dashboard** - Already hosted and ready at [cognify-68642.web.app](https://cognify-68642.web.app/)
2. 📦 **Chrome Extension** - Download and install manually (see below)

### Why Manual Installation?

The extension is currently **awaiting Chrome Web Store approval** (takes 5-7 days). Meanwhile, you can use the full functionality by loading it as an unpacked extension!

**📖 Detailed Installation Guide:** See [USER_INSTALLATION_GUIDE.md](./USER_INSTALLATION_GUIDE.md) for step-by-step instructions with troubleshooting.

---

## 🎯 Quick Installation Guide (2 Minutes)

### Step 1: Download the Extension

📥 **[Download Cognify Extension](https://github.com/jayesh-durge/Cognify/archive/refs/heads/main.zip)**

- Click the link above to download
- Extract the ZIP file to a **permanent location** on your computer
- ⚠️ **Important:** Don't delete this folder after installation!

### Step 2: Install in Chrome

1. Open Google Chrome browser
2. Type `chrome://extensions/` in the address bar and press Enter
3. Turn ON **"Developer mode"** (toggle switch in top-right corner)
4. Click **"Load unpacked"** button
5. Navigate to the extracted folder and select: `Cognify-main/chrome-extension`
6. Click **"Select Folder"**
7. ✅ Extension installed! You'll see the Cognify icon in your toolbar

**Tip:** Click the puzzle icon (🧩) in Chrome and pin Cognify for easy access!

### Step 3: Get Your Free API Key

1. Visit 🔗 **[Google AI Studio](https://makersuite.google.com/app/apikey)**
2. Sign in with your Google account
3. Click **"Create API Key"** (100% FREE)
4. Copy the API key to clipboard

### Step 4: Configure the Extension

1. Click the **Cognify icon** in your Chrome toolbar
2. Click the **⚙️ Settings** icon
3. Paste your Gemini API key in the field
4. Click **"Save"**
5. ✅ Configuration complete!

### Step 5: Sign In & Start Using

1. Click the Cognify icon
2. Click **"Sign in with Google"**
3. Authorize the extension
4. Go to any coding platform (LeetCode, CodeChef, etc.)
5. Open a problem and click Cognify icon
6. Start getting AI hints!

📊 **View Your Progress:** [Open Dashboard →](https://cognify-68642.web.app/)

---

> ### ✅ Important: Where Each Component Lives
> 
> | Component | Location | Access |
> |-----------|----------|--------|
> | 🧩 **This Extension** | Your Computer (Local) | Install from Chrome://extensions |
> | 📊 **Web Dashboard** | Cloud (Online) | https://cognify-68642.web.app/ |
>
> **You install the extension locally, but use the dashboard online!**

---

## 🚀 Features

- **Multi-Platform Support**: Works on LeetCode, CodeChef, Codeforces, GeeksforGeeks, and YouTube
- **AI-Powered Hints**: Get intelligent hints without spoiling the solution
- **Side Panel Assistant**: Access your AI mentor in a convenient side panel
- **Progress Tracking**: Automatic sync with the web dashboard
- **YouTube Integration**: Learn from video tutorials with AI assistance
- **Session Management**: Track time spent on each problem
- **Firebase Sync**: All your data synced across devices

## 📋 What You Need

- **Google Chrome** browser (any recent version)
- **Google account** (for sign-in)
- **Gemini API key** (free - get it [here](https://makersuite.google.com/app/apikey))
- **5 minutes** to set up!

---

## 🛠️ Detailed Setup (For Developers)

### 1. Get Required API Keys

#### Gemini API Key
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy your API key

#### Firebase Configuration
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select existing one
3. Add a web app to your project
4. Copy the Firebase configuration

### 2. Configure the Extension (For Custom Firebase Setup)

> ⚠️ **Note:** If you're just using the extension, you can skip this and use the default Firebase configuration. This is only needed if you want to set up your own Firebase project.

1. **Update Firebase Config** in `services/firebase-service.js`:
```javascript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
};
```

2. **Add Your Gemini API Key** in extension settings:
   - Install the extension first
   - Click Cognify icon → Settings
   - Paste your API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Click Save

### 3. Install the Extension in Chrome

1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top-right corner)
3. Click "Load unpacked"
4. Select the `chrome-extension` folder from your download
5. Extension appears in your toolbar - pin it for easy access!

### 4. Enable Firebase Services

In Firebase Console:

1. **Authentication:**
   - Enable Google sign-in provider
   - Add authorized domains if deploying

2. **Firestore Database:**
   - Create database
   - Set up these collections:
     - `users` - User profiles and settings
     - `sessions` - Problem-solving sessions
     - `progress` - Daily progress tracking

3. **Security Rules:**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /sessions/{sessionId} {
      allow read, write: if request.auth != null;
    }
    match /progress/{progressId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## 📱 How to Use

### First Time Setup

1. **Pin the Extension:**
   - Click the puzzle icon in Chrome toolbar
   - Find "Cognify - AI Interview Mentor"
   - Click the pin icon to keep it visible

2. **Sign In:**
   - Click the Cognify icon in your toolbar
   - Click "Sign in with Google"
   - Grant necessary permissions

3. **Configure API Key:**
   - Go to extension settings (right-click icon → Options)
   - Enter your Gemini API key
   - Save settings

### Using on Coding Platforms

1. **Navigate to a Problem:**
   - Go to LeetCode, CodeChef, Codeforces, or GeeksforGeeks
   - Open any problem page
   - The extension automatically detects the problem

2. **Open Side Panel:**
   - Click the Cognify icon
   - Click "Open Side Panel"
   - The AI assistant appears on the right side

3. **Get Hints:**
   - Click "Get Hint" for progressive hints
   - Ask questions in the chat
   - AI provides guidance without spoiling the solution

4. **Track Progress:**
   - Timer automatically starts when you open a problem
   - Mark problem as solved when done
   - Progress syncs to your dashboard

### YouTube Learning

1. **Watch Tutorial:**
   - Play any coding tutorial on YouTube
   - Open Cognify side panel

2. **AI Assistance:**
   - Ask questions about the video content
   - Get code explanations
   - Request practice problems related to the topic

## 🎯 Features Breakdown

### Side Panel
- **Chat Interface:** Ask questions and get AI responses
- **Hint System:** Progressive hints that don't spoil solutions
- **Code Analysis:** Paste your code for AI review
- **Session Timer:** Track time spent on problems
- **Quick Actions:** Mark solved, skip, save for later

### Popup Menu
- **Quick Stats:** See today's progress
- **Settings Access:** One-click to options
- **Auth Status:** Check sign-in status
- **Open Dashboard:** Quick link to web dashboard

### Settings Page
- **API Configuration:** Manage Gemini API key
- **Platform Preferences:** Enable/disable specific platforms
- **Notification Settings:** Configure alerts
- **Data Management:** Export or clear data
- **Account Settings:** Manage linked accounts

## 🔧 Extension Structure

```
chrome-extension/
├── manifest.json              # Extension configuration
├── background/
│   └── service-worker.js     # Background service worker
├── content-scripts/          # Platform-specific scripts
│   ├── leetcode.js
│   ├── codechef.js
│   ├── codeforces.js
│   ├── geeksforgeeks.js
│   ├── youtube.js
│   └── styles/
│       └── common.css
├── sidepanel/                # Side panel UI
│   ├── sidepanel.html
│   └── sidepanel.js
├── popup/                    # Popup UI
│   ├── popup.html
│   └── popup.js
├── settings/                 # Settings page
│   ├── settings.html
│   └── settings.js
├── services/                 # Core services
│   ├── auth-service.js
│   ├── firebase-service.js
│   └── gemini-service.js
├── config/                   # Configuration
│   ├── config.js
│   └── prompts.js
└── utils/                    # Utilities
    └── session-manager.js
```

## 🔑 Supported Platforms

| Platform | Features | Status |
|----------|----------|--------|
| **LeetCode** | Problem detection, hints, timer | ✅ Active |
| **CodeChef** | Problem detection, hints, timer | ✅ Active |
| **Codeforces** | Problem detection, hints, timer | ✅ Active |
| **GeeksforGeeks** | Problem detection, hints, timer | ✅ Active |
| **YouTube** | Video learning assistance | ✅ Active |

## 🐛 Troubleshooting

### Extension Not Detecting Problems
**Solution:** Refresh the page after installing the extension. Make sure you're on a problem page, not the problems list.

### AI Not Responding
**Solution:** 
- Check if Gemini API key is correctly configured
- Verify you're signed in
- Check browser console for errors

### Data Not Syncing
**Solution:** 
- Ensure you're signed in with the same Google account on both extension and dashboard
- Check internet connection
- Verify Firestore is properly configured

### Side Panel Not Opening
**Solution:** 
- Update Chrome to the latest version (Side Panel requires Chrome 114+)
- Try closing and reopening Chrome
- Reload the extension

### "Unauthorized" Errors
**Solution:**
- Make sure Firebase Authentication is enabled
- Check that your domain is authorized in Firebase Console
- Re-sign in to the extension

## 🔐 Security & Privacy

- **Data Storage:** All data encrypted and stored in Firebase
- **API Keys:** Never shared or transmitted to third parties
- **Code Privacy:** Your code is only sent to Gemini API for analysis
- **No Tracking:** We don't track or sell your data
- **Open Source:** Code is available for audit

## ⚙️ Advanced Configuration

### Custom Prompts

Edit `config/prompts.js` to customize AI behavior:

```javascript
export const PROMPTS = {
  HINT_SYSTEM: "Your custom hint prompt...",
  INTERVIEW_FEEDBACK: "Your custom feedback prompt...",
  // ... other prompts
};
```

### Platform-Specific Customization

Each content script can be customized in the `content-scripts/` folder to adjust how the extension interacts with each platform.

## 📊 Permissions Explained

The extension requires these permissions:

- **activeTab:** To detect which coding platform you're on
- **sidePanel:** To show the AI assistant panel
- **storage:** To save your preferences and session data
- **identity:** For Google sign-in authentication

## 🚀 Performance Tips

- Close side panel when not needed to save memory
- Clear old session data periodically from settings
- Use "Pause Session" when taking breaks
- Limit hint requests for better API quota management

## 🆘 Support & Feedback

- **Issues:** Report bugs on the GitHub repository
- **Feature Requests:** Submit ideas through GitHub issues
- **Questions:** Check the web dashboard FAQ section

## 📄 License

This extension is part of the Cognify AI Mentor system.

---

**Happy Coding! 🎉**
