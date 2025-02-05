// config/passport.js
const passport = require('passport');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const User = require('../models/User');  // Make sure your User model is correctly defined

const opts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),  // Extract JWT from Authorization header
  secretOrKey: process.env.JWT_SECRET  // Secret key to verify the token
};

passport.use(new JwtStrategy(opts, async (jwt_payload, done) => {
  try {
    // Look for the user by the ID stored in the 'sub' field of the JWT payload
    const user = await User.findById(jwt_payload.sub);

    // If user exists, pass the user to the next middleware
    if (user) {
      return done(null, user);
    }
    
    // If no user found, return false (authentication failed)
    return done(null, false);
  } catch (err) {
    // If there is any error, pass it to the next middleware
    console.error('Passport JWT Error:', err);
    return done(err, false);
  }
}));