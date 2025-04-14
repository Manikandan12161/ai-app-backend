const express = require('express');
const axios = require('axios');
const router = express.Router();
const Message = require('../models/Message');

// POST /api/ai
router.post('/', async (req, res) => {
  try {
    const prompt = req.body.prompt;
    console.log("📝 Received prompt:", prompt);

    // Call Groq API
    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama3-8b-8192", // ✅ Use supported model
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const aiReply = response.data.choices[0].message.content;
    console.log("🤖 AI response:", aiReply);

    // Save to MongoDB
    const newMessage = new Message({ prompt, response: aiReply });
    await newMessage.save();

    res.json({ response: aiReply });
  } catch (error) {
    console.error("❌ Groq API error:", error.response?.data || error.message);
    res.status(500).json({ error: "Error contacting AI server." });
  }
});

module.exports = router;
