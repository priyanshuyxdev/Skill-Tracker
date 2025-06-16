import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

interface SolutionCheckResult {
  isCorrect: boolean;
  score: number;
  feedback: string;
  suggestions: string[];
}

export async function checkCodingSolution(
  problemStatement: string,
  expectedOutput: string,
  userSolution: string,
  difficulty: string
): Promise<SolutionCheckResult> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an expert programming instructor. Evaluate the student's code solution against the problem requirements. 
          
          Provide feedback in JSON format with:
          - isCorrect: boolean (true if solution meets requirements)
          - score: number (0-100 based on correctness, efficiency, and code quality)
          - feedback: string (detailed explanation of strengths/weaknesses)
          - suggestions: array of strings (specific improvement recommendations)
          
          Consider: correctness, efficiency, readability, best practices, and edge cases.`
        },
        {
          role: "user",
          content: `Problem: ${problemStatement}
          
          Expected behavior: ${expectedOutput}
          
          Difficulty: ${difficulty}
          
          Student's solution:
          \`\`\`
          ${userSolution}
          \`\`\`
          
          Please evaluate this solution and respond with JSON only.`
        }
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    
    return {
      isCorrect: result.isCorrect || false,
      score: Math.max(0, Math.min(100, result.score || 0)),
      feedback: result.feedback || "Unable to evaluate solution",
      suggestions: result.suggestions || []
    };
  } catch (error) {
    console.error("Error checking solution:", error);
    return {
      isCorrect: false,
      score: 0,
      feedback: "Error occurred while checking solution. Please try again.",
      suggestions: ["Please ensure your code is properly formatted and try again."]
    };
  }
}

export async function generateCareerGuidance(
  currentSkills: string[],
  targetJobRole: string,
  currentLevel: string
): Promise<{
  roadmap: string[];
  suggestedSkills: string[];
  timelineWeeks: number;
  resources: string[];
}> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a career guidance expert. Create a personalized learning roadmap for students.
          
          Provide response in JSON format with:
          - roadmap: array of learning steps in order
          - suggestedSkills: array of skills to learn next
          - timelineWeeks: estimated weeks to reach target role
          - resources: array of specific learning resource types`
        },
        {
          role: "user",
          content: `Current skills: ${currentSkills.join(', ')}
          Target job role: ${targetJobRole}
          Current level: ${currentLevel}
          
          Create a practical learning roadmap to reach the target role.`
        }
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    
    return {
      roadmap: result.roadmap || [],
      suggestedSkills: result.suggestedSkills || [],
      timelineWeeks: result.timelineWeeks || 12,
      resources: result.resources || []
    };
  } catch (error) {
    console.error("Error generating career guidance:", error);
    return {
      roadmap: ["Complete your profile and add more skills to get personalized guidance"],
      suggestedSkills: [],
      timelineWeeks: 12,
      resources: []
    };
  }
}