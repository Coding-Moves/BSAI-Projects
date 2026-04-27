
import { GoogleGenAI } from "@google/genai";

export const getSecurityInsights = async (logs: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `As a cybersecurity expert, analyze these application logs and provide a brief security health report. Logs: ${logs}`,
    config: {
      systemInstruction: "You are a Senior Security Auditor for an encrypted cloud storage platform. Provide concise, professional insights.",
      temperature: 0.7,
    },
  });
  return response.text;
};

export const generateAcademicReport = async (username: string, fileCount: number) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Generate a 300-word academic summary for a project titled "Secure Cloud Storage and File Sharing System". The project belongs to student "${username}" and currently hosts ${fileCount} encrypted objects. Use professional academic tone. Focus on AES-256 and RSA-2048 implementation.`,
    config: {
      systemInstruction: "You are a professor specializing in Information Security. Write a project report outline suitable for university submission.",
    }
  });
  return response.text;
};

// Added history to ai.chats.create to ensure the model retains conversation context
export const chatWithSecurityExpert = async (history: {role: 'user' | 'model', parts: {text: string}[]}[], message: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const chat = ai.chats.create({
    model: 'gemini-3-flash-preview',
    history: history as any,
    config: {
      systemInstruction: "You are an AI Security Consultant. You answer questions specifically about cryptography, AES, RSA, and secure file sharing. Keep answers technical yet accessible for university students.",
    },
  });
  
  const response = await chat.sendMessage({ message });
  return response.text;
};
