require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.set('trust proxy', true);
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

const fs = require('fs');
const uploadsPath = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath);
}
app.use('/uploads', express.static(uploadsPath));

// API Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', app: 'Content Maker' });
});

app.post('/api/upload-media', (req, res) => {
  try {
    const { image } = req.body;
    if (!image || !image.startsWith('data:image/')) {
      return res.status(400).json({ error: 'Invalid image data' });
    }
    const base64Data = image.replace(/^data:image\/\w+;base64,/, "");
    const ext = image.split(';')[0].split('/')[1] || 'jpeg';
    const filename = `img_${Date.now()}_${Math.floor(Math.random() * 1000)}.${ext}`;
    const filePath = path.join(uploadsPath, filename);
    
    fs.writeFileSync(filePath, base64Data, 'base64');
    
    const baseUrl = req.protocol + '://' + req.get('host');
    const url = `${baseUrl}/uploads/${filename}`;
    
    res.json({ success: true, url });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/render', async (req, res) => {
  try {
    const { scenes, format = '9:16', credentials = {} } = req.body;
    
    // Check for Lambda setup
    const serveUrl = credentials.REMOTION_SERVE_URL || process.env.REMOTION_SERVE_URL || 'https://remotionlambda-useast1-9y1366941d.s3.us-east-1.amazonaws.com/sites/content-maker-templates/index.html';
    const functionName = credentials.REMOTION_FUNCTION_NAME || process.env.REMOTION_FUNCTION_NAME || 'remotion-render-4-0-507-mem2048mb-disk2048mb-120sec';
    const region = credentials.AWS_REGION || process.env.REMOTION_AWS_REGION || 'us-east-1';
    
    if (!serveUrl || !functionName) {
      return res.status(500).json({ error: "Remotion Lambda is not configured in .env or settings yet." });
    }
    
    if (credentials.AWS_ACCESS_KEY_ID && credentials.AWS_SECRET_ACCESS_KEY) {
      process.env.AWS_ACCESS_KEY_ID = credentials.AWS_ACCESS_KEY_ID;
      process.env.AWS_SECRET_ACCESS_KEY = credentials.AWS_SECRET_ACCESS_KEY;
    }

    const { renderMediaOnLambda, getRenderProgress } = require('@remotion/lambda/client');

    const compositionId = format === '9:16' ? 'ContentMakerVideo_Portrait' : (format === '1:1' ? 'ContentMakerVideo_Square' : 'ContentMakerVideo_Landscape');

    const render = await renderMediaOnLambda({
      region,
      functionName,
      serveUrl,
      composition: compositionId,
      inputProps: { scenes },
      codec: 'h264',
      imageFormat: 'jpeg',
      maxRetries: 1,
      privacy: 'public',
    });

    // In a production app, you'd return the renderId and poll from the client,
    // but for simplicity here we will poll on the backend and return the final URL.
    let progress = await getRenderProgress({
      renderId: render.renderId,
      bucketName: render.bucketName,
      functionName,
      region,
    });

    while (!progress.done && !progress.fatalErrorEncountered) {
      await new Promise(resolve => setTimeout(resolve, 2000));
      progress = await getRenderProgress({
        renderId: render.renderId,
        bucketName: render.bucketName,
        functionName,
        region,
      });
    }

    if (progress.fatalErrorEncountered) {
      return res.status(500).json({ error: "Render failed", details: progress.errors });
    }

    res.json({ success: true, url: progress.outputFile });
  } catch (err) {
    console.error("Render error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Serve the built React app
const clientBuildPath = path.join(__dirname, 'client', 'dist');
app.use(express.static(clientBuildPath));

// Catch-all to serve index.html for React Router
app.get('*', (req, res) => {
  res.sendFile(path.join(clientBuildPath, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
