# Welcome/Onboarding Page

This directory contains the onboarding experience shown to users when they first install the Cognify extension.

## Files

- `welcome.html` - Main welcome page with platform information and setup links
- `welcome.js` - Interactive functionality for the welcome page

## Features

1. **Platform Overview** - Shows all supported coding platforms (LeetCode, CodeChef, Codeforces, GeeksforGeeks)
2. **Quick Setup** - Direct links to:
   - Settings page (Add API Key)
   - Web Dashboard
   - Documentation
3. **Feature Highlights** - Key features of Cognify
4. **Interactive Cards** - Clickable platform cards that open respective coding sites

## User Flow

1. User installs the extension
2. Welcome page automatically opens in a new tab
3. User can:
   - Learn about supported platforms
   - Set up their Gemini API key
   - Access the web dashboard
   - Start coding on any supported platform

## Customization

The dashboard URL is configured to use the production deployment:
```html
<a href="https://cognify-68642.web.app/" class="action-card secondary" target="_blank">
```

To use a different URL (e.g., for development), update this in `welcome.html`.
