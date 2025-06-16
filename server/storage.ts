import {
  users,
  skills,
  badges,
  recommendations,
  challenges,
  userChallengeProgress,
  codingChallenges,
  codingSubmissions,
  type User,
  type UpsertUser,
  type InsertSkill,
  type Skill,
  type InsertBadge,
  type Badge,
  type Recommendation,
  type Challenge,
  type UserChallengeProgress,
  type UpdateProfile,
  type CodingChallenge,
  type InsertCodingChallenge,
  type CodingSubmission,
  type InsertCodingSubmission,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, count, sql, and } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserProfile(userId: string, profile: UpdateProfile): Promise<User>;
  
  // Skill operations
  getUserSkills(userId: string): Promise<Skill[]>;
  createSkill(skill: InsertSkill): Promise<Skill>;
  updateSkill(skillId: number, updates: Partial<InsertSkill>): Promise<Skill>;
  deleteSkill(skillId: number): Promise<void>;
  
  // Badge operations
  getUserBadges(userId: string): Promise<Badge[]>;
  createBadge(badge: InsertBadge): Promise<Badge>;
  
  // Recommendation operations
  getRecommendations(): Promise<Recommendation[]>;
  getPersonalizedRecommendations(userId: string): Promise<Recommendation[]>;
  createRecommendation(recommendation: any): Promise<Recommendation>;
  
  // Challenge operations
  getActiveChallenge(): Promise<Challenge | undefined>;
  getUserChallengeProgress(userId: string, challengeId: number): Promise<UserChallengeProgress | undefined>;
  updateChallengeProgress(userId: string, challengeId: number, progress: number): Promise<UserChallengeProgress>;
  
  // Leaderboard
  getLeaderboard(): Promise<Array<{ user: User; skillCount: number }>>;
  
  // Admin operations
  getAllUsers(): Promise<User[]>;
  getTotalStats(): Promise<{ totalUsers: number; totalSkills: number; activeUsers: number }>;
  
  // Coding challenge operations
  getPersonalizedCodingChallenge(userId: string): Promise<CodingChallenge | undefined>;
  getCodingChallenges(): Promise<CodingChallenge[]>;
  createCodingSubmission(submission: InsertCodingSubmission): Promise<CodingSubmission>;
  getCodingSubmissions(userId: string): Promise<CodingSubmission[]>;
  getCodingLeaderboard(): Promise<Array<{ user: User; totalScore: number; submissionCount: number }>>;
  submitCodingChallenge(userId: string, challengeId: number, solution: string): Promise<any>;
  getCareerGuidance(userId: string): Promise<any>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async updateUserProfile(userId: string, profile: UpdateProfile): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ ...profile, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async getUserSkills(userId: string): Promise<Skill[]> {
    return await db.select().from(skills).where(eq(skills.userId, userId)).orderBy(desc(skills.updatedAt));
  }

  async createSkill(skill: InsertSkill): Promise<Skill> {
    const [newSkill] = await db.insert(skills).values(skill).returning();
    return newSkill;
  }

  async updateSkill(skillId: number, updates: Partial<InsertSkill>): Promise<Skill> {
    const [skill] = await db
      .update(skills)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(skills.id, skillId))
      .returning();
    return skill;
  }

  async deleteSkill(skillId: number): Promise<void> {
    await db.delete(skills).where(eq(skills.id, skillId));
  }

  async getUserBadges(userId: string): Promise<Badge[]> {
    return await db.select().from(badges).where(eq(badges.userId, userId)).orderBy(desc(badges.earnedAt));
  }

  async createBadge(badge: InsertBadge): Promise<Badge> {
    const [newBadge] = await db.insert(badges).values(badge).returning();
    return newBadge;
  }

  async getRecommendations(): Promise<Recommendation[]> {
    return await db.select().from(recommendations).where(eq(recommendations.isActive, true)).orderBy(desc(recommendations.matchPercentage));
  }

  async getPersonalizedRecommendations(userId: string): Promise<Recommendation[]> {
    // Get user profile and skills
    const user = await this.getUser(userId);
    const userSkills = await db.select().from(skills).where(eq(skills.userId, userId));
    
    if (!user) return [];

    // Extract skill names and categories for matching
    const skillNames = userSkills.map(skill => skill.name.toLowerCase());
    const skillCategories = userSkills.map(skill => skill.category.toLowerCase());
    
    // Get all active recommendations
    const allRecommendations = await db.select().from(recommendations).where(eq(recommendations.isActive, true));
    
    // Filter recommendations based on job role preference and skills
    const personalizedRecs = allRecommendations.filter(rec => {
      let matchScore = 0;
      
      // Job role matching (highest priority)
      if (user.preferredJobRole && rec.tags) {
        const jobRoleLower = user.preferredJobRole.toLowerCase();
        const hasJobRoleMatch = rec.tags.some(tag => 
          tag.toLowerCase().includes(jobRoleLower) || 
          jobRoleLower.includes(tag.toLowerCase())
        );
        if (hasJobRoleMatch) matchScore += 50;
      }
      
      // Skill matching (medium priority)
      if (rec.tags && rec.tags.length > 0) {
        const skillMatches = rec.tags.filter(tag => {
          const tagLower = tag.toLowerCase();
          return skillNames.some(skill => 
            skill.includes(tagLower) || tagLower.includes(skill)
          ) || skillCategories.some(category =>
            category.includes(tagLower) || tagLower.includes(category)
          );
        });
        matchScore += skillMatches.length * 10;
      }
      
      // Only return recommendations with some relevance
      return matchScore > 0;
    });

    // Sort by relevance score and limit to top 6 to avoid overwhelming users
    return personalizedRecs
      .sort((a, b) => (b.matchPercentage || 0) - (a.matchPercentage || 0))
      .slice(0, 6);
  }

  async createRecommendation(recommendation: any): Promise<Recommendation> {
    const [newRec] = await db.insert(recommendations).values(recommendation).returning();
    return newRec;
  }

  async getActiveChallenge(): Promise<Challenge | undefined> {
    const [challenge] = await db
      .select()
      .from(challenges)
      .where(and(eq(challenges.isActive, true), sql`${challenges.endDate} > NOW()`))
      .orderBy(desc(challenges.startDate))
      .limit(1);
    return challenge;
  }

  async getUserChallengeProgress(userId: string, challengeId: number): Promise<UserChallengeProgress | undefined> {
    const [progress] = await db
      .select()
      .from(userChallengeProgress)
      .where(and(eq(userChallengeProgress.userId, userId), eq(userChallengeProgress.challengeId, challengeId)));
    return progress;
  }

  async updateChallengeProgress(userId: string, challengeId: number, progress: number): Promise<UserChallengeProgress> {
    const [existingProgress] = await db
      .select()
      .from(userChallengeProgress)
      .where(and(eq(userChallengeProgress.userId, userId), eq(userChallengeProgress.challengeId, challengeId)));

    if (existingProgress) {
      const [updated] = await db
        .update(userChallengeProgress)
        .set({ progress, completed: progress >= 100 })
        .where(eq(userChallengeProgress.id, existingProgress.id))
        .returning();
      return updated;
    } else {
      const [newProgress] = await db
        .insert(userChallengeProgress)
        .values({ userId, challengeId, progress, completed: progress >= 100 })
        .returning();
      return newProgress;
    }
  }

  async getLeaderboard(): Promise<Array<{ user: User; skillCount: number }>> {
    const result = await db
      .select({
        user: users,
        skillCount: count(skills.id),
      })
      .from(users)
      .leftJoin(skills, eq(users.id, skills.userId))
      .groupBy(users.id)
      .orderBy(desc(count(skills.id)))
      .limit(10);

    return result.map(row => ({
      user: row.user,
      skillCount: row.skillCount || 0,
    }));
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  }

  async getTotalStats(): Promise<{ totalUsers: number; totalSkills: number; activeUsers: number }> {
    const [userStats] = await db.select({ count: count() }).from(users);
    const [skillStats] = await db.select({ count: count() }).from(skills);
    
    // Consider users active if they've updated a skill in the last week
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const [activeStats] = await db
      .select({ count: count() })
      .from(users)
      .innerJoin(skills, eq(users.id, skills.userId))
      .where(sql`${skills.updatedAt} > ${weekAgo}`);

    return {
      totalUsers: userStats.count,
      totalSkills: skillStats.count,
      activeUsers: activeStats.count || 0,
    };
  }

  // Coding challenge operations
  async getPersonalizedCodingChallenge(userId: string): Promise<CodingChallenge | undefined> {
    const user = await this.getUser(userId);
    const userSkills = await db.select().from(skills).where(eq(skills.userId, userId));
    
    if (!user) return undefined;

    // Determine difficulty based on user's skill levels
    const skillLevels = userSkills.map(skill => skill.level.toLowerCase());
    let targetDifficulty = 'beginner';
    
    if (skillLevels.includes('advanced') || skillLevels.includes('expert')) {
      targetDifficulty = 'advanced';
    } else if (skillLevels.includes('intermediate')) {
      targetDifficulty = 'intermediate';
    }

    // Find challenges matching user's job role preference and difficulty
    let challenges = await db.select().from(codingChallenges).where(
      and(
        eq(codingChallenges.isActive, true),
        eq(codingChallenges.difficulty, targetDifficulty)
      )
    );

    // Filter by job role if available
    if (user.preferredJobRole && challenges.length > 0) {
      const jobRoleMatches = challenges.filter(challenge => 
        challenge.jobRole.toLowerCase().includes(user.preferredJobRole!.toLowerCase()) ||
        user.preferredJobRole!.toLowerCase().includes(challenge.jobRole.toLowerCase())
      );
      if (jobRoleMatches.length > 0) {
        challenges = jobRoleMatches;
      }
    }

    // Return a random challenge from the filtered set
    return challenges.length > 0 ? challenges[Math.floor(Math.random() * challenges.length)] : undefined;
  }

  async getCodingChallenges(): Promise<CodingChallenge[]> {
    return await db.select().from(codingChallenges).where(eq(codingChallenges.isActive, true));
  }

  async createCodingSubmission(submission: InsertCodingSubmission): Promise<CodingSubmission> {
    const [newSubmission] = await db.insert(codingSubmissions).values(submission).returning();
    return newSubmission;
  }

  async getCodingSubmissions(userId: string): Promise<CodingSubmission[]> {
    return await db.select().from(codingSubmissions).where(eq(codingSubmissions.userId, userId)).orderBy(desc(codingSubmissions.submittedAt));
  }

  async getCodingLeaderboard(): Promise<Array<{ user: User; totalScore: number; submissionCount: number }>> {
    const leaderboardData = await db
      .select({
        userId: codingSubmissions.userId,
        totalScore: sql<number>`sum(${codingSubmissions.score})`,
        submissionCount: count(codingSubmissions.id),
      })
      .from(codingSubmissions)
      .groupBy(codingSubmissions.userId)
      .orderBy(desc(sql<number>`sum(${codingSubmissions.score})`));

    const result = [];
    for (const entry of leaderboardData) {
      const user = await this.getUser(entry.userId);
      if (user) {
        result.push({
          user,
          totalScore: entry.totalScore || 0,
          submissionCount: entry.submissionCount,
        });
      }
    }

    return result;
  }

  async submitCodingChallenge(userId: string, challengeId: number, solution: string): Promise<any> {
    const { checkCodingSolution } = await import('./openai');
    
    // Get the challenge details
    const [challenge] = await db
      .select()
      .from(codingChallenges)
      .where(eq(codingChallenges.id, challengeId));

    if (!challenge) {
      throw new Error("Challenge not found");
    }

    // Check solution with AI
    const result = await checkCodingSolution(
      challenge.problemStatement,
      challenge.expectedOutput || "Correct implementation",
      solution,
      challenge.difficulty
    );

    // Create submission record
    const submission = await this.createCodingSubmission({
      userId,
      challengeId,
      solution,
      score: result.score,
      feedback: result.feedback,
      status: result.isCorrect ? "correct" : "incorrect"
    });

    return {
      submission,
      result
    };
  }

  async getCareerGuidance(userId: string): Promise<any> {
    const { generateCareerGuidance } = await import('./openai');
    
    // Get user profile and skills
    const user = await this.getUser(userId);
    const skills = await this.getUserSkills(userId);

    if (!user || !user.preferredJobRole) {
      return {
        roadmap: ["Please complete your profile with preferred job role to get personalized guidance"],
        suggestedSkills: [],
        timelineWeeks: 12,
        resources: []
      };
    }

    const skillNames = skills.map(skill => skill.name);
    const avgLevel = skills.length > 0 
      ? skills.reduce((sum, skill) => sum + (skill.level === "Beginner" ? 1 : skill.level === "Intermediate" ? 2 : 3), 0) / skills.length
      : 1;
    
    const levelName = avgLevel < 1.5 ? "Beginner" : avgLevel < 2.5 ? "Intermediate" : "Advanced";

    return await generateCareerGuidance(skillNames, user.preferredJobRole, levelName);
  }
}

export const storage = new DatabaseStorage();
