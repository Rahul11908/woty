import { pgTable, text, varchar, serial, integer, boolean, timestamp, json, jsonb, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  fullName: text("full_name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password"),
  company: text("company"),
  jobTitle: text("job_title"),
  avatar: text("avatar"),
  userRole: text("user_role").default("attendee"), // attendee, panelist, moderator, glory_team
  isOnline: boolean("is_online").default(false),
  hasAcceptedTerms: boolean("has_accepted_terms").default(false),
  linkedinId: text("linkedin_id").unique(),
  linkedinHeadline: text("linkedin_headline"),
  linkedinProfileUrl: text("linkedin_profile_url"),
  authProvider: text("auth_provider").default("password"), // password, linkedin
  createdAt: timestamp("created_at").defaultNow(),
});

export const conversations = pgTable("conversations", {
  id: serial("id").primaryKey(),
  participant1Id: integer("participant1_id").notNull().references(() => users.id),
  participant2Id: integer("participant2_id").notNull().references(() => users.id),
  lastMessageAt: timestamp("last_message_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id").notNull().references(() => conversations.id),
  senderId: integer("sender_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const messageReactions = pgTable("message_reactions", {
  id: serial("id").primaryKey(),
  messageId: integer("message_id").notNull().references(() => messages.id, { onDelete: 'cascade' }),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  emoji: varchar("emoji", { length: 10 }).notNull(), // 👍, ❤️, 😊, 😢, 😮, 😡
  createdAt: timestamp("created_at").defaultNow(),
});

export const connections = pgTable("connections", {
  id: serial("id").primaryKey(),
  requesterId: integer("requester_id").notNull().references(() => users.id),
  addresseeId: integer("addressee_id").notNull().references(() => users.id),
  status: text("status").notNull().default("pending"), // pending, accepted, rejected
  createdAt: timestamp("created_at").defaultNow(),
});

export const questions = pgTable("questions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  panelName: text("panel_name").notNull(),
  question: text("question").notNull(),
  isAnswered: boolean("is_answered").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const surveys = pgTable("surveys", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  type: text("type").notNull(), // 'during_event', 'post_event'
  status: text("status").notNull().default("draft"), // 'draft', 'active', 'completed'
  emailSubject: text("email_subject"),
  emailBody: text("email_body"),
  scheduledSendDate: timestamp("scheduled_send_date"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const surveyQuestions = pgTable("survey_questions", {
  id: serial("id").primaryKey(),
  surveyId: integer("survey_id").notNull().references(() => surveys.id),
  questionText: text("question_text").notNull(),
  questionType: text("question_type").notNull(), // 'text', 'multiple_choice', 'rating'
  options: json("options"), // For multiple choice questions
  isRequired: boolean("is_required").default(false),
  order: integer("order").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const surveyResponses = pgTable("survey_responses", {
  id: serial("id").primaryKey(),
  surveyId: integer("survey_id").notNull().references(() => surveys.id),
  userId: integer("user_id").notNull().references(() => users.id),
  isCompleted: boolean("is_completed").default(false),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const surveyAnswers = pgTable("survey_answers", {
  id: serial("id").primaryKey(),
  responseId: integer("response_id").notNull().references(() => surveyResponses.id),
  questionId: integer("question_id").notNull().references(() => surveyQuestions.id),
  answerText: text("answer_text"),
  selectedOption: text("selected_option"),
  createdAt: timestamp("created_at").defaultNow(),
});

// User Analytics Tables
export const userSessions = pgTable("user_sessions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  sessionStart: timestamp("session_start").defaultNow(),
  sessionEnd: timestamp("session_end"),
  duration: integer("duration"), // in seconds
  pageViews: integer("page_views").default(0),
  messagesPosted: integer("messages_posted").default(0),
  connectionsRequested: integer("connections_requested").default(0),
  questionsSubmitted: integer("questions_submitted").default(0),
  surveysCompleted: integer("surveys_completed").default(0),
  deviceType: varchar("device_type", { length: 50 }),
  userAgent: text("user_agent"),
});

export const userActivity = pgTable("user_activity", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  activityType: varchar("activity_type", { length: 100 }).notNull(), // 'message_sent', 'connection_requested', etc.
  activityDetails: jsonb("activity_details"),
  timestamp: timestamp("timestamp").defaultNow(),
  sessionId: integer("session_id").references(() => userSessions.id),
});

export const dailyMetrics = pgTable("daily_metrics", {
  id: serial("id").primaryKey(),
  date: date("date").notNull(),
  totalUsers: integer("total_users").default(0),
  activeUsers: integer("active_users").default(0),
  newUsers: integer("new_users").default(0),
  totalMessages: integer("total_messages").default(0),
  totalConnections: integer("total_connections").default(0),
  totalQuestions: integer("total_questions").default(0),
  avgSessionDuration: integer("avg_session_duration").default(0), // in seconds
  totalPageViews: integer("total_page_views").default(0),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
}).extend({
  password: z.string().min(8, "Password must be at least 8 characters long"),
});

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export const insertConversationSchema = createInsertSchema(conversations).omit({
  id: true,
  createdAt: true,
  lastMessageAt: true,
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true,
});

export const insertConnectionSchema = createInsertSchema(connections).omit({
  id: true,
  createdAt: true,
});

export const insertQuestionSchema = createInsertSchema(questions).omit({
  id: true,
  createdAt: true,
}).extend({
  panelName: z.string().min(1, "Panel name is required"),
  question: z.string().min(1, "Question is required").max(1000, "Question must be less than 1000 characters"),
  userId: z.number().int().positive("User ID must be a positive integer"),
});

export const insertGroupChatMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true,
  conversationId: true,
});

export const insertMessageReactionSchema = createInsertSchema(messageReactions).omit({
  id: true,
  createdAt: true,
});

export const insertSurveySchema = createInsertSchema(surveys).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSurveyQuestionSchema = createInsertSchema(surveyQuestions).omit({
  id: true,
  createdAt: true,
});

export const insertSurveyResponseSchema = createInsertSchema(surveyResponses).omit({
  id: true,
  createdAt: true,
});

export const insertSurveyAnswerSchema = createInsertSchema(surveyAnswers).omit({
  id: true,
  createdAt: true,
});

// Analytics Schema
export const insertUserSessionSchema = createInsertSchema(userSessions).omit({
  id: true,
}).extend({
  sessionStart: z.union([z.date(), z.string().transform((str) => new Date(str))]).optional(),
  sessionEnd: z.union([z.date(), z.string().transform((str) => new Date(str))]).optional(),
});

export const insertUserActivitySchema = createInsertSchema(userActivity).omit({
  id: true,
  timestamp: true,
});

export const insertDailyMetricsSchema = createInsertSchema(dailyMetrics).omit({
  id: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type LoginData = z.infer<typeof loginSchema>;
export type User = typeof users.$inferSelect;
export type InsertConversation = z.infer<typeof insertConversationSchema>;
export type Conversation = typeof conversations.$inferSelect;
export type MessageReaction = typeof messageReactions.$inferSelect;
export type InsertMessageReaction = z.infer<typeof insertMessageReactionSchema>;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;
export type InsertConnection = z.infer<typeof insertConnectionSchema>;
export type Connection = typeof connections.$inferSelect;
export type InsertQuestion = z.infer<typeof insertQuestionSchema>;
export type Question = typeof questions.$inferSelect;
export type InsertSurvey = z.infer<typeof insertSurveySchema>;
export type Survey = typeof surveys.$inferSelect;
export type InsertSurveyQuestion = z.infer<typeof insertSurveyQuestionSchema>;
export type SurveyQuestion = typeof surveyQuestions.$inferSelect;
export type InsertSurveyResponse = z.infer<typeof insertSurveyResponseSchema>;
export type SurveyResponse = typeof surveyResponses.$inferSelect;
export type InsertSurveyAnswer = z.infer<typeof insertSurveyAnswerSchema>;
export type SurveyAnswer = typeof surveyAnswers.$inferSelect;

// Analytics Types
export type InsertUserSession = z.infer<typeof insertUserSessionSchema>;
export type UserSession = typeof userSessions.$inferSelect;
export type InsertUserActivity = z.infer<typeof insertUserActivitySchema>;
export type UserActivity = typeof userActivity.$inferSelect;
export type InsertDailyMetrics = z.infer<typeof insertDailyMetricsSchema>;
export type DailyMetrics = typeof dailyMetrics.$inferSelect;

export type ConversationWithParticipant = Conversation & {
  participant: User;
  lastMessage?: Message;
  unreadCount: number;
};

export type MessageWithSender = Message & {
  sender: User;
  reactions?: Array<{
    emoji: string;
    count: number;
    users: User[];
    hasUserReacted: boolean;
  }>;
};

export type SurveyWithQuestions = Survey & {
  questions: SurveyQuestion[];
};

export type SurveyResponseWithAnswers = SurveyResponse & {
  answers: SurveyAnswer[];
  user: User;
};
