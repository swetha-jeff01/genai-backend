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
    // Get the prompt sent from your frontend
    const userPrompt = req.body.prompt;

    if (!userPrompt) {
      return res.status(400).json({ error: "Please provide a prompt." });
    }

    // Call Groq AI
    const completion = await ai.chat.completions.create({
      model: "llama-3.1-8b-instant", // Ensure this is the correct model!
      messages: [
        { role: "system", content: "You are a helpful AI assistant that writes engaging tweets." },
        { role: "user", content: userPrompt }
      ],
    });

    // Send the AI's tweet back to the frontend
    res.json({ result: completion.choices[0].message.content });

  } catch (error) { 
    // This is the better error logging you added on GitHub!
    console.error("FULL ERROR:", error);
    res.status(500).json({ 
      error: error.message,
      details: error.response?.data
    });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Backend server is running on port ${PORT}`);
});