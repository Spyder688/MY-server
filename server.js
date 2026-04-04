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
 
// Helper: upload base64 image to imgbb, return public URL
async function uploadToImgbb(base64, mimeType) {
  const formData = new URLSearchParams();
  formData.append('key', process.env.IMGBB_API_KEY);
  formData.append('image', base64);
 
  const response = await fetch('https://api.imgbb.com/1/upload', {
    method: 'POST',
    body: formData
  });
 
  const data = await response.json();
 
  if (!data.success) {
    throw new Error('Image upload to imgbb failed: ' + JSON.stringify(data));
  }
 
  return data.data.url; // public image URL
}
 
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
    let userContent;
 
    if (images && images.length > 0) {
      // Upload each image to imgbb to get a public URL
      console.log('Uploading images to imgbb...');
      const imageUrls = await Promise.all(
        images.map(img => uploadToImgbb(img.base64, img.mimeType))
      );
      console.log('Image URLs:', imageUrls);
 
      // Build vision message: images first, then text
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
      userContent = message;
    }
 
    const model = (images && images.length > 0)
      ? 'llama-3.2-11b-vision-preview'
      : 'llama-3.3-70b-versatile';
 
    console.log('Using model:', model);
 
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