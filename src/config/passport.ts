import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as JWTStrategy, ExtractJwt } from 'passport-jwt';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import bcrypt from 'bcrypt';
import prisma from '../db';
import { addHours } from 'date-fns';
import { JwtPayload, PassportDone, GoogleProfile } from '../types/auth/auth';

// Configuration Local Strategy
passport.use(
  new LocalStrategy(
    {
      usernameField: 'email',
      passwordField: 'password',
    },
    async (email: string, password: string, done: PassportDone) => {
      try {
        const user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
          return done(null, false, { message: 'Incorrect email.' });
        }

        const isMatch = await bcrypt.compare(password, user.password || '');
        if (!isMatch) {
          return done(null, false, { message: 'Incorrect password.' });
        }

        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  )
);

// Configuration JWT Strategy
passport.use(
  new JWTStrategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET || 'your-secret-key',
    },
    async (jwtPayload: JwtPayload, done: PassportDone) => {
      try {
        const user = await prisma.user.findUnique({
          where: { id: jwtPayload.id },
        });

        if (user) {
          return done(null, user);
        }

        return done(null, false);
      } catch (error) {
        return done(error, false);
      }
    }
  )
);

// Configuration Google Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      callbackURL: 'http://localhost:3000/auth/google/callback',
    },
    async (
      accessToken: string,
      refreshToken: string,
      profile: GoogleProfile,
      done: PassportDone
    ) => {
      try {
        const email = profile.emails?.[0]?.value;
        if (!email) {
          return done(new Error('No email found in Google profile'), false);
        }

        let user = await prisma.user.findFirst({
          where: {
            OR: [{ email }, { googleId: profile.id }],
          },
        });

        const tokenData = {
          accessToken,
          refreshToken: refreshToken || undefined,
          tokenExpiry: addHours(new Date(), 1),
        };

        if (!user) {
          user = await prisma.user.create({
            data: {
              email,
              name: profile.displayName,
              googleId: profile.id,
              password: null,
              ...tokenData,
            },
          });
        } else {
          user = await prisma.user.update({
            where: { id: user.id },
            data: {
              googleId: profile.id,
              ...tokenData,
            },
          });
        }

        try {
          const userInfo = await fetch(
            'https://www.googleapis.com/oauth2/v1/userinfo',
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
            }
          ).then((res) => res.json());

          if (userInfo) {
            await prisma.user.update({
              where: { id: user.id },
              data: {
                name: userInfo.name || user.name,
              },
            });
          }
        } catch (error) {
          console.error('Error fetching additional user info:', error);
        }

        return done(null, user);
      } catch (error) {
        return done(error, false);
      }
    }
  )
);

/**
 * Using 'any' type here is acceptable because:
 * 1. This is Passport's internal serialization
 * 2. We know our user object will always have an 'id' property
 * 3. The serialization logic is simple and contained
 */
passport.serializeUser(function (user: any, done) {
  done(null, user.id);
});

passport.deserializeUser(function (id: number, done) {
  prisma.user
    .findUnique({
      where: { id },
    })
    .then((user) => {
      done(null, user);
    })
    .catch((err) => {
      done(err, null);
    });
});

export default passport;
