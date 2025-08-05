# Twitter OAuth Setup Guide

This guide will help you set up Twitter OAuth authentication for the Monad Voices application.

## Prerequisites

1. A Twitter Developer Account
2. A web server to host your application
3. HTTPS enabled (required for OAuth)

## Step 1: Create a Twitter App

1. Go to [https://developer.twitter.com/](https://developer.twitter.com/)
2. Sign in with your Twitter account
3. Create a new Project (if you don't have one)
4. Create a new App within your project
5. Note down your **Client ID** and **Client Secret**

## Step 2: Configure OAuth Settings

1. In your Twitter App settings, go to **User authentication settings**
2. Enable **OAuth 2.0 Authorization Code with PKCE**
3. Set your **App permissions** to "Read"
4. Add your **Callback URLs**:
   - For development: `http://localhost:3000/callback.html`
   - For production: `https://your-domain.com/callback.html`
5. Set your **Website URL** to your app's domain
6. Save the changes

## Step 3: Update Configuration

1. Open `twitter-config.js`
2. Replace the placeholder values with your actual credentials:

```javascript
const TWITTER_CONFIG = {
  CLIENT_ID: 'YOUR_ACTUAL_CLIENT_ID',
  CLIENT_SECRET: 'YOUR_ACTUAL_CLIENT_SECRET',
  REDIRECT_URI: 'https://your-domain.com/callback.html', // Update with your domain
  // ... other settings remain the same
};
```

## Step 4: Server-Side Implementation (Required for Production)

For production use, you'll need a server to handle the OAuth token exchange securely. Here's a simple Node.js example:

### Install Dependencies
```bash
npm install express axios
```

### Create Server (server.js)
```javascript
const express = require('express');
const axios = require('axios');
const app = express();

app.use(express.json());
app.use(express.static('.')); // Serve your static files

// Exchange authorization code for access token
app.post('/api/twitter/token', async (req, res) => {
  try {
    const { code, code_verifier } = req.body;
    
    const response = await axios.post('https://api.twitter.com/2/oauth2/token', {
      grant_type: 'authorization_code',
      code: code,
      client_id: process.env.TWITTER_CLIENT_ID,
      redirect_uri: process.env.TWITTER_REDIRECT_URI,
      code_verifier: code_verifier
    }, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
    
    const { access_token } = response.data;
    
    // Get user info
    const userResponse = await axios.get('https://api.twitter.com/2/users/me', {
      headers: {
        'Authorization': `Bearer ${access_token}`
      },
      params: {
        'user.fields': 'id,name,username,profile_image_url'
      }
    });
    
    res.json(userResponse.data);
  } catch (error) {
    console.error('Twitter OAuth error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

### Environment Variables (.env)
```
TWITTER_CLIENT_ID=your_client_id
TWITTER_CLIENT_SECRET=your_client_secret
TWITTER_REDIRECT_URI=https://your-domain.com/callback.html
```

## Step 5: Update Frontend Code

Update the `handleTwitterCallback` function in `app.js` to use your server:

```javascript
async function handleTwitterCallback() {
  const code = getAuthCode();
  const state = getState();
  
  if (!code || !state) {
    console.error('Missing authorization code or state');
    return;
  }
  
  try {
    // Send code to your server
    const response = await fetch('/api/twitter/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        code: code,
        code_verifier: TWITTER_CONFIG.CODE_VERIFIER
      })
    });
    
    if (!response.ok) {
      throw new Error('Token exchange failed');
    }
    
    const userData = await response.json();
    
    // Store user data
    storeUserData(userData.data);
    
    // Redirect back to main page
    window.location.href = window.location.origin + window.location.pathname;
    
  } catch (error) {
    console.error('Error handling Twitter callback:', error);
    alert('Authentication failed. Please try again.');
  }
}
```

## Step 6: Test the Integration

1. Start your server: `node server.js`
2. Open your application in a browser
3. Click "Login with X" button
4. Complete the Twitter authorization
5. Verify that your real Twitter handle is displayed

## Security Considerations

1. **Never expose your Client Secret** in frontend code
2. **Always use HTTPS** in production
3. **Validate state parameter** to prevent CSRF attacks
4. **Store tokens securely** on your server
5. **Implement proper error handling**

## Troubleshooting

### Common Issues:

1. **"Invalid redirect URI"**
   - Ensure your callback URL exactly matches what's configured in Twitter
   - Check for trailing slashes and protocol (http vs https)

2. **"Invalid client"**
   - Verify your Client ID is correct
   - Ensure your app is approved and active

3. **"PKCE error"**
   - Make sure code_challenge and code_verifier match
   - Verify you're using the correct challenge method

4. **CORS errors**
   - Ensure your server is properly configured
   - Check that your domain is whitelisted

### Debug Mode

Add this to your browser console to debug OAuth flow:

```javascript
// Enable debug logging
localStorage.setItem('debug_oauth', 'true');

// Check stored user data
console.log('Stored user data:', localStorage.getItem('twitter_user_data'));
```

## Production Deployment

1. Deploy your server to a hosting service (Heroku, Vercel, etc.)
2. Update your Twitter App's callback URLs to your production domain
3. Set environment variables on your hosting platform
4. Test the complete OAuth flow in production

## Support

If you encounter issues:
1. Check the Twitter Developer Console for app status
2. Verify your OAuth settings are correct
3. Check browser console for JavaScript errors
4. Ensure your server logs for backend errors

---

**Note:** This implementation uses the "plain" PKCE method for simplicity. For production, consider using "S256" for better security. 