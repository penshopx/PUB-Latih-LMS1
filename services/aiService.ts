import { GoogleGenAI, Type } from "@google/genai";
import { CourseModule, UserRole } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Generate structured course modules using Gemini 2.5 Flash and JSON Schema
export const generateCourseStructure = async (topic: string): Promise<{ modules: CourseModule[], description: string }> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Create a detailed course curriculum and a concise description for a course titled "${topic}". 
      Include 3-5 modules. Mix 'video', 'text', and 'quiz' types.
      For quizzes, include 2 multiple choice questions.
      For videos, provide a mock transcript.
      For text, provide markdown content.
      The description should be a short paragraph summarizing the course value proposition.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            description: { type: Type.STRING },
            modules: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  title: { type: Type.STRING },
                  type: { type: Type.STRING, enum: ["video", "text", "quiz", "live"] },
                  duration: { type: Type.STRING },
                  isCompleted: { type: Type.BOOLEAN },
                  // Optional fields depending on type
                  textContent: { type: Type.STRING },
                  transcript: { type: Type.STRING },
                  quizData: {
                    type: Type.OBJECT,
                    properties: {
                      id: { type: Type.STRING },
                      title: { type: Type.STRING },
                      questions: {
                        type: Type.ARRAY,
                        items: {
                          type: Type.OBJECT,
                          properties: {
                            id: { type: Type.STRING },
                            text: { type: Type.STRING },
                            type: { type: Type.STRING },
                            options: { type: Type.ARRAY, items: { type: Type.STRING } },
                            correctAnswer: { type: Type.INTEGER }
                          }
                        }
                      }
                    }
                  }
                },
                required: ["title", "type", "duration"]
              }
            }
          },
          required: ["description", "modules"]
        }
      }
    });

    if (response.text) {
      const data = JSON.parse(response.text);
      // Ensure unique IDs
      const modules = data.modules.map((m: any, i: number) => ({
        ...m,
        id: `gen-${Date.now()}-${i}`,
        isCompleted: false
      }));
      return { modules, description: data.description || '' };
    }
    return { modules: [], description: '' };
  } catch (error) {
    console.error("AI Generation Error:", error);
    // Fallback if API fails or key is missing
    return {
      modules: [
        {
          id: `fallback-${Date.now()}`,
          title: `Introduction to ${topic}`,
          type: 'text',
          duration: '10:00',
          isCompleted: false,
          textContent: `# ${topic}\n\nThis content was generated as a fallback because the AI service could not be reached.`
        }
      ],
      description: `Learn the fundamentals of ${topic} in this comprehensive course.`
    };
  }
};

export const chatWithAI = async (message: string, role: UserRole): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: message,
      config: {
        systemInstruction: `You are a helpful LMS assistant acting as a mentor for a ${role}. 
        Keep answers concise (under 50 words). 
        If user is Instructor, help with pedagogy. 
        If Learner, help with studying. 
        If Admin, help with analytics.`
      }
    });
    return response.text || "I'm having trouble thinking right now.";
  } catch (error) {
    console.error("AI Chat Error:", error);
    return "I am currently offline. Please check your connection.";
  }
};