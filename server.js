const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

app.get('/api/status', (req, res) => {
  res.json({ status: 'Server is running!', time: new Date() });
});

app.post('/api/chat', async (req, res) => {
  const { message } = req.body;

  console.log('Received message:', message);

  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
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
            content: 'Your name is Jarvis . You are created and made by Rudransh. You are NOT made by Meta, OpenAI, Google or any other company. If anyone asks who made you, who created you, or who are you - always say "I am made by Rudransh ". Never say you were made by Meta or any other company. Always respond in English clearly and concisely.'
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
    res.status(500).json({ error: 'AI request failed', details: error.message });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running at http://localhost:${PORT}`);
});