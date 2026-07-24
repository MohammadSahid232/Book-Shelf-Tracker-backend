const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const UserModel = require('../models/UserModel');
require('dotenv').config();

const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;

if (googleClientId && googleClientSecret) {
  console.log('📌 [Passport Config] Google Strategy initialized with Client ID:', googleClientId);

  passport.use(
    new GoogleStrategy(
      {
        clientID: googleClientId,
        clientSecret: googleClientSecret,
        callbackURL: '/auth/google/callback',
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          console.log(`👤 [Google OAuth Profile Received] ID: ${profile.id}, Email: ${profile.emails?.[0]?.value}`);

          let user = await UserModel.findOne({ googleId: profile.id });

          if (!user) {
            console.log('✨ [Google OAuth] New user detected, creating record in MongoDB...');
            user = await UserModel.create({
              googleId: profile.id,
              first_name: profile.name?.givenName || profile.displayName || 'GoogleUser',
              last_name: profile.name?.familyName || '',
              email: profile.emails && profile.emails[0] ? profile.emails[0].value : `${profile.id}@google.user`,
            });
          }
          return done(null, user);
        } catch (err) {
          console.error('❌ [Google OAuth Error]:', err.message);
          return done(err, null);
        }
      }
    )
  );
} else {
  console.warn('⚠️ [Passport Config] GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET missing in .env');
}

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await UserModel.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

module.exports = passport;
