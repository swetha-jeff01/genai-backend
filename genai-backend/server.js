require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { OpenAI } = require('openai'); // We still use this package!

const app = express();

// Enable CORS
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("🚀 GenAI Backend is running successfully!");
});

// Initialize AI using Groq's free endpoint
const ai = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1", // This points it to Groq instead of OpenAI
});

app.post('/api/generate', async (req, res) => {
  try {
    const { topic } = req.body;
    
    // Call the AI model
    const completion = await ai.chat.completions.create({
      model: "llama3-8b-8192", // Groq's super fast, free model
      messages: [
        { role: "system", content: "You are a social media expert. Write a viral, engaging tweet." },
        { role: "user", content: `Write a tweet about: ${topic}` }
      ],
    });

    // Send the AI's tweet back to the frontend
    res.json({ result: completion.choices[0].message.content });

  } catch (error) {
    console.error("Error generating tweet:", error);
    res.status(500).json({ error: "Failed to generate tweet" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Backend server is running on http://localhost:${PORT}`);
});
