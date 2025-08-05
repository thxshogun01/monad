# Twitter OAuth 1.0a Setup Guide

This guide will help you set up Twitter OAuth 1.0a authentication for the Monad Voices application. This implementation uses the `/authenticate` endpoint to leverage existing Twitter sessions.

## Prerequisites

1. A Twitter Developer Account
2. A web server to host your application
3. HTTPS enabled (required for OAuth)

## Step 1: Create a Twitter App

1. Go to [https://developer.twitter.com/](https://developer.twitter.com/)
2. Sign in with your Twitter account
3. Create a new Project (if you don't have one)
4. Create a new App within your project
5. Note down your **Consumer Key** and **Consumer Secret**

## Step 2: Configure OAuth Settings

1. In your Twitter App settings, go to **User authentication settings**
2. Enable **OAuth 1.0a** (not OAuth 2.0)
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
  CONSUMER_KEY: 'YOUR_ACTUAL_CONSUMER_KEY',
  CONSUMER_SECRET: 'YOUR_ACTUAL_CONSUMER_SECRET',
  CALLBACK_URL: 'https://your-domain.com/callback.html', // Update with your domain
  // ... other settings remain the same
};
```

## Step 4: OAuth 1.0a Flow

The implementation uses OAuth 1.0a with the `/authenticate` endpoint, which provides several advantages:

### Flow Overview:
1. **Get Request Token** - App requests a temporary token from Twitter
2. **Redirect to Authenticate** - User is sent to Twitter's authenticate page with `force_login=false`
3. **User Approves** - Twitter redirects back with oauth_token and oauth_verifier
4. **Exchange for Access Token** - App exchanges the request token for an access token
5. **Get User Info** - App fetches user details using the access token

### Key Benefits:
- **Uses Existing Session** - `force_login=false` leverages the user's existing Twitter login
- **No Sign-up Flow** - Users aren't forced through account creation
- **Real Handle Verification** - Gets the actual `screen_name` from Twitter API
- **Simpler Implementation** - No complex PKCE or state management needed

### Frontend Implementation:
The current implementation handles the OAuth flow entirely in the browser using:
- Request token generation with proper OAuth signatures
- Redirect to Twitter's authenticate endpoint
- Token exchange and user info retrieval
- Secure storage of user data

## Step 5: Test the Integration

1. Update your Twitter App credentials in `twitter-config.js`
2. Open your application in a browser
3. Click "Login with X" button
4. Complete the Twitter authorization (should use your existing session)
5. Verify that your real Twitter handle is displayed

The OAuth 1.0a implementation is already complete and ready to use!



## Security Considerations

1. **Never expose your Consumer Secret** in frontend code
2. **Always use HTTPS** in production
3. **Validate OAuth parameters** to prevent CSRF attacks
4. **Store tokens securely** in session storage
5. **Implement proper error handling**
6. **Use proper OAuth signatures** for all API calls

## Troubleshooting

### Common Issues:

1. **"Invalid callback URI"**
   - Ensure your callback URL exactly matches what's configured in Twitter
   - Check for trailing slashes and protocol (http vs https)

2. **"Invalid consumer key"**
   - Verify your Consumer Key is correct
   - Ensure your app is approved and active

3. **"OAuth signature error"**
   - Check that your OAuth signature generation is correct
   - Verify all required OAuth parameters are included

4. **"Token expired"**
   - Request tokens expire quickly, ensure you're using them promptly
   - Check that you're storing and retrieving token secrets correctly

### Debug Mode

Add this to your browser console to debug OAuth flow:

```javascript
// Enable debug logging
localStorage.setItem('debug_oauth', 'true');

// Check stored user data
console.log('Stored user data:', localStorage.getItem('twitter_user_data'));

// Check session storage for token secret
console.log('Token secret:', sessionStorage.getItem('oauth_token_secret'));
```

## Production Deployment

1. Deploy your application to a hosting service (Netlify, Vercel, etc.)
2. Update your Twitter App's callback URLs to your production domain
3. Update the `CALLBACK_URL` in `twitter-config.js` to your production domain
4. Test the complete OAuth flow in production

## Support

If you encounter issues:
1. Check the Twitter Developer Console for app status
2. Verify your OAuth 1.0a settings are correct
3. Check browser console for JavaScript errors
4. Verify OAuth signature generation is working correctly

---

**Note:** This implementation uses OAuth 1.0a with the `/authenticate` endpoint for better user experience. The `force_login=false` parameter ensures users can use their existing Twitter sessions. 