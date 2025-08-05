// Twitter OAuth 1.0a Configuration
// Replace these with your actual Twitter Developer App credentials
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

// Simplified OAuth signature generation for browser
function createOAuthSignature(method, url, params, consumerSecret, tokenSecret = '') {
  // For browser compatibility, we'll use a simplified approach
  // In production, you should use a proper crypto library or server-side implementation
  
  // Sort parameters alphabetically
  const sortedParams = Object.keys(params).sort().map(key => `${key}=${encodeURIComponent(params[key])}`).join('&');
  
  // Create signature base string
  const signatureBaseString = [
    method.toUpperCase(),
    encodeURIComponent(url),
    encodeURIComponent(sortedParams)
  ].join('&');
  
  // Create signing key
  const signingKey = encodeURIComponent(consumerSecret) + '&' + encodeURIComponent(tokenSecret);
  
  // For demo purposes, we'll use a simple hash
  // In production, use proper HMAC-SHA1
  const hash = btoa(signatureBaseString + signingKey).replace(/[^a-zA-Z0-9]/g, '');
  return hash;
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
  oauthParams.oauth_signature = createOAuthSignature(method, url, oauthParams, consumerSecret, tokenSecret);
  
  // Create Authorization header
  const authHeader = 'OAuth ' + Object.keys(oauthParams)
    .filter(key => key.startsWith('oauth_'))
    .map(key => `${key}="${encodeURIComponent(oauthParams[key])}"`)
    .join(', ');
  
  return authHeader;
}

// For demo purposes, we'll use a mock implementation
// In production, you should implement proper OAuth 1.0a
async function getRequestToken() {
  // Mock implementation for demo
  // In production, implement proper OAuth 1.0a signature generation
  console.log('Getting request token...');
  
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Return mock data
  return {
    oauth_token: 'mock_oauth_token_' + Date.now(),
    oauth_token_secret: 'mock_oauth_token_secret_' + Date.now(),
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

// Mock access token exchange
async function getAccessToken(oauthToken, oauthVerifier, oauthTokenSecret) {
  // Mock implementation for demo
  console.log('Exchanging for access token...');
  
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Return mock data
  return {
    oauth_token: 'mock_access_token_' + Date.now(),
    oauth_token_secret: 'mock_access_token_secret_' + Date.now(),
    user_id: '123456789',
    screen_name: 'demo_user'
  };
}

// Mock user info
async function getUserInfo(oauthToken, oauthTokenSecret) {
  // Mock implementation for demo
  console.log('Getting user info...');
  
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Return mock data
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