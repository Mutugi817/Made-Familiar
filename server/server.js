const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// Import local modules
const Paper = require('./models/Paper');
const { client: whatsappClient } = require('./config/whatsappClient');
const { MessageMedia } = require('whatsapp-web.js');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files (uploaded papers)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Database Connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/exam_repo')
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error('MongoDB Connection Error:', err));

// --- API ROUTES ---

// 1. Get all papers
app.get('/api/papers', async (req, res) => {
  try {
    const papers = await Paper.find().sort({ year: -1 });
    res.json(papers);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch papers' });
  }
});

// 2. Download Paper
app.get('/api/papers/download/:id', async (req, res) => {
  try {
    const paper = await Paper.findById(req.params.id);
    if (!paper) return res.status(404).send('Paper not found');

    const filePath = path.resolve(paper.filePath);
    
    if (fs.existsSync(filePath)) {
      res.download(filePath, `${paper.title}.pdf`);
    } else {
      res.status(404).send('File not found on server');
    }
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// 3. Send via WhatsApp
app.post('/api/papers/whatsapp', async (req, res) => {
  const { paperId, phoneNumber } = req.body;

  if (!paperId || !phoneNumber) {
    return res.status(400).json({ error: 'Missing paperId or phoneNumber' });
  }

  try {
    const paper = await Paper.findById(paperId);
    if (!paper) return res.status(404).json({ error: 'Paper not found' });

    // Format number: Remove '+' and ensure it ends with '@c.us'
    const sanitizedNumber = phoneNumber.replace(/\D/g, '');
    const chatId = `${sanitizedNumber}@c.us`;

    const filePath = path.resolve(paper.filePath);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File file does not exist on server' });
    }

    // Read and send media
    const media = MessageMedia.fromFilePath(filePath);
    await whatsappClient.sendMessage(chatId, media, { caption: `Here is your requested exam paper: ${paper.title}` });

    res.json({ success: true, message: 'Paper sent successfully via WhatsApp' });

  } catch (err) {
    console.error('WhatsApp Error:', err);
    res.status(500).json({ error: 'Failed to send WhatsApp message' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});