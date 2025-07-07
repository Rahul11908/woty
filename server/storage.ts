import { 
  users, 
  conversations, 
  messages, 
  connections,
  questions,
  type User, 
  type InsertUser,
  type Conversation,
  type InsertConversation,
  type Message,
  type InsertMessage,
  type Connection,
  type InsertConnection,
  type Question,
  type InsertQuestion,
  type ConversationWithParticipant,
  type MessageWithSender
} from "@shared/schema";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserOnlineStatus(id: number, isOnline: boolean): Promise<void>;
  getSuggestedConnections(userId: number, limit?: number): Promise<User[]>;

  // Conversations
  getConversationsForUser(userId: number): Promise<ConversationWithParticipant[]>;
  getOrCreateConversation(participant1Id: number, participant2Id: number): Promise<Conversation>;
  getConversation(id: number): Promise<Conversation | undefined>;

  // Messages
  getMessagesForConversation(conversationId: number, limit?: number): Promise<MessageWithSender[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  updateConversationLastMessage(conversationId: number): Promise<void>;

  // Connections
  createConnection(connection: InsertConnection): Promise<Connection>;
  getConnectionStatus(requesterId: number, addresseeId: number): Promise<Connection | undefined>;
  updateConnectionStatus(connectionId: number, status: string): Promise<void>;
  getConnections(userId: number, status?: string): Promise<Connection[]>;

  // Questions
  createQuestion(question: InsertQuestion): Promise<Question>;
  getQuestions(panelName?: string): Promise<Question[]>;
  getQuestionsByUser(userId: number): Promise<Question[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private conversations: Map<number, Conversation>;
  private messages: Map<number, Message>;
  private connections: Map<number, Connection>;
  private questions: Map<number, Question>;
  private currentUserId: number;
  private currentConversationId: number;
  private currentMessageId: number;
  private currentConnectionId: number;
  private currentQuestionId: number;

  constructor() {
    this.users = new Map();
    this.conversations = new Map();
    this.messages = new Map();
    this.connections = new Map();
    this.questions = new Map();
    this.currentUserId = 1;
    this.currentConversationId = 1;
    this.currentMessageId = 1;
    this.currentConnectionId = 1;
    this.currentQuestionId = 1;

    // Initialize with some sample users
    this.initializeSampleData();
  }

  private async initializeSampleData() {
    const sampleUsers = [
      {
        username: "michael.chen",
        password: "password123",
        fullName: "Michael Chen",
        title: "Sports Analytics Director",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150",
        isOnline: true
      },
      {
        username: "sarah.johnson",
        password: "password123",
        fullName: "Sarah Johnson",
        title: "Olympic Committee Representative",
        avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150",
        isOnline: false
      },
      {
        username: "david.rodriguez",
        password: "password123",
        fullName: "David Rodriguez",
        title: "Sports Marketing Executive",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150",
        isOnline: true
      },
      {
        username: "alex.thompson",
        password: "password123",
        fullName: "Alex Thompson",
        title: "Professional Athlete",
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150",
        isOnline: false
      }
    ];

    for (const userData of sampleUsers) {
      await this.createUser(userData);
    }
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { 
      ...insertUser, 
      id,
      title: insertUser.title || null,
      avatar: insertUser.avatar || null,
      isOnline: insertUser.isOnline || false,
      createdAt: new Date()
    };
    this.users.set(id, user);
    return user;
  }

  async updateUserOnlineStatus(id: number, isOnline: boolean): Promise<void> {
    const user = this.users.get(id);
    if (user) {
      user.isOnline = isOnline;
      this.users.set(id, user);
    }
  }

  async getSuggestedConnections(userId: number, limit = 10): Promise<User[]> {
    const allUsers = Array.from(this.users.values());
    return allUsers
      .filter(user => user.id !== userId)
      .slice(0, limit);
  }

  async getConversationsForUser(userId: number): Promise<ConversationWithParticipant[]> {
    const userConversations = Array.from(this.conversations.values())
      .filter(conv => conv.participant1Id === userId || conv.participant2Id === userId)
      .sort((a, b) => new Date(b.lastMessageAt!).getTime() - new Date(a.lastMessageAt!).getTime());

    const result: ConversationWithParticipant[] = [];
    
    for (const conv of userConversations) {
      const participantId = conv.participant1Id === userId ? conv.participant2Id : conv.participant1Id;
      const participant = await this.getUser(participantId);
      
      if (participant) {
        const conversationMessages = Array.from(this.messages.values())
          .filter(msg => msg.conversationId === conv.id)
          .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());
        
        const lastMessage = conversationMessages[0];
        const unreadCount = conversationMessages.filter(msg => msg.senderId !== userId).length;

        result.push({
          ...conv,
          participant,
          lastMessage,
          unreadCount
        });
      }
    }

    return result;
  }

  async getOrCreateConversation(participant1Id: number, participant2Id: number): Promise<Conversation> {
    const existing = Array.from(this.conversations.values()).find(conv =>
      (conv.participant1Id === participant1Id && conv.participant2Id === participant2Id) ||
      (conv.participant1Id === participant2Id && conv.participant2Id === participant1Id)
    );

    if (existing) {
      return existing;
    }

    const id = this.currentConversationId++;
    const conversation: Conversation = {
      id,
      participant1Id,
      participant2Id,
      lastMessageAt: new Date(),
      createdAt: new Date()
    };

    this.conversations.set(id, conversation);
    return conversation;
  }

  async getConversation(id: number): Promise<Conversation | undefined> {
    return this.conversations.get(id);
  }

  async getMessagesForConversation(conversationId: number, limit = 50): Promise<MessageWithSender[]> {
    const conversationMessages = Array.from(this.messages.values())
      .filter(msg => msg.conversationId === conversationId)
      .sort((a, b) => new Date(a.createdAt!).getTime() - new Date(b.createdAt!).getTime())
      .slice(-limit);

    const result: MessageWithSender[] = [];
    
    for (const message of conversationMessages) {
      const sender = await this.getUser(message.senderId);
      if (sender) {
        result.push({
          ...message,
          sender
        });
      }
    }

    return result;
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const id = this.currentMessageId++;
    const message: Message = {
      ...insertMessage,
      id,
      createdAt: new Date()
    };

    this.messages.set(id, message);
    await this.updateConversationLastMessage(insertMessage.conversationId);
    return message;
  }

  async updateConversationLastMessage(conversationId: number): Promise<void> {
    const conversation = this.conversations.get(conversationId);
    if (conversation) {
      conversation.lastMessageAt = new Date();
      this.conversations.set(conversationId, conversation);
    }
  }

  async createConnection(insertConnection: InsertConnection): Promise<Connection> {
    const id = this.currentConnectionId++;
    const connection: Connection = {
      ...insertConnection,
      id,
      status: insertConnection.status || "pending",
      createdAt: new Date()
    };

    this.connections.set(id, connection);
    return connection;
  }

  async getConnectionStatus(requesterId: number, addresseeId: number): Promise<Connection | undefined> {
    return Array.from(this.connections.values()).find(conn =>
      (conn.requesterId === requesterId && conn.addresseeId === addresseeId) ||
      (conn.requesterId === addresseeId && conn.addresseeId === requesterId)
    );
  }

  async updateConnectionStatus(connectionId: number, status: string): Promise<void> {
    const connection = this.connections.get(connectionId);
    if (connection) {
      connection.status = status;
      this.connections.set(connectionId, connection);
    }
  }

  async getConnections(userId: number, status?: string): Promise<Connection[]> {
    return Array.from(this.connections.values()).filter(conn =>
      (conn.requesterId === userId || conn.addresseeId === userId) &&
      (!status || conn.status === status)
    );
  }

  async createQuestion(insertQuestion: InsertQuestion): Promise<Question> {
    const id = this.currentQuestionId++;
    const question: Question = {
      ...insertQuestion,
      id,
      isAnswered: insertQuestion.isAnswered || false,
      createdAt: new Date()
    };

    this.questions.set(id, question);
    return question;
  }

  async getQuestions(panelName?: string): Promise<Question[]> {
    const allQuestions = Array.from(this.questions.values());
    if (panelName) {
      return allQuestions.filter(q => q.panelName === panelName);
    }
    return allQuestions;
  }

  async getQuestionsByUser(userId: number): Promise<Question[]> {
    return Array.from(this.questions.values()).filter(q => q.userId === userId);
  }
}

export const storage = new MemStorage();
