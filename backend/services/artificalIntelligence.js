import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_AI});

async function aichat(prompt) {
    const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: prompt,
    });
    return response.text;
}

export default aichat;