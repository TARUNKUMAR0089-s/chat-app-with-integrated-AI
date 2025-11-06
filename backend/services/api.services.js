import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const ai = new GoogleGenerativeAI(process.env.GOOGLE_AI_KEY);

const model = ai.getGenerativeModel({
  model: "gemini-2.5-flash"
});

//  Function to call Gemini
export const generateResult = async (prompt) => {
  try {
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (err) {
    console.error("Gemini Error:", err);
    return "AI error occurred!";
  }
};
