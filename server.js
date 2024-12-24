const express = require('express');
const axios = require('axios');
const querystring = require('querystring');
const app = express();
require('dotenv').config();

// Spotify credentials from .env
const clientId = process.env.SPOTIFY_CLIENT_ID;
const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
const redirectUri = process.env.REDIRECT_URI;

app.use(express.static('public')); // Serve static files like HTML, CSS, JS

// Step 1: Redirect user to Spotify for authentication
app.get('/login', (req, res) => {
  const loginUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=code&redirect_uri=${redirectUri}&scope=user-library-read user-read-playback-state user-modify-playback-state`;
  res.redirect(loginUrl); // Redirect to Spotify login page
});

// Step 2: Handle the callback and exchange code for access token
app.get('/callback', async (req, res) => {
  const code = req.query.code; // Get the authorization code from query params

  // Exchange the authorization code for an access token
  try {
    const tokenResponse = await axios.post('https://accounts.spotify.com/api/token', querystring.stringify({
      code: code,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    }), {
      headers: {
        'Authorization': 'Basic ' + Buffer.from(clientId + ':' + clientSecret).toString('base64'),
      },
    });

    const accessToken = tokenResponse.data.access_token;
    const refreshToken = tokenResponse.data.refresh_token;

    // Redirect back to index.html with the login status and tokens in URL params
    res.redirect(`http://localhost:5500/index.html?logged_in=true&access_token=${accessToken}&refresh_token=${refreshToken}`);
  } catch (error) {
    console.error(error);
    res.send('Error during authentication');
  }
});

// Step 3: Play a track using the access token and device ID
app.get('/play', async (req, res) => {
  const accessToken = req.query.access_token; // Get the access token from query params

  try {
    // Step 1: Get the list of available devices
    const devicesResponse = await axios.get('https://api.spotify.com/v1/me/player/devices', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      }
    });

    const devices = devicesResponse.data.devices;

    // Step 2: Ensure there is at least one available device
    if (devices.length > 0) {
      const deviceId = devices[0].id; // Use the first available device

      // Step 3: Play a track on the device
      const trackUri = "spotify:track:2tpWsVSb9UEmDRxAl1zhX1"; // Replace with your track URI
      await axios.put(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
        uris: [trackUri],
      }, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        }
      });

      res.send('Now playing the track!');
    } else {
      res.send('No active devices found. Please ensure Spotify is running and connected.');
    }
  } catch (error) {
    console.error('Error while playing track:', error);
    res.send('Failed to play the track.');
  }
});

// Step 4: Health check endpoint (optional)
app.get('/', (req, res) => {
  res.send('<h1>Server is running!</h1>');
});

// Start server on port 3000
const PORT = 3000;
app.listen(PORT, (err) => {
  if (err) {
    console.error('Failed to start server:', err);
  } else {
    console.log(`Server is running on http://localhost:${PORT}`);
  }
});
