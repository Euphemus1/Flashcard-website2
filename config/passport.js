const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/User'); // Adjust path if your User model is elsewhere

// Configure the "local" strategy (username/password login)
passport.use(
  new LocalStrategy(
    { usernameField: 'email' },
    async (email, password, done) => {
      try {
        const user = await User.findOne({ email });
        if (!user) return done(null, false, { message: 'Credenciales inválidas' });

        const isValid = await user.comparePassword(password);
        if (!isValid) return done(null, false, { message: 'Credenciales inválidas' });

        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  )
);

// Configure how users are serialized/deserialized (for sessions)
passport.serializeUser((user, done) => {
  done(null, user.id); // Store user ID in the session
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user); // Attach user object to `req.user`
  } catch (err) {
    done(err);
  }
});