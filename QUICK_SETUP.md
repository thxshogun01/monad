# Quick Twitter OAuth Setup

## Step 1: Get Twitter App Credentials

1. Go to [https://developer.twitter.com/](https://developer.twitter.com/)
2. Create a new app or use existing one
3. Go to **App Settings** → **User authentication settings**
4. Enable **OAuth 1.0a**
5. Set **App permissions** to "Read"
6. Add **Callback URLs**: `https://your-domain.com/callback.html`
7. Copy your **Consumer Key** and **Consumer Secret**

## Step 2: Update Configuration

Open `twitter-config.js` and replace:

```javascript
CONSUMER_KEY: 'YOUR_CONSUMER_KEY',
CONSUMER_SECRET: 'YOUR_CONSUMER_SECRET',
CALLBACK_URL: 'https://your-domain.com/callback.html',
```

With your actual credentials:

```javascript
CONSUMER_KEY: 'abc123def456ghi789', // Your actual Consumer Key
CONSUMER_SECRET: 'xyz789uvw456rst123', // Your actual Consumer Secret
CALLBACK_URL: 'https://your-domain.com/callback.html', // Your actual domain
```

## Step 3: Test

1. Deploy to your domain
2. Click "Login with X"
3. Should redirect to Twitter and back with real user data

## Troubleshooting

- **CORS errors**: Make sure your domain is whitelisted in Twitter app settings
- **Invalid callback**: Check that callback URL exactly matches Twitter app settings
- **Signature errors**: Verify Consumer Key/Secret are correct

## For Local Testing

For local development, you can use:
- Callback URL: `http://localhost:3000/callback.html`
- Make sure your local server is running on port 3000 