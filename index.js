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


app.use(session({ 
  secret: process.env.SESSION_SECRET || 'your-secret-key', 
  resave: false, 
  saveUninitialized: true 
}));

app.use(passport.initialize());
app.use(passport.session());

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3200/auth/google/callback',
  scope: ['profile', 'email']
}, (accessToken, refreshToken, profile, done) => {
  console.log('🔍 Google OAuth callback received for:', profile.emails[0].value);
  done(null, profile);
}));


passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});


// app.use(cors({
//   origin: process.env.FRONTEND_URL || 'http://localhost:3000/test',
//   credentials: true
// }));

// app.use(express.json());

// Auth routes

app.get('/', (req, res) => {
  res.send('<a href="/auth/google">Login with Google</a>');
});

app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get('/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: '/' }), 
  (req, res) => {
    console.log('✅ Google callback successful, redirecting to frontend');
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/test`);
  }
);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy' });
});

// Routes
app.use('/users', userRoutes);
app.use('/auth', authRoutes);


