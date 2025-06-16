import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Star, Users, MapPin, Calendar, DollarSign, ExternalLink } from "lucide-react";

interface RecommendationCardProps {
  recommendation: {
    id: number;
    title: string;
    description: string;
    type: string;
    url?: string;
    provider: string;
    imageUrl?: string;
    level?: string;
    duration?: string;
    price?: string;
    rating?: string;
    reviewCount?: string;
    matchPercentage?: number;
    deadline?: string;
    location?: string;
  };
}

const typeColors: Record<string, string> = {
  "Course": "primary",
  "Internship": "green",
  "Event": "yellow",
  "Certification": "purple",
};

export default function RecommendationCard({ recommendation }: RecommendationCardProps) {
  const typeColor = typeColors[recommendation.type] || "primary";
  
  const handleAction = () => {
    if (recommendation.url) {
      window.open(recommendation.url, '_blank');
    }
  };

  const getActionText = () => {
    switch (recommendation.type) {
      case "Course":
        return "View Details";
      case "Internship":
        return "Apply Now";
      case "Event":
        return "Register";
      case "Certification":
        return "Learn More";
      default:
        return "View Details";
    }
  };

  return (
    <Card className="border border-slate-200 hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start space-x-4">
          <div className="w-20 h-15 rounded-lg bg-slate-100 flex items-center justify-center overflow-hidden">
            {recommendation.imageUrl ? (
              <img 
                src={recommendation.imageUrl} 
                alt={recommendation.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-slate-400 text-2xl">
                {recommendation.type === "Course" && "📚"}
                {recommendation.type === "Internship" && "💼"}
                {recommendation.type === "Event" && "🎪"}
                {recommendation.type === "Certification" && "🏆"}
              </div>
            )}
          </div>
          
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-slate-800 mb-1">{recommendation.title}</h3>
                <p className="text-slate-600 text-sm mb-2 line-clamp-2">{recommendation.description}</p>
                
                <div className="flex items-center space-x-4 text-sm text-slate-500 mb-3">
                  {recommendation.duration && (
                    <span className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {recommendation.duration}
                    </span>
                  )}
                  {recommendation.rating && (
                    <span className="flex items-center">
                      <Star className="h-4 w-4 mr-1" />
                      {recommendation.rating} ({recommendation.reviewCount})
                    </span>
                  )}
                  {recommendation.location && (
                    <span className="flex items-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      {recommendation.location}
                    </span>
                  )}
                  {recommendation.deadline && (
                    <span className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      Deadline: {new Date(recommendation.deadline).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
              
              <div className="text-right">
                <Badge variant={typeColor as any} className="mb-2">
                  {recommendation.type}
                </Badge>
                {recommendation.price && (
                  <div className="text-right">
                    {recommendation.price === "FREE" || recommendation.price === "Free" ? (
                      <span className="text-lg font-bold text-green-600">FREE</span>
                    ) : (
                      <span className="text-lg font-bold text-slate-800">{recommendation.price}</span>
                    )}
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Badge variant="secondary" className="text-xs">
                  {recommendation.provider}
                </Badge>
                {recommendation.matchPercentage && (
                  <span className="text-xs text-green-600 font-medium">
                    {recommendation.matchPercentage}% match
                  </span>
                )}
              </div>
              <Button onClick={handleAction} size="sm">
                {getActionText()}
                <ExternalLink className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
