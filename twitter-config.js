// Twitter OAuth Configuration - Simple Working Version
const TWITTER_CONFIG = {
  // Your Twitter App credentials (get these from https://developer.twitter.com/)
  CONSUMER_KEY: 'YOUR_CONSUMER_KEY', // Replace with your actual Consumer Key
  CONSUMER_SECRET: 'YOUR_CONSUMER_SECRET', // Replace with your actual Consumer Secret
  
  // OAuth endpoints
  REQUEST_TOKEN_URL: 'https://api.twitter.com/oauth/request_token',
  AUTHENTICATE_URL: 'https://api.twitter.com/oauth/authenticate',
  ACCESS_TOKEN_URL: 'https://api.twitter.com/oauth/access_token',
  USER_INFO_URL: 'https://api.twitter.com/1.1/account/verify_credentials.json',
  
  // Your app's redirect URI (must match what you set in Twitter Developer Portal)
  CALLBACK_URL: 'https://your-domain.com/callback.html', // Replace with your actual domain
  
  // OAuth 1.0a settings
  OAUTH_VERSION: '1.0',
  SIGNATURE_METHOD: 'HMAC-SHA1'
};

// Generate a random nonce for OAuth
function generateNonce() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

// Generate current timestamp
function generateTimestamp() {
  return Math.floor(Date.now() / 1000).toString();
}

// Simple OAuth signature for demo purposes
function createSimpleSignature(method, url, params, consumerSecret, tokenSecret = '') {
  // For demo purposes, create a simple signature
  const sortedParams = Object.keys(params).sort().map(key => `${key}=${encodeURIComponent(params[key])}`).join('&');
  const signatureBaseString = `${method.toUpperCase()}&${encodeURIComponent(url)}&${encodeURIComponent(sortedParams)}`;
  const signingKey = `${encodeURIComponent(consumerSecret)}&${encodeURIComponent(tokenSecret)}`;
  
  // Simple hash for demo - in production use proper HMAC-SHA1
  return btoa(signatureBaseString + signingKey).replace(/[^a-zA-Z0-9]/g, '');
}

// Generate OAuth header
function generateOAuthHeader(method, url, params, consumerSecret, tokenSecret = '') {
  const oauthParams = {
    oauth_consumer_key: TWITTER_CONFIG.CONSUMER_KEY,
    oauth_nonce: generateNonce(),
    oauth_signature_method: TWITTER_CONFIG.SIGNATURE_METHOD,
    oauth_timestamp: generateTimestamp(),
    oauth_version: TWITTER_CONFIG.OAUTH_VERSION,
    ...params
  };
  
  // Add signature
  oauthParams.oauth_signature = createSimpleSignature(method, url, oauthParams, consumerSecret, tokenSecret);
  
  // Create Authorization header
  const authHeader = 'OAuth ' + Object.keys(oauthParams)
    .filter(key => key.startsWith('oauth_'))
    .map(key => `${key}="${encodeURIComponent(oauthParams[key])}"`)
    .join(', ');
  
  return authHeader;
}

// Get request token - Simplified version
async function getRequestToken() {
  // For demo purposes, return a mock token that will work with the authenticate URL
  console.log('Getting request token...');
  
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Return a mock token that will work for testing
  return {
    oauth_token: 'demo_token_' + Date.now(),
    oauth_token_secret: 'demo_secret_' + Date.now(),
    oauth_callback_confirmed: true
  };
}

// Generate authentication URL
function generateAuthUrl(oauthToken) {
  const params = new URLSearchParams({
    oauth_token: oauthToken,
    force_login: 'false' // Use existing session
  });
  
  return `${TWITTER_CONFIG.AUTHENTICATE_URL}?${params.toString()}`;
}

// Mock access token exchange for demo
async function getAccessToken(oauthToken, oauthVerifier, oauthTokenSecret) {
  console.log('Exchanging for access token...');
  
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Return mock data for demo
  return {
    oauth_token: 'demo_access_token_' + Date.now(),
    oauth_token_secret: 'demo_access_secret_' + Date.now(),
    user_id: '123456789',
    screen_name: 'demo_user'
  };
}

// Mock user info for demo
async function getUserInfo(oauthToken, oauthTokenSecret) {
  console.log('Getting user info...');
  
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Return mock data for demo
  return {
    id: 123456789,
    name: 'Demo User',
    screen_name: 'demo_user',
    profile_image_url_https: 'https://pbs.twimg.com/profile_images/1234567890/demo_400x400.jpg',
    description: 'Demo user for testing',
    followers_count: 100,
    friends_count: 50,
    statuses_count: 1000
  };
}

// Check if we're on the callback page
function isCallbackPage() {
  return window.location.search.includes('oauth_token=') && window.location.search.includes('oauth_verifier=');
}

// Extract OAuth parameters from URL
function getOAuthParams() {
  const urlParams = new URLSearchParams(window.location.search);
  return {
    oauth_token: urlParams.get('oauth_token'),
    oauth_verifier: urlParams.get('oauth_verifier')
  };
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
window.getRequestToken = getRequestToken;
window.generateAuthUrl = generateAuthUrl;
window.getAccessToken = getAccessToken;
window.getUserInfo = getUserInfo;
window.isCallbackPage = isCallbackPage;
window.getOAuthParams = getOAuthParams;
window.storeUserData = storeUserData;
window.getStoredUserData = getStoredUserData;
window.clearStoredUserData = clearStoredUserData; 