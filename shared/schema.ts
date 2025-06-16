import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  integer,
  boolean,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  college: varchar("college"),
  course: varchar("course"),
  graduationYear: integer("graduation_year"),
  preferredJobRole: varchar("preferred_job_role"),
  isAdmin: boolean("is_admin").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const skills = pgTable("skills", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: varchar("name").notNull(),
  category: varchar("category").notNull(),
  level: varchar("level").notNull(), // "Beginner", "Intermediate", "Advanced"
  progress: integer("progress").default(0), // 0-100
  certificateUrl: varchar("certificate_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const badges = pgTable("badges", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: varchar("name").notNull(),
  description: text("description"),
  icon: varchar("icon").notNull(),
  earnedAt: timestamp("earned_at").defaultNow(),
});

export const recommendations = pgTable("recommendations", {
  id: serial("id").primaryKey(),
  title: varchar("title").notNull(),
  description: text("description"),
  type: varchar("type").notNull(), // "Course", "Internship", "Event", "Certification"
  url: varchar("url"),
  provider: varchar("provider"),
  imageUrl: varchar("image_url"),
  level: varchar("level"), // "Beginner", "Intermediate", "Advanced"
  duration: varchar("duration"),
  price: varchar("price"),
  rating: varchar("rating"),
  reviewCount: varchar("review_count"),
  matchPercentage: integer("match_percentage"),
  deadline: timestamp("deadline"),
  location: varchar("location"),
  tags: text("tags").array(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const challenges = pgTable("challenges", {
  id: serial("id").primaryKey(),
  title: varchar("title").notNull(),
  description: text("description"),
  targetCount: integer("target_count").notNull(),
  rewardBadge: varchar("reward_badge"),
  startDate: timestamp("start_date").defaultNow(),
  endDate: timestamp("end_date").notNull(),
  isActive: boolean("is_active").default(true),
});

export const userChallengeProgress = pgTable("user_challenge_progress", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  challengeId: integer("challenge_id").notNull().references(() => challenges.id, { onDelete: "cascade" }),
  progress: integer("progress").default(0),
  completed: boolean("completed").default(false),
  completedAt: timestamp("completed_at"),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  skills: many(skills),
  badges: many(badges),
  challengeProgress: many(userChallengeProgress),
}));

export const skillsRelations = relations(skills, ({ one }) => ({
  user: one(users, {
    fields: [skills.userId],
    references: [users.id],
  }),
}));

export const badgesRelations = relations(badges, ({ one }) => ({
  user: one(users, {
    fields: [badges.userId],
    references: [users.id],
  }),
}));

export const userChallengeProgressRelations = relations(userChallengeProgress, ({ one }) => ({
  user: one(users, {
    fields: [userChallengeProgress.userId],
    references: [users.id],
  }),
  challenge: one(challenges, {
    fields: [userChallengeProgress.challengeId],
    references: [challenges.id],
  }),
}));

export const challengesRelations = relations(challenges, ({ many }) => ({
  userProgress: many(userChallengeProgress),
}));

export const codingChallenges = pgTable("coding_challenges", {
  id: serial("id").primaryKey(),
  title: varchar("title").notNull(),
  description: text("description").notNull(),
  difficulty: varchar("difficulty").notNull(), // beginner, intermediate, advanced
  category: varchar("category").notNull(), // frontend, backend, fullstack, data-science
  jobRole: varchar("job_role").notNull(), // frontend-developer, backend-developer, data-analyst, etc.
  problemStatement: text("problem_statement").notNull(),
  expectedOutput: text("expected_output"),
  hints: text("hints").array(),
  tags: varchar("tags").array(),
  points: integer("points").default(10),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const codingSubmissions = pgTable("coding_submissions", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  challengeId: integer("challenge_id").notNull().references(() => codingChallenges.id, { onDelete: "cascade" }),
  solution: text("solution").notNull(),
  language: varchar("language").notNull(),
  status: varchar("status").notNull(), // submitted, reviewed, accepted, rejected
  score: integer("score").default(0),
  feedback: text("feedback"),
  submittedAt: timestamp("submitted_at").defaultNow(),
});

export const codingChallengesRelations = relations(codingChallenges, ({ many }) => ({
  submissions: many(codingSubmissions),
}));

export const codingSubmissionsRelations = relations(codingSubmissions, ({ one }) => ({
  user: one(users, {
    fields: [codingSubmissions.userId],
    references: [users.id],
  }),
  challenge: one(codingChallenges, {
    fields: [codingSubmissions.challengeId],
    references: [codingChallenges.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSkillSchema = createInsertSchema(skills).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertBadgeSchema = createInsertSchema(badges).omit({
  id: true,
  earnedAt: true,
});

export const insertRecommendationSchema = createInsertSchema(recommendations).omit({
  id: true,
  createdAt: true,
});

export const insertChallengeSchema = createInsertSchema(challenges).omit({
  id: true,
});

export const updateProfileSchema = createInsertSchema(users).pick({
  firstName: true,
  lastName: true,
  college: true,
  course: true,
  graduationYear: true,
  preferredJobRole: true,
});

export const insertCodingChallengeSchema = createInsertSchema(codingChallenges).omit({
  id: true,
  createdAt: true,
});

export const insertCodingSubmissionSchema = createInsertSchema(codingSubmissions).omit({
  id: true,
  submittedAt: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type InsertSkill = z.infer<typeof insertSkillSchema>;
export type Skill = typeof skills.$inferSelect;
export type InsertBadge = z.infer<typeof insertBadgeSchema>;
export type Badge = typeof badges.$inferSelect;
export type InsertRecommendation = z.infer<typeof insertRecommendationSchema>;
export type Recommendation = typeof recommendations.$inferSelect;
export type InsertChallenge = z.infer<typeof insertChallengeSchema>;
export type Challenge = typeof challenges.$inferSelect;
export type UserChallengeProgress = typeof userChallengeProgress.$inferSelect;
export type UpdateProfile = z.infer<typeof updateProfileSchema>;
export type InsertCodingChallenge = z.infer<typeof insertCodingChallengeSchema>;
export type CodingChallenge = typeof codingChallenges.$inferSelect;
export type InsertCodingSubmission = z.infer<typeof insertCodingSubmissionSchema>;
export type CodingSubmission = typeof codingSubmissions.$inferSelect;
