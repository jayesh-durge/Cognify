# Cognify Chrome Extension

An AI-powered Chrome extension that acts as your personal interview mentor while you practice coding problems. Get real-time hints, learn problem-solving approaches, and track your progress across multiple coding platforms.

## 🚀 Features

- **Multi-Platform Support**: Works on LeetCode, CodeChef, Codeforces, GeeksforGeeks, and YouTube
- **AI-Powered Hints**: Get intelligent hints without spoiling the solution
- **Side Panel Assistant**: Access your AI mentor in a convenient side panel
- **Progress Tracking**: Automatic sync with the web dashboard
- **YouTube Integration**: Learn from video tutorials with AI assistance
- **Session Management**: Track time spent on each problem
- **Firebase Sync**: All your data synced across devices

## 📋 Prerequisites

- Google Chrome browser (Version 88 or higher)
- Google account (for authentication)
- Gemini API key (for AI features)
- Firebase project (for data sync)

## 🛠️ Setup Instructions

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

### 2. Configure the Extension

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

2. **Update Gemini API Config** in `config/config.js`:
```javascript
export const CONFIG = {
  GEMINI_API_KEY: 'your-gemini-api-key-here',
  // ... other config
};
```

### 3. Install the Extension

#### Method 1: Load Unpacked (Development)

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top-right corner)
3. Click "Load unpacked"
4. Select the `chrome-extension` folder
5. The extension should now appear in your extensions list

#### Method 2: Create ZIP (Distribution)

1. Zip the `chrome-extension` folder
2. Upload to Chrome Web Store (if publishing)
3. Or share the ZIP file for manual installation

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
