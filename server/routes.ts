import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertMessageSchema, insertConnectionSchema, insertQuestionSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication routes
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

  // Get event attendees
  app.get("/api/event-attendees", async (req, res) => {
    try {
      const attendees = await storage.getEventAttendees();
      res.json(attendees);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch event attendees" });
    }
  });

  // Get group chat messages
  app.get("/api/group-chat/messages", async (req, res) => {
    try {
      const messages = await storage.getGroupChatMessages();
      res.json(messages);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch group chat messages" });
    }
  });

  // Send group chat message
  app.post("/api/group-chat/messages", async (req, res) => {
    try {
      const messageData = insertMessageSchema.omit({ conversationId: true }).parse(req.body);
      const message = await storage.createGroupChatMessage(messageData);
      res.json(message);
    } catch (error) {
      res.status(400).json({ error: "Invalid message data" });
    }
  });

  // Submit a question for a panel
  app.post("/api/questions", async (req, res) => {
    try {
      const questionData = insertQuestionSchema.parse(req.body);
      const question = await storage.createQuestion(questionData);
      res.json(question);
    } catch (error) {
      res.status(400).json({ error: "Invalid question data" });
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

  const httpServer = createServer(app);
  return httpServer;
}
