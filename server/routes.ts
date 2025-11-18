import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertMessageSchema, 
  insertConnectionSchema, 
  insertQuestionSchema,
  insertGroupChatMessageSchema,
  insertSurveySchema,
  insertSurveyQuestionSchema,
  insertSurveyResponseSchema,
  insertSurveyAnswerSchema,
  insertUserSessionSchema,
  insertUserActivitySchema,
  insertDailyMetricsSchema,
  loginSchema,
  type User
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication routes
  app.get("/api/auth/current-user", async (req, res) => {
    try {
      // Check passport authentication first
      if (req.isAuthenticated() && req.user) {
        const user = req.user as User;
        return res.json(user);
      }
      
      // Check session-based authentication (LinkedIn users)
      const session = req.session as any;
      if (session.userId && session.user) {
        // Get fresh user data from storage to include hasPassword status
        const freshUser = await storage.getUser(session.userId);
        if (freshUser) {
          return res.json({
            ...freshUser,
            hasPassword: !!freshUser.password
          });
        }
        return res.json(session.user);
      }
      
      return res.status(401).json({ message: "Not authenticated" });
    } catch (error) {
      console.error("Error getting current user:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app.post("/api/users", async (req, res) => {
    try {
      const userData = req.body;
      
      // Check if email already exists
      const existingEmail = await storage.getUserByEmail(userData.email);
      if (existingEmail) {
        return res.status(400).json({ message: "Email already exists" });
      }
      
      const user = await storage.createUser(userData);
      res.json(user);
    } catch (error) {
      console.error("User creation error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Login authentication
  app.post("/api/login", async (req, res) => {
    try {
      const loginData = loginSchema.parse(req.body);
      const user = await storage.authenticateUser(loginData);
      
      if (!user) {
        return res.status(401).json({ message: "Invalid email or password" });
      }
      
      // Set up the session for the authenticated user
      const session = req.session as any;
      session.userId = user.id;
      session.user = user;
      
      res.json(user);
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Create password for LinkedIn users
  app.post("/api/create-password", async (req, res) => {
    try {
      const { password } = req.body;
      const session = req.session as any;
      
      if (!session.pendingPasswordUserId) {
        return res.status(400).json({ message: "No pending password creation session" });
      }
      
      const user = await storage.setUserPassword(session.pendingPasswordUserId, password);
      
      // Set up the session for the authenticated user
      session.userId = user.id;
      session.user = user;
      
      // Clear the pending session
      delete session.pendingPasswordUserId;
      
      res.json(user);
    } catch (error) {
      console.error("Password creation error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Login by email (keeping for backward compatibility)
  app.post("/api/users/by-email", async (req, res) => {
    try {
      const { email } = req.body;
      const user = await storage.getUserByEmail(email);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json(user);
    } catch (error) {
      console.error("Email login error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get conversations for current user
  app.get("/api/conversations", async (req, res) => {
    try {
      // In a real app, get user ID from session/auth
      const userId = parseInt(req.query.userId as string) || 1;
      const conversations = await storage.getConversationsForUser(userId);
      res.json(conversations);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch conversations" });
    }
  });

  // Get messages for a conversation
  app.get("/api/conversations/:id/messages", async (req, res) => {
    try {
      const conversationId = parseInt(req.params.id);
      const messages = await storage.getMessagesForConversation(conversationId);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch messages" });
    }
  });

  // Send a message
  app.post("/api/messages", async (req, res) => {
    try {
      const messageData = insertMessageSchema.parse(req.body);
      const message = await storage.createMessage(messageData);
      res.json(message);
    } catch (error) {
      res.status(400).json({ error: "Invalid message data" });
    }
  });

  // Get or create conversation between two users
  app.post("/api/conversations", async (req, res) => {
    try {
      const { participant1Id, participant2Id } = req.body;
      const conversation = await storage.getOrCreateConversation(participant1Id, participant2Id);
      res.json(conversation);
    } catch (error) {
      res.status(500).json({ error: "Failed to create conversation" });
    }
  });

  // Get suggested connections
  app.get("/api/suggested-connections", async (req, res) => {
    try {
      const userId = parseInt(req.query.userId as string) || 1;
      const suggestions = await storage.getSuggestedConnections(userId);
      res.json(suggestions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch suggested connections" });
    }
  });

  // Create a connection request
  app.post("/api/connections", async (req, res) => {
    try {
      const connectionData = insertConnectionSchema.parse(req.body);
      const connection = await storage.createConnection(connectionData);
      res.json(connection);
    } catch (error) {
      res.status(400).json({ error: "Invalid connection data" });
    }
  });

  // Update connection status
  app.patch("/api/connections/:id", async (req, res) => {
    try {
      const connectionId = parseInt(req.params.id);
      const { status } = req.body;
      await storage.updateConnectionStatus(connectionId, status);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to update connection" });
    }
  });

  // Get all users (for testing)
  app.get("/api/users", async (req, res) => {
    try {
      const users = await storage.getSuggestedConnections(0, 100);
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });

  // Find user by email (for login)
  app.post("/api/users/by-email", async (req, res) => {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }
      
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json(user);
    } catch (error) {
      console.error("Error finding user by email:", error);
      res.status(500).json({ message: "Failed to find user" });
    }
  });

  // Get user by ID
  app.get("/api/users/:id", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      console.error("Error fetching user by ID:", error);
      res.status(500).json({ error: "Failed to fetch user" });
    }
  });

  // Get event attendees
  app.get("/api/event-attendees", async (req, res) => {
    try {
      console.log("[EVENT-ATTENDEES] Starting fetch...");
      console.log("[EVENT-ATTENDEES] DATABASE_URL exists:", !!process.env.DATABASE_URL);
      
      const attendees = await storage.getEventAttendees();
      
      console.log(`[EVENT-ATTENDEES] Successfully fetched ${attendees.length} attendees`);
      res.json(attendees);
    } catch (error: any) {
      console.error("[EVENT-ATTENDEES] Critical error:", error);
      console.error("[EVENT-ATTENDEES] Error stack:", error?.stack);
      console.error("[EVENT-ATTENDEES] Error message:", error?.message);
      res.status(500).json({ 
        error: "Failed to fetch event attendees",
        details: process.env.NODE_ENV === 'development' ? error?.message : undefined
      });
    }
  });

  // Update user profile by ID
  app.patch("/api/users/:id", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const updates = req.body;
      
      // Validate required fields
      if (!updates.fullName?.trim()) {
        return res.status(400).json({ error: "Full name is required" });
      }
      
      const updatedUser = await storage.updateUser(userId, updates);
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating user:", error);
      if (error instanceof Error && error.message.includes('not found')) {
        return res.status(404).json({ error: "User not found" });
      }
      res.status(500).json({ error: "Failed to update user" });
    }
  });

  // Update user profile (PUT method for frontend compatibility)
  app.put("/api/users/:id", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const updates = req.body;
      
      // Validate required fields
      if (!updates.fullName?.trim()) {
        return res.status(400).json({ error: "Full name is required" });
      }
      
      const updatedUser = await storage.updateUser(userId, updates);
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating user:", error);
      if (error instanceof Error && error.message.includes('not found')) {
        return res.status(404).json({ error: "User not found" });
      }
      res.status(500).json({ error: "Failed to update user" });
    }
  });

  // Delete user by ID (admin only)
  app.delete("/api/users/:id", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      await storage.deleteUser(userId);
      res.json({ success: true, message: "User deleted successfully" });
    } catch (error) {
      console.error("Delete user error:", error);
      res.status(500).json({ error: "Failed to delete user", details: error.message });
    }
  });

  // Get group chat messages
  app.get("/api/group-chat/messages", async (req, res) => {
    try {
      const userId = req.query.userId ? parseInt(req.query.userId as string) : undefined;
      const messages = await storage.getGroupChatMessages();
      
      // Set hasUserReacted flag for each reaction if userId is provided
      if (userId) {
        messages.forEach(message => {
          if (message.reactions) {
            message.reactions.forEach(reaction => {
              reaction.hasUserReacted = reaction.users.some(user => user.id === userId);
            });
          }
        });
      }
      
      res.json(messages);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch group chat messages" });
    }
  });

  // Send group chat message
  app.post("/api/group-chat/messages", async (req, res) => {
    try {
      const messageData = insertGroupChatMessageSchema.parse(req.body);
      const message = await storage.createGroupChatMessage(messageData);
      
      // Track user activity for posting a message
      await storage.createUserActivity({
        userId: messageData.senderId,
        activityType: 'message_sent',
        activityDetails: { messageId: message.id, messageType: 'group_chat' }
      });
      
      res.json(message);
    } catch (error) {
      console.error("Group chat message error:", error);
      res.status(400).json({ error: "Invalid message data" });
    }
  });

  // Delete group chat message (admin only)
  app.delete("/api/group-chat/messages/:id", async (req, res) => {
    try {
      const messageId = parseInt(req.params.id);
      const { adminUserId } = req.body;

      // Check if the user is an admin (has @glory.media email)
      const adminUser = await storage.getUser(adminUserId);
      if (!adminUser || !adminUser.email.endsWith('@glory.media')) {
        return res.status(403).json({ error: "Only GLORY team members can delete messages" });
      }

      await storage.deleteGroupChatMessage(messageId);
      res.json({ success: true });
    } catch (error) {
      console.error("Delete group chat message error:", error);
      res.status(500).json({ error: "Failed to delete message" });
    }
  });

  // Add message reaction
  app.post("/api/messages/:messageId/reactions", async (req, res) => {
    try {
      const messageId = parseInt(req.params.messageId);
      const { userId, emoji } = req.body;

      if (!userId || !emoji) {
        return res.status(400).json({ error: "Missing userId or emoji" });
      }

      await storage.addMessageReaction(messageId, userId, emoji);
      
      // Track user activity for reaction
      await storage.createUserActivity({
        userId,
        activityType: 'message_reacted',
        activityDetails: { messageId, emoji }
      });
      
      res.json({ success: true });
    } catch (error) {
      console.error("Add reaction error:", error);
      res.status(500).json({ error: "Failed to add reaction" });
    }
  });

  // Remove message reaction
  app.delete("/api/messages/:messageId/reactions", async (req, res) => {
    try {
      const messageId = parseInt(req.params.messageId);
      const { userId, emoji } = req.body;

      if (!userId || !emoji) {
        return res.status(400).json({ error: "Missing userId or emoji" });
      }

      await storage.removeMessageReaction(messageId, userId, emoji);
      res.json({ success: true });
    } catch (error) {
      console.error("Remove reaction error:", error);
      res.status(500).json({ error: "Failed to remove reaction" });
    }
  });

  // Get message reactions
  app.get("/api/messages/:messageId/reactions", async (req, res) => {
    try {
      const messageId = parseInt(req.params.messageId);
      const userId = req.query.userId ? parseInt(req.query.userId as string) : undefined;
      
      const reactions = await storage.getMessageReactions(messageId);
      
      // Set hasUserReacted flag if userId is provided
      if (userId) {
        reactions.forEach(reaction => {
          reaction.hasUserReacted = reaction.users.some(user => user.id === userId);
        });
      }
      
      res.json(reactions);
    } catch (error) {
      console.error("Get reactions error:", error);
      res.status(500).json({ error: "Failed to get reactions" });
    }
  });

  // Submit a question for a panel
  app.post("/api/questions", async (req, res) => {
    try {
      console.log("Question submission request body:", req.body);
      
      // Validate the question data
      const questionData = insertQuestionSchema.parse(req.body);
      console.log("Parsed question data:", questionData);
      
      // Verify the user exists before creating the question
      const user = await storage.getUser(questionData.userId);
      if (!user) {
        console.log("User not found:", questionData.userId);
        return res.status(404).json({ error: "User not found" });
      }
      
      // Create the question
      const question = await storage.createQuestion(questionData);
      console.log("Question created successfully:", question);
      
      // Track user activity for submitting a question
      try {
        await storage.createUserActivity({
          userId: questionData.userId,
          activityType: 'question_submitted',
          activityDetails: { questionId: question.id, panelName: question.panelName }
        });
      } catch (activityError) {
        console.warn("Failed to track user activity:", activityError);
        // Don't fail the whole request if activity tracking fails
      }
      
      res.json(question);
    } catch (error) {
      console.error("Error submitting question:", error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: "Invalid question data format", details: error.errors });
      }
      res.status(500).json({ error: "Failed to submit question" });
    }
  });

  // Get questions for a panel
  app.get("/api/questions", async (req, res) => {
    try {
      const panelName = req.query.panelName as string;
      const questions = await storage.getQuestions(panelName);
      res.json(questions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch questions" });
    }
  });

  // Get questions by user
  app.get("/api/questions/user/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const questions = await storage.getQuestionsByUser(userId);
      res.json(questions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user questions" });
    }
  });

  // Mark question as answered
  app.patch("/api/questions/:id/answer", async (req, res) => {
    try {
      const questionId = parseInt(req.params.id);
      await storage.markQuestionAsAnswered(questionId);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to mark question as answered" });
    }
  });

  // Delete question (admin only)
  app.delete("/api/questions/:id", async (req, res) => {
    try {
      const questionId = parseInt(req.params.id);
      await storage.deleteQuestion(questionId);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete question" });
    }
  });

  // Survey Management Routes
  
  // Create a survey
  app.post("/api/surveys", async (req, res) => {
    try {
      const parsed = insertSurveySchema.parse(req.body);
      const survey = await storage.createSurvey(parsed);
      res.json(survey);
    } catch (error) {
      res.status(500).json({ error: "Failed to create survey" });
    }
  });

  // Get all surveys
  app.get("/api/surveys", async (req, res) => {
    try {
      const surveys = await storage.getSurveys();
      res.json(surveys);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch surveys" });
    }
  });

  // Get a survey with questions
  app.get("/api/surveys/:id", async (req, res) => {
    try {
      const surveyId = parseInt(req.params.id);
      const survey = await storage.getSurvey(surveyId);
      if (!survey) {
        return res.status(404).json({ error: "Survey not found" });
      }
      res.json(survey);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch survey" });
    }
  });

  // Update a survey
  app.put("/api/surveys/:id", async (req, res) => {
    try {
      const surveyId = parseInt(req.params.id);
      const survey = await storage.updateSurvey(surveyId, req.body);
      res.json(survey);
    } catch (error) {
      res.status(500).json({ error: "Failed to update survey" });
    }
  });

  // Delete a survey
  app.delete("/api/surveys/:id", async (req, res) => {
    try {
      const surveyId = parseInt(req.params.id);
      await storage.deleteSurvey(surveyId);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete survey" });
    }
  });

  // Survey Questions

  // Add question to survey
  app.post("/api/surveys/:surveyId/questions", async (req, res) => {
    try {
      const surveyId = parseInt(req.params.surveyId);
      const questionData = { ...req.body, surveyId };
      const parsed = insertSurveyQuestionSchema.parse(questionData);
      const question = await storage.createSurveyQuestion(parsed);
      res.json(question);
    } catch (error) {
      res.status(500).json({ error: "Failed to create survey question" });
    }
  });

  // Get survey questions
  app.get("/api/surveys/:surveyId/questions", async (req, res) => {
    try {
      const surveyId = parseInt(req.params.surveyId);
      const questions = await storage.getSurveyQuestions(surveyId);
      res.json(questions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch survey questions" });
    }
  });

  // Update survey question
  app.put("/api/survey-questions/:id", async (req, res) => {
    try {
      const questionId = parseInt(req.params.id);
      const question = await storage.updateSurveyQuestion(questionId, req.body);
      res.json(question);
    } catch (error) {
      res.status(500).json({ error: "Failed to update survey question" });
    }
  });

  // Delete survey question
  app.delete("/api/survey-questions/:id", async (req, res) => {
    try {
      const questionId = parseInt(req.params.id);
      await storage.deleteSurveyQuestion(questionId);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete survey question" });
    }
  });

  // Survey Responses and Analytics

  // Get survey responses with user details
  app.get("/api/surveys/:surveyId/responses", async (req, res) => {
    try {
      const surveyId = parseInt(req.params.surveyId);
      const responses = await storage.getSurveyResponses(surveyId);
      res.json(responses);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch survey responses" });
    }
  });

  // Check if user has responded to survey
  app.get("/api/surveys/:surveyId/user-response/:userId", async (req, res) => {
    try {
      const surveyId = parseInt(req.params.surveyId);
      const userId = parseInt(req.params.userId);
      const response = await storage.getSurveyResponseByUser(surveyId, userId);
      res.json({ hasResponded: !!response, response });
    } catch (error) {
      res.status(500).json({ error: "Failed to check user response" });
    }
  });

  // Download survey responses as CSV
  app.get("/api/surveys/:surveyId/responses/download", async (req, res) => {
    try {
      const surveyId = parseInt(req.params.surveyId);
      const survey = await storage.getSurvey(surveyId);
      const responses = await storage.getSurveyResponses(surveyId);
      
      if (!survey) {
        return res.status(404).json({ error: "Survey not found" });
      }
      
      // Create CSV headers
      let csvContent = "Response ID,User Name,User Email,Completion Date";
      if (survey.questions) {
        survey.questions.forEach(q => {
          csvContent += `,"${q.questionText.replace(/"/g, '""')}"`;
        });
      }
      csvContent += "\n";
      
      // Add response data
      responses.forEach(response => {
        let row = `${response.id},${response.user?.fullName || 'N/A'},${response.user?.email || 'N/A'},${response.completedAt ? new Date(response.completedAt).toISOString() : 'N/A'}`;
        
        if (survey.questions && response.answers) {
          survey.questions.forEach(q => {
            const answer = response.answers.find(a => a.questionId === q.id);
            const answerText = answer ? (answer.answerText || answer.selectedOption || '') : '';
            row += `,"${answerText.replace(/"/g, '""')}"`;
          });
        }
        
        csvContent += row + "\n";
      });
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="survey_${surveyId}_responses.csv"`);
      res.send(csvContent);
    } catch (error) {
      console.error("Error downloading survey responses:", error);
      res.status(500).json({ error: "Failed to download survey responses" });
    }
  });

  // Send survey notification emails
  app.post("/api/surveys/:surveyId/notify", async (req, res) => {
    try {
      const surveyId = parseInt(req.params.surveyId);
      const { userIds, sendToAll } = req.body;
      
      // Get the survey details
      const survey = await storage.getSurvey(surveyId);
      if (!survey) {
        return res.status(404).json({ error: "Survey not found" });
      }

      // Get users to notify
      let usersToNotify = [];
      if (sendToAll) {
        usersToNotify = await storage.getAllUsers();
      } else if (userIds && Array.isArray(userIds)) {
        usersToNotify = await Promise.all(
          userIds.map((id: number) => storage.getUserById(id))
        );
        usersToNotify = usersToNotify.filter(Boolean);
      } else {
        return res.status(400).json({ error: "Must specify userIds or sendToAll" });
      }

      // Import email function dynamically
      const { sendSurveyNotification } = await import('./email');
      
      // Send emails
      const results = await Promise.allSettled(
        usersToNotify.map(user => {
          if (!user.email) return Promise.resolve(false);
          
          return sendSurveyNotification(
            user.email,
            user.fullName || 'Attendee',
            survey.title,
            survey.description || '',
            survey.emailSubject || `Survey: ${survey.title}`,
            survey.emailBody || 'Please take a moment to complete this survey.',
            `${process.env.FRONTEND_URL || 'http://localhost:5000'}/survey/${survey.id}`
          );
        })
      );

      const successful = results.filter(result => 
        result.status === 'fulfilled' && result.value === true
      ).length;
      
      const failed = results.length - successful;

      res.json({
        success: true,
        sent: successful,
        failed: failed,
        total: usersToNotify.length
      });
    } catch (error) {
      console.error("Failed to send survey notifications:", error);
      res.status(500).json({ error: "Failed to send survey notifications" });
    }
  });

  // Get survey statistics
  app.get("/api/surveys/:surveyId/stats", async (req, res) => {
    try {
      const surveyId = parseInt(req.params.surveyId);
      const stats = await storage.getSurveyStats(surveyId);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch survey statistics" });
    }
  });

  // Submit survey response
  app.post("/api/surveys/:surveyId/responses", async (req, res) => {
    try {
      console.log("Survey response submission:", req.body);
      const surveyId = parseInt(req.params.surveyId);
      const { userId, answers } = req.body;
      
      // Check if user already has a response for this survey
      const existingResponse = await storage.getSurveyResponseByUser(surveyId, userId);
      if (existingResponse) {
        return res.status(400).json({ error: "You have already submitted a response for this survey" });
      }
      
      // Create response
      const response = await storage.createSurveyResponse({
        surveyId,
        userId,
        isCompleted: false
      });

      // Add answers
      for (const answer of answers) {
        await storage.createSurveyAnswer({
          responseId: response.id,
          questionId: answer.questionId,
          answerText: answer.answerText,
          selectedOption: answer.selectedOption
        });
      }

      // Mark as completed
      await storage.completeSurveyResponse(response.id);
      
      console.log("Survey response completed:", response);
      res.json({ success: true, responseId: response.id });
    } catch (error) {
      console.error("Error submitting survey response:", error);
      res.status(500).json({ error: "Failed to submit survey response" });
    }
  });

  // Analytics Routes

  // Get analytics summary
  app.get("/api/analytics/summary", async (req, res) => {
    try {
      const summary = await storage.getAnalyticsSummary();
      res.json(summary);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch analytics summary" });
    }
  });

  // Get daily metrics
  app.get("/api/analytics/daily", async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      const metrics = await storage.getDailyMetrics(
        startDate as string, 
        endDate as string
      );
      res.json(metrics);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch daily metrics" });
    }
  });

  // Get user activity
  app.get("/api/analytics/activity/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const limit = parseInt(req.query.limit as string) || 100;
      const activity = await storage.getUserActivity(userId, limit);
      res.json(activity);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user activity" });
    }
  });

  // Get user sessions
  app.get("/api/analytics/sessions/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const limit = parseInt(req.query.limit as string) || 50;
      const sessions = await storage.getUserSessions(userId, limit);
      res.json(sessions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user sessions" });
    }
  });

  // Create user session (for tracking)
  app.post("/api/analytics/sessions", async (req, res) => {
    try {
      const sessionData = insertUserSessionSchema.parse(req.body);
      
      // Check if user exists before creating session
      const user = await storage.getUser(sessionData.userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      const session = await storage.createUserSession(sessionData);
      res.json(session);
    } catch (error) {
      console.error("Error creating session:", error);
      res.status(500).json({ error: "Failed to create session" });
    }
  });

  // Update user session
  app.put("/api/analytics/sessions/:sessionId", async (req, res) => {
    try {
      const sessionId = parseInt(req.params.sessionId);
      const updates = req.body;
      const session = await storage.updateUserSession(sessionId, updates);
      res.json(session);
    } catch (error) {
      res.status(500).json({ error: "Failed to update session" });
    }
  });

  // End user session
  app.post("/api/analytics/sessions/:sessionId/end", async (req, res) => {
    try {
      const sessionId = parseInt(req.params.sessionId);
      const session = await storage.endUserSession(sessionId);
      res.json(session);
    } catch (error) {
      res.status(500).json({ error: "Failed to end session" });
    }
  });

  // Track user activity
  app.post("/api/analytics/activity", async (req, res) => {
    try {
      const activityData = insertUserActivitySchema.parse(req.body);
      const activity = await storage.createUserActivity(activityData);
      res.json(activity);
    } catch (error) {
      console.error("Error tracking activity:", error);
      res.status(500).json({ error: "Failed to track activity" });
    }
  });

  // Utility endpoint to update existing LinkedIn users' job titles and companies
  app.post("/api/admin/update-linkedin-profiles", async (req, res) => {
    try {
      // Get all LinkedIn users
      const users = await storage.getAllUsers();
      const linkedInUsers = users.filter(user => user.authProvider === 'linkedin' && user.linkedinHeadline);
      
      let updatedCount = 0;
      
      for (const user of linkedInUsers) {
        const { jobTitle, company } = parseLinkedInHeadline(user.linkedinHeadline);
        
        if (jobTitle || company) {
          await storage.updateUser(user.id, {
            jobTitle: user.jobTitle || jobTitle,
            company: user.company || company
          });
          updatedCount++;
        }
      }
      
      res.json({ 
        message: `Updated ${updatedCount} LinkedIn users with job title and company information`,
        totalLinkedInUsers: linkedInUsers.length,
        updatedUsers: updatedCount
      });
    } catch (error) {
      console.error("Error updating LinkedIn profiles:", error);
      res.status(500).json({ message: "Failed to update LinkedIn profiles" });
    }
  });

  // Logout endpoints (both GET and POST for mobile compatibility)
  const logoutHandler = (req: any, res: any) => {
    try {
      // Clear session data
      const session = req.session as any;
      if (session) {
        session.userId = null;
        session.user = null;
        session.pendingPasswordUserId = null;
      }
      
      // Destroy the session completely
      req.session.destroy((err: any) => {
        if (err) {
          console.error("Error destroying session:", err);
        }
      });
      
      // Logout passport session if it exists
      if (req.logout) {
        req.logout((err: any) => {
          if (err) {
            console.error("Error logging out passport session:", err);
          }
        });
      }
      
      // Clear session cookie
      res.clearCookie('connect.sid');
      
      // For API calls, return JSON; for browser redirects, redirect to login
      if (req.headers.accept && req.headers.accept.includes('application/json')) {
        res.json({ success: true, message: "Logged out successfully" });
      } else {
        res.redirect('/login');
      }
    } catch (error) {
      console.error("Logout error:", error);
      res.status(500).json({ error: "Failed to logout" });
    }
  };

  app.get("/api/logout", logoutHandler);
  app.post("/api/logout", logoutHandler);

  const httpServer = createServer(app);
  return httpServer;

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
}
