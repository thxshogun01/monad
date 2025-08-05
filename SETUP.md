# Quick Setup - Working Twitter OAuth

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Get Twitter Credentials

1. Go to [https://developer.twitter.com/](https://developer.twitter.com/)
2. Create a new app or use existing one
3. Go to **App Settings** → **User authentication settings**
4. Enable **OAuth 1.0a**
5. Set **App permissions** to "Read"
6. Add **Callback URLs**: `http://localhost:3000/callback`
7. Copy your **Consumer Key** and **Consumer Secret**

## Step 3: Set Environment Variables

Create a `.env` file:

```env
TWITTER_CONSUMER_KEY=your_consumer_key_here
TWITTER_CONSUMER_SECRET=your_consumer_secret_here
TWITTER_CALLBACK_URL=http://localhost:3000/callback
```

## Step 4: Start the Server

```bash
npm start
```

## Step 5: Test

1. Open http://localhost:3000
2. Click "Login with X"
3. Should redirect to Twitter and back with real user data

## For Production

1. Deploy to your hosting service (Heroku, Vercel, etc.)
2. Update callback URL to your production domain
3. Set environment variables on your hosting platform

## Troubleshooting

- **"Failed to get request token"**: Check your Twitter credentials
- **"Invalid callback"**: Make sure callback URL matches Twitter app settings
- **CORS errors**: Server handles OAuth on backend, no CORS issues 