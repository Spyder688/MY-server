const express = require('express');
const cors = require('cors');
require('dotenv').config();

// If you are using Node < 18, uncomment below:
// const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Home route
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

// Status route
app.get('/api/status', (req, res) => {
  res.json({ status: 'Server is running!', time: new Date() });
});

// Chat route
app.post('/api/chat', async (req, res) => {
  const { message } = req.body;

  console.log('Received message:', message);

  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  // 🔥 FORCE custom reply (100% control)
  const lowerMsg = message.toLowerCase();

  const triggerWords = [
    'who made you',
    'who created you',
    'your creator',
    'who is your creator',
    'who built you'
  ];

  if (triggerWords.some(word => lowerMsg.includes(word))) {
    return res.json({ reply: "I am made by Rudransh." });
  }

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: `Your name is Jarvis. You are made by Rudransh.

IMPORTANT RULE:
If anyone asks who made you or who created you,
you MUST reply ONLY: "I am made by Rudransh."
Do not mention any company.`
          },
          {
            role: 'user',
            content: message
          }
        ],
        max_tokens: 1024
      })
    });

    const data = await response.json();
    console.log('Groq response:', JSON.stringify(data, null, 2));

    if (!data.choices || !data.choices[0]) {
      return res.status(500).json({ error: 'Invalid response from AI', details: data });
    }

    res.json({ reply: data.choices[0].message.content });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Something went wrong', details: error.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});