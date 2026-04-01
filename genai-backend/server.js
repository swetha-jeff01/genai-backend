require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { OpenAI } = require('openai');

const app = express();

// Enable CORS
app.use(cors());
app.use(express.json());

// Initialize AI using Groq
const ai = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

app.post('/api/generate', async (req, res) => {
  try { 
    // 1. Get the prompt sent from your frontend (assuming frontend sends { "prompt": "..." })
    const userPrompt = req.body.prompt;

    // 2. Make sure the prompt isn't empty
    if (!userPrompt) {
      return res.status(400).json({ error: "Please provide a prompt." });
    }

    // 3. Call the AI with the CORRECT model and the user's prompt
    const completion = await ai.chat.completions.create({
      model: "llama-3.1-8b-instant", // <-- The updated Groq model!
      messages: [
        { role: "system", content: "You are a helpful AI assistant that writes engaging tweets." },
        { role: "user", content: userPrompt }
      ],
    });

    // 4. Send the AI's tweet back to the frontend
    res.json({ result: completion.choices[0].message.content });

  } catch (error) { 
    console.error("Error generating tweet:", error);
    res.status(500).json({ error: "Failed to generate tweet" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Backend server is running on port ${PORT}`);
});