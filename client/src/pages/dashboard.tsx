import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import Navigation from "@/components/navigation";
import SkillCard from "@/components/skill-card";
import RecommendationCard from "@/components/recommendation-card";
import AddSkillDialog from "@/components/add-skill-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Trophy, Flame, Code, Plus } from "lucide-react";
import { useState } from "react";

export default function Dashboard() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [showAddSkill, setShowAddSkill] = useState(false);

  const { data: skills = [], refetch: refetchSkills } = useQuery({
    queryKey: ["/api/skills"],
    enabled: isAuthenticated,
  });

  const { data: badges = [] } = useQuery({
    queryKey: ["/api/badges"],
    enabled: isAuthenticated,
  });

  const { data: recommendations = [] } = useQuery({
    queryKey: ["/api/recommendations"],
    enabled: isAuthenticated,
  });

  const { data: challengeData } = useQuery({
    queryKey: ["/api/challenge"],
    enabled: isAuthenticated,
  });

  const { data: leaderboard = [] } = useQuery({
    queryKey: ["/api/leaderboard"],
    enabled: isAuthenticated,
  });

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  if (isLoading || !isAuthenticated) {
    return <div>Loading...</div>;
  }

  const userRank = leaderboard.findIndex(entry => entry.user.id === user?.id) + 1;
  const challenge = challengeData?.challenge;
  const challengeProgress = challengeData?.progress;

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-primary to-blue-600 rounded-2xl p-8 mb-8 text-white">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                Welcome back, {user?.firstName || "Student"}! 🎓
              </h1>
              <p className="text-blue-100 text-lg">
                {user?.course || "Computer Science"} • {user?.college || "University"} • Class of {user?.graduationYear || "2025"}
              </p>
              <div className="flex items-center space-x-6 mt-4">
                <div className="flex items-center space-x-2">
                  <Code className="h-5 w-5 text-blue-200" />
                  <span>{skills.length} Skills Mastered</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Trophy className="h-5 w-5 text-blue-200" />
                  <span>{badges.length} Badges Earned</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Flame className="h-5 w-5 text-blue-200" />
                  <span>15 Day Streak</span>
                </div>
              </div>
            </div>
            <div className="mt-6 md:mt-0">
              <Button 
                variant="secondary" 
                className="bg-white text-primary hover:bg-blue-50"
                onClick={() => setShowAddSkill(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add New Skill
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Skills Overview */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-2xl">My Skills</CardTitle>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      <Trophy className="h-4 w-4 mr-2" />
                      View Analytics
                    </Button>
                    <Button variant="outline" size="sm">
                      Filter
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3 mb-6">
                  <Badge variant="default">All Skills</Badge>
                  <Badge variant="secondary">Programming</Badge>
                  <Badge variant="secondary">Design</Badge>
                  <Badge variant="secondary">Data Science</Badge>
                  <Badge variant="secondary">Marketing</Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {skills.map((skill: any) => (
                    <SkillCard 
                      key={skill.id} 
                      skill={skill} 
                      onUpdate={refetchSkills}
                    />
                  ))}
                </div>

                {skills.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-slate-500 mb-4">No skills added yet</p>
                    <Button onClick={() => setShowAddSkill(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Your First Skill
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recommendations */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-2xl">Recommended for You</CardTitle>
                  <div className="flex space-x-2">
                    <select className="border border-slate-300 rounded-lg px-3 py-2 text-sm">
                      <option>All Types</option>
                      <option>Courses</option>
                      <option>Internships</option>
                      <option>Events</option>
                    </select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recommendations.map((rec: any) => (
                    <RecommendationCard key={rec.id} recommendation={rec} />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Recent Achievements */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Achievements</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {badges.slice(0, 3).map((badge: any) => (
                    <div key={badge.id} className="flex items-center space-x-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                        <Trophy className="h-6 w-6 text-yellow-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-800">{badge.name}</h4>
                        <p className="text-sm text-slate-600">{badge.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Leaderboard */}
            <Card>
              <CardHeader>
                <CardTitle>Leaderboard</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {leaderboard.slice(0, 5).map((entry: any, index: number) => (
                    <div 
                      key={entry.user.id} 
                      className={`flex items-center justify-between p-3 rounded-lg ${
                        entry.user.id === user?.id ? 'bg-primary-50 border border-primary-200' : 'hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          index === 0 ? 'bg-yellow-100' : 'bg-slate-100'
                        }`}>
                          <span className={`text-sm font-bold ${
                            index === 0 ? 'text-yellow-600' : 'text-slate-600'
                          }`}>
                            {index + 1}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-slate-800">
                            {entry.user.firstName} {entry.user.lastName}
                            {entry.user.id === user?.id && " (You)"}
                          </p>
                          <p className="text-xs text-slate-500">
                            {entry.user.college}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-slate-800">{entry.skillCount} skills</p>
                      </div>
                    </div>
                  ))}
                </div>
                {userRank > 5 && (
                  <div className="mt-4 pt-4 border-t border-slate-200">
                    <p className="text-sm text-slate-600">Your rank: #{userRank}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Weekly Challenge */}
            {challenge && (
              <Card className="bg-gradient-to-br from-purple-500 to-pink-500 text-white border-0">
                <CardContent className="p-6">
                  <h3 className="text-lg font-bold mb-2">Weekly Challenge 🎯</h3>
                  <p className="text-purple-100 mb-4">{challenge.description}</p>
                  
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Progress</span>
                      <span>{challengeProgress?.progress || 0}/{challenge.targetCount}</span>
                    </div>
                    <Progress 
                      value={((challengeProgress?.progress || 0) / challenge.targetCount) * 100} 
                      className="bg-purple-300"
                    />
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-purple-200">
                        Ends {new Date(challenge.endDate).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-purple-200">
                        Reward: {challenge.rewardBadge}
                      </p>
                    </div>
                    <Button variant="secondary" size="sm">
                      Continue
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      <AddSkillDialog 
        open={showAddSkill} 
        onOpenChange={setShowAddSkill}
        onSkillAdded={refetchSkills}
      />
    </div>
  );
}
