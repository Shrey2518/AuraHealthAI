
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { UserProfile, Message } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeHealthScore = async (profile: UserProfile) => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Analyze this wellness profile: ${JSON.stringify(profile)}. 
    
    STRICT LANGUAGE RULES:
    1. DO NOT use words like: "disease", "danger", "critical", "you have", "risk".
    2. ALWAYS USE positive, preventive language like: "early insight", "wellness trend", "health signal", "preventive awareness", "optimization opportunity".
    3. Treat all findings as trends and signals for optimization rather than diagnostic risks.
    
    TASKS:
    1. Provide a wellness score (0-100).
    2. Identify wellness trends and health signal trajectories.
    3. Categorize into a Preventive Awareness level: "Stable", "Improving", or "Watchful".
    4. Provide specific percentages for wellness optimization trends.
    5. List priority preventive actions for optimal health.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          score: { type: Type.NUMBER },
          wellnessLevel: { type: Type.STRING },
          keyInsights: { type: Type.ARRAY, items: { type: Type.STRING } },
          priorityActions: { type: Type.ARRAY, items: { type: Type.STRING } },
          wellnessTrends: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                trend: { type: Type.STRING },
                strength: { type: Type.NUMBER }
              },
              required: ["trend", "strength"]
            }
          }
        },
        required: ["score", "wellnessLevel", "keyInsights", "priorityActions", "wellnessTrends"],
      }
    }
  });
  return JSON.parse(response.text || '{}');
};

export const getHabitFeedback = async (profile: UserProfile) => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Based on this wellness profile: ${JSON.stringify(profile)}, provide 3 optimization tips using strictly positive and preventive language. Avoid medical jargon like "disease" or "danger".`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            tip: { type: Type.STRING },
          },
          required: ["title", "tip"],
        },
      }
    }
  });
  return JSON.parse(response.text || '[]');
};

export const chatWithAssistant = async (history: Message[], userInput: string, clinicalSummary?: string) => {
  const chat = ai.chats.create({
    model: 'gemini-3-flash-preview',
    config: {
      systemInstruction: `You are AuraChat, an advanced wellness AI assistant. 
      Context: ${clinicalSummary || 'Analyzing wellness signals'}.
      
      STRICT LANGUAGE RULES:
      1. Use ONLY positive, preventive terminology. 
      2. Avoid words like "disease", "danger", "critical", "you have", "risk".
      3. Use "early insight", "wellness trend", "health signal", and "preventive awareness".
      4. If the user asks about a "disease", pivot to discussing "wellness management" or "health signals".
      5. Be professional, supportive, and snappily empathetic. 🧘✨`,
    }
  });

  const response = await chat.sendMessage({ message: userInput });
  return response.text;
};

export const getStressFeedback = async (stressLevel: number) => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Give an encouraging wellness insight for someone with a stress sensitivity reading of ${stressLevel}/100. Use strictly positive and preventive language.`,
  });
  return response.text;
};

export const generateHealingStory = async (stressLevel: number) => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Write a 100-word positive healing visualization journey focused on "wellness trends" and "health signals". Use strictly positive language. Avoid all negative medical terminology.`,
  });
  return response.text;
};

export const reciteText = async (text: string) => {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text: `Read this encouraging wellness text: ${text}` }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: 'Kore' },
        },
      },
    },
  });
  return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
};

export const generateDoctorSummary = async (profile: UserProfile) => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Create a professional "Wellness Optimization Signature" in HTML for this profile: ${JSON.stringify(profile)}. Focus on wellness trends, health signals, and preventive awareness. Use ONLY positive language. Avoid clinical jargon like "disease risk".`,
  });
  return response.text;
};
