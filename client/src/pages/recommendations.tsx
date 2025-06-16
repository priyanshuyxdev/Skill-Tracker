import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import Navigation from "@/components/navigation";
import RecommendationCard from "@/components/recommendation-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Filter, BookOpen, Briefcase, Calendar, Award } from "lucide-react";

export default function Recommendations() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedLevel, setSelectedLevel] = useState("all");
  const [selectedProvider, setSelectedProvider] = useState("all");

  const { data: recommendations = [] } = useQuery({
    queryKey: ["/api/recommendations/personalized"],
    enabled: isAuthenticated,
  });

  const { data: skills = [] } = useQuery({
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

  // Filter recommendations based on search and filters
  const filteredRecommendations = recommendations.filter((rec: any) => {
    const matchesSearch = rec.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         rec.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === "all" || rec.type === selectedType;
    const matchesLevel = selectedLevel === "all" || rec.level === selectedLevel;
    const matchesProvider = selectedProvider === "all" || rec.provider === selectedProvider;
    return matchesSearch && matchesType && matchesLevel && matchesProvider;
  });

  // Group recommendations by type
  const recommendationsByType = {
    Course: filteredRecommendations.filter((rec: any) => rec.type === "Course"),
    Internship: filteredRecommendations.filter((rec: any) => rec.type === "Internship"),
    Event: filteredRecommendations.filter((rec: any) => rec.type === "Event"),
    Certification: filteredRecommendations.filter((rec: any) => rec.type === "Certification"),
  };

  // Get unique providers
  const providers = [...new Set(recommendations.map((rec: any) => rec.provider))];

  // Get personalized recommendations based on user skills
  const userSkillNames = skills.map((skill: any) => skill.name.toLowerCase());
  const personalizedRecs = recommendations.filter((rec: any) => {
    if (!rec.tags) return false;
    return rec.tags.some((tag: string) => 
      userSkillNames.some(skill => 
        skill.includes(tag.toLowerCase()) || tag.toLowerCase().includes(skill)
      )
    );
  });

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Recommendations</h1>
          <p className="text-slate-600 mt-2">Discover courses, internships, events, and certifications tailored to your skills</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600 font-medium">Courses</p>
                  <p className="text-2xl font-bold text-blue-800">{recommendationsByType.Course.length}</p>
                </div>
                <BookOpen className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-600 font-medium">Internships</p>
                  <p className="text-2xl font-bold text-green-800">{recommendationsByType.Internship.length}</p>
                </div>
                <Briefcase className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-600 font-medium">Events</p>
                  <p className="text-2xl font-bold text-purple-800">{recommendationsByType.Event.length}</p>
                </div>
                <Calendar className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-orange-600 font-medium">Certifications</p>
                  <p className="text-2xl font-bold text-orange-800">{recommendationsByType.Certification.length}</p>
                </div>
                <Award className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Search and Filters */}
            <Card className="mb-6">
              <CardContent className="p-6">
                <div className="flex flex-wrap gap-4 items-center">
                  <div className="relative flex-1 min-w-64">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                    <Input
                      placeholder="Search recommendations..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  
                  <Select value={selectedType} onValueChange={setSelectedType}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="Course">Courses</SelectItem>
                      <SelectItem value="Internship">Internships</SelectItem>
                      <SelectItem value="Event">Events</SelectItem>
                      <SelectItem value="Certification">Certifications</SelectItem>
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
                  
                  <Select value={selectedProvider} onValueChange={setSelectedProvider}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Provider" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Providers</SelectItem>
                      {providers.map((provider) => (
                        <SelectItem key={provider} value={provider}>
                          {provider}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setSearchTerm("");
                      setSelectedType("all");
                      setSelectedLevel("all");
                      setSelectedProvider("all");
                    }}
                  >
                    Clear Filters
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Recommendations Tabs */}
            <Tabs defaultValue="all" className="space-y-6">
              <TabsList>
                <TabsTrigger value="all">All ({filteredRecommendations.length})</TabsTrigger>
                <TabsTrigger value="personalized">For You ({personalizedRecs.length})</TabsTrigger>
                <TabsTrigger value="courses">Courses ({recommendationsByType.Course.length})</TabsTrigger>
                <TabsTrigger value="internships">Internships ({recommendationsByType.Internship.length})</TabsTrigger>
                <TabsTrigger value="events">Events ({recommendationsByType.Event.length})</TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="space-y-4">
                {filteredRecommendations.map((rec: any) => (
                  <RecommendationCard key={rec.id} recommendation={rec} />
                ))}
                {filteredRecommendations.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-slate-500">No recommendations match your current filters</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="personalized" className="space-y-4">
                {personalizedRecs.length > 0 ? (
                  <>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                      <h3 className="font-semibold text-blue-800 mb-2">Personalized for Your Skills</h3>
                      <p className="text-blue-600 text-sm">
                        These recommendations are matched to your current skills: {userSkillNames.slice(0, 3).join(", ")}
                        {userSkillNames.length > 3 && ` and ${userSkillNames.length - 3} more`}
                      </p>
                    </div>
                    {personalizedRecs.map((rec: any) => (
                      <RecommendationCard key={rec.id} recommendation={rec} />
                    ))}
                  </>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-slate-500 mb-4">No personalized recommendations available yet</p>
                    <p className="text-slate-400 text-sm">Add more skills to your profile to get better recommendations</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="courses" className="space-y-4">
                {recommendationsByType.Course.map((rec: any) => (
                  <RecommendationCard key={rec.id} recommendation={rec} />
                ))}
              </TabsContent>

              <TabsContent value="internships" className="space-y-4">
                {recommendationsByType.Internship.map((rec: any) => (
                  <RecommendationCard key={rec.id} recommendation={rec} />
                ))}
              </TabsContent>

              <TabsContent value="events" className="space-y-4">
                {recommendationsByType.Event.map((rec: any) => (
                  <RecommendationCard key={rec.id} recommendation={rec} />
                ))}
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Your Skills */}
            <Card>
              <CardHeader>
                <CardTitle>Your Skills</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {skills.slice(0, 6).map((skill: any) => (
                    <Badge key={skill.id} variant="secondary" className="mr-2 mb-2">
                      {skill.name}
                    </Badge>
                  ))}
                  {skills.length > 6 && (
                    <p className="text-xs text-slate-500">+{skills.length - 6} more skills</p>
                  )}
                  {skills.length === 0 && (
                    <p className="text-sm text-slate-500">No skills added yet</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Quick Filters */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Filters</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => setSelectedType("Course")}
                  >
                    <BookOpen className="h-4 w-4 mr-2" />
                    Online Courses
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => setSelectedType("Internship")}
                  >
                    <Briefcase className="h-4 w-4 mr-2" />
                    Internships
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => setSelectedType("Event")}
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    Upcoming Events
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => setSelectedType("Certification")}
                  >
                    <Award className="h-4 w-4 mr-2" />
                    Certifications
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Top Providers */}
            <Card>
              <CardHeader>
                <CardTitle>Top Providers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {providers.slice(0, 5).map((provider) => {
                    const providerCount = recommendations.filter((rec: any) => rec.provider === provider).length;
                    return (
                      <div key={provider} className="flex justify-between items-center">
                        <span className="text-sm text-slate-700">{provider}</span>
                        <Badge variant="secondary">{providerCount}</Badge>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}