import { 
  users, 
  conversations, 
  messages, 
  connections,
  questions,
  surveys,
  surveyQuestions,
  surveyResponses,
  surveyAnswers,
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
  type Survey,
  type InsertSurvey,
  type SurveyQuestion,
  type InsertSurveyQuestion,
  type SurveyResponse,
  type InsertSurveyResponse,
  type SurveyAnswer,
  type InsertSurveyAnswer,
  type ConversationWithParticipant,
  type MessageWithSender,
  type SurveyWithQuestions,
  type SurveyResponseWithAnswers
} from "@shared/schema";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserOnlineStatus(id: number, isOnline: boolean): Promise<void>;
  getSuggestedConnections(userId: number, limit?: number): Promise<User[]>;
  getEventAttendees(limit?: number): Promise<User[]>;

  // Conversations
  getConversationsForUser(userId: number): Promise<ConversationWithParticipant[]>;
  getOrCreateConversation(participant1Id: number, participant2Id: number): Promise<Conversation>;
  getConversation(id: number): Promise<Conversation | undefined>;

  // Messages
  getMessagesForConversation(conversationId: number, limit?: number): Promise<MessageWithSender[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  updateConversationLastMessage(conversationId: number): Promise<void>;

  // Group Chat
  getGroupChatMessages(limit?: number): Promise<MessageWithSender[]>;
  createGroupChatMessage(message: Omit<InsertMessage, 'conversationId'>): Promise<Message>;

  // Connections
  createConnection(connection: InsertConnection): Promise<Connection>;
  getConnectionStatus(requesterId: number, addresseeId: number): Promise<Connection | undefined>;
  updateConnectionStatus(connectionId: number, status: string): Promise<void>;
  getConnections(userId: number, status?: string): Promise<Connection[]>;

  // Questions
  createQuestion(question: InsertQuestion): Promise<Question>;
  getQuestions(panelName?: string): Promise<Question[]>;
  getQuestionsByUser(userId: number): Promise<Question[]>;

  // Surveys
  createSurvey(survey: InsertSurvey): Promise<Survey>;
  getSurveys(): Promise<Survey[]>;
  getSurvey(id: number): Promise<SurveyWithQuestions | undefined>;
  updateSurvey(id: number, updates: Partial<Survey>): Promise<Survey>;
  deleteSurvey(id: number): Promise<void>;

  // Survey Questions
  createSurveyQuestion(question: InsertSurveyQuestion): Promise<SurveyQuestion>;
  getSurveyQuestions(surveyId: number): Promise<SurveyQuestion[]>;
  updateSurveyQuestion(id: number, updates: Partial<SurveyQuestion>): Promise<SurveyQuestion>;
  deleteSurveyQuestion(id: number): Promise<void>;

  // Survey Responses
  createSurveyResponse(response: InsertSurveyResponse): Promise<SurveyResponse>;
  getSurveyResponses(surveyId: number): Promise<SurveyResponseWithAnswers[]>;
  completeSurveyResponse(responseId: number): Promise<void>;

  // Survey Answers
  createSurveyAnswer(answer: InsertSurveyAnswer): Promise<SurveyAnswer>;
  getSurveyStats(surveyId: number): Promise<{
    totalResponses: number;
    completionRate: number;
    questionStats: Array<{
      questionId: number;
      questionText: string;
      responseCount: number;
      responses: Array<{ answer: string; count: number }>;
    }>;
  }>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private conversations: Map<number, Conversation>;
  private messages: Map<number, Message>;
  private connections: Map<number, Connection>;
  private questions: Map<number, Question>;
  private groupChatMessages: Map<number, Message>;
  private surveys: Map<number, Survey>;
  private surveyQuestions: Map<number, SurveyQuestion>;
  private surveyResponses: Map<number, SurveyResponse>;
  private surveyAnswers: Map<number, SurveyAnswer>;
  private currentUserId: number;
  private currentConversationId: number;
  private currentMessageId: number;
  private currentConnectionId: number;
  private currentQuestionId: number;
  private currentSurveyId: number;
  private currentSurveyQuestionId: number;
  private currentSurveyResponseId: number;
  private currentSurveyAnswerId: number;
  private groupChatId: number;

  constructor() {
    this.users = new Map();
    this.conversations = new Map();
    this.messages = new Map();
    this.connections = new Map();
    this.questions = new Map();
    this.surveys = new Map();
    this.surveyQuestions = new Map();
    this.surveyResponses = new Map();
    this.surveyAnswers = new Map();
    this.groupChatMessages = new Map();
    this.currentUserId = 1;
    this.currentConversationId = 1;
    this.currentMessageId = 1;
    this.currentConnectionId = 1;
    this.currentQuestionId = 1;
    this.currentSurveyId = 1;
    this.currentSurveyQuestionId = 1;
    this.currentSurveyResponseId = 1;
    this.currentSurveyAnswerId = 1;
    this.groupChatId = 9999; // Special ID for group chat

    // Initialize with some sample users
    this.initializeSampleData();
    this.initializeGroupChat();
  }

  private async initializeSampleData() {
    const sampleUsers = [
      {
        fullName: "Michael Chen",
        email: "michael.chen@example.com",
        company: "SportsTech Corp",
        jobTitle: "Sports Analytics Director",
        avatar: "",
        isOnline: true,
        hasAcceptedTerms: true
      },
      {
        fullName: "Dwayne De Rosario",
        email: "dwayne.derosario@example.com",
        company: "Independent",
        jobTitle: "Former Player",
        avatar: "",
        isOnline: true,
        hasAcceptedTerms: true
      },
      {
        fullName: "Diana Matheson",
        email: "diana.matheson@project8.com",
        company: "Project 8",
        jobTitle: "Former Player, Co-founder",
        avatar: "",
        isOnline: true,
        hasAcceptedTerms: true
      },
      {
        fullName: "Jesse Marsch",
        email: "jesse.marsch@ussoccer.com",
        company: "US Soccer",
        jobTitle: "Head Coach, Men's National Team",
        avatar: "",
        isOnline: false,
        hasAcceptedTerms: true
      },
      {
        fullName: "Teresa Resch",
        email: "teresa.resch@torontotempo.com",
        company: "Toronto Tempo",
        jobTitle: "President",
        avatar: "",
        isOnline: true,
        hasAcceptedTerms: true
      },
      {
        fullName: "Anastasia Bucsis",
        email: "anastasia.bucsis@cbc.ca",
        company: "CBC Sports",
        jobTitle: "Former Olympian, CBC Sports journalist",
        avatar: "",
        isOnline: false,
        hasAcceptedTerms: true
      },
      {
        fullName: "Kyle McMann",
        email: "kyle.mcmann@nhl.com",
        company: "NHL",
        jobTitle: "SVP, Global Business Development",
        avatar: "",
        isOnline: true,
        hasAcceptedTerms: true
      },
      {
        fullName: "Lance Chung",
        email: "lance.chung@glory.media",
        company: "GLORY Media",
        jobTitle: "Editor-in-Chief",
        avatar: "",
        isOnline: true,
        hasAcceptedTerms: true
      },
      {
        fullName: "Sarah Johnson",
        email: "sarah.johnson@example.com",
        company: "Independent",
        jobTitle: "Summit Attendee",
        avatar: "",
        isOnline: false,
        hasAcceptedTerms: true
      }
    ];

    for (const userData of sampleUsers) {
      await this.createUser(userData);
    }
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { 
      ...insertUser, 
      id,
      company: insertUser.company || null,
      jobTitle: insertUser.jobTitle || null,
      avatar: insertUser.avatar || null,
      isOnline: insertUser.isOnline || false,
      hasAcceptedTerms: insertUser.hasAcceptedTerms || false,
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

  private async initializeGroupChat() {
    // Add welcome messages to group chat
    const welcomeMessages = [
      {
        content: "Welcome to the GLORY Sports Summit 2025! Looking forward to connecting with everyone today. 🏆",
        senderId: 2 // Dwayne De Rosario
      },
      {
        content: "Excited to be here! Can't wait for the panel discussions, especially the one on Canadian soccer identity.",
        senderId: 3 // Diana Matheson
      },
      {
        content: "Great to see so many industry leaders gathered in one place. This should be an amazing day of insights!",
        senderId: 5 // Teresa Resch
      },
      {
        content: "The networking opportunities here are incredible. Let's make some great connections! 🤝",
        senderId: 7 // Kyle McMann
      }
    ];

    for (const messageData of welcomeMessages) {
      await this.createGroupChatMessage(messageData);
    }
  }

  async getEventAttendees(limit = 50): Promise<User[]> {
    return Array.from(this.users.values()).slice(0, limit);
  }

  async getGroupChatMessages(limit = 100): Promise<MessageWithSender[]> {
    const allMessages = Array.from(this.groupChatMessages.values())
      .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0))
      .slice(0, limit);

    const messagesWithSender = await Promise.all(
      allMessages.map(async (message) => {
        const sender = await this.getUser(message.senderId);
        return {
          ...message,
          sender: sender!
        };
      })
    );

    return messagesWithSender.reverse(); // Return in chronological order
  }

  async createGroupChatMessage(messageData: Omit<InsertMessage, 'conversationId'>): Promise<Message> {
    const id = this.currentMessageId++;
    const message: Message = {
      ...messageData,
      id,
      conversationId: this.groupChatId,
      createdAt: new Date()
    };

    this.groupChatMessages.set(id, message);
    return message;
  }

  // Survey Methods
  async createSurvey(insertSurvey: InsertSurvey): Promise<Survey> {
    const id = this.currentSurveyId++;
    const survey: Survey = {
      ...insertSurvey,
      id,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.surveys.set(id, survey);
    return survey;
  }

  async getSurveys(): Promise<Survey[]> {
    return Array.from(this.surveys.values());
  }

  async getSurvey(id: number): Promise<SurveyWithQuestions | undefined> {
    const survey = this.surveys.get(id);
    if (!survey) return undefined;

    const questions = Array.from(this.surveyQuestions.values())
      .filter(q => q.surveyId === id)
      .sort((a, b) => a.order - b.order);

    return { ...survey, questions };
  }

  async updateSurvey(id: number, updates: Partial<Survey>): Promise<Survey> {
    const survey = this.surveys.get(id);
    if (!survey) throw new Error('Survey not found');

    const updatedSurvey = { ...survey, ...updates, updatedAt: new Date() };
    this.surveys.set(id, updatedSurvey);
    return updatedSurvey;
  }

  async deleteSurvey(id: number): Promise<void> {
    this.surveys.delete(id);
    // Also delete associated questions and responses
    Array.from(this.surveyQuestions.entries())
      .filter(([_, q]) => q.surveyId === id)
      .forEach(([qId, _]) => this.surveyQuestions.delete(qId));
  }

  async createSurveyQuestion(insertQuestion: InsertSurveyQuestion): Promise<SurveyQuestion> {
    const id = this.currentSurveyQuestionId++;
    const question: SurveyQuestion = {
      ...insertQuestion,
      id,
      createdAt: new Date()
    };
    this.surveyQuestions.set(id, question);
    return question;
  }

  async getSurveyQuestions(surveyId: number): Promise<SurveyQuestion[]> {
    return Array.from(this.surveyQuestions.values())
      .filter(q => q.surveyId === surveyId)
      .sort((a, b) => a.order - b.order);
  }

  async updateSurveyQuestion(id: number, updates: Partial<SurveyQuestion>): Promise<SurveyQuestion> {
    const question = this.surveyQuestions.get(id);
    if (!question) throw new Error('Survey question not found');

    const updatedQuestion = { ...question, ...updates };
    this.surveyQuestions.set(id, updatedQuestion);
    return updatedQuestion;
  }

  async deleteSurveyQuestion(id: number): Promise<void> {
    this.surveyQuestions.delete(id);
  }

  async createSurveyResponse(insertResponse: InsertSurveyResponse): Promise<SurveyResponse> {
    const id = this.currentSurveyResponseId++;
    const response: SurveyResponse = {
      ...insertResponse,
      id,
      createdAt: new Date()
    };
    this.surveyResponses.set(id, response);
    return response;
  }

  async getSurveyResponses(surveyId: number): Promise<SurveyResponseWithAnswers[]> {
    const responses = Array.from(this.surveyResponses.values())
      .filter(r => r.surveyId === surveyId);

    return responses.map(response => {
      const answers = Array.from(this.surveyAnswers.values())
        .filter(a => a.responseId === response.id);
      const user = this.users.get(response.userId)!;
      return { ...response, answers, user };
    });
  }

  async completeSurveyResponse(responseId: number): Promise<void> {
    const response = this.surveyResponses.get(responseId);
    if (response) {
      response.isCompleted = true;
      response.completedAt = new Date();
      this.surveyResponses.set(responseId, response);
    }
  }

  async createSurveyAnswer(insertAnswer: InsertSurveyAnswer): Promise<SurveyAnswer> {
    const id = this.currentSurveyAnswerId++;
    const answer: SurveyAnswer = {
      ...insertAnswer,
      id,
      createdAt: new Date()
    };
    this.surveyAnswers.set(id, answer);
    return answer;
  }

  async getSurveyStats(surveyId: number): Promise<{
    totalResponses: number;
    completionRate: number;
    questionStats: Array<{
      questionId: number;
      questionText: string;
      responseCount: number;
      responses: Array<{ answer: string; count: number }>;
    }>;
  }> {
    const responses = Array.from(this.surveyResponses.values())
      .filter(r => r.surveyId === surveyId);
    const completedResponses = responses.filter(r => r.isCompleted);
    
    const questions = await this.getSurveyQuestions(surveyId);
    const questionStats = questions.map(question => {
      const answers = Array.from(this.surveyAnswers.values())
        .filter(a => {
          const response = this.surveyResponses.get(a.responseId);
          return response && response.surveyId === surveyId;
        })
        .filter(a => a.questionId === question.id);

      const responseGroups = new Map<string, number>();
      answers.forEach(answer => {
        const key = answer.answerText || answer.selectedOption || '';
        responseGroups.set(key, (responseGroups.get(key) || 0) + 1);
      });

      const responses = Array.from(responseGroups.entries())
        .map(([answer, count]) => ({ answer, count }))
        .sort((a, b) => b.count - a.count);

      return {
        questionId: question.id,
        questionText: question.questionText,
        responseCount: answers.length,
        responses
      };
    });

    return {
      totalResponses: responses.length,
      completionRate: responses.length > 0 ? (completedResponses.length / responses.length) * 100 : 0,
      questionStats
    };
  }
}

export const storage = new MemStorage();
