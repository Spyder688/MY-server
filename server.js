const express = require('express');
const cors = require('cors');
require('dotenv').config();
 
const app = express();
const PORT = process.env.PORT || 4000;
 
app.use(cors());
app.use(express.json({ limit: '20mb' }));
app.use(express.static('public'));
 
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});
 
app.get('/api/status', (req, res) => {
  res.json({ status: 'Server is running!', time: new Date() });
});
 
// ── Upload image to ImgBB and return a public URL ──────────────────────────
async function uploadToImgbb(base64) {
  if (!process.env.IMGBB_API_KEY) {
    throw new Error('IMGBB_API_KEY is missing from environment variables');
  }
 
  const formData = new URLSearchParams();
  formData.append('key', process.env.IMGBB_API_KEY);
  formData.append('image', base64);
 
  const response = await fetch('https://api.imgbb.com/1/upload', {
    method: 'POST',
    body: formData
  });
 
  const data = await response.json();
 
  if (!data.success) {
    throw new Error('ImgBB upload failed: ' + JSON.stringify(data.error || data));
  }
 
  return data.data.url;
}
 
// ── Chat route ─────────────────────────────────────────────────────────────
app.post('/api/chat', async (req, res) => {
  const { message, images } = req.body;
 
  console.log('─── New request ───────────────────────────');
  console.log('Message:', message);
  console.log('Images count:', images ? images.length : 0);
 
  if (!message && (!images || images.length === 0)) {
    return res.status(400).json({ error: 'Message or image is required' });
  }
 
  // Check API key
  if (!process.env.GROQ_API_KEY) {
    console.error('GROQ_API_KEY missing!');
    return res.status(500).json({ error: 'GROQ_API_KEY is missing from environment variables' });
  }
 
  // Custom creator override
  const lowerMsg = (message || '').toLowerCase();
  const triggerWords = ['who made you', 'who created you', 'your creator', 'who is your creator', 'who built you'];
  if (triggerWords.some(word => lowerMsg.includes(word))) {
    return res.json({ reply: 'I am made by Rudransh.' });
  }
 
  try {
    let userContent;
    let model;
 
    if (images && images.length > 0) {
      // ── Vision path ───────────────────────────────────────────────────────
      model = 'llama-3.2-11b-vision-preview';
      console.log('Using vision model:', model);
      console.log('Uploading images to ImgBB...');
 
      const imageUrls = await Promise.all(
        images.map(img => uploadToImgbb(img.base64))
      );
      console.log('ImgBB URLs:', imageUrls);
 
      userContent = [
        ...imageUrls.map(url => ({
          type: 'image_url',
          image_url: { url }
        })),
        {
          type: 'text',
          text: message || 'What do you see in this image?'
        }
      ];
    } else {
      // ── Text-only path ────────────────────────────────────────────────────
      model = 'llama-3.3-70b-versatile';
      console.log('Using text model:', model);
      userContent = message;
    }
 
    // ── Call Groq ─────────────────────────────────────────────────────────
    console.log('Calling Groq API...');
    const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
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
 
    const data = await groqResponse.json();
    console.log('Groq status:', groqResponse.status);
    console.log('Groq response:', JSON.stringify(data, null, 2));
 
    // Check for Groq-level errors
    if (data.error) {
      console.error('Groq API error:', data.error);
      return res.status(500).json({
        error: 'Groq API error: ' + data.error.message,
        details: data.error
      });
    }
 
    if (!data.choices || !data.choices[0]) {
      console.error('No choices in Groq response:', data);
      return res.status(500).json({
        error: 'Invalid response from Groq — no choices returned',
        details: data
      });
    }
 
    res.json({ reply: data.choices[0].message.content });
 
  } catch (error) {
    console.error('Caught error:', error);
    res.status(500).json({
      error: error.message || 'Something went wrong',
      details: error.stack
    });
  }
});
 
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log('GROQ_API_KEY set:', !!process.env.GROQ_API_KEY);
  console.log('IMGBB_API_KEY set:', !!process.env.IMGBB_API_KEY);
});
 