const express = require('express');
const crypto = require('crypto');
const axios = require('axios');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Twitter OAuth configuration
const TWITTER_CONFIG = {
  CONSUMER_KEY: process.env.TWITTER_CONSUMER_KEY || 'YOUR_CONSUMER_KEY',
  CONSUMER_SECRET: process.env.TWITTER_CONSUMER_SECRET || 'YOUR_CONSUMER_SECRET',
  CALLBACK_URL: process.env.TWITTER_CALLBACK_URL || 'http://localhost:3000/callback'
};

// Serve static files
app.use(express.static('.'));

// Generate OAuth signature
function createOAuthSignature(method, url, params, consumerSecret, tokenSecret = '') {
  const sortedParams = Object.keys(params).sort().map(key => `${key}=${encodeURIComponent(params[key])}`).join('&');
  const signatureBaseString = `${method.toUpperCase()}&${encodeURIComponent(url)}&${encodeURIComponent(sortedParams)}`;
  const signingKey = `${encodeURIComponent(consumerSecret)}&${encodeURIComponent(tokenSecret)}`;
  
  return crypto.createHmac('sha1', signingKey).update(signatureBaseString).digest('base64');
}

// Generate OAuth header
function generateOAuthHeader(method, url, params, consumerSecret, tokenSecret = '') {
  const oauthParams = {
    oauth_consumer_key: TWITTER_CONFIG.CONSUMER_KEY,
    oauth_nonce: Math.random().toString(36).substring(2, 15),
    oauth_signature_method: 'HMAC-SHA1',
    oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
    oauth_version: '1.0',
    ...params
  };
  
  oauthParams.oauth_signature = createOAuthSignature(method, url, oauthParams, consumerSecret, tokenSecret);
  
  const authHeader = 'OAuth ' + Object.keys(oauthParams)
    .filter(key => key.startsWith('oauth_'))
    .map(key => `${key}="${encodeURIComponent(oauthParams[key])}"`)
    .join(', ');
  
  return authHeader;
}

// Get request token
app.get('/api/twitter/request-token', async (req, res) => {
  try {
    const params = {
      oauth_callback: TWITTER_CONFIG.CALLBACK_URL
    };
    
    const authHeader = generateOAuthHeader('POST', 'https://api.twitter.com/oauth/request_token', params, TWITTER_CONFIG.CONSUMER_SECRET);
    
    const response = await axios.post('https://api.twitter.com/oauth/request_token', null, {
      headers: {
        'Authorization': authHeader
      }
    });
    
    const tokenData = new URLSearchParams(response.data);
    
    res.json({
      oauth_token: tokenData.get('oauth_token'),
      oauth_token_secret: tokenData.get('oauth_token_secret'),
      oauth_callback_confirmed: tokenData.get('oauth_callback_confirmed') === 'true'
    });
  } catch (error) {
    console.error('Error getting request token:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to get request token' });
  }
});

// Exchange request token for access token
app.post('/api/twitter/access-token', async (req, res) => {
  try {
    const { oauth_token, oauth_verifier, oauth_token_secret } = req.body;
    
    const params = {
      oauth_token: oauth_token,
      oauth_verifier: oauth_verifier
    };
    
    const authHeader = generateOAuthHeader('POST', 'https://api.twitter.com/oauth/access_token', params, TWITTER_CONFIG.CONSUMER_SECRET, oauth_token_secret);
    
    const response = await axios.post('https://api.twitter.com/oauth/access_token', null, {
      headers: {
        'Authorization': authHeader
      }
    });
    
    const tokenData = new URLSearchParams(response.data);
    
    res.json({
      oauth_token: tokenData.get('oauth_token'),
      oauth_token_secret: tokenData.get('oauth_token_secret'),
      user_id: tokenData.get('user_id'),
      screen_name: tokenData.get('screen_name')
    });
  } catch (error) {
    console.error('Error getting access token:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to get access token' });
  }
});

// Get user info
app.get('/api/twitter/user-info', async (req, res) => {
  try {
    const { oauth_token, oauth_token_secret } = req.query;
    
    const params = {};
    const authHeader = generateOAuthHeader('GET', 'https://api.twitter.com/1.1/account/verify_credentials.json', params, TWITTER_CONFIG.CONSUMER_SECRET, oauth_token_secret);
    
    const response = await axios.get('https://api.twitter.com/1.1/account/verify_credentials.json?include_entities=true&skip_status=true', {
      headers: {
        'Authorization': authHeader
      }
    });
    
    res.json(response.data);
  } catch (error) {
    console.error('Error getting user info:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to get user info' });
  }
});

// Handle callback
app.get('/callback', (req, res) => {
  res.sendFile(path.join(__dirname, 'callback.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log('Make sure to set your Twitter credentials as environment variables:');
  console.log('TWITTER_CONSUMER_KEY=your_consumer_key');
  console.log('TWITTER_CONSUMER_SECRET=your_consumer_secret');
  console.log('TWITTER_CALLBACK_URL=http://localhost:3000/callback');
}); 