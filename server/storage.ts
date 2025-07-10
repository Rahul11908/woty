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
  userSessions,
  userActivity,
  dailyMetrics,
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
  type SurveyResponseWithAnswers,
  type UserSession,
  type InsertUserSession,
  type UserActivity,
  type InsertUserActivity,
  type DailyMetrics,
  type InsertDailyMetrics,
} from "@shared/schema";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<User>): Promise<User>;
  updateUserOnlineStatus(id: number, isOnline: boolean): Promise<void>;
  getSuggestedConnections(userId: number, limit?: number): Promise<User[]>;
  getEventAttendees(limit?: number): Promise<User[]>;
  deleteUser(id: number): Promise<void>;

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
  markQuestionAsAnswered(questionId: number): Promise<void>;
  deleteQuestion(questionId: number): Promise<void>;

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

  // Analytics
  createUserSession(session: InsertUserSession): Promise<UserSession>;
  updateUserSession(sessionId: number, updates: Partial<UserSession>): Promise<UserSession>;
  endUserSession(sessionId: number): Promise<UserSession>;
  getUserSessions(userId: number, limit?: number): Promise<UserSession[]>;
  createUserActivity(activity: InsertUserActivity): Promise<UserActivity>;
  getUserActivity(userId: number, limit?: number): Promise<UserActivity[]>;
  updateDailyMetrics(date: string): Promise<DailyMetrics>;
  getDailyMetrics(startDate?: string, endDate?: string): Promise<DailyMetrics[]>;
  getAnalyticsSummary(): Promise<{
    totalUsers: number;
    activeUsersToday: number;
    avgSessionDuration: number;
    totalMessages: number;
    totalConnections: number;
    popularPages: Array<{ page: string; views: number }>;
    userEngagement: Array<{ date: string; activeUsers: number; messages: number }>;
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
  private userSessions: Map<number, UserSession>;
  private userActivities: Map<number, UserActivity>;
  private dailyMetrics: Map<string, DailyMetrics>;
  private currentUserId: number;
  private currentConversationId: number;
  private currentMessageId: number;
  private currentConnectionId: number;
  private currentQuestionId: number;
  private currentSurveyId: number;
  private currentSurveyQuestionId: number;
  private currentSurveyResponseId: number;
  private currentSurveyAnswerId: number;
  private currentUserSessionId: number;
  private currentUserActivityId: number;
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
    this.userSessions = new Map();
    this.userActivities = new Map();
    this.dailyMetrics = new Map();
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
    this.currentUserSessionId = 1;
    this.currentUserActivityId = 1;
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
        userRole: "attendee",
        isOnline: true,
        hasAcceptedTerms: true
      },
      {
        fullName: "Dwayne De Rosario",
        email: "dwayne.derosario@example.com",
        company: "Independent",
        jobTitle: "Former Player",
        avatar: "",
        userRole: "panelist",
        isOnline: true,
        hasAcceptedTerms: true
      },
      {
        fullName: "Diana Matheson",
        email: "diana.matheson@project8.com",
        company: "Project 8",
        jobTitle: "Former Player, Co-founder",
        avatar: "",
        userRole: "panelist",
        isOnline: true,
        hasAcceptedTerms: true
      },
      {
        fullName: "Jesse Marsch",
        email: "jesse.marsch@ussoccer.com",
        company: "US Soccer",
        jobTitle: "Head Coach, Men's National Team",
        avatar: "",
        userRole: "panelist",
        isOnline: false,
        hasAcceptedTerms: true
      },
      {
        fullName: "Teresa Resch",
        email: "teresa.resch@torontotempo.com",
        company: "Toronto Tempo",
        jobTitle: "President",
        avatar: "",
        userRole: "panelist",
        isOnline: true,
        hasAcceptedTerms: true
      },
      {
        fullName: "Anastasia Bucsis",
        email: "anastasia.bucsis@cbc.ca",
        company: "CBC Sports",
        jobTitle: "Former Olympian, CBC Sports journalist",
        avatar: "",
        userRole: "moderator",
        isOnline: false,
        hasAcceptedTerms: true
      },
      {
        fullName: "Kyle McMann",
        email: "kyle.mcmann@nhl.com",
        company: "NHL",
        jobTitle: "SVP, Global Business Development",
        avatar: "",
        userRole: "panelist",
        isOnline: true,
        hasAcceptedTerms: true
      },
      {
        fullName: "Lance Chung",
        email: "lance.chung@glory.media",
        company: "GLORY Media",
        jobTitle: "Editor-in-Chief",
        avatar: "",
        userRole: "glory_team",
        isOnline: true,
        hasAcceptedTerms: true
      },
      {
        fullName: "Sarah Johnson",
        email: "sarah.johnson@example.com",
        company: "Independent",
        jobTitle: "Summit Attendee",
        avatar: "",
        userRole: "attendee",
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
    
    // Automatically assign GLORY Team role for @glory.media emails
    const userRole = insertUser.email && insertUser.email.endsWith('@glory.media') 
      ? 'glory_team' 
      : insertUser.userRole || "attendee";

    const user: User = { 
      ...insertUser, 
      id,
      company: insertUser.company || null,
      jobTitle: insertUser.jobTitle || null,
      avatar: insertUser.avatar || null,
      userRole,
      isOnline: insertUser.isOnline || false,
      hasAcceptedTerms: insertUser.hasAcceptedTerms || false,
      createdAt: new Date()
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User> {
    const user = this.users.get(id);
    if (!user) {
      throw new Error(`User with id ${id} not found`);
    }
    
    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
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

  async markQuestionAsAnswered(questionId: number): Promise<void> {
    const question = this.questions.get(questionId);
    if (question) {
      question.isAnswered = true;
      this.questions.set(questionId, question);
    }
  }

  async deleteQuestion(questionId: number): Promise<void> {
    this.questions.delete(questionId);
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

  async deleteUser(id: number): Promise<void> {
    // Remove user from main users map
    this.users.delete(id);
    
    // Remove user's messages
    const messagesToDelete = Array.from(this.messages.values())
      .filter(message => message.senderId === id);
    messagesToDelete.forEach(message => this.messages.delete(message.id));
    
    // Remove user's group chat messages
    const groupMessagesToDelete = Array.from(this.groupChatMessages.values())
      .filter(message => message.senderId === id);
    groupMessagesToDelete.forEach(message => this.groupChatMessages.delete(message.id));
    
    // Remove user's connections
    const connectionsToDelete = Array.from(this.connections.values())
      .filter(conn => conn.requesterId === id || conn.addresseeId === id);
    connectionsToDelete.forEach(conn => this.connections.delete(conn.id));
    
    // Remove user's conversations
    const conversationsToDelete = Array.from(this.conversations.values())
      .filter(conv => conv.participant1Id === id || conv.participant2Id === id);
    conversationsToDelete.forEach(conv => this.conversations.delete(conv.id));
    
    // Remove user's questions
    const questionsToDelete = Array.from(this.questions.values())
      .filter(question => question.userId === id);
    questionsToDelete.forEach(question => this.questions.delete(question.id));
    
    // Remove user's survey responses
    const responsesToDelete = Array.from(this.surveyResponses.values())
      .filter(response => response.userId === id);
    responsesToDelete.forEach(response => this.surveyResponses.delete(response.id));
    
    // Remove user's sessions and activities
    const sessionsToDelete = Array.from(this.userSessions.values())
      .filter(session => session.userId === id);
    sessionsToDelete.forEach(session => this.userSessions.delete(session.id));
    
    const activitiesToDelete = Array.from(this.userActivities.values())
      .filter(activity => activity.userId === id);
    activitiesToDelete.forEach(activity => this.userActivities.delete(activity.id));
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
      conversationId: this.groupChatId, // 9999
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

  // Analytics Methods
  async createUserSession(insertSession: InsertUserSession): Promise<UserSession> {
    const id = this.currentUserSessionId++;
    const session: UserSession = {
      ...insertSession,
      id,
      sessionStart: new Date(),
    };
    this.userSessions.set(id, session);
    
    // Track activity
    await this.createUserActivity({
      userId: session.userId,
      activityType: 'session_start',
      sessionId: id,
    });
    
    return session;
  }

  async updateUserSession(sessionId: number, updates: Partial<UserSession>): Promise<UserSession> {
    const session = this.userSessions.get(sessionId);
    if (!session) throw new Error('Session not found');

    const updatedSession = { ...session, ...updates };
    this.userSessions.set(sessionId, updatedSession);
    return updatedSession;
  }

  async endUserSession(sessionId: number): Promise<UserSession> {
    const session = this.userSessions.get(sessionId);
    if (!session) throw new Error('Session not found');

    const endTime = new Date();
    const duration = session.sessionStart ? Math.floor((endTime.getTime() - session.sessionStart.getTime()) / 1000) : 0;
    
    const updatedSession = {
      ...session,
      sessionEnd: endTime,
      duration,
    };
    
    this.userSessions.set(sessionId, updatedSession);
    
    // Track session end activity
    await this.createUserActivity({
      userId: session.userId,
      activityType: 'session_end',
      activityDetails: { duration },
      sessionId,
    });
    
    return updatedSession;
  }

  async getUserSessions(userId: number, limit = 50): Promise<UserSession[]> {
    return Array.from(this.userSessions.values())
      .filter(session => session.userId === userId)
      .sort((a, b) => new Date(b.sessionStart!).getTime() - new Date(a.sessionStart!).getTime())
      .slice(0, limit);
  }

  async createUserActivity(insertActivity: InsertUserActivity): Promise<UserActivity> {
    const id = this.currentUserActivityId++;
    const activity: UserActivity = {
      ...insertActivity,
      id,
      timestamp: new Date(),
    };
    this.userActivities.set(id, activity);
    return activity;
  }

  async getUserActivity(userId: number, limit = 100): Promise<UserActivity[]> {
    return Array.from(this.userActivities.values())
      .filter(activity => activity.userId === userId)
      .sort((a, b) => new Date(b.timestamp!).getTime() - new Date(a.timestamp!).getTime())
      .slice(0, limit);
  }

  async updateDailyMetrics(date: string): Promise<DailyMetrics> {
    const existingMetrics = this.dailyMetrics.get(date);
    const today = new Date(date);
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

    // Calculate metrics for the day
    const sessions = Array.from(this.userSessions.values())
      .filter(session => session.sessionStart && 
        session.sessionStart >= startOfDay && 
        session.sessionStart < endOfDay);

    const activities = Array.from(this.userActivities.values())
      .filter(activity => activity.timestamp && 
        activity.timestamp >= startOfDay && 
        activity.timestamp < endOfDay);

    const uniqueUsers = new Set(sessions.map(s => s.userId)).size;
    const totalUsers = this.users.size;
    const newUsers = Array.from(this.users.values())
      .filter(user => user.createdAt && 
        user.createdAt >= startOfDay && 
        user.createdAt < endOfDay).length;

    const totalMessages = activities.filter(a => a.activityType === 'message_sent').length;
    const totalConnections = activities.filter(a => a.activityType === 'connection_requested').length;
    const totalQuestions = activities.filter(a => a.activityType === 'question_submitted').length;
    
    const completedSessions = sessions.filter(s => s.duration !== undefined && s.duration !== null);
    const avgSessionDuration = completedSessions.length > 0 
      ? Math.round(completedSessions.reduce((sum, s) => sum + (s.duration || 0), 0) / completedSessions.length)
      : 0;

    const totalPageViews = sessions.reduce((sum, s) => sum + (s.pageViews || 0), 0);

    const metrics: DailyMetrics = {
      id: existingMetrics?.id || Date.now(),
      date,
      totalUsers,
      activeUsers: uniqueUsers,
      newUsers,
      totalMessages,
      totalConnections,
      totalQuestions,
      avgSessionDuration,
      totalPageViews,
    };

    this.dailyMetrics.set(date, metrics);
    return metrics;
  }

  async getDailyMetrics(startDate?: string, endDate?: string): Promise<DailyMetrics[]> {
    let metrics = Array.from(this.dailyMetrics.values());
    
    if (startDate) {
      metrics = metrics.filter(m => m.date >= startDate);
    }
    if (endDate) {
      metrics = metrics.filter(m => m.date <= endDate);
    }
    
    return metrics.sort((a, b) => a.date.localeCompare(b.date));
  }

  async getAnalyticsSummary(): Promise<{
    totalUsers: number;
    activeUsersToday: number;
    avgSessionDuration: number;
    totalMessages: number;
    totalConnections: number;
    popularPages: Array<{ page: string; views: number }>;
    userEngagement: Array<{ date: string; activeUsers: number; messages: number }>;
  }> {
    const today = new Date().toISOString().split('T')[0];
    const last7Days = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    // Get today's metrics
    await this.updateDailyMetrics(today);
    const todayMetrics = this.dailyMetrics.get(today);
    
    // Calculate overall stats
    const totalUsers = this.users.size;
    const activeUsersToday = todayMetrics?.activeUsers || 0;
    
    // Calculate average session duration from all completed sessions
    const completedSessions = Array.from(this.userSessions.values())
      .filter(s => s.duration !== undefined && s.duration !== null);
    const avgSessionDuration = completedSessions.length > 0 
      ? Math.round(completedSessions.reduce((sum, s) => sum + (s.duration || 0), 0) / completedSessions.length)
      : 0;

    // Count total messages and connections
    const totalMessages = this.groupChatMessages.size + this.messages.size;
    const totalConnections = this.connections.size;

    // Calculate popular pages (simplified - based on page views in sessions)
    const pageViewCounts = new Map<string, number>();
    Array.from(this.userActivities.values())
      .filter(a => a.activityType === 'page_view')
      .forEach(activity => {
        const page = activity.activityDetails?.page || 'unknown';
        pageViewCounts.set(page, (pageViewCounts.get(page) || 0) + 1);
      });

    const popularPages = Array.from(pageViewCounts.entries())
      .map(([page, views]) => ({ page, views }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 5);

    // Get user engagement for last 7 days
    const recentMetrics = await this.getDailyMetrics(last7Days, today);
    const userEngagement = recentMetrics.map(metrics => ({
      date: metrics.date,
      activeUsers: metrics.activeUsers || 0,
      messages: metrics.totalMessages || 0,
    }));

    return {
      totalUsers,
      activeUsersToday,
      avgSessionDuration,
      totalMessages,
      totalConnections,
      popularPages,
      userEngagement,
    };
  }
}

// Database storage implementation
import { db } from "./db";
import { eq, desc, and, ne, sql } from "drizzle-orm";

export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    // Automatically assign GLORY Team role for @glory.media emails
    const userRole = insertUser.email && insertUser.email.endsWith('@glory.media') 
      ? 'glory_team' 
      : insertUser.userRole || "attendee";

    const [user] = await db
      .insert(users)
      .values({
        ...insertUser,
        userRole,
        isOnline: insertUser.isOnline || false,
        hasAcceptedTerms: insertUser.hasAcceptedTerms || false,
      })
      .returning();
    return user;
  }

  async updateUserOnlineStatus(id: number, isOnline: boolean): Promise<void> {
    await db.update(users).set({ isOnline }).where(eq(users.id, id));
  }

  async getSuggestedConnections(userId: number, limit = 10): Promise<User[]> {
    const allUsers = await db.select().from(users).where(ne(users.id, userId));
    return allUsers.slice(0, limit);
  }

  async getEventAttendees(limit = 50): Promise<User[]> {
    return await db.select().from(users).limit(limit);
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User> {
    const [user] = await db
      .update(users)
      .set(updates)
      .where(eq(users.id, id))
      .returning();
    
    if (!user) {
      throw new Error(`User with id ${id} not found`);
    }
    
    return user;
  }

  async deleteUser(id: number): Promise<void> {
    await db.delete(users).where(eq(users.id, id));
  }

  // Conversations
  async getConversationsForUser(userId: number): Promise<ConversationWithParticipant[]> {
    // Simplified implementation - would need proper joins in production
    return [];
  }

  async getOrCreateConversation(participant1Id: number, participant2Id: number): Promise<Conversation> {
    // Simplified implementation
    const [conversation] = await db
      .insert(conversations)
      .values({ participant1Id, participant2Id })
      .returning();
    return conversation;
  }

  async getConversation(id: number): Promise<Conversation | undefined> {
    const [conversation] = await db.select().from(conversations).where(eq(conversations.id, id));
    return conversation || undefined;
  }

  // Messages
  async getMessagesForConversation(conversationId: number, limit = 50): Promise<MessageWithSender[]> {
    // Simplified implementation - would need joins
    return [];
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const [message] = await db.insert(messages).values(insertMessage).returning();
    return message;
  }

  async updateConversationLastMessage(conversationId: number): Promise<void> {
    await db.update(conversations)
      .set({ lastMessageAt: new Date() })
      .where(eq(conversations.id, conversationId));
  }

  // Group Chat
  async getGroupChatMessages(limit = 100): Promise<MessageWithSender[]> {
    // Create a special group chat conversation if it doesn't exist
    const GROUP_CHAT_ID = 999; // Special ID for group chat
    
    try {
      const result = await db.select({
        id: messages.id,
        content: messages.content,
        createdAt: messages.createdAt,
        conversationId: messages.conversationId,
        senderId: messages.senderId,
        sender: {
          id: users.id,
          fullName: users.fullName,
          email: users.email,
          company: users.company,
          jobTitle: users.jobTitle,
          avatar: users.avatar,
          userRole: users.userRole,
          isOnline: users.isOnline,
          hasAcceptedTerms: users.hasAcceptedTerms,
          createdAt: users.createdAt,
        }
      })
      .from(messages)
      .innerJoin(users, eq(messages.senderId, users.id))
      .where(eq(messages.conversationId, GROUP_CHAT_ID))
      .orderBy(messages.createdAt)
      .limit(limit);

      return result.map(row => ({
        id: row.id,
        content: row.content,
        createdAt: row.createdAt,
        conversationId: row.conversationId,
        senderId: row.senderId,
        sender: row.sender
      }));
    } catch (error) {
      console.error("Error fetching group chat messages:", error);
      return [];
    }
  }

  async createGroupChatMessage(messageData: Omit<InsertMessage, 'conversationId'>): Promise<Message> {
    const GROUP_CHAT_ID = 999; // Special ID for group chat
    
    const [message] = await db.insert(messages).values({
      ...messageData,
      conversationId: GROUP_CHAT_ID
    }).returning();
    return message;
  }

  // Connections
  async createConnection(insertConnection: InsertConnection): Promise<Connection> {
    const [connection] = await db.insert(connections).values(insertConnection).returning();
    return connection;
  }

  async getConnectionStatus(requesterId: number, addresseeId: number): Promise<Connection | undefined> {
    const [connection] = await db.select().from(connections)
      .where(and(
        eq(connections.requesterId, requesterId),
        eq(connections.addresseeId, addresseeId)
      ));
    return connection || undefined;
  }

  async updateConnectionStatus(connectionId: number, status: string): Promise<void> {
    await db.update(connections).set({ status }).where(eq(connections.id, connectionId));
  }

  async getConnections(userId: number, status?: string): Promise<Connection[]> {
    let query = db.select().from(connections)
      .where(eq(connections.requesterId, userId));
    
    if (status) {
      query = query.where(eq(connections.status, status));
    }
    
    return await query;
  }

  // Questions
  async createQuestion(insertQuestion: InsertQuestion): Promise<Question> {
    const [question] = await db.insert(questions).values(insertQuestion).returning();
    return question;
  }

  async getQuestions(panelName?: string): Promise<Question[]> {
    if (panelName) {
      return await db.select().from(questions).where(eq(questions.panelName, panelName));
    }
    return await db.select().from(questions);
  }

  async getQuestionsByUser(userId: number): Promise<Question[]> {
    return await db.select().from(questions).where(eq(questions.userId, userId));
  }

  async markQuestionAsAnswered(questionId: number): Promise<void> {
    await db.update(questions)
      .set({ isAnswered: true })
      .where(eq(questions.id, questionId));
  }

  async deleteQuestion(questionId: number): Promise<void> {
    await db.delete(questions).where(eq(questions.id, questionId));
  }

  // Surveys - simplified implementations
  async createSurvey(insertSurvey: InsertSurvey): Promise<Survey> {
    const [survey] = await db.insert(surveys).values(insertSurvey).returning();
    return survey;
  }

  async getSurveys(): Promise<Survey[]> {
    return await db.select().from(surveys);
  }

  async getSurvey(id: number): Promise<SurveyWithQuestions | undefined> {
    const [survey] = await db.select().from(surveys).where(eq(surveys.id, id));
    if (!survey) return undefined;
    
    const surveyQuestions = await db.select().from(surveyQuestions)
      .where(eq(surveyQuestions.surveyId, id));
    
    return { ...survey, questions: surveyQuestions };
  }

  async updateSurvey(id: number, updates: Partial<Survey>): Promise<Survey> {
    const [survey] = await db.update(surveys).set(updates).where(eq(surveys.id, id)).returning();
    return survey;
  }

  async deleteSurvey(id: number): Promise<void> {
    await db.delete(surveys).where(eq(surveys.id, id));
  }

  // Survey Questions
  async createSurveyQuestion(insertQuestion: InsertSurveyQuestion): Promise<SurveyQuestion> {
    const [question] = await db.insert(surveyQuestions).values(insertQuestion).returning();
    return question;
  }

  async getSurveyQuestions(surveyId: number): Promise<SurveyQuestion[]> {
    return await db.select().from(surveyQuestions).where(eq(surveyQuestions.surveyId, surveyId));
  }

  async updateSurveyQuestion(id: number, updates: Partial<SurveyQuestion>): Promise<SurveyQuestion> {
    const [question] = await db.update(surveyQuestions).set(updates).where(eq(surveyQuestions.id, id)).returning();
    return question;
  }

  async deleteSurveyQuestion(id: number): Promise<void> {
    await db.delete(surveyQuestions).where(eq(surveyQuestions.id, id));
  }

  // Survey Responses
  async createSurveyResponse(insertResponse: InsertSurveyResponse): Promise<SurveyResponse> {
    const [response] = await db.insert(surveyResponses).values(insertResponse).returning();
    return response;
  }

  async getSurveyResponses(surveyId: number): Promise<SurveyResponseWithAnswers[]> {
    // Simplified implementation
    return [];
  }

  async completeSurveyResponse(responseId: number): Promise<void> {
    await db.update(surveyResponses)
      .set({ completedAt: new Date() })
      .where(eq(surveyResponses.id, responseId));
  }

  // Survey Answers
  async createSurveyAnswer(insertAnswer: InsertSurveyAnswer): Promise<SurveyAnswer> {
    const [answer] = await db.insert(surveyAnswers).values(insertAnswer).returning();
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
    // Simplified implementation
    return {
      totalResponses: 0,
      completionRate: 0,
      questionStats: []
    };
  }

  // Analytics - simplified implementations
  async createUserSession(insertSession: InsertUserSession): Promise<UserSession> {
    const [session] = await db.insert(userSessions).values(insertSession).returning();
    return session;
  }

  async updateUserSession(sessionId: number, updates: Partial<UserSession>): Promise<UserSession> {
    const [session] = await db.update(userSessions).set(updates).where(eq(userSessions.id, sessionId)).returning();
    return session;
  }

  async endUserSession(sessionId: number): Promise<UserSession> {
    const [session] = await db.update(userSessions)
      .set({ endTime: new Date() })
      .where(eq(userSessions.id, sessionId))
      .returning();
    return session;
  }

  async getUserSessions(userId: number, limit = 50): Promise<UserSession[]> {
    return await db.select().from(userSessions)
      .where(eq(userSessions.userId, userId))
      .limit(limit);
  }

  async createUserActivity(insertActivity: InsertUserActivity): Promise<UserActivity> {
    const [activity] = await db.insert(userActivity).values(insertActivity).returning();
    return activity;
  }

  async getUserActivity(userId: number, limit = 100): Promise<UserActivity[]> {
    return await db.select().from(userActivity)
      .where(eq(userActivity.userId, userId))
      .limit(limit);
  }

  async updateDailyMetrics(date: string): Promise<DailyMetrics> {
    // Simplified implementation
    const [metrics] = await db.insert(dailyMetrics).values({
      date: new Date(date),
      activeUsers: 0,
      newUsers: 0,
      totalMessages: 0,
      totalConnections: 0,
      avgSessionDuration: 0
    }).returning();
    return metrics;
  }

  async getDailyMetrics(startDate?: string, endDate?: string): Promise<DailyMetrics[]> {
    return await db.select().from(dailyMetrics);
  }

  async getAnalyticsSummary(): Promise<{
    totalUsers: number;
    activeUsersToday: number;
    avgSessionDuration: number;
    totalMessages: number;
    totalConnections: number;
    popularPages: Array<{ page: string; views: number }>;
    userEngagement: Array<{ date: string; activeUsers: number; messages: number }>;
  }> {
    const totalUsersResult = await db.select({ count: sql<number>`count(*)` }).from(users);
    const totalUsers = totalUsersResult[0]?.count || 0;

    return {
      totalUsers,
      activeUsersToday: 0,
      avgSessionDuration: 0,
      totalMessages: 0,
      totalConnections: 0,
      popularPages: [],
      userEngagement: []
    };
  }
}

export const storage = new DatabaseStorage();
