import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import type { Express, Request, Response } from "express";
import session from "express-session";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import * as db from "../db";
import { getSessionCookieOptions } from "./cookies";
import { SignJWT } from "jose";

// Session serialization
passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: number, done) => {
  try {
    // Fetch user from database
    const user = await db.getUserById(id);
    done(null, user);
  } catch (error) {
    done(error);
  }
});

export function registerGoogleOAuthRoutes(app: Express) {
  const googleClientId = process.env.GOOGLE_CLIENT_ID || "";
  const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET || "";

  // Only register Google OAuth if credentials are provided
  if (!googleClientId || !googleClientSecret) {
    console.warn(
      "[Google OAuth] Skipping registration: GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are not set. " +
      "Google login will be unavailable."
    );
    return;
  }

  // Required for Render/proxies to correctly identify HTTPS
  app.set("trust proxy", 1);

  // Register Google Strategy (lazy initialization — only when credentials exist)
  passport.use(
    new GoogleStrategy(
      {
        clientID: googleClientId,
        clientSecret: googleClientSecret,
        callbackURL: "/api/oauth/google/callback",
        proxy: true, // Tell passport to trust the proxy and use HTTPS in callbackURL
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value;
          const name = profile.displayName;
          const googleId = profile.id;

          if (!email || !googleId) {
            return done(new Error("Missing email or Google ID"));
          }

          // Upsert user
          await db.upsertUser({
            openId: `google_${googleId}`,
            email,
            name,
            loginMethod: "google",
            lastSignedIn: new Date(),
          });

          // Get user from database
          const user = await db.getUserByOpenId(`google_${googleId}`);
          done(null, user);
        } catch (error) {
          done(error);
        }
      }
    )
  );

  // Session middleware
  app.use(
    session({
      secret: process.env.SESSION_SECRET || "your-secret-key",
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: process.env.NODE_ENV === "production",
        httpOnly: true,
        sameSite: "lax",
        maxAge: ONE_YEAR_MS,
      },
    })
  );

  // Initialize Passport
  app.use(passport.initialize());
  app.use(passport.session());

  // Google OAuth login route
  app.get(
    "/api/oauth/google",
    passport.authenticate("google", {
      scope: ["profile", "email"],
    })
  );

  // Shared callback handler logic
  const handleCallback = async (req: Request, res: Response) => {
    try {
      const user = req.user as any;

      if (!user || !user.openId) {
        res.status(400).json({ error: "User not found" });
        return;
      }

      // Create JWT session token
      const secret = new TextEncoder().encode(process.env.JWT_SECRET || "secret");
      const sessionToken = await new SignJWT({
        openId: user.openId,
        email: user.email,
        name: user.name,
      })
        .setProtectedHeader({ alg: "HS256" })
        .setExpirationTime("1y")
        .sign(secret);

      // Set session cookie
      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });

      // Redirect to home
      res.redirect("/");
    } catch (error) {
      console.error("[Google OAuth] Callback failed", error);
      res.status(500).json({ error: "OAuth callback failed" });
    }
  };

  // Google OAuth callback route (Standard)
  app.get(
    "/api/oauth/google/callback",
    passport.authenticate("google", { failureRedirect: "/" }),
    handleCallback
  );

  // Google OAuth callback route (Alternative format used in some configurations)
  app.get(
    "/api/google-oauth/callback",
    passport.authenticate("google", { failureRedirect: "/" }),
    handleCallback
  );

  // Logout route
  app.get("/api/oauth/logout", (req: Request, res: Response) => {
    req.logout((err) => {
      if (err) {
        res.status(500).json({ error: "Logout failed" });
        return;
      }
      res.clearCookie(COOKIE_NAME);
      res.json({ success: true });
    });
  });
}
