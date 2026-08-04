export const generateSceneImage = async (prompt, aspectRatio, provider = 'pollinations', apiKey = null) => {
  const [w, h] = aspectRatio === '16:9' ? [1920, 1080] : aspectRatio === '1:1' ? [1080, 1080] : [1080, 1920];
  
  if (provider === 'pollinations') {
    // Fetch image as blob to control concurrency and avoid 429 Too Many Requests
    const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=${w}&height=${h}&nologo=true&seed=${Math.floor(Math.random()*10000)}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("Pollinations fetch failed");
    const blob = await res.blob();
    return URL.createObjectURL(blob);
  } 
  
  if (provider === 'nano_banana') {
    // Nano Banana (Gemini Flash Lite Image)
    if (!apiKey) throw new Error("API Key required for Nano Banana");
    const safePrompt = prompt + " (CRITICAL INSTRUCTION: Do NOT include any text, letters, words, or typography in this image whatsoever. Background should be completely textless.)";
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite-image:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: safePrompt }] }] })
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
