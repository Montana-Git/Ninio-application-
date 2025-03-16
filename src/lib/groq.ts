import Groq from "groq-sdk";

// Initialize the Groq client with API key
const groq = new Groq({
  apiKey: "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",
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
