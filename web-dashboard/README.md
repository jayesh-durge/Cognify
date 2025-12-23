# Cognify Web Dashboard 📊

**Already Online & Ready to Use!** ✅

View your coding progress, analytics, and interview preparation insights - no installation needed!

🌐 **Access Dashboard:** [https://cognify-68642.web.app/](https://cognify-68642.web.app/)

---

## 🚀 For Users - Just Visit the Dashboard!

### No Setup Required! 🎉

The dashboard is **already hosted and running online**. You don't need to install anything!

**Just follow these 3 simple steps:**

1. 👉 **[Open the Dashboard](https://cognify-68642.web.app/)**
2. Click **"Sign in with Google"**
3. Use the **same Google account** you use in the Chrome Extension

That's it! ✨

### What You Can Do:

✅ View your progress across all platforms  
✅ See detailed analytics and charts  
✅ Review interview session reports  
✅ Get personalized recommendations  
✅ Track your daily/weekly/monthly progress  
✅ Access from any device (phone, tablet, laptop)  

### Requirements:

- 🌐 Internet connection
- 🔑 Google account (same as Chrome Extension)
- 🧩 Cognify Chrome Extension installed (to track data)

📘 **Need to install the extension?** [Download here](https://github.com/jayesh-durge/Cognify/archive/refs/heads/main.zip)

---

## 🛠️ For Developers Only

> ⚠️ **The sections below are ONLY for developers who want to:**
> - Run the dashboard locally for development
> - Contribute to the project
> - Customize the dashboard
> - Deploy their own instance
>
> **Regular users:** Just use [https://cognify-68642.web.app/](https://cognify-68642.web.app/) ⬆️

---

## 🚀 Features

- **Progress Tracking**: Monitor your problem-solving journey across platforms
- **Session Analysis**: Review detailed feedback from your practice sessions
- **Analytics Dashboard**: Visualize your performance with interactive charts
- **Firebase Integration**: Secure authentication and real-time data sync
- **Responsive Design**: Works seamlessly on desktop and mobile devices

### Prerequisites (For Local Development)

- **Node.js** v16 or higher ([Download](https://nodejs.org/))
- **npm** or yarn (comes with Node.js)
- **Google account** (for authentication)
- **Firebase project** (optional - can use existing config)

## 🛠️ Setup Instructions

> 💡 **Tip:** Most users don't need to run this locally. Just use the [live dashboard](https://cognify-68642.web.app/)!
>
> Only follow these steps if you want to:
> - Contribute to development
> - Customize the dashboard
> - Run your own instance

### 1. Install Dependencies

```bash
cd web-dashboard
npm install
```

### 2. Configure Firebase (Optional)

> 💡 **Note:** The extension comes with Firebase already configured. You only need this if you're setting up your own instance.

Create a `.env` file in the `web-dashboard` directory:

```env
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

**Get your Firebase credentials:**
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project (or create new)
3. Go to Project Settings → General
4. Scroll to "Your apps" and select/create a web app
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

## 🏃 Running the Application (Developers Only)

> **Regular Users:** You don't need this! Just use [https://cognify-68642.web.app/](https://cognify-68642.web.app/)

### Development Mode

```bash
npm run dev
```

The app will be available at `http://localhost:5173` for local development.

**Production URL:** https://cognify-68642.web.app/

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

Your dashboard is live at: **https://cognify-68642.web.app/**

## 📱 How to Use

### For Regular Users

**Just visit: [https://cognify-68642.web.app/](https://cognify-68642.web.app/)**

Then:
1. Sign in with Google (same account as your Chrome extension)
2. View your dashboard, progress, and interview reports
3. All your data syncs automatically from the Chrome extension

---

### For Developers (Local Setup)

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
