// Twitter OAuth Configuration
// Replace these with your actual Twitter Developer App credentials
const TWITTER_CONFIG = {
  // Your Twitter App credentials (get these from https://developer.twitter.com/)
  CLIENT_ID: 'YOUR_TWITTER_CLIENT_ID', // Replace with your actual Client ID
  CLIENT_SECRET: 'YOUR_TWITTER_CLIENT_SECRET', // Replace with your actual Client Secret
  
  // OAuth endpoints
  AUTHORIZE_URL: 'https://twitter.com/i/oauth2/authorize',
  TOKEN_URL: 'https://api.twitter.com/2/oauth2/token',
  USER_INFO_URL: 'https://api.twitter.com/2/users/me',
  
  // Your app's redirect URI (must match what you set in Twitter Developer Portal)
  REDIRECT_URI: 'https://your-domain.com/callback', // Replace with your actual domain
  
  // Scopes needed for user info
  SCOPE: 'tweet.read users.read offline.access',
  
  // State parameter for security
  STATE: 'monad_voices_auth_' + Math.random().toString(36).substr(2, 9),
  
  // PKCE settings (using 'plain' method for simplicity)
  CODE_CHALLENGE_METHOD: 'plain',
  CODE_CHALLENGE: 'monad_voices_challenge_' + Math.random().toString(36).substr(2, 9),
  CODE_VERIFIER: 'monad_voices_verifier_' + Math.random().toString(36).substr(2, 9)
};

// Generate the Twitter OAuth URL
function generateTwitterAuthUrl() {
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: TWITTER_CONFIG.CLIENT_ID,
    redirect_uri: TWITTER_CONFIG.REDIRECT_URI,
    scope: TWITTER_CONFIG.SCOPE,
    state: TWITTER_CONFIG.STATE,
    code_challenge: TWITTER_CONFIG.CODE_CHALLENGE,
    code_challenge_method: TWITTER_CONFIG.CODE_CHALLENGE_METHOD
  });
  
  return `${TWITTER_CONFIG.AUTHORIZE_URL}?${params.toString()}`;
}

// Check if we're on the callback page
function isCallbackPage() {
  return window.location.search.includes('code=') && window.location.search.includes('state=');
}

// Extract authorization code from URL
function getAuthCode() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('code');
}

// Extract state from URL
function getState() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('state');
}

// Store user data in localStorage
function storeUserData(userData) {
  localStorage.setItem('twitter_user_data', JSON.stringify(userData));
  localStorage.setItem('twitter_auth_time', Date.now().toString());
}

// Get stored user data
function getStoredUserData() {
  const data = localStorage.getItem('twitter_user_data');
  const authTime = localStorage.getItem('twitter_auth_time');
  
  if (!data || !authTime) return null;
  
  // Check if auth is still valid (24 hours)
  const now = Date.now();
  const authTimestamp = parseInt(authTime);
  if (now - authTimestamp > 24 * 60 * 60 * 1000) {
    clearStoredUserData();
    return null;
  }
  
  return JSON.parse(data);
}

// Clear stored user data
function clearStoredUserData() {
  localStorage.removeItem('twitter_user_data');
  localStorage.removeItem('twitter_auth_time');
}

// Export for use in other files
window.TWITTER_CONFIG = TWITTER_CONFIG;
window.generateTwitterAuthUrl = generateTwitterAuthUrl;
window.isCallbackPage = isCallbackPage;
window.getAuthCode = getAuthCode;
window.getState = getState;
window.storeUserData = storeUserData;
window.getStoredUserData = getStoredUserData;
window.clearStoredUserData = clearStoredUserData; 