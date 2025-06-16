import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import Navigation from "@/components/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Trophy, Medal, Award, TrendingUp, Users, Crown } from "lucide-react";

export default function Leaderboard() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const { toast } = useToast();

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

  const userRank = leaderboard.findIndex((entry: any) => entry.user.id === user?.id) + 1;
  const topThree = leaderboard.slice(0, 3);
  const restOfLeaderboard = leaderboard.slice(3);

  const getRankIcon = (position: number) => {
    switch (position) {
      case 1:
        return <Crown className="h-6 w-6 text-yellow-500" />;
      case 2:
        return <Medal className="h-6 w-6 text-slate-400" />;
      case 3:
        return <Award className="h-6 w-6 text-amber-600" />;
      default:
        return <Trophy className="h-5 w-5 text-slate-400" />;
    }
  };

  const getRankBackground = (position: number) => {
    switch (position) {
      case 1:
        return "bg-gradient-to-r from-yellow-400 to-yellow-600 text-white";
      case 2:
        return "bg-gradient-to-r from-slate-300 to-slate-500 text-white";
      case 3:
        return "bg-gradient-to-r from-amber-400 to-amber-600 text-white";
      default:
        return "bg-white border border-slate-200";
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            <Trophy className="h-10 w-10 text-yellow-500 inline-block mr-3" />
            Leaderboard
          </h1>
          <p className="text-slate-600 text-lg">See how you rank among your peers in skill development</p>
        </div>

        {/* Your Rank Card */}
        {userRank > 0 && (
          <Card className="mb-8 border-primary bg-primary/5">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
                    <span className="text-2xl font-bold text-white">#{userRank}</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">Your Current Rank</h3>
                    <p className="text-slate-600">
                      You have {leaderboard.find((entry: any) => entry.user.id === user?.id)?.skillCount || 0} skills tracked
                    </p>
                  </div>
                </div>
                <Badge variant="default" className="text-lg px-4 py-2">
                  Rank #{userRank}
                </Badge>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Top 3 Podium */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6 text-center">Top Performers</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {topThree.map((entry: any, index: number) => {
              const position = index + 1;
              return (
                <Card key={entry.user.id} className={`${getRankBackground(position)} border-0 shadow-lg`}>
                  <CardContent className="p-6 text-center">
                    <div className="mb-4">
                      {getRankIcon(position)}
                    </div>
                    <Avatar className="w-20 h-20 mx-auto mb-4 border-4 border-white">
                      <AvatarImage 
                        src={entry.user.profileImageUrl || `https://ui-avatars.com/api/?name=${entry.user.firstName}+${entry.user.lastName}&background=3b82f6&color=ffffff`}
                        alt={`${entry.user.firstName} ${entry.user.lastName}`}
                      />
                      <AvatarFallback className="text-lg font-bold">
                        {entry.user.firstName?.[0]}{entry.user.lastName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <h3 className={`text-xl font-bold mb-2 ${position > 3 ? 'text-slate-900' : ''}`}>
                      {entry.user.firstName} {entry.user.lastName}
                    </h3>
                    <p className={`text-sm mb-3 ${position > 3 ? 'text-slate-600' : 'text-white/80'}`}>
                      {entry.user.college}
                    </p>
                    <div className={`text-3xl font-bold ${position > 3 ? 'text-primary' : ''}`}>
                      {entry.skillCount}
                    </div>
                    <p className={`text-sm ${position > 3 ? 'text-slate-600' : 'text-white/80'}`}>
                      Skills Mastered
                    </p>
                    {entry.user.id === user?.id && (
                      <Badge variant="secondary" className="mt-2">
                        You
                      </Badge>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Complete Leaderboard */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-6 w-6" />
              <span>Complete Rankings</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {leaderboard.map((entry: any, index: number) => {
                const position = index + 1;
                const isCurrentUser = entry.user.id === user?.id;
                
                return (
                  <div
                    key={entry.user.id}
                    className={`flex items-center justify-between p-4 rounded-lg transition-colors ${
                      isCurrentUser 
                        ? 'bg-primary/10 border-2 border-primary/30' 
                        : 'bg-slate-50 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        position <= 3 
                          ? getRankBackground(position) 
                          : 'bg-slate-200 text-slate-600'
                      }`}>
                        {position <= 3 ? (
                          getRankIcon(position)
                        ) : (
                          <span className="font-bold">#{position}</span>
                        )}
                      </div>
                      
                      <Avatar className="w-12 h-12">
                        <AvatarImage 
                          src={entry.user.profileImageUrl || `https://ui-avatars.com/api/?name=${entry.user.firstName}+${entry.user.lastName}&background=3b82f6&color=ffffff`}
                          alt={`${entry.user.firstName} ${entry.user.lastName}`}
                        />
                        <AvatarFallback>
                          {entry.user.firstName?.[0]}{entry.user.lastName?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div>
                        <h4 className="font-semibold text-slate-900">
                          {entry.user.firstName} {entry.user.lastName}
                          {isCurrentUser && (
                            <Badge variant="default" className="ml-2">You</Badge>
                          )}
                        </h4>
                        <p className="text-sm text-slate-600">
                          {entry.user.course} • {entry.user.college}
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-2xl font-bold text-slate-900">
                        {entry.skillCount}
                      </div>
                      <p className="text-sm text-slate-600">Skills</p>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {leaderboard.length === 0 && (
              <div className="text-center py-8">
                <Trophy className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500 text-lg">No rankings available yet</p>
                <p className="text-slate-400">Be the first to add skills and claim the top spot!</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <Card>
            <CardContent className="p-6 text-center">
              <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-3" />
              <h3 className="font-semibold text-slate-800 mb-2">Average Skills</h3>
              <div className="text-2xl font-bold text-green-600">
                {leaderboard.length > 0 
                  ? Math.round(leaderboard.reduce((sum: number, entry: any) => sum + entry.skillCount, 0) / leaderboard.length)
                  : 0
                }
              </div>
              <p className="text-sm text-slate-600">per student</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <Users className="h-8 w-8 text-blue-600 mx-auto mb-3" />
              <h3 className="font-semibold text-slate-800 mb-2">Total Students</h3>
              <div className="text-2xl font-bold text-blue-600">{leaderboard.length}</div>
              <p className="text-sm text-slate-600">actively tracking skills</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <Trophy className="h-8 w-8 text-yellow-600 mx-auto mb-3" />
              <h3 className="font-semibold text-slate-800 mb-2">Top Score</h3>
              <div className="text-2xl font-bold text-yellow-600">
                {leaderboard.length > 0 ? leaderboard[0]?.skillCount || 0 : 0}
              </div>
              <p className="text-sm text-slate-600">skills mastered</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}