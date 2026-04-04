const express = require('express');
const cors = require('cors');
require('dotenv').config();
 
const app = express();
const PORT = process.env.PORT || 4000;
 
app.use(cors());
app.use(express.json({ limit: '20mb' })); // Increased limit for base64 images
app.use(express.static('public'));
 
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});
 
app.get('/api/status', (req, res) => {
  res.json({ status: 'Server is running!', time: new Date() });
});
 
app.post('/api/chat', async (req, res) => {
  const { message, images } = req.body;
 
  console.log('Received message:', message);
  console.log('Images attached:', images ? images.length : 0);
 
  if (!message && (!images || images.length === 0)) {
    return res.status(400).json({ error: 'Message or image is required' });
  }
 
  // Custom creator override
  const lowerMsg = (message || '').toLowerCase();
  const triggerWords = ['who made you', 'who created you', 'your creator', 'who is your creator', 'who built you'];
  if (triggerWords.some(word => lowerMsg.includes(word))) {
    return res.json({ reply: 'I am made by Rudransh.' });
  }
 
  try {
    // Build message content — supports text + images
    let userContent;
 
    if (images && images.length > 0) {
      // Vision request: use llama-3.2-11b-vision-preview
      userContent = [
        ...images.map(img => ({
          type: 'image_url',
          image_url: {
            url: `data:${img.mimeType};base64,${img.base64}`
          }
        })),
        {
          type: 'text',
          text: message || 'What do you see in this image?'
        }
      ];
    } else {
      // Text-only
      userContent = message;
    }
 
    const model = (images && images.length > 0)
      ? 'llama-3.2-11b-vision-preview'  // Vision model for images
      : 'llama-3.3-70b-versatile';       // Fast text model
 
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: 'system',
            content: `Your name is Jarvis. You are made by Rudransh.
IMPORTANT RULE: If anyone asks who made you or who created you,
you MUST reply ONLY: "I am made by Rudransh." Do not mention any company.`
          },
          {
            role: 'user',
            content: userContent
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
 
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
 