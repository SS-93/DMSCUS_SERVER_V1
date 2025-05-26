
require('dotenv').config()

const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('./models/user.model');



// Google OAuth configuration
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const CALLBACK_URL = process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3200/auth/google/callback';


passport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: CALLBACK_URL,
      scope: ['profile', 'email']
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        console.log('🔍 Google OAuth callback received for:', profile.emails[0].value);
        
        // Check if user already exists
        let user = await User.findOne({ email: profile.emails[0].value });

        if (!user) {
          console.log('👤 Creating new user from Google profile');
          // Create new user if doesn't exist
          user = await User.create({
            firstName: profile.name.givenName,
            lastName: profile.name.familyName,
            email: profile.emails[0].value,
            password: Math.random().toString(36).slice(-8), // Generate random password
            phoneNumber: '0000000000', // Default phone number
            googleId: profile.id,
            picture: profile.photos[0].value
          });
          console.log('✅ New user created successfully');
        } else {
          console.log('👤 Existing user found, updating Google info');
          // Update existing user with Google info
          user.googleId = profile.id;
          user.picture = profile.photos[0].value;
          await user.save();
        }

        return done(null, user);
      } catch (error) {
        console.error('❌ Error in Google OAuth callback:', error);
        return done(error);
      }
    }
  )
);

// Serialize user for the session
passport.serializeUser((user, done) => {
  done(null, user._id);
});

// Deserialize user from the session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error);
  }
});

module.exports = passport; 