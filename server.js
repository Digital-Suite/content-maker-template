require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// API Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', app: 'Content Maker' });
});

app.post('/api/render', async (req, res) => {
  try {
    const { scenes, format = '9:16' } = req.body;
    
    // Check for Lambda setup
    if (!process.env.REMOTION_SERVE_URL || !process.env.REMOTION_FUNCTION_NAME) {
      return res.status(500).json({ error: "Remotion Lambda is not configured in .env yet." });
    }

    const { renderMediaOnLambda, getRenderProgress } = require('@remotion/lambda/client');

    const compositionId = format === '9:16' ? 'ContentMakerVideo_Portrait' : (format === '1:1' ? 'ContentMakerVideo_Square' : 'ContentMakerVideo_Landscape');

    const render = await renderMediaOnLambda({
      region: process.env.REMOTION_AWS_REGION || 'us-east-1',
      functionName: process.env.REMOTION_FUNCTION_NAME,
      serveUrl: process.env.REMOTION_SERVE_URL,
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
      functionName: process.env.REMOTION_FUNCTION_NAME,
      region: process.env.REMOTION_AWS_REGION || 'us-east-1',
    });

    while (!progress.done && !progress.fatalErrorEncountered) {
      await new Promise(resolve => setTimeout(resolve, 2000));
      progress = await getRenderProgress({
        renderId: render.renderId,
        bucketName: render.bucketName,
        functionName: process.env.REMOTION_FUNCTION_NAME,
        region: process.env.REMOTION_AWS_REGION || 'us-east-1',
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
