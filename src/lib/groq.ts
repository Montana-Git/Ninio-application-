import Groq from "groq-sdk";
import { getEnvVariable } from "@/utils/env";

// Get API key from environment variables with validation
const apiKey = getEnvVariable('VITE_GROQ_API_KEY', { required: true });

// Initialize the Groq client with API key
// SECURITY WARNING: We're allowing browser usage with dangerouslyAllowBrowser: true
// This is NOT recommended for production environments as it exposes your API key.
//
// For production, you should implement a server-side proxy like this:
// 1. Create a backend API endpoint (e.g., /api/chat)
// 2. Make requests to your backend instead of directly to Groq
// 3. Your backend keeps the API key secure and forwards requests to Groq
// 4. Example backend code:
//    ```
//    app.post('/api/chat', async (req, res) => {
//      try {
//        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
//          method: 'POST',
//          headers: {
//            'Content-Type': 'application/json',
//            'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
//          },
//          body: JSON.stringify(req.body)
//        });
//        const data = await response.json();
//        res.json(data);
//      } catch (error) {
//        res.status(500).json({ error: error.message });
//      }
//    });
//    ```
const groq = new Groq({
  apiKey,
  dangerouslyAllowBrowser: true, // Required for browser environments
});

export async function getGroqChatCompletion(messages: any[]) {
  try {
    return await groq.chat.completions.create({
      messages,
      model: "llama-3.3-70b-versatile",
      temperature: 0.7,
      max_tokens: 500,
    });
  } catch (error) {
    console.error("Error calling Groq API:", error);
    throw error;
  }
}
