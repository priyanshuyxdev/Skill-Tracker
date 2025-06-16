import {
  users,
  skills,
  badges,
  recommendations,
  challenges,
  userChallengeProgress,
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
    // Get user skills first
    const userSkills = await db.select().from(skills).where(eq(skills.userId, userId));
    
    if (userSkills.length === 0) {
      return [];
    }

    // Extract skill names and categories for matching
    const skillNames = userSkills.map(skill => skill.name.toLowerCase());
    const skillCategories = userSkills.map(skill => skill.category.toLowerCase());
    
    // Get all active recommendations
    const allRecommendations = await db.select().from(recommendations).where(eq(recommendations.isActive, true));
    
    // Filter recommendations based on skill matching
    const personalizedRecs = allRecommendations.filter(rec => {
      if (!rec.tags || rec.tags.length === 0) return false;
      
      // Check if any tag matches user skills or categories
      return rec.tags.some(tag => {
        const tagLower = tag.toLowerCase();
        return skillNames.some(skill => 
          skill.includes(tagLower) || tagLower.includes(skill)
        ) || skillCategories.some(category =>
          category.includes(tagLower) || tagLower.includes(category)
        );
      });
    });

    // Sort by match percentage and return
    return personalizedRecs.sort((a, b) => (b.matchPercentage || 0) - (a.matchPercentage || 0));
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
}

export const storage = new DatabaseStorage();
