import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertSkillSchema, updateProfileSchema, insertRecommendationSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Profile routes
  app.put('/api/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const profileData = updateProfileSchema.parse(req.body);
      const user = await storage.updateUserProfile(userId, profileData);
      res.json(user);
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(400).json({ message: "Failed to update profile" });
    }
  });

  // Skill routes
  app.get('/api/skills', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const skills = await storage.getUserSkills(userId);
      res.json(skills);
    } catch (error) {
      console.error("Error fetching skills:", error);
      res.status(500).json({ message: "Failed to fetch skills" });
    }
  });

  app.post('/api/skills', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const skillData = insertSkillSchema.parse({ ...req.body, userId });
      const skill = await storage.createSkill(skillData);
      res.json(skill);
    } catch (error) {
      console.error("Error creating skill:", error);
      res.status(400).json({ message: "Failed to create skill" });
    }
  });

  app.put('/api/skills/:id', isAuthenticated, async (req: any, res) => {
    try {
      const skillId = parseInt(req.params.id);
      const updates = req.body;
      const skill = await storage.updateSkill(skillId, updates);
      res.json(skill);
    } catch (error) {
      console.error("Error updating skill:", error);
      res.status(400).json({ message: "Failed to update skill" });
    }
  });

  app.delete('/api/skills/:id', isAuthenticated, async (req: any, res) => {
    try {
      const skillId = parseInt(req.params.id);
      await storage.deleteSkill(skillId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting skill:", error);
      res.status(400).json({ message: "Failed to delete skill" });
    }
  });

  // Badge routes
  app.get('/api/badges', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const badges = await storage.getUserBadges(userId);
      res.json(badges);
    } catch (error) {
      console.error("Error fetching badges:", error);
      res.status(500).json({ message: "Failed to fetch badges" });
    }
  });

  // Recommendation routes
  app.get('/api/recommendations', isAuthenticated, async (req: any, res) => {
    try {
      const recommendations = await storage.getRecommendations();
      res.json(recommendations);
    } catch (error) {
      console.error("Error fetching recommendations:", error);
      res.status(500).json({ message: "Failed to fetch recommendations" });
    }
  });

  app.get('/api/recommendations/personalized', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const personalizedRecs = await storage.getPersonalizedRecommendations(userId);
      res.json(personalizedRecs);
    } catch (error) {
      console.error("Error fetching personalized recommendations:", error);
      res.status(500).json({ message: "Failed to fetch personalized recommendations" });
    }
  });

  // Challenge routes
  app.get('/api/challenge', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const challenge = await storage.getActiveChallenge();
      if (!challenge) {
        return res.json(null);
      }
      
      const progress = await storage.getUserChallengeProgress(userId, challenge.id);
      res.json({ challenge, progress });
    } catch (error) {
      console.error("Error fetching challenge:", error);
      res.status(500).json({ message: "Failed to fetch challenge" });
    }
  });

  // Leaderboard routes
  app.get('/api/leaderboard', isAuthenticated, async (req: any, res) => {
    try {
      const leaderboard = await storage.getLeaderboard();
      res.json(leaderboard);
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
      res.status(500).json({ message: "Failed to fetch leaderboard" });
    }
  });

  // Coding challenge routes
  app.get('/api/coding-challenge/personalized', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const challenge = await storage.getPersonalizedCodingChallenge(userId);
      res.json(challenge);
    } catch (error) {
      console.error("Error fetching personalized coding challenge:", error);
      res.status(500).json({ message: "Failed to fetch coding challenge" });
    }
  });

  app.post('/api/coding-submission', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const submission = await storage.createCodingSubmission({
        ...req.body,
        userId,
        status: 'submitted',
        score: 10, // Default score, can be updated later
      });
      res.json(submission);
    } catch (error) {
      console.error("Error creating coding submission:", error);
      res.status(500).json({ message: "Failed to submit solution" });
    }
  });

  app.get('/api/coding-leaderboard', isAuthenticated, async (req: any, res) => {
    try {
      const leaderboard = await storage.getCodingLeaderboard();
      res.json(leaderboard);
    } catch (error) {
      console.error("Error fetching coding leaderboard:", error);
      res.status(500).json({ message: "Failed to fetch coding leaderboard" });
    }
  });

  // Admin routes
  app.get('/api/admin/users', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const currentUser = await storage.getUser(userId);
      
      if (!currentUser?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.get('/api/admin/stats', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const currentUser = await storage.getUser(userId);
      
      if (!currentUser?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      const stats = await storage.getTotalStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  app.post('/api/admin/recommendations', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const currentUser = await storage.getUser(userId);
      
      if (!currentUser?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      const recommendationData = insertRecommendationSchema.parse(req.body);
      const recommendation = await storage.createRecommendation(recommendationData);
      res.json(recommendation);
    } catch (error) {
      console.error("Error creating recommendation:", error);
      res.status(400).json({ message: "Failed to create recommendation" });
    }
  });

  // Submit coding challenge solution with AI checking
  app.post('/api/coding-challenges/submit', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { challengeId, solution } = req.body;
      
      const result = await storage.submitCodingChallenge(userId, challengeId, solution);
      res.json(result);
    } catch (error) {
      console.error("Error submitting coding challenge:", error);
      res.status(500).json({ message: "Failed to submit solution" });
    }
  });

  // Get career guidance
  app.get('/api/career-guidance', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const guidance = await storage.getCareerGuidance(userId);
      res.json(guidance);
    } catch (error) {
      console.error("Error fetching career guidance:", error);
      res.status(500).json({ message: "Failed to fetch career guidance" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
