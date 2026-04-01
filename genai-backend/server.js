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
    const userPrompt = req.body.prompt;

    if (!userPrompt) {
      return res.status(400).json({ error: "Please provide a prompt." });
    }

    // 1. Generate the Text using Groq
    const completion = await ai.chat.completions.create({
      model: "llama-3.1-8b-instant", 
      messages: [
        { role: "system", content: "You are a helpful AI assistant that writes engaging, short tweets. Do not include options like 'Tweet 1, Tweet 2', just give me ONE single tweet." }, 
        { role: "user", content: userPrompt }
      ],
    });

    const generatedTweet = completion.choices[0].message.content;

    // 2. Generate the Image URL using Pollinations AI (Free & No API Key needed!)
    const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(userPrompt)}?width=1024&height=1024&nologo=true`;

    // 3. Send BOTH back to the frontend
    res.json({ 
      result: generatedTweet,
      image: imageUrl 
    });

  } catch (error) { 
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