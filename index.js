require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const passport = require('passport');
const session = require('express-session');
const GoogleStrategy = require('passport-google-oauth20');

// Import passport configuration
require('./passport');

const userRoutes = require('./routes/user.routes');
const authRoutes = require('./routes/auth.routes');
const PORT = process.env.PORT || 3200;
const MONGO = process.env.MONGO || 'mongodb://localhost:27017';

// Debug: Log the MONGO variable to see what's being used
console.log('🔍 MONGO URI being used:', MONGO);

// Middleware
const app = express();

app.use(session({ 
  secret: process.env.SESSION_SECRET || 'your-secret-key', 
  resave: false, 
  saveUninitialized: true 
}));

app.use(passport.initialize());
app.use(passport.session());

// Enable CORS and JSON parsing
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

app.use(express.json());

// Passport Google Strategy configuration
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3200/auth/google/callback',
  scope: ['profile', 'email']
}, async (accessToken, refreshToken, profile, done) => {
  try {
    console.log('🔍 Google OAuth callback received for:', profile.emails[0].value);
    
    const User = require('./models/user.model');
    
    // Check if user already exists
    let user = await User.findOne({ email: profile.emails[0].value });
    
    if (!user) {
      console.log('👤 Creating new user from Google profile');
      // Handle cases where Google profile might not have separate first/last names
      const fullName = profile.displayName || profile.name?.givenName || 'User';
      const firstName = profile.name?.givenName || fullName.split(' ')[0] || 'User';
      const lastName = profile.name?.familyName || fullName.split(' ').slice(1).join(' ') || 'User';
      
      // Create new user if doesn't exist
      user = await User.create({
        firstName: firstName,
        lastName: lastName,
        email: profile.emails[0].value,
        password: Math.random().toString(36).slice(-8), // Generate random password
        phoneNumber: '000-000-0000', // Default phone number
        googleId: profile.id,
        picture: profile.photos[0]?.value
      });
    } else {
      console.log('✅ Existing user found, updating Google ID');
      // Update Google ID if user exists
      user.googleId = profile.id;
      user.picture = profile.photos[0]?.value;
      await user.save();
    }
    
    done(null, user);
  } catch (error) {
    console.error('❌ Error in Google OAuth strategy:', error);
    done(error, null);
  }
}));

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

// Auth routes
app.get('/', (req, res) => {
  res.send('<a href="/auth/google">Login with Google</a>');
});

app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get('/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: '/' }), 
  (req, res) => {
    try {
      console.log('✅ Google callback successful for user:', req.user.email);
      console.log('🔍 User object:', {
        id: req.user._id,
        email: req.user.email,
        firstName: req.user.firstName,
        lastName: req.user.lastName
      });
      
      // Generate JWT token
      const jwt = require('jsonwebtoken');
      const token = jwt.sign(
        { userId: req.user._id, email: req.user.email },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '24h' }
      );
      
      console.log('🎟️ JWT token generated');
      console.log('🔗 Redirecting to Drive login with token');
      
      // Redirect to Drive login with token in URL
      const redirectUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/drive-login?token=${token}`;
      console.log('🔗 Redirect URL:', redirectUrl);
      
      res.redirect(redirectUrl);
    } catch (error) {
      console.error('❌ Error in Google callback:', error);
      res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?error=auth_failed`);
    }
  }
);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy' });
});

// Routes
app.use('/users', userRoutes);
app.use('/auth', authRoutes);

// Connect to MongoDB
mongoose.connect(`${MONGO}/DMSCUS`)
  .then(() => {
    console.log('📦 Connected to MongoDB successfully');
  })
  .catch((error) => {
    console.error('❌ MongoDB connection error:', error);
  });

// Start server
app.listen(PORT, () => {
  console.log(`👉 App is listening on port ${PORT}`);
});


