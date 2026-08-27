import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Sends a question to Gemini along with gym data context.
 * @param {string} systemContext - Pre-built context string from the DB
 * @param {string} userQuestion  - The question asked by the user
 * @returns {Promise<string>}    - Gemini's answer as plain text
 */
export const getGymAnswer = async (systemContext, userQuestion) => {
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

  const prompt = `${systemContext}

USER QUESTION: ${userQuestion}

INSTRUCTIONS:
- Answer ONLY based on the gym data provided above.
- NEVER use the word 'undefined' in your response. If data is missing or zero, describe it naturally (e.g., 'Permanent access' or 'Contact us for more info').
- Format your response using clean Markdown: use bold (**plan name**) for keys and bullet points for lists.
- Keep answers concise, helpful, and professional.
- Include prices in LKR and relevant categories when mentioning plans or products.`;

  const result = await model.generateContent(prompt);
  return result.response.text();
};
