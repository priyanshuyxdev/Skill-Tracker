import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import Navigation from "@/components/navigation";
import SkillCard from "@/components/skill-card";
import AddSkillDialog from "@/components/add-skill-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Plus, Search, Filter, TrendingUp, Code, Award } from "lucide-react";

export default function Skills() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [showAddSkill, setShowAddSkill] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedLevel, setSelectedLevel] = useState("all");

  const { data: skills = [], refetch: refetchSkills } = useQuery({
    queryKey: ["/api/skills"],
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

  // Filter skills based on search and filters
  const filteredSkills = skills.filter((skill: any) => {
    const matchesSearch = skill.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || skill.category === selectedCategory;
    const matchesLevel = selectedLevel === "all" || skill.level === selectedLevel;
    return matchesSearch && matchesCategory && matchesLevel;
  });

  // Get unique categories and skill stats
  const categories = [...new Set(skills.map((skill: any) => skill.category))];
  const avgProgress = skills.length > 0 ? skills.reduce((sum: number, skill: any) => sum + skill.progress, 0) / skills.length : 0;
  const advancedSkills = skills.filter((skill: any) => skill.level === "Advanced").length;
  const skillsWithCerts = skills.filter((skill: any) => skill.certificateUrl).length;

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">My Skills</h1>
            <p className="text-slate-600 mt-2">Track and manage your technical skills and certifications</p>
          </div>
          <Button onClick={() => setShowAddSkill(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add New Skill
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600 font-medium">Total Skills</p>
                  <p className="text-2xl font-bold text-blue-800">{skills.length}</p>
                </div>
                <Code className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-600 font-medium">Average Progress</p>
                  <p className="text-2xl font-bold text-green-800">{Math.round(avgProgress)}%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-600 font-medium">Advanced Level</p>
                  <p className="text-2xl font-bold text-purple-800">{advancedSkills}</p>
                </div>
                <Award className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-orange-600 font-medium">Certified</p>
                  <p className="text-2xl font-bold text-orange-800">{skillsWithCerts}</p>
                </div>
                <Award className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Skills Content */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                  <CardTitle className="text-2xl">Skills Portfolio</CardTitle>
                  
                  {/* Search and Filters */}
                  <div className="flex flex-wrap gap-2 items-center">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                      <Input
                        placeholder="Search skills..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 w-48"
                      />
                    </div>
                    
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                      <SelectTrigger className="w-36">
                        <SelectValue placeholder="Level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Levels</SelectItem>
                        <SelectItem value="Beginner">Beginner</SelectItem>
                        <SelectItem value="Intermediate">Intermediate</SelectItem>
                        <SelectItem value="Advanced">Advanced</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredSkills.map((skill: any) => (
                    <SkillCard 
                      key={skill.id} 
                      skill={skill} 
                      onUpdate={refetchSkills}
                    />
                  ))}
                </div>

                {filteredSkills.length === 0 && skills.length > 0 && (
                  <div className="text-center py-8">
                    <p className="text-slate-500 mb-4">No skills match your current filters</p>
                    <Button variant="outline" onClick={() => {
                      setSearchTerm("");
                      setSelectedCategory("all");
                      setSelectedLevel("all");
                    }}>
                      Clear Filters
                    </Button>
                  </div>
                )}

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
          </div>

          {/* Skills Summary Sidebar */}
          <div className="space-y-6">
            {/* Skill Categories */}
            <Card>
              <CardHeader>
                <CardTitle>Skill Categories</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {categories.map((category) => {
                    const categorySkills = skills.filter((skill: any) => skill.category === category);
                    const categoryProgress = categorySkills.length > 0 
                      ? categorySkills.reduce((sum: number, skill: any) => sum + skill.progress, 0) / categorySkills.length 
                      : 0;
                    
                    return (
                      <div key={category} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-slate-700">{category}</span>
                          <Badge variant="secondary">{categorySkills.length}</Badge>
                        </div>
                        <Progress value={categoryProgress} className="h-2" />
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Updates</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {skills
                    .sort((a: any, b: any) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
                    .slice(0, 5)
                    .map((skill: any) => (
                      <div key={skill.id} className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-slate-800">{skill.name}</p>
                          <p className="text-xs text-slate-500">
                            Updated {new Date(skill.updatedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
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