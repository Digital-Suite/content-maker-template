export const generateSceneImage = async (prompt, aspectRatio, provider = 'pollinations', apiKey = null) => {
  const [w, h] = aspectRatio === '16:9' ? [1920, 1080] : aspectRatio === '1:1' ? [1080, 1080] : [1080, 1920];
  
  if (provider === 'pollinations') {
    // Instant URL resolution - bypass cache by appending random salt
    return `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=${w}&height=${h}&nologo=true&seed=${Math.floor(Math.random()*10000)}`;
  } 
  
  if (provider === 'nano_banana') {
    // Nano Banana (Gemini Flash Lite Image)
    if (!apiKey) throw new Error("API Key required for Nano Banana");
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite-image:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    });
    const data = await res.json();
    if (!data.candidates || !data.candidates[0].content.parts[0].inlineData) {
        throw new Error("Failed to generate image with Nano Banana");
    }
    const base64 = data.candidates[0].content.parts.find(p => p.inlineData).inlineData.data;
    return `data:image/jpeg;base64,${base64}`;
  }

  throw new Error("Unknown provider");
};
