# Cognify Web Dashboard

A modern React-based web dashboard for tracking your coding interview preparation progress, viewing analytics, and managing your learning journey with AI-powered insights.

## 🚀 Features

- **Progress Tracking**: Monitor your problem-solving journey across platforms
- **Session Analysis**: Review detailed feedback from your practice sessions
- **Analytics Dashboard**: Visualize your performance with interactive charts
- **Firebase Integration**: Secure authentication and real-time data sync
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Firebase project (for authentication and database)
- Google account (for authentication)

## 🛠️ Setup Instructions

### 1. Install Dependencies

```bash
cd web-dashboard
npm install
```

### 2. Configure Firebase

Create a `.env` file in the `web-dashboard` directory with your Firebase credentials:

```env
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

**To get your Firebase credentials:**
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project or create a new one
3. Go to Project Settings > General
4. Scroll down to "Your apps" and click on the web app icon
5. Copy the configuration values

### 3. Enable Firebase Services

In your Firebase Console:

1. **Authentication:**
   - Go to Authentication > Sign-in method
   - Enable Google sign-in provider

2. **Firestore Database:**
   - Go to Firestore Database
   - Create database (start in test mode for development)
   - Set up security rules as needed

3. **Firebase Hosting (Optional):**
   - Go to Hosting
   - Follow the setup wizard

## 🏃 Running the Application

### Development Mode

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Build for Production

```bash
npm run build
```

This creates an optimized build in the `dist` folder.

### Preview Production Build

```bash
npm run preview
```

## 🌐 Deployment

### Deploy to Firebase Hosting

1. **Install Firebase CLI:**
```bash
npm install -g firebase-tools
```

2. **Login to Firebase:**
```bash
firebase login
```

3. **Initialize Firebase Hosting:**
```bash
firebase init hosting
```

Configuration:
- Public directory: `dist`
- Single-page app: `Yes`
- Automatic builds: `No`

4. **Build and Deploy:**
```bash
npm run build
firebase deploy --only hosting
```

Your dashboard will be live at: `https://your-project.web.app`

## 📱 How to Use

### First Time Setup

1. **Sign In:**
   - Open the dashboard
   - Click "Sign in with Google"
   - Authorize with your Google account

2. **Install Chrome Extension:**
   - The dashboard works in tandem with the Cognify Chrome Extension
   - Install the extension from the `chrome-extension` folder
   - Make sure to sign in to the extension with the same Google account

### Using the Dashboard

1. **Dashboard View:**
   - See your overall statistics and progress
   - Track problems solved across different platforms
   - View your performance trends over time

2. **Progress Tab:**
   - Detailed breakdown by platform (LeetCode, CodeChef, Codeforces, etc.)
   - Difficulty-wise analysis
   - Topic-wise performance

3. **Interview Reports:**
   - Review detailed session analysis
   - See your strengths and areas for improvement
   - Track performance over time

4. **Settings:**
   - Manage your profile
   - Configure notification preferences
   - Link/unlink accounts

## 🔧 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |

## 🏗️ Tech Stack

- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **Firebase** - Authentication and database
- **Recharts** - Data visualization
- **Tailwind CSS** - Styling
- **Lucide React** - Icons

## 📂 Project Structure

```
web-dashboard/
├── src/
│   ├── components/       # React components
│   │   ├── Dashboard.jsx
│   │   ├── Progress.jsx
│   │   ├── InterviewReports.jsx
│   │   ├── Recommendations.jsx
│   │   ├── Settings.jsx
│   │   └── Navbar.jsx
│   ├── contexts/         # React contexts
│   │   └── AuthContext.jsx
│   ├── services/         # Firebase services
│   │   └── firebase.js
│   ├── App.jsx          # Main app component
│   ├── main.jsx         # Entry point
│   └── index.css        # Global styles
├── public/              # Static assets
├── index.html           # HTML template
└── package.json         # Dependencies
```

## 🐛 Troubleshooting

### Issue: Firebase Authentication Error
**Solution:** Ensure your Firebase API keys are correctly set in the `.env` file and that Google sign-in is enabled in Firebase Console.

### Issue: Data Not Syncing
**Solution:** Check Firestore security rules and ensure the Chrome extension is signed in with the same Google account.

### Issue: Build Fails
**Solution:** Delete `node_modules` and `package-lock.json`, then run `npm install` again.

## 🔐 Security Notes

- Never commit your `.env` file to version control
- Add `.env` to `.gitignore`
- Use Firebase security rules to protect your data
- For production, configure proper Firebase security rules

## 📄 License

This project is part of the Cognify AI Mentor system.

## 🤝 Support

For issues and questions, please check the main Cognify repository or create an issue on GitHub.
