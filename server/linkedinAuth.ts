import passport from "passport";
import { Strategy as OAuth2Strategy } from "passport-oauth2";
import type { Express } from "express";
import { storage } from "./storage";
import { v4 as uuidv4 } from "uuid";

// LinkedIn OAuth configuration
const CLIENT_ID = process.env.LINKEDIN_CLIENT_ID;
const CLIENT_SECRET = process.env.LINKEDIN_CLIENT_SECRET;
const CALLBACK_URL = process.env.LINKEDIN_CALLBACK_URL || `https://${process.env.REPLIT_DOMAINS}/auth/linkedin/callback`;

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.warn("LinkedIn OAuth credentials not found. LinkedIn Sign-In will be disabled.");
}

export function setupLinkedInAuth(app: Express) {
  if (!CLIENT_ID || !CLIENT_SECRET) {
    return;
  }
  
  console.log("Setting up LinkedIn auth with callback URL:", CALLBACK_URL);

  // Passport session setup
  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  passport.use('linkedin', new OAuth2Strategy({
    authorizationURL: 'https://www.linkedin.com/oauth/v2/authorization',
    tokenURL: 'https://www.linkedin.com/oauth/v2/accessToken',
    clientID: CLIENT_ID,
    clientSecret: CLIENT_SECRET,
    callbackURL: CALLBACK_URL,
    scope: ['openid', 'profile', 'email']
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      // Fetch user profile from LinkedIn API
      const profileResponse = await fetch('https://api.linkedin.com/v2/userinfo', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!profileResponse.ok) {
        throw new Error(`LinkedIn API error: ${profileResponse.status} ${profileResponse.statusText}`);
      }

      const linkedinProfile = await profileResponse.json();
      console.log("LinkedIn profile data:", JSON.stringify(linkedinProfile, null, 2));
      
      const email = linkedinProfile.email;
      const firstName = linkedinProfile.given_name || "";
      const lastName = linkedinProfile.family_name || "";
      const fullName = linkedinProfile.name || `${firstName} ${lastName}`.trim();
      const linkedinId = linkedinProfile.sub;
      const linkedinHeadline = linkedinProfile.headline || "";
      const linkedinProfileUrl = linkedinProfile.profile || "";
      const avatar = linkedinProfile.picture || "";

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
          company: null,
          jobTitle: null,
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
    scope: ['openid', 'profile', 'email']
  }));

  app.get("/auth/linkedin/callback",
    passport.authenticate("linkedin", { failureRedirect: "/login" }),
    (req, res) => {
      const user = req.user as any;
      if (!user) {
        console.error("No user found in LinkedIn callback");
        return res.redirect("/login?error=auth_failed");
      }
      
      console.log("LinkedIn authentication successful for user:", user.fullName, user.email);
      
      // Check if user needs to create a password
      if (!user.password) {
        // Store user ID in session and redirect to password creation
        (req.session as any).pendingPasswordUserId = user.id;
        return res.redirect("/create-password");
      } else {
        // User already has password, redirect to app
        return res.redirect("/network");
      }
    }
  );
}