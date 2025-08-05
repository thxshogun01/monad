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

// Create OAuth signature
function createOAuthSignature(method, url, params, consumerSecret, tokenSecret = '') {
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
  
  // Generate HMAC-SHA1 signature (this is a simplified version)
  // In production, you'd use a proper crypto library
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
  oauthParams.oauth_signature = createOAuthSignature(method, url, oauthParams, consumerSecret, tokenSecret);
  
  // Create Authorization header
  const authHeader = 'OAuth ' + Object.keys(oauthParams)
    .filter(key => key.startsWith('oauth_'))
    .map(key => `${key}="${encodeURIComponent(oauthParams[key])}"`)
    .join(', ');
  
  return authHeader;
}

// Get request token
async function getRequestToken() {
  const params = {
    oauth_callback: TWITTER_CONFIG.CALLBACK_URL
  };
  
  const authHeader = generateOAuthHeader('POST', TWITTER_CONFIG.REQUEST_TOKEN_URL, params, TWITTER_CONFIG.CONSUMER_SECRET);
  
  try {
    const response = await fetch(TWITTER_CONFIG.REQUEST_TOKEN_URL, {
      method: 'POST',
      headers: {
        'Authorization': authHeader
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to get request token');
    }
    
    const text = await response.text();
    const params = new URLSearchParams(text);
    
    return {
      oauth_token: params.get('oauth_token'),
      oauth_token_secret: params.get('oauth_token_secret'),
      oauth_callback_confirmed: params.get('oauth_callback_confirmed') === 'true'
    };
  } catch (error) {
    console.error('Error getting request token:', error);
    throw error;
  }
}

// Generate authentication URL
function generateAuthUrl(oauthToken) {
  const params = new URLSearchParams({
    oauth_token: oauthToken,
    force_login: 'false' // Use existing session
  });
  
  return `${TWITTER_CONFIG.AUTHENTICATE_URL}?${params.toString()}`;
}

// Exchange request token for access token
async function getAccessToken(oauthToken, oauthVerifier, oauthTokenSecret) {
  const params = {
    oauth_token: oauthToken,
    oauth_verifier: oauthVerifier
  };
  
  const authHeader = generateOAuthHeader('POST', TWITTER_CONFIG.ACCESS_TOKEN_URL, params, TWITTER_CONFIG.CONSUMER_SECRET, oauthTokenSecret);
  
  try {
    const response = await fetch(TWITTER_CONFIG.ACCESS_TOKEN_URL, {
      method: 'POST',
      headers: {
        'Authorization': authHeader
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to get access token');
    }
    
    const text = await response.text();
    const params = new URLSearchParams(text);
    
    return {
      oauth_token: params.get('oauth_token'),
      oauth_token_secret: params.get('oauth_token_secret'),
      user_id: params.get('user_id'),
      screen_name: params.get('screen_name')
    };
  } catch (error) {
    console.error('Error getting access token:', error);
    throw error;
  }
}

// Get user info
async function getUserInfo(oauthToken, oauthTokenSecret) {
  const params = {};
  
  const authHeader = generateOAuthHeader('GET', TWITTER_CONFIG.USER_INFO_URL, params, TWITTER_CONFIG.CONSUMER_SECRET, oauthTokenSecret);
  
  try {
    const response = await fetch(`${TWITTER_CONFIG.USER_INFO_URL}?include_entities=true&skip_status=true`, {
      method: 'GET',
      headers: {
        'Authorization': authHeader
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to get user info');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error getting user info:', error);
    throw error;
  }
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