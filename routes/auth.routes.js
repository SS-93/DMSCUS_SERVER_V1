const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const router = express.Router();
const { User } = require('../models/user.model');

// Import Google Drive routes
const driveRoutes = require('./drive.routes');

// Mount Drive routes under /drive
router.use('/drive', driveRoutes);

router.get('/clock', (req, res) => {
  const oauth2Client = require('../utils/googleAuth');
  const scopes = [
    'https://www.googleapis.com/auth/userinfo.profile',
    'https://www.googleapis.com/auth/userinfo.email',
  ];
});

// const { generateTokens } = require('../../utils');

// // Initiate Google OAuth login
// router.get('/google',
//   passport.authenticate('google', { 
//     scope: ['profile', 'email'],
//     prompt: 'select_account'
//   })
// );

// // Google OAuth callback
// router.get('/google/callback',
//   passport.authenticate('google', { 
//     failureRedirect: '/login',
//     session: false 
//   }),
//   (req, res) => {
//     try {
//       // Generate JWT token
//       const token = jwt.sign(
//         { 
//           id: req.user._id, 
//           email: req.user.email,
//           firstName: req.user.firstName,
//           lastName: req.user.lastName
//         },
//         process.env.JWT_SECRET,
//         { expiresIn: '24h' }
//       );
      
//       // Redirect to frontend with token
//       res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}`);
//     } catch (error) {
//       console.error('Error in Google callback:', error);
//       res.redirect(`${process.env.FRONTEND_URL}/login?error=auth_failed`);
//     }
//   }
// );

// // Verify token endpoint
// router.get('/verify', (req, res) => {
//   const token = req.headers.authorization?.split(' ')[1];
  
//   if (!token) {
//     return res.status(401).json({ message: 'No token provided' });
//   }

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     res.json({ valid: true, user: decoded });
//   } catch (error) {
//     res.status(401).json({ valid: false, message: 'Invalid token' });
//   }
// });

// // Token refresh endpoint
// router.post('/refresh', async (req, res) => {
//   try {
//     const { refreshToken } = req.body;
//     const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    
//     const user = await User.findByPk(decoded.id);
//     if (!user) {
//       return res.status(401).json({ error: 'User not found' });
//     }

//     const tokens = await generateTokens(user);
//     res.json(tokens);
//   } catch (error) {
//     res.status(401).json({ error: 'Invalid refresh token' });
//   }
// });

module.exports = router; 