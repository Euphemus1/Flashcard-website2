import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import { Strategy as LocalStrategy } from 'passport-local';
import User from '../models/User.js';
import bcrypt from 'bcrypt';

export default function configurePassport(passport) {
  // Verify JWT_SECRET exists when configuring passport
  if (!process.env.JWT_SECRET) {
    throw new Error('❌ JWT_SECRET is missing in environment variables');
  }

  // Local Strategy
  passport.use(
    new LocalStrategy(
      { usernameField: 'email' },
      async (email, password, done) => {
        try {
          const user = await User.findOne({ email });
          if (!user) return done(null, false, { message: 'Invalid credentials' });
          
          const isMatch = await bcrypt.compare(password, user.password);
          return isMatch ? done(null, user) : done(null, false, { message: 'Invalid credentials' });
        } catch (err) {
          return done(err);
        }
      }
    )
  );

  // JWT Strategy
  const jwtOptions = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET
  };

  passport.use(
    new JwtStrategy(jwtOptions, async (payload, done) => {
      try {
        const user = await User.findById(payload.sub);
        return user ? done(null, user) : done(null, false);
      } catch (err) {
        return done(err, false);
      }
    })
  );
};