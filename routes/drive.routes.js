const express = require('express');
const { google } = require('googleapis');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');

// Google Drive OAuth configuration
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_DRIVE_CALLBACK_URL || 'http://localhost:3200/auth/drive/callback'
);

// Generate Google Drive OAuth URL
router.get('/login', authenticateToken, (req, res) => {
  try {
    console.log('🔍 Drive login request received');
    console.log('🔍 User from token:', {
      id: req.user._id,
      email: req.user.email,
      firstName: req.user.firstName,
      lastName: req.user.lastName
    });
    console.log('🔍 Google Client ID:', process.env.GOOGLE_CLIENT_ID ? 'Present' : 'Missing');
    console.log('🔍 Google Client Secret:', process.env.GOOGLE_CLIENT_SECRET ? 'Present' : 'Missing');
    console.log('🔍 Drive Callback URL:', process.env.GOOGLE_DRIVE_CALLBACK_URL || 'http://localhost:3200/auth/drive/callback');
    
    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: [
        'https://www.googleapis.com/auth/drive.file',
        'https://www.googleapis.com/auth/drive.readonly',
        'https://www.googleapis.com/auth/userinfo.profile',
        'https://www.googleapis.com/auth/userinfo.email'
      ],
      state: req.user._id.toString(), // Pass user ID in state
    });

    console.log('🔗 Generated Drive auth URL for user:', req.user.email);
    console.log('🔗 Auth URL (first 100 chars):', authUrl.substring(0, 100) + '...');
    console.log('🔗 State parameter (user ID):', req.user._id.toString());
    
    res.json({ authUrl });
  } catch (error) {
    console.error('❌ Error generating Drive auth URL:', error);
    res.status(500).json({ error: 'Failed to generate auth URL' });
  }
});

// Handle Google Drive OAuth callback
router.get('/callback', async (req, res) => {
  try {
    const { code, state } = req.query;
    
    console.log('📥 Drive callback received with code:', code ? 'Present' : 'Missing');
    
    if (!code) {
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/drive-error?error=no_code`);
    }

    // Get tokens from Google
    const { tokens } = await oauth2Client.getToken(code);
    console.log('🎟️ Received Drive tokens:', tokens.access_token ? 'Access token received' : 'No access token');
    
    // Find user by ID from state
    const User = require('../models/user.model');
    const user = await User.findById(state);
    if (!user) {
      console.error('❌ User not found for state:', state);
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/drive-error?error=user_not_found`);
    }

    // Store Drive tokens in user document
    user.driveAccessToken = tokens.access_token;
    user.driveRefreshToken = tokens.refresh_token;
    user.driveTokenExpiry = new Date(tokens.expiry_date);
    await user.save();

    console.log('✅ Google Drive tokens stored for user:', user.email);
    
    // Redirect to Drive dashboard
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/drive-dashboard`);
  } catch (error) {
    console.error('❌ Error in Drive callback:', error);
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/drive-error?error=auth_failed`);
  }
});

// Get user's Drive files
router.get('/files', authenticateToken, async (req, res) => {
  try {
    const user = req.user;
    
    if (!user.driveAccessToken) {
      return res.status(401).json({ error: 'Drive not connected' });
    }

    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({
      access_token: user.driveAccessToken,
      refresh_token: user.driveRefreshToken,
    });

    const drive = google.drive({ version: 'v3', auth: oauth2Client });

    const response = await drive.files.list({
      pageSize: 50,
      fields: 'files(id, name, mimeType, size, modifiedTime, webViewLink, iconLink)',
      orderBy: 'modifiedTime desc',
    });

    console.log(`📁 Retrieved ${response.data.files.length} files for user:`, user.email);
    res.json({ files: response.data.files });
  } catch (error) {
    console.error('❌ Error fetching Drive files:', error);
    res.status(500).json({ error: 'Failed to fetch files' });
  }
});

module.exports = router; 