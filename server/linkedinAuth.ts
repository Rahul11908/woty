import passport from "passport";
import { Strategy as LinkedInStrategy } from "passport-linkedin-oauth2";
import type { Express } from "express";
import { storage } from "./storage";
import { v4 as uuidv4 } from "uuid";

// LinkedIn OAuth configuration
const CLIENT_ID = process.env.LINKEDIN_CLIENT_ID;
const CLIENT_SECRET = process.env.LINKEDIN_CLIENT_SECRET;
const CALLBACK_URL = process.env.LINKEDIN_CALLBACK_URL || "http://localhost:5000/auth/linkedin/callback";

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.warn("LinkedIn OAuth credentials not found. LinkedIn Sign-In will be disabled.");
}

export function setupLinkedInAuth(app: Express) {
  if (!CLIENT_ID || !CLIENT_SECRET) {
    return;
  }

  passport.use(new LinkedInStrategy({
    clientID: CLIENT_ID,
    clientSecret: CLIENT_SECRET,
    callbackURL: CALLBACK_URL,
    scope: ['r_liteprofile', 'r_emailaddress']
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      const email = profile.emails?.[0]?.value;
      const firstName = profile.name?.givenName || "";
      const lastName = profile.name?.familyName || "";
      const fullName = `${firstName} ${lastName}`.trim();
      const linkedinId = profile.id;
      const linkedinHeadline = profile.headline || "";
      const linkedinProfileUrl = profile.profileUrl || "";
      const avatar = profile.photos?.[0]?.value || "";

      if (!email) {
        return done(new Error("Email is required for LinkedIn authentication"));
      }

      // Check if user already exists
      let user = await storage.getUserByEmail(email);
      
      if (user) {
        // Update existing user with LinkedIn data
        user = await storage.updateUser(user.id, {
          linkedinId,
          linkedinHeadline,
          linkedinProfileUrl,
          avatar: avatar || user.avatar,
          authProvider: "linkedin"
        });
      } else {
        // Create new user with LinkedIn data
        user = await storage.createUser({
          fullName: fullName || email.split('@')[0],
          email,
          password: null, // No password for LinkedIn users initially
          linkedinId,
          linkedinHeadline,
          linkedinProfileUrl,
          avatar,
          authProvider: "linkedin",
          company: profile.company || null,
          jobTitle: profile.title || null,
          userRole: email.includes('@glory.media') ? 'glory_team' : 'attendee',
          isOnline: true,
          hasAcceptedTerms: false
        });
      }

      return done(null, user);
    } catch (error) {
      console.error("LinkedIn authentication error:", error);
      return done(error);
    }
  }));

  // LinkedIn authentication routes
  app.get("/auth/linkedin", passport.authenticate("linkedin", {
    scope: ['r_liteprofile', 'r_emailaddress']
  }));

  app.get("/auth/linkedin/callback",
    passport.authenticate("linkedin", { failureRedirect: "/login" }),
    (req, res) => {
      // Check if user needs to create a password
      const user = req.user as any;
      if (!user.password) {
        // Store user ID in session and redirect to password creation
        req.session.pendingPasswordUserId = user.id;
        res.redirect("/create-password");
      } else {
        // User already has password, redirect to app
        res.redirect("/");
      }
    }
  );
}