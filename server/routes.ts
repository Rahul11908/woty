import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertMessageSchema, insertConnectionSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
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

  const httpServer = createServer(app);
  return httpServer;
}
