import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Film, Lightbulb, Type, Mic, Music, Play, CheckCircle2, ChevronRight, ChevronLeft, Wand2, ImageIcon, LayoutTemplate, Eye, Clock, Plus, Trash2, GripVertical, MousePointerClick, Link, Video, UploadCloud, User } from 'lucide-react';
import { getStoredApiKey } from '../hooks/useDigitalSuite';
import { generateSceneImage } from '../utils/mediaGenerator';

const STEPS = [
  { id: 1, title: 'Idea', icon: Lightbulb },
  { id: 2, title: 'Action', icon: MousePointerClick },
  { id: 3, title: 'Script', icon: Type },
  { id: 4, title: 'Visuals', icon: ImageIcon },
  { id: 5, title: 'Review', icon: CheckCircle2 }
];

const CAPTION_COLORS = [
  { id: 'white', name: 'White', class: 'text-white' },
  { id: 'yellow', name: 'Yellow', class: 'text-yellow-400' },
  { id: 'green', name: 'Green', class: 'text-green-400' },
  { id: 'red', name: 'Red', class: 'text-red-500' },
  { id: 'custom', name: 'Custom...' }
];

const MOCK_IDEAS = [
  {
    id: 'idea-1',
    title: 'The Curiosity Hook',
    description: 'Hooks the viewer by highlighting a common pain point they struggle with, then revealing a counter-intuitive solution that positions you as the expert.',
    draft_script: 'Are you still struggling with [Pain Point]? You are probably doing it the hard way. Here is the exact framework we use to solve it effortlessly...'
  },
  {
    id: 'idea-2',
    title: 'Behind the Scenes Value',
    description: 'Builds trust and draws ideal clients in by showing the transparent, step-by-step process of how you achieve results.',
    draft_script: 'Want to know exactly how we get results for our clients? Come behind the scenes with me. Step one...'
  },
  {
    id: 'idea-3',
    title: 'The Myth Buster',
    description: 'Polarizing content that challenges an industry norm, automatically attracting people who align with your unique approach.',
    draft_script: 'Stop believing the lie that you need [Industry Norm]. Let me tell you why that is holding you back, and what you should do instead.'
  }
];

const MOCK_AV_SCRIPT = [
  {
    id: 'scene-1',
    duration: '2.5s',
    visualConcept: 'Fast zoom into a person looking frustrated at their laptop screen.',
    voiceover: 'Are you still struggling with lead generation?'
  },
  {
    id: 'scene-2',
    duration: '2.8s',
    visualConcept: 'Split screen: Left side shows a messy desk, right side shows a clean dashboard.',
    voiceover: 'You are doing it the hard way. Stop wasting time.'
  },
  {
    id: 'scene-3',
    duration: '2.2s',
    visualConcept: 'User confidently clicking a button on the Digital Suite app, green checkmark pops up.',
    voiceover: 'Here is the exact framework we use to solve it effortlessly.'
  }
];

const MOCK_SCENES = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1493612276216-ee3925520721?auto=format&fit=crop&q=80&w=400',
    caption: 'FRUSTRATED?',
    captionPosition: 'center',
    captionStyle: 'text_only',
    captionColor: 'white',
    voiceover: 'Are you still struggling with lead generation?',
    duration: '2.5s'
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1542204165-65bf26472b9b?auto=format&fit=crop&q=80&w=400',
    caption: 'THE HARD WAY',
    captionPosition: 'bottom',
    captionStyle: 'dark_overlay',
    captionColor: 'yellow',
    voiceover: 'You are doing it the hard way. Stop wasting time.',
    duration: '2.8s'
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=400',
    caption: 'THE SOLUTION',
    captionPosition: 'center',
    captionStyle: 'blur_overlay',
    captionColor: 'green',
    voiceover: 'Here is the exact framework we use to solve it effortlessly.',
    duration: '2.2s'
  }
];

const MOCK_VOICES = [
  { id: 'v-1', name: 'Jarvis', description: 'Dry wit, composed British AI assistant' },
  { id: 'v-2', name: 'Morgan Freeman', description: 'Rich, warm baritone with gravitas and calm authority' },
  { id: 'v-3', name: 'Zendaya', description: 'Relaxed, modern delivery with effortless cool' },
];

