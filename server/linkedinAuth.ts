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

// Function to parse job title and company from LinkedIn headline
function parseLinkedInHeadline(headline: string): { jobTitle: string | null, company: string | null } {
  if (!headline || headline.trim() === "") {
    return { jobTitle: null, company: null };
  }

  // Common patterns in LinkedIn headlines:
  // "Software Engineer at Google"
  // "Marketing Manager | Microsoft"
  // "CEO @ Startup Inc."
  // "Product Manager - Apple"
  // "Senior Developer, Netflix"
  // "Founder & CEO at Company Name"
  // "Account Manager, Glory Media"
  
  const separators = [' at ', ' @ ', ' | ', ' - ', ', ', ' — ', ' – '];
  
  for (const separator of separators) {
    if (headline.includes(separator)) {
      const parts = headline.split(separator);
      if (parts.length >= 2) {
        const jobTitle = parts[0].trim();
        const company = parts[1].trim();
        
        // Clean up common title prefixes/suffixes
        const cleanJobTitle = jobTitle
          .replace(/^(Sr\.|Senior|Jr\.|Junior|Lead|Principal|Staff)\s+/i, '')
          .replace(/\s+(I|II|III|IV|V)$/i, '')
          .trim();
        
        // Clean up company names
        const cleanCompany = company
          .replace(/\s+(Inc\.?|LLC\.?|Ltd\.?|Corp\.?|Co\.?|Company)$/i, '')
          .replace(/^(at|@)\s+/i, '')
          .trim();
        
        return { 
          jobTitle: cleanJobTitle || null, 
          company: cleanCompany || null 
        };
      }
    }
  }
  
  // If no separator found, treat entire headline as job title
  return { jobTitle: headline.trim(), company: null };
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
    scope: ['openid', 'profile', 'email', 'w_member_social']
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
      console.log("LinkedIn profile data received:", JSON.stringify(linkedinProfile, null, 2));
      
      // Try to get the public profile URL from LinkedIn People API
      let publicProfileUrl = null;
      try {
        const peopleResponse = await fetch('https://api.linkedin.com/v2/people/(id=' + linkedinProfile.sub + ')', {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (peopleResponse.ok) {
          const peopleData = await peopleResponse.json();
          console.log("LinkedIn people data:", JSON.stringify(peopleData, null, 2));
          publicProfileUrl = peopleData.publicProfileUrl;
        }
      } catch (error) {
        console.log("Could not fetch LinkedIn public profile URL:", error);
      }
      
      const email = linkedinProfile.email;
      const firstName = linkedinProfile.given_name || "";
      const lastName = linkedinProfile.family_name || "";
      const fullName = linkedinProfile.name || `${firstName} ${lastName}`.trim();
      const linkedinId = linkedinProfile.sub;
      const linkedinHeadline = linkedinProfile.headline || "";
      // Only store valid LinkedIn profile URLs, not the sub ID
      const linkedinProfileUrl = (publicProfileUrl && publicProfileUrl.includes('linkedin.com/in/')) ? publicProfileUrl : null;
      const avatar = linkedinProfile.picture || "";

      // Parse job title and company from LinkedIn headline
      const { jobTitle, company } = parseLinkedInHeadline(linkedinHeadline);
      console.log("Parsed LinkedIn headline:", { 
        original: linkedinHeadline, 
        parsed: { jobTitle, company } 
      });

      if (!email) {
        return done(new Error("Email is required for LinkedIn authentication"));
      }

      // Check if user already exists
      let user = await storage.getUserByEmail(email);
      
      if (user) {
        // Update existing user with LinkedIn data
        console.log("Updating existing user:", user.id);
        user = await storage.updateUser(user.id, {
          linkedinId,
          linkedinHeadline,
          linkedinProfileUrl,
          avatar: avatar || user.avatar,
          authProvider: "linkedin",
          // Update job title and company from LinkedIn headline if not already set
          jobTitle: user.jobTitle || jobTitle,
          company: user.company || company
        });
        console.log("User updated successfully");
      } else {
        // Create new user with LinkedIn data
        console.log("Creating new user for:", email);
        user = await storage.createUser({
          fullName: fullName || email.split('@')[0],
          email,
          password: null, // No password for LinkedIn users initially
          linkedinId,
          linkedinHeadline,
          linkedinProfileUrl,
          avatar,
          authProvider: "linkedin",
          company: company,
          jobTitle: jobTitle,
          userRole: email.includes('@glory.media') ? 'glory_team' : 'attendee',
          isOnline: true,
          hasAcceptedTerms: false
        });
        console.log("New user created with ID:", user.id);
      }

      console.log("Returning user from LinkedIn auth:", { id: user.id, email: user.email, hasPassword: !!user.password });
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
      
      // Store user in session for authentication
      (req.session as any).userId = user.id;
      (req.session as any).user = user;
      
      // Check if user needs to create a password
      if (!user.password) {
        // Store user ID in session and redirect to password creation
        (req.session as any).pendingPasswordUserId = user.id;
        console.log("Redirecting to create-password");
        return res.redirect("/create-password");
      } else {
        // User already has password, redirect to app
        console.log("Redirecting to main app");
        return res.redirect("/");
      }
    }
  );
}