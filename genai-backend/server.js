require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { OpenAI } = require('openai');
const mongoose = require('mongoose');

const app = express();

// Enable CORS and JSON
app.use(cors());
app.use(express.json());

// ==========================================
// 1. DATABASE SETUP (MongoDB)
// ==========================================
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Database Connected Successfully!'))
  .catch((err) => console.log('❌ MongoDB Connection Error: ', err));

// Blueprint for how a saved tweet should look
const tweetSchema = new mongoose.Schema({
  prompt: String,
  tweetText: String,
  imageUrl: String,
  createdAt: { type: Date, default: Date.now }
});

const SavedTweet = mongoose.model('SavedTweet', tweetSchema);

// ==========================================
// 2. AI SETUP (Groq)
// ==========================================
const ai = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

// ==========================================
// 3. THE GENERATE ROUTE
// ==========================================
app.post('/api/generate', async (req, res) => {
  try { 
    const userPrompt = req.body.prompt;

    if (!userPrompt) {
      return res.status(400).json({ error: "Please provide a prompt." });
    }

    // A. Generate Text using Groq
    const completion = await ai.chat.completions.create({
      model: "llama-3.1-8b-instant", 
      messages: [
        { role: "system", content: "You are a helpful AI assistant that writes engaging, short tweets. Do not include options like 'Tweet 1, Tweet 2', just give me ONE single tweet." }, 
        { role: "user", content: userPrompt }
      ],
    });

    const generatedTweet = completion.choices[0].message.content;

    // B. Generate Image URL (with random seed so it never gets stuck)
    const randomSeed = Math.floor(Math.random() * 100000);
    const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(userPrompt)}?seed=${randomSeed}&width=1024&height=1024&nologo=true`;

    // C. Save it to the Database!
    const newTweet = new SavedTweet({
      prompt: userPrompt,
      tweetText: generatedTweet,
      imageUrl: imageUrl
    });
    
    await newTweet.save();
    console.log("💾 Successfully saved new tweet to MongoDB!");

    // D. Send both back to the frontend
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

// ==========================================
// 4. START THE SERVER
// ==========================================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Backend server is running on port ${PORT}`);
});