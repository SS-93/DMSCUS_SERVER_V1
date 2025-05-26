// require('dotenv').config();
// const passport = require('passport');
// const GoogleStrategy = require('passport-google-oauth20').Strategy;
// const User = require('./models/user.model');

// // Google OAuth configuration
// const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || process.env.REACT_APP_GOOGLE_CLIENT_ID;
// const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || process.env.REACT_APP_GOOGLE_CLIENT_SECRET;
// const CALLBACK_URL = process.env.CALLBACK_URL || process.env.REACT_APP_CALLBACK_URL || 'http://localhost:3200/auth/google/callback';



// // Debug logs
// console.log('🔑 Environment Variables:');
// console.log('GOOGLE_CLIENT_ID:', GOOGLE_CLIENT_ID ? '✅ Set' : '❌ Missing');
// console.log('GOOGLE_CLIENT_SECRET:', GOOGLE_CLIENT_SECRET ? '✅ Set' : '❌ Missing');
// console.log('CALLBACK_URL:', CALLBACK_URL);

// // Check if Google OAuth credentials are configured
// if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
//   console.error('❌ Google OAuth credentials are missing! Please check your .env file.');
//   console.error('Required environment variables:');
//   console.error('- GOOGLE_CLIENT_ID');
//   console.error('- GOOGLE_CLIENT_SECRET');
//   process.exit(1);
// }

// passport.use(
//   new GoogleStrategy(
//     {
//       clientID: GOOGLE_CLIENT_ID,
//       clientSecret: GOOGLE_CLIENT_SECRET,
//       callbackURL: CALLBACK_URL,
//       scope: ['profile', 'email']
//     },
//     async (accessToken, refreshToken, profile, done) => {
//       try {
//         console.log('🔍 Google profile received:', profile.displayName);
        
//         // Check if user already exists
//         let user = await User.findOne({ email: profile.emails[0].value });

//         if (!user) {
//           // Create new user if doesn't exist
//           console.log('👤 Creating new user:', profile.emails[0].value);
//           user = await User.create({
//             firstName: profile.name.givenName,
//             lastName: profile.name.familyName,
//             email: profile.emails[0].value,
//             password: Math.random().toString(36).slice(-8), // Generate random password
//             phoneNumber: '0000000000', // Default phone number
//             googleId: profile.id,
//             picture: profile.photos[0].value
//           });
//         } else {
//           console.log('👤 User already exists:', user.email);
//         }

//         return done(null, user);
//       } catch (error) {
//         console.error('❌ Error in Google strategy:', error);
//         return done(error);
//       }
//     }
//   )
// );

// // Serialize user for the session
// passport.serializeUser((user, done) => {
//   done(null, user.id);
// });

// // Deserialize user from the session
// passport.deserializeUser(async (id, done) => {
//   try {
//     const user = await User.findById(id);
//     done(null, user);
//   } catch (error) {
//     done(error);
//   }
// });

// console.log('✅ Passport Google strategy configured');

// module.exports = passport; 