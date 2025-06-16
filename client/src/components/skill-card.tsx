import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { IdCard, Edit, Trash2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";

interface SkillCardProps {
  skill: {
    id: number;
    name: string;
    category: string;
    level: string;
    progress: number;
    certificateUrl?: string;
    updatedAt: string;
  };
  onUpdate: () => void;
}

const skillIcons: Record<string, string> = {
  "React.js": "fab fa-react",
  "Node.js": "fab fa-node-js",
  "Python": "fab fa-python",
  "JavaScript": "fab fa-js",
  "TypeScript": "fab fa-js",
  "HTML": "fab fa-html5",
  "CSS": "fab fa-css3",
  "Vue.js": "fab fa-vuejs",
  "Angular": "fab fa-angular",
  "PHP": "fab fa-php",
  "Java": "fab fa-java",
  "C++": "fas fa-code",
  "UI/UX Design": "fas fa-paint-brush",
  "Figma": "fab fa-figma",
  "Adobe XD": "fas fa-vector-square",
  "Photoshop": "fas fa-image",
};

const skillColors: Record<string, string> = {
  "React.js": "blue",
  "Node.js": "green",
  "Python": "orange",
  "JavaScript": "yellow",
  "TypeScript": "blue",
  "HTML": "orange",
  "CSS": "blue",
  "Vue.js": "green",
  "Angular": "red",
  "PHP": "purple",
  "Java": "red",
  "C++": "slate",
  "UI/UX Design": "purple",
  "Figma": "purple",
  "Adobe XD": "pink",
  "Photoshop": "blue",
};

const levelColors: Record<string, string> = {
  "Beginner": "blue",
  "Intermediate": "yellow",
  "Advanced": "green",
};

export default function SkillCard({ skill, onUpdate }: SkillCardProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const deleteSkillMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", `/api/skills/${skill.id}`);
    },
    onSuccess: () => {
      toast({
        title: "Skill deleted",
        description: "The skill has been removed from your profile.",
      });
      onUpdate();
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
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
      toast({
        title: "Error",
        description: "Failed to delete skill. Please try again.",
        variant: "destructive",
      });
    },
  });

  const color = skillColors[skill.name] || "slate";
  const icon = skillIcons[skill.name] || "fas fa-code";

  return (
    <Card className="border border-slate-200 hover:border-primary/30 hover:shadow-md transition-all cursor-pointer">
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 bg-${color}-100 rounded-lg flex items-center justify-center`}>
              <i className={`${icon} text-${color}-600`}></i>
            </div>
            <div>
              <h3 className="font-semibold text-slate-800">{skill.name}</h3>
              <span className="text-sm text-slate-500">{skill.category}</span>
            </div>
          </div>
          <Badge 
            variant={skill.level === "Advanced" ? "default" : skill.level === "Intermediate" ? "secondary" : "outline"}
            className={`${
              skill.level === "Advanced" 
                ? "bg-green-100 text-green-700" 
                : skill.level === "Intermediate"
                ? "bg-yellow-100 text-yellow-700"
                : "bg-blue-100 text-blue-700"
            }`}
          >
            {skill.level}
          </Badge>
        </div>
        
        <div className="mb-3">
          <div className="flex justify-between text-sm text-slate-600 mb-1">
            <span>Progress</span>
            <span>{skill.progress}%</span>
          </div>
          <Progress 
            value={skill.progress} 
            className={`h-2 ${
              skill.level === "Advanced" 
                ? "bg-green-200" 
                : skill.level === "Intermediate"
                ? "bg-yellow-200"
                : "bg-blue-200"
            }`}
          />
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-xs text-slate-500">
            Last updated: {new Date(skill.updatedAt).toLocaleDateString()}
          </span>
          <div className="flex items-center space-x-2">
            {skill.certificateUrl ? (
              <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">
                <IdCard className="h-4 w-4 mr-1" />
                View IdCard
              </Button>
            ) : (
              <Button variant="ghost" size="sm" className="text-slate-500">
                <IdCard className="h-4 w-4 mr-1" />
                Add IdCard
              </Button>
            )}
            <Button 
              variant="ghost" 
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                deleteSkillMutation.mutate();
              }}
              className="text-red-500 hover:text-red-600"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