export function VideoCreatorWizard() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [topic, setTopic] = useState('');
  const [isGeneratingIdeas, setIsGeneratingIdeas] = useState(false);
  const [ideas, setIdeas] = useState([]);
  
  const [script, setScript] = useState('');
  const [avScript, setAvScript] = useState([]);
  
  const [scenes, setScenes] = useState(MOCK_SCENES);
  const [musicVibe, setMusicVibe] = useState('ambient');
  const [aspectRatio, setAspectRatio] = useState('9:16');
  
  const [ctaType, setCtaType] = useState('comment');
  const [ctaKeyword, setCtaKeyword] = useState('');
  const [ctaLink, setCtaLink] = useState('');
  
  const [voices, setVoices] = useState(() => {
    const saved = localStorage.getItem('digital_suite_voices');
    return saved ? JSON.parse(saved) : MOCK_VOICES;
  });
  const [selectedVoice, setSelectedVoice] = useState('v-1');
  const [isCloneModalOpen, setIsCloneModalOpen] = useState(false);
  const [cloneName, setCloneName] = useState('');
  const [isCloning, setIsCloning] = useState(false);
  const [playingVoice, setPlayingVoice] = useState(null);
  
  const [postDescription, setPostDescription] = useState('Struggling to get leads? 🛑 You might be doing it the hard way.\n\nWe spent years figuring out the exact framework to automate lead generation so you don\'t have to waste time on manual outreach. Check out how we do it effortlessly!\n\n👇 Comment "SYSTEM" below and I will DM you the exact framework for free!');
  
  const [isCompiling, setIsCompiling] = useState(false);
  const [isGeneratingScript, setIsGeneratingScript] = useState(false);
  const [selectedIdea, setSelectedIdea] = useState(null);
  const [ideaError, setIdeaError] = useState('');
  const [scriptError, setScriptError] = useState('');
  
  const [isGeneratingVisuals, setIsGeneratingVisuals] = useState(false);
  const [regeneratingSceneId, setRegeneratingSceneId] = useState(null);
  const [voiceboxProfiles, setVoiceboxProfiles] = useState([]);
  
  React.useEffect(() => {
    // Mock external API loading
    setVoiceboxProfiles(MOCK_VOICES);
    setSelectedVoice(MOCK_VOICES[0].id);
  }, []);

  // Resolves the latest Gemini flash model synced from the DigitalSuite backend
  const getLatestFlashModel = async () => {
    try {
      const apiBaseUrl = sessionStorage.getItem('ds_apiBaseUrl') || 'http://localhost:3333';
      const res = await fetch(`${apiBaseUrl}/api/v1/system/ai-models`);
      if (res.ok) {
        const models = await res.json();
        const flashModels = models
          .filter(m => 
            m.provider === 'Google AI' && 
            m.id.includes('flash') && 
            !m.id.includes('preview') && 
            !m.id.includes('exp') && 
            !m.id.includes('omni')
          )
          .sort((a, b) => b.id.localeCompare(a.id));
        if (flashModels.length > 0) return flashModels[0].id;
      }
    } catch (e) {
      console.warn("Failed to fetch models from backend, using fallback.", e);
    }
    return 'gemini-3.5-flash';
  };

  const handleGenerateIdeas = async () => {
    if (!topic.trim()) return;
    setIdeaError('');
    setIsGeneratingIdeas(true);
    setIdeas([]);
    try {
      const apiKey = getStoredApiKey('gemini');
      if (!apiKey) {
        setIdeaError('No Gemini API key found. Please add it in DigitalSuite Settings → AI Models.');
        return;
      }
      const prompt = `You are a short-form video strategist specializing in Attraction Marketing on social media.\n\nGenerate exactly 3 distinct short-form video ideas for the topic: "${topic.trim()}".\n\nEach idea must:\n- Use a proven Attraction Marketing hook (curiosity, social proof, myth buster, behind-the-scenes, transformation, etc.)\n- Be suitable for TikTok / Instagram Reels (vertical short-form)\n- Have a draft script that begins with an attention-grabbing first line\n- Be specific and compelling, NOT generic\n\nReturn ONLY a valid JSON array (no markdown, no explanation) with exactly this structure:\n[\n  {\n    "id": "idea-1",\n    "title": "Hook Type Name",\n    "description": "One sentence describing the psychological approach and why it works.",\n    "draft_script": "The full opening lines / hook script for this idea."\n  }\n]`;

      const targetModel = await getLatestFlashModel();
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${targetModel}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: 'application/json', temperature: 0.9 }
          })
        }
      );
      if (!res.ok) throw new Error(`Gemini API error: ${res.status}`);
      const data = await res.json();
      const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text || '[]';
      const parsed = JSON.parse(raw);
      setIdeas(Array.isArray(parsed) ? parsed : []);
    } catch (err) {
      console.error('Idea generation failed:', err);
      setIdeaError('Failed to generate ideas. Please check your API key and try again.');
    } finally {
      setIsGeneratingIdeas(false);
    }
  };

  const selectIdea = (idea) => {
    setSelectedIdea(idea);
    setScript(idea.draft_script);
    setCurrentStep(2); // Go to Action step; script generates on "Generate Script" click
  };

  const handleGenerateScript = async () => {
    if (!selectedIdea) return;
    setScriptError('');
    setIsGeneratingScript(true);
    try {
      const apiKey = getStoredApiKey('gemini');
      if (!apiKey) {
        setScriptError('No Gemini API key found. Please add it in DigitalSuite Settings → AI Models.');
        return;
      }
      const ctaValue = ctaType === 'comment' ? ctaKeyword : ctaLink;
      const ctaInstruction = ctaType === 'comment'
        ? `The FINAL scene must end with the viewer being told to comment the word "${ctaValue}" to get something valuable.`
        : `The FINAL scene must direct the viewer to click the link in bio.`;

      const prompt = `You are an expert short-form video director and script writer.\n\nBase Idea: "${selectedIdea.title}"\nScript Draft: "${selectedIdea.draft_script}"\n\nTransform this into a structured scene-by-scene storyboard.\n\nRequirements:\n- Create exactly 4-6 scenes\n- CRITICAL: Each scene MUST be maximum 3 seconds (duration_seconds <= 3.0)\n- Fast, punchy pacing to hold attention on TikTok/Reels\n- Each scene needs a distinct visual concept and voiceover line\n- Caption text: 1-4 punchy UPPERCASE words\n- Generate a highly-engaging post description (caption for TikTok/Reels) containing emojis and hashtags.\n- ${ctaInstruction}\n- Aspect ratio: ${aspectRatio}\n\nReturn ONLY valid JSON (no markdown, no explanation):\n{\n  "postDescription": "The highly-engaging caption to accompany the video, including the CTA.",\n  "scenes": [\n    {\n      "id": "scene-1",\n      "duration": "2.5s",\n      "visualConcept": "Detailed visual description for this scene",\n      "voiceover": "Exact words spoken in this scene"\n    }\n  ]\n}`;

      const targetModel = await getLatestFlashModel();
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${targetModel}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: 'application/json', temperature: 0.7 }
          })
        }
      );
      if (!res.ok) throw new Error(`Gemini API error: ${res.status}`);
      const data = await res.json();
      const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
      const parsed = JSON.parse(raw);
      const scriptJson = (parsed || {});
      if (scriptJson.scenes) {
        setAvScript(scriptJson.scenes);
        if (scriptJson.postDescription) {
          setPostDescription(scriptJson.postDescription);
        }
        // Initialize scenes structure matching avScript, without images yet
        setScenes(scriptJson.scenes.map(s => ({ ...s, image: '', caption: s.voiceover || '' })));
        setCurrentStep(3);
      } else {
        throw new Error("Invalid script format");
      }
    } catch (err) {
      console.error('Script generation failed:', err);
      setScriptError('Failed to generate script. Please try again.');
    } finally {
      setIsGeneratingScript(false);
    }
  };

  const updateSceneCaption = (id, key, value) => {
    setScenes(scenes.map(s => s.id === id ? { ...s, [key]: value } : s));
  };

  const handleGenerateVisuals = async () => {
    if (avScript.length === 0) return;
    
    // Skip if we've already generated visuals for this script length
    if (scenes.length === avScript.length && scenes.every(s => s.image)) {
      setCurrentStep(4);
      return;
    }

    setIsGeneratingVisuals(true);
    setScriptError(null);
    try {
      const apiKey = getStoredApiKey('gemini'); // In case we use nano_banana later
      const newScenes = [...avScript];
      
      // Fetch sequentially
      for (let index = 0; index < newScenes.length; index++) {
        const scene = newScenes[index];
        const imageUrl = await generateSceneImage(scene.visualConcept, aspectRatio, 'nano_banana', apiKey);
        newScenes[index].image = imageUrl;
        newScenes[index].imageHistory = [imageUrl];
        newScenes[index].currentImageIndex = 0;
        newScenes[index].caption = scene.voiceover || '';
        newScenes[index].captionPosition = 'center';
        newScenes[index].captionStyle = 'text_only';
        newScenes[index].captionColor = 'white';
      }
      
      setScenes(newScenes);
      setCurrentStep(4);
    } catch (e) {
      console.error("Failed to generate visuals", e);
      setScriptError("Failed to generate visual assets. Check your API key.");
    } finally {
      setIsGeneratingVisuals(false);
    }
  };

  const handleRegenerateSceneImage = async (sceneId) => {
    setRegeneratingSceneId(sceneId);
    try {
      const sceneIndex = scenes.findIndex(s => s.id === sceneId);
      const scene = scenes[sceneIndex];
      const apiKey = getStoredApiKey('gemini');
      const newImageUrl = await generateSceneImage(scene.visualConcept, aspectRatio, 'nano_banana', apiKey);
      
      setScenes(prev => {
        const newScenes = [...prev];
        const target = newScenes[sceneIndex];
        const history = target.imageHistory || [target.image];
        target.imageHistory = [...history, newImageUrl];
        target.currentImageIndex = target.imageHistory.length - 1;
        target.image = newImageUrl;
        return newScenes;
      });
    } catch (e) {
      console.error("Failed to regenerate image", e);
    } finally {
      setRegeneratingSceneId(null);
    }
  };

  const handleCycleImage = (sceneId, direction) => {
    setScenes(prev => prev.map(s => {
      if (s.id !== sceneId || !s.imageHistory || s.imageHistory.length <= 1) return s;
      let newIndex = s.currentImageIndex + direction;
      if (newIndex < 0) newIndex = s.imageHistory.length - 1;
      if (newIndex >= s.imageHistory.length) newIndex = 0;
      return { ...s, currentImageIndex: newIndex, image: s.imageHistory[newIndex] };
    }));
  };

  const addScene = () => {
    setIsCompiling(true);
    setTimeout(() => {
      setIsCompiling(false);
      setCurrentStep(7);
    }, 2000);
  };

  const [videoUrl, setVideoUrl] = useState(null);

  const handleCompile = async () => {
    setIsCompiling(true);
    try {
      const response = await fetch('/api/render', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenes, format: aspectRatio })
      });
      const data = await response.json();
      if (data.success) {
        setVideoUrl(data.url);
        setCurrentStep(6);
      } else {
        alert("Render failed: " + (data.error || "Unknown error"));
      }
    } catch (e) {
      console.error(e);
      alert("Failed to compile video. Check console.");
    } finally {
      setIsCompiling(false);
    }
  };

  const handleCloneVoice = () => {
    if (!cloneName.trim()) return;
    setIsCloning(true);
    setTimeout(() => {
      const newVoice = {
        id: `v-custom-${Date.now()}`,
        name: cloneName,
        description: 'Your cloned custom voice'
      };
      const updatedVoices = [newVoice, ...voices];
      setVoices(updatedVoices);
      localStorage.setItem('digital_suite_voices', JSON.stringify(updatedVoices));
      setSelectedVoice(newVoice.id);
      setIsCloning(false);
      setIsCloneModalOpen(false);
      setCloneName('');
    }, 2000);
  };

  const [sampleAudio, setSampleAudio] = useState(null);

  const handlePlaySample = (voiceId, e) => {
    e.stopPropagation();
    if (playingVoice === voiceId) {
      if (sampleAudio) {
        window.speechSynthesis.cancel();
        setSampleAudio(null);
      }
      setPlayingVoice(null);
      return;
    }
    if (sampleAudio) {
      window.speechSynthesis.cancel();
    }
    setPlayingVoice(voiceId);
    
    const text = "Hello! I am ready to narrate your next viral video.";
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onend = () => {
      setPlayingVoice(null);
      setSampleAudio(null);
    };
    utterance.onerror = () => {
      setPlayingVoice(null);
      setSampleAudio(null);
    };
    
    window.speechSynthesis.speak(utterance);
    setSampleAudio({
      pause: () => window.speechSynthesis.cancel()
    });
  };

  return (
    <div className="h-full flex flex-col bg-bg text-text">
      {/* Stepper Header */}
      <div className="bg-surface/90 backdrop-blur-md border-b border-border p-6 shrink-0 relative z-20 shadow-sm sticky top-0">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#10b981] to-[#0ea5e9] rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
              <Film size={20} className="text-text" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Content Wizard</h1>
              <p className="text-muted text-xs font-medium">6-Step Automated Process</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 overflow-x-auto pb-2 md:pb-0 custom-scrollbar">
            {STEPS.map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === step.id;
              const isPast = currentStep > step.id;
              
              return (
                <div key={step.id} className="flex items-center">
                  <div className={`flex items-center px-3 py-1.5 rounded-lg border text-sm font-medium transition-all ${
                    isActive 
                      ? 'bg-primary/10 border-primary text-primary' 
                      : isPast 
                        ? 'bg-surface-raised border-border text-text' 
                        : 'bg-transparent border-border text-muted'
                  }`}>
                    <Icon size={16} className={`mr-2 ${isActive ? 'animate-pulse' : ''}`} />
                    {step.title}
                  </div>
                  {index < STEPS.length - 1 && (
                    <ChevronRight size={16} className="text-[#2e3039] mx-2 shrink-0" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-8 relative">
        <div className="max-w-4xl mx-auto h-full flex flex-col">

          {/* STEP 1: IDEATION */}
          {currentStep === 1 && (
            <div className="flex-1 flex flex-col justify-center animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="text-center mb-10">
                <h2 className="text-3xl font-bold mb-3">Let's brainstorm some ideas.</h2>
                <p className="text-muted max-w-lg mx-auto">
                  Type a broad topic, keyword, or pain point below. The AI will generate tailored concepts to help you figure out what your video should be about.
                </p>
              </div>
              
              <div className="bg-surface border border-border p-2 rounded-2xl flex items-center shadow-lg mx-auto w-full max-w-2xl relative">
                <input 
                  type="text" 
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g. Lead generation strategies..."
                  className="flex-1 bg-transparent border-none px-4 py-3 focus:outline-none text-lg placeholder:text-[#4b4d58]"
                  onKeyDown={(e) => e.key === 'Enter' && handleGenerateIdeas()}
                />
                <button 
                  onClick={handleGenerateIdeas}
                  disabled={isGeneratingIdeas || !topic.trim()}
                  className="bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-xl font-medium transition-colors flex items-center shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGeneratingIdeas ? <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2" /> : <Wand2 size={18} className="mr-2" />}
                  Generate Ideas
                </button>
              </div>

              {ideaError && (
                <p className="mt-4 text-center text-red-400 text-sm">{ideaError}</p>
              )}

              <div className="flex justify-center mt-4">
                <div className="flex items-center text-sm">
                  <span className="text-muted mr-3 font-medium">Video Format:</span>
                  <select 
                    value={aspectRatio}
                    onChange={(e) => setAspectRatio(e.target.value)}
                    className="bg-surface border border-border rounded-lg px-3 py-1.5 text-text focus:outline-none focus:border-primary appearance-none cursor-pointer hover:border-border-subtle transition-colors"
                  >
                    <option value="9:16">9:16 (Vertical) - TikTok / Reels</option>
                    <option value="16:9">16:9 (Horizontal) - YouTube</option>
                    <option value="1:1">1:1 (Square) - Feed</option>
                  </select>
                </div>
              </div>

              {ideas.length > 0 && (
                <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
                  {ideas.map((idea, i) => (
                    <button 
                      key={idea.id}
                      onClick={() => selectIdea(idea)}
                      className="bg-surface border border-border p-6 rounded-2xl text-left hover:border-primary hover:shadow-[0_0_20px_rgba(16,185,129,0.1)] transition-all group flex flex-col"
                      style={{ animationDelay: `${i * 100}ms` }}
                    >
                      <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors">{idea.title}</h3>
                      <p className="text-muted text-sm leading-relaxed mb-4 flex-1">{idea.description}</p>
                      <div className="text-xs text-primary font-medium flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                        Draft Script <ChevronRight size={14} className="ml-1" />
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* STEP 2: ACTION */}
          {currentStep === 2 && (
            <div className="animate-in fade-in slide-in-from-right-8 duration-500 h-full flex flex-col justify-center max-w-2xl mx-auto w-full">
              <div className="text-center mb-10">
                <h2 className="text-3xl font-bold mb-3">How do you want viewers to take action?</h2>
                <p className="text-muted max-w-lg mx-auto">
                  Defining your Call-To-Action (CTA) upfront allows the AI to perfectly integrate it into the video script and post description.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div 
                  onClick={() => setCtaType('comment')}
                  className={`border-2 p-6 rounded-2xl cursor-pointer transition-all ${ctaType === 'comment' ? 'bg-primary/10 border-primary' : 'bg-surface border-border hover:border-border-subtle'}`}
                >
                  <div className="flex items-center mb-3">
                    <Type size={24} className={ctaType === 'comment' ? 'text-primary' : 'text-muted'} />
                    <span className="ml-3 font-bold">Comment Keyword</span>
                    <span className="ml-auto text-[10px] font-bold uppercase tracking-wider bg-primary/20 text-primary px-2 py-0.5 rounded">Recommended</span>
                  </div>
                  <p className="text-muted text-sm leading-relaxed mb-4">Ask viewers to comment a specific word. Perfect for triggering DM automations.</p>
                  
                  {ctaType === 'comment' && (
                    <div className="animate-in fade-in zoom-in-95 duration-200">
                      <label className="text-xs font-semibold text-primary uppercase tracking-wider mb-2 block">Keyword to Comment:</label>
                      <input 
                        type="text"
                        value={ctaKeyword}
                        onChange={(e) => setCtaKeyword(e.target.value)}
                        placeholder="e.g. SYSTEM"
                        className="w-full bg-bg border border-primary/30 rounded-xl px-4 py-3 text-text focus:outline-none focus:border-primary uppercase font-bold"
                      />
                    </div>
                  )}
                </div>

                <div 
                  onClick={() => setCtaType('link')}
                  className={`border-2 p-6 rounded-2xl cursor-pointer transition-all ${ctaType === 'link' ? 'bg-primary/10 border-primary' : 'bg-surface border-border hover:border-border-subtle'}`}
                >
                  <div className="flex items-center mb-3">
                    <Link size={24} className={ctaType === 'link' ? 'text-primary' : 'text-muted'} />
                    <span className="ml-3 font-bold">Link in Bio</span>
                  </div>
                  <p className="text-muted text-sm leading-relaxed mb-4">Direct traffic to your profile link or video description. Standard approach.</p>
                  
                  {ctaType === 'link' && (
                    <div className="animate-in fade-in zoom-in-95 duration-200">
                      <label className="text-xs font-semibold text-primary uppercase tracking-wider mb-2 block">Link URL:</label>
                      <input 
                        type="url"
                        value={ctaLink}
                        onChange={(e) => setCtaLink(e.target.value)}
                        placeholder="e.g. https://digitalsuite.tech"
                        className="w-full bg-bg border border-primary/30 rounded-xl px-4 py-3 text-text focus:outline-none focus:border-primary font-medium"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-between items-center mt-auto md:mt-8 shrink-0">
                <button onClick={() => setCurrentStep(1)} className="text-muted hover:text-text px-4 py-2 font-medium transition-colors">Back</button>
                <div className="flex flex-col items-end">
                  <button 
                    onClick={handleGenerateScript}
                    disabled={(ctaType === 'comment' && !ctaKeyword.trim()) || (ctaType === 'link' && !ctaLink.trim()) || isGeneratingScript}
                    className="bg-primary hover:bg-primary-dark text-white px-8 py-3 rounded-xl font-medium transition-colors flex items-center shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isGeneratingScript ? (
                      <><div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2" />Writing Script...</>
                    ) : (
                      <>Generate Script <ChevronRight size={18} className="ml-2" /></>
                    )}
                  </button>
                  {scriptError && (
                    <p className="mt-3 text-center text-red-400 text-sm">{scriptError}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: SCRIPT */}
          {currentStep === 3 && (
            <div className="animate-in fade-in slide-in-from-right-8 duration-500 h-full flex flex-col">
              <div className="mb-6 flex justify-between items-end">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Script Editor</h2>
                  <p className="text-muted text-sm">The AI has structured your idea into visual scenes and dialogue. Tweak it before generating images.</p>
                </div>
                <div className="flex items-center text-sm bg-surface border border-border px-4 py-2 rounded-xl shadow-sm">
                  <span className="text-muted mr-2">Total Duration:</span>
                  <span className="text-text font-bold flex items-center">
                    <Clock size={14} className="mr-1.5 text-blue-400" />
                    {avScript.reduce((acc, scene) => acc + parseFloat(scene.duration || 0), 0).toFixed(1)}s
                  </span>
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-6">
                {avScript.map((scene, index) => (
                  <div key={scene.id} className="bg-surface border border-border rounded-2xl overflow-hidden shadow-lg group hover:border-border-subtle transition-colors flex flex-col">
                    {/* Scene Header */}
                    <div className="bg-surface-raised/40 px-5 py-3 flex justify-between items-center border-b border-border">
                      <div className="flex items-center space-x-3">
                        <GripVertical size={16} className="text-[#4b4d58] group-hover:text-muted cursor-grab transition-colors" />
                        <span className="text-text font-bold tracking-wide">Scene {index + 1}</span>
                      </div>
                      <div className="flex items-center space-x-4 text-muted">
                        <div className="flex items-center text-xs bg-bg px-2.5 py-1 rounded-md border border-border font-medium">
                          <Clock size={12} className="mr-1.5 text-blue-400" />
                          {scene.duration}
                        </div>
                        <button className="hover:text-red-400 transition-colors" title="Delete Scene"><Trash2 size={16} /></button>
                      </div>
                    </div>

                    {/* Split Pane */}
                    <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-[#2e3039]">
                      {/* Left: Visuals */}
                      <div className="p-5 flex flex-col">
                        <label className="text-xs text-muted flex items-center mb-3 font-semibold uppercase tracking-wider">
                          <Eye size={14} className="mr-2 text-primary"/> Visual Concept
                        </label>
                        <textarea 
                          value={scene.visualConcept || ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            setAvScript(prev => prev.map(s => s.id === scene.id ? { ...s, visualConcept: val } : s));
                            setScenes([]); // clear scenes to force regeneration on next step
                          }}
                          className="flex-1 w-full bg-bg/50 border border-border rounded-xl p-3 text-sm text-text focus:outline-none focus:border-primary focus:bg-bg resize-none min-h-[100px] leading-relaxed transition-colors shadow-inner" 
                          placeholder="Describe what happens on screen..."
                        />
                      </div>
                      
                      {/* Right: Audio */}
                      <div className="p-5 flex flex-col">
                        <label className="text-xs text-muted flex items-center mb-3 font-semibold uppercase tracking-wider">
                          <Mic size={14} className="mr-2 text-purple-400"/> Voiceover / Dialogue
                        </label>
                        <textarea 
                          value={scene.voiceover || ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            setAvScript(prev => prev.map(s => s.id === scene.id ? { ...s, voiceover: val } : s));
                          }}
                          className="flex-1 w-full bg-bg/50 border border-border rounded-xl p-3 text-sm text-text focus:outline-none focus:border-purple-400 focus:bg-bg resize-none min-h-[100px] leading-relaxed transition-colors shadow-inner" 
                          placeholder="What is spoken during this scene?"
                        />
                      </div>
                    </div>
                  </div>
                ))}

                <button className="w-full border-2 border-dashed border-border rounded-2xl p-4 flex flex-col items-center justify-center text-muted hover:text-text hover:border-[#8b8d98] hover:bg-surface transition-all group mt-6">
                  <Plus size={20} className="mb-1 group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-medium">Add Scene</span>
                </button>
              </div>
              
              <div className="mt-6 pt-6 border-t border-border flex justify-between items-center shrink-0">
                <button onClick={() => setCurrentStep(2)} className="text-muted hover:text-text px-4 py-2 font-medium transition-colors">Back</button>
                <button 
                  onClick={handleGenerateVisuals}
                  disabled={isGeneratingVisuals}
                  className="bg-primary hover:bg-primary-dark text-white px-8 py-3 rounded-xl font-medium transition-colors flex items-center shadow-lg shadow-primary/20 disabled:opacity-50"
                >
                  {isGeneratingVisuals ? <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2" /> : null}
                  {isGeneratingVisuals ? 'Generating Visuals...' : (scenes.length > 0 ? 'Continue to Storyboard' : 'Generate Visual Assets')} {isGeneratingVisuals ? null : <ChevronRight size={18} className="ml-2" />}
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: VISUALS */}
          {currentStep === 4 && (
            <div className="animate-in fade-in slide-in-from-right-8 duration-500 h-full flex flex-col">
              <div className="mb-6">
                <h2 className="text-2xl font-bold mb-2">Storyboard & Visuals</h2>
                <p className="text-muted text-sm">Review the AI-generated scenes, tweak prompts, and select Caption Templates.</p>
              </div>
              <div className="flex-1 flex overflow-x-auto overflow-y-auto custom-scrollbar pb-10 space-x-6">
                  {scenes.map((scene, index) => (
                    <div key={scene.id} className="bg-surface border border-border rounded-2xl overflow-hidden shadow-lg flex flex-col h-fit flex-shrink-0 w-[340px] max-h-full overflow-y-auto custom-scrollbar">
                    <div className="bg-surface-raised/50 px-4 py-2.5 flex justify-between items-center border-b border-border shrink-0">
                      <span className="text-text font-medium text-sm">Scene {index + 1} {scene.imageHistory?.length > 1 && <span className="text-muted ml-2 text-xs">({scene.currentImageIndex + 1}/{scene.imageHistory.length})</span>}</span>
                      {scene.duration && (
                        <span className="text-xs bg-bg text-muted px-2 py-0.5 rounded border border-border">{scene.duration}</span>
                      )}
                    </div>

                    <div className={`shrink-0 relative bg-bg group ${aspectRatio === '9:16' ? 'aspect-[9/16]' : aspectRatio === '1:1' ? 'aspect-square' : 'aspect-video'}`}>
                      <img src={scene.image} alt={`Scene ${index + 1}`} className="w-full h-full object-cover opacity-80" />
                      
                      {/* Caption Overlay Preview */}
                      <div className={`absolute inset-0 flex flex-col p-6 pointer-events-none ${
                        scene.captionPosition === 'top' ? 'justify-start pt-16' : 
                        scene.captionPosition === 'bottom' ? 'justify-end pb-16' : 'justify-center'
                      }`}>
                        <div className={`flex flex-col items-center justify-center w-full ${
                          scene.captionStyle === 'dark_overlay' ? 'bg-black/60 p-4 rounded-xl' :
                          scene.captionStyle === 'blur_overlay' ? 'backdrop-blur-md bg-black/40 p-4 border-y border-white/10' : ''
                        }`}>
                          <h1 
                            className={`text-center uppercase tracking-tight text-2xl font-black drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)] ${
                              CAPTION_COLORS.find(c => c.id === scene.captionColor)?.class || ''
                            }`}
                            style={scene.captionColor === 'custom' ? { color: scene.captionCustomColor || '#ffffff' } : {}}
                          >
                            {scene.caption}
                          </h1>
                        </div>
                      </div>
                      
                      {/* Image Cycler Chevrons */}
                      {scene.imageHistory?.length > 1 && (
                        <>
                          <button onClick={() => handleCycleImage(scene.id, -1)} className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black text-white p-1.5 rounded-full backdrop-blur transition-all opacity-0 group-hover:opacity-100 z-10">
                            <ChevronLeft size={18} />
                          </button>
                          <button onClick={() => handleCycleImage(scene.id, 1)} className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black text-white p-1.5 rounded-full backdrop-blur transition-all opacity-0 group-hover:opacity-100 z-10">
                            <ChevronRight size={18} />
                          </button>
                        </>
                      )}
                      
                      {/* Hover Actions */}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-auto">
                        <button 
                          onClick={() => handleRegenerateSceneImage(scene.id)}
                          disabled={regeneratingSceneId === scene.id}
                          className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-lg shadow-primary/20 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {regeneratingSceneId === scene.id ? (
                            <><div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2" /> Regenerating...</>
                          ) : (
                            <><Wand2 size={14} className="mr-2" /> Regenerate Image</>
                          )}
                        </button>
                      </div>
                    </div>
                    <div className="p-5 flex flex-col space-y-4">
                        <div className="grid grid-cols-3 gap-2">
                          <div className="col-span-3 lg:col-span-1">
                            <label className="text-xs text-muted flex items-center mb-1.5 font-medium uppercase tracking-wider">
                              <LayoutTemplate size={12} className="mr-1 text-primary"/> Position
                            </label>
                            <select 
                              value={scene.captionPosition || 'center'}
                              onChange={(e) => updateSceneCaption(scene.id, 'captionPosition', e.target.value)}
                              className="w-full bg-bg border border-border rounded p-2 text-xs text-text focus:outline-none focus:border-primary appearance-none"
                            >
                              <option value="top">Top</option>
                              <option value="center">Center</option>
                              <option value="bottom">Bottom</option>
                            </select>
                          </div>
                          
                          <div className="col-span-3 lg:col-span-1">
                            <label className="text-xs text-muted flex items-center mb-1.5 font-medium uppercase tracking-wider">
                              <LayoutTemplate size={12} className="mr-1 text-primary"/> Style
                            </label>
                            <select 
                              value={scene.captionStyle || 'text_only'}
                              onChange={(e) => updateSceneCaption(scene.id, 'captionStyle', e.target.value)}
                              className="w-full bg-bg border border-border rounded p-2 text-xs text-text focus:outline-none focus:border-primary appearance-none"
                            >
                              <option value="text_only">Text Only</option>
                              <option value="dark_overlay">Dark Overlay</option>
                              <option value="blur_overlay">Blur Overlay</option>
                            </select>
                          </div>

                          <div className="col-span-3 lg:col-span-1">
                            <label className="text-xs text-muted flex items-center mb-1.5 font-medium uppercase tracking-wider">
                              <LayoutTemplate size={12} className="mr-1 text-primary"/> Color
                            </label>
                            <div className="flex items-center space-x-2">
                              <select 
                                value={scene.captionColor || 'white'}
                                onChange={(e) => updateSceneCaption(scene.id, 'captionColor', e.target.value)}
                                className="flex-1 bg-bg border border-border rounded p-2 text-xs text-text focus:outline-none focus:border-primary appearance-none"
                              >
                                {CAPTION_COLORS.map(c => (
                                  <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                              </select>
                              {scene.captionColor === 'custom' && (
                                <input 
                                  type="color" 
                                  value={scene.captionCustomColor || '#ffffff'} 
                                  onChange={(e) => updateSceneCaption(scene.id, 'captionCustomColor', e.target.value)}
                                  className="w-8 h-8 rounded cursor-pointer bg-bg border border-border p-0.5"
                                />
                              )}
                            </div>
                          </div>
                        </div>

                        <div>
                          <label className="text-xs text-muted flex items-center mb-1.5 font-medium uppercase tracking-wider">
                            <Type size={12} className="mr-1.5 text-blue-400"/> Caption Text
                          </label>
                          <input type="text" value={scene.caption || ''} onChange={(e) => updateSceneCaption(scene.id, 'caption', e.target.value)} className="w-full bg-bg border border-border rounded p-2 text-sm text-text focus:outline-none focus:border-primary" />
                        </div>
                      </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-6 border-t border-border flex justify-between items-center shrink-0">
                <button onClick={() => setCurrentStep(3)} className="text-muted hover:text-text px-4 py-2 font-medium transition-colors">Back</button>
                <button 
                  onClick={() => setCurrentStep(5)}
                  className="bg-primary hover:bg-primary-dark text-white px-8 py-3 rounded-xl font-medium transition-colors flex items-center shadow-lg shadow-primary/20"
                >
                  Final Review <ChevronRight size={18} className="ml-2" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 5: REVIEW */}
          {currentStep === 5 && (
            <div className="animate-in fade-in slide-in-from-right-8 duration-500 h-full flex flex-col max-w-4xl mx-auto w-full">
              <div className="text-center mb-8 shrink-0">
                <div className="w-16 h-16 bg-gradient-to-br from-[#10b981] to-[#0ea5e9] rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl shadow-primary/20">
                  <CheckCircle2 size={32} className="text-text" />
                </div>
                <h2 className="text-3xl font-bold mb-2">Ready to Compile</h2>
                <p className="text-muted">All assets have been configured. Review the final details.</p>
              </div>
              
              <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-6">
                <div className="bg-surface border border-border rounded-2xl p-6 shadow-lg flex flex-col md:flex-row gap-6">
                  <div className="flex-1">
                    <h3 className="text-muted font-medium text-sm mb-4 uppercase tracking-wider">Video Summary</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center border-b border-border pb-3">
                        <span className="text-muted">Total Scenes</span>
                        <span className="text-text font-bold">{scenes.length}</span>
                      </div>
                      <div className="flex justify-between items-center border-b border-border pb-3">
                        <span className="text-muted">Total Duration</span>
                        <span className="text-text font-bold">
                          {avScript.reduce((acc, scene) => acc + parseFloat(scene.duration || 0), 0).toFixed(1)} Seconds
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted">Music Vibe</span>
                        <span className="text-text font-bold capitalize">{musicVibe}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-surface border border-border rounded-2xl p-6 shadow-lg">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-primary font-medium text-sm uppercase tracking-wider flex items-center">
                      <Type size={16} className="mr-2" /> Generated Post Description & CTA
                    </h3>
                    <button className="text-xs bg-primary/10 text-primary hover:bg-primary/20 px-3 py-1.5 rounded-lg font-semibold transition-colors flex items-center border border-primary/20">
                      <Wand2 size={12} className="mr-1.5" /> Optimize for Platforms
                    </button>
                  </div>
                  <p className="text-muted text-sm mb-4">
                    The AI generated this highly-engaging caption to accompany your video. It includes a specific CTA word for your automated DM replies.
                  </p>
                  <textarea 
                    value={postDescription}
                    onChange={(e) => setPostDescription(e.target.value)}
                    className="w-full bg-bg border border-border rounded-xl p-4 text-sm text-text focus:outline-none focus:border-primary resize-none h-40 leading-relaxed shadow-inner" 
                  />
                </div>
              </div>

              <div className="flex justify-between items-center mt-6 pt-6 border-t border-border shrink-0">
                <button onClick={() => setCurrentStep(4)} className="text-muted hover:text-text px-4 py-2 font-medium transition-colors">Back</button>
                <button 
                  onClick={handleCompile}
                  disabled={isCompiling}
                  className={`px-10 py-4 rounded-xl font-bold flex items-center transition-all shadow-lg text-lg ${
                    isCompiling ? 'bg-surface-raised text-muted cursor-not-allowed shadow-none' : 'bg-primary hover:bg-primary-dark text-white shadow-[#10b981]/30'
                  }`}
                >
                  {isCompiling ? <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2" /> : null}
                  {isCompiling ? 'Rendering...' : 'Generate Video'}
                </button>
              </div>
            </div>
          )}

          {/* STEP 6: SUCCESS */}
          {currentStep === 6 && (
            <div className="animate-in fade-in slide-in-from-bottom-8 duration-500 h-full flex flex-col justify-center max-w-lg mx-auto w-full text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-[#10b981] to-[#0ea5e9] rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl shadow-primary/20">
                <CheckCircle2 size={48} className="text-text" />
              </div>
              <h2 className="text-4xl font-bold mb-4">Video Rendered!</h2>
              <p className="text-muted mb-10 text-lg leading-relaxed">
                Your video has been successfully rendered by the cloud engine.
              </p>
              
              <div className="flex flex-col space-y-4">
                {videoUrl && (
                  <a 
                    href={videoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="bg-primary border border-border hover:border-primary text-text px-8 py-4 rounded-xl font-bold transition-all shadow-lg flex items-center justify-center mx-auto w-full text-lg group"
                  >
                    <Play size={24} className="mr-3 text-white group-hover:scale-110 transition-transform" />
                    <span className="text-white">Watch & Download Video</span>
                  </a>
                )}
                <button 
                  onClick={() => window.location.reload()}
                  className="bg-surface border border-border hover:border-primary text-text px-8 py-4 rounded-xl font-bold transition-all shadow-lg flex items-center justify-center mx-auto w-full text-lg group"
                >
                  Create Another Video
                </button>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Voice Clone Modal Overlay */}
      {isCloneModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-surface border border-border rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-border flex justify-between items-center">
              <h3 className="text-xl font-bold">Clone Your Voice</h3>
              <button 
                onClick={() => setIsCloneModalOpen(false)}
                className="text-muted hover:text-text transition-colors p-1"
              >
                ✕
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div>
                <label className="text-xs text-muted block mb-2 font-medium uppercase tracking-wider">Voice Name</label>
                <input 
                  type="text" 
                  value={cloneName}
                  onChange={(e) => setCloneName(e.target.value)}
                  placeholder="e.g. My Podcast Voice"
                  className="w-full bg-bg border border-border rounded-xl p-3 text-sm text-text focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="text-xs text-muted block mb-2 font-medium uppercase tracking-wider">Audio Sample (30s+)</label>
                <div className="border-2 border-dashed border-border hover:border-primary/50 rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-colors bg-bg/50 group">
                  <div className="w-12 h-12 bg-surface-raised group-hover:bg-primary/20 rounded-full flex items-center justify-center mb-3 transition-colors">
                    <UploadCloud className="text-muted group-hover:text-primary transition-colors" size={24} />
                  </div>
                  <p className="text-sm font-medium mb-1">Drag and drop audio file</p>
                  <p className="text-xs text-muted">WAV or MP3, max 10MB. Must be clean audio without background noise.</p>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-border flex justify-end gap-3 bg-bg/50">
              <button 
                onClick={() => setIsCloneModalOpen(false)}
                className="px-5 py-2.5 rounded-xl text-sm font-medium text-muted hover:text-text transition-colors"
                disabled={isCloning}
              >
                Cancel
              </button>
              <button 
                onClick={handleCloneVoice}
                disabled={!cloneName.trim() || isCloning}
                className="bg-primary hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg flex items-center"
              >
                {isCloning ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2" />
                    Cloning Voice...
                  </>
                ) : (
                  'Clone & Use Voice'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
