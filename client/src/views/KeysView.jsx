import React, { useState, useEffect } from 'react';
import { Key, Save, CheckCircle2, ShieldAlert } from 'lucide-react';

export function KeysView() {
  const [keys, setKeys] = useState({
    AWS_ACCESS_KEY_ID: '',
    AWS_SECRET_ACCESS_KEY: '',
    AWS_REGION: 'us-east-1'
  });
  
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const savedKeys = localStorage.getItem('ds_content_maker_keys');
    if (savedKeys) {
      try {
        setKeys(JSON.parse(savedKeys));
      } catch (e) {
        console.error("Failed to parse keys", e);
      }
    }
  }, []);

  const handleChange = (e) => {
    setKeys({ ...keys, [e.target.name]: e.target.value });
    setIsSaved(false);
  };

  const handleSave = () => {
    localStorage.setItem('ds_content_maker_keys', JSON.stringify(keys));
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="h-full flex flex-col bg-bg text-text p-8 animate-in fade-in duration-500">
      <div className="max-w-3xl mx-auto w-full">
        <div className="flex items-center space-x-4 mb-8 border-b border-border pb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-[#10b981] to-[#0ea5e9] rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
            <Key size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Settings & Keys</h1>
            <p className="text-muted mt-1">Configure your Remotion Lambda & AWS Credentials locally in your browser.</p>
          </div>
        </div>

        <div className="bg-surface border border-border rounded-2xl shadow-lg p-8">
          <div className="flex items-start bg-primary/10 border border-primary/20 p-4 rounded-xl mb-8">
            <ShieldAlert size={24} className="text-primary mr-4 shrink-0 mt-0.5" />
            <div className="text-sm text-text leading-relaxed">
              <strong>Local Storage Only:</strong> These keys are saved directly to your browser's local storage and are never sent to our database. They are only sent in the background when you generate a video. If you clear your browser cache, you will need to re-enter them.
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-text mb-2 uppercase tracking-wider">AWS Access Key ID</label>
              <input
                type="text"
                name="AWS_ACCESS_KEY_ID"
                value={keys.AWS_ACCESS_KEY_ID}
                onChange={handleChange}
                placeholder="AKIA..."
                className="w-full bg-bg border border-border rounded-xl px-4 py-3 text-text focus:outline-none focus:border-primary font-mono transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-text mb-2 uppercase tracking-wider">AWS Secret Access Key</label>
              <input
                type="password"
                name="AWS_SECRET_ACCESS_KEY"
                value={keys.AWS_SECRET_ACCESS_KEY}
                onChange={handleChange}
                placeholder="Your secret key..."
                className="w-full bg-bg border border-border rounded-xl px-4 py-3 text-text focus:outline-none focus:border-primary font-mono transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-text mb-2 uppercase tracking-wider">AWS Region</label>
              <input
                type="text"
                name="AWS_REGION"
                value={keys.AWS_REGION}
                onChange={handleChange}
                placeholder="e.g. us-east-1"
                className="w-full bg-bg border border-border rounded-xl px-4 py-3 text-text focus:outline-none focus:border-primary font-mono transition-colors"
              />
            </div>
          </div>

          <div className="mt-10 flex justify-end">
            <button
              onClick={handleSave}
              className="bg-primary hover:bg-primary-dark text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg flex items-center shadow-primary/20"
            >
              {isSaved ? (
                <>
                  <CheckCircle2 size={20} className="mr-2" /> Saved
                </>
              ) : (
                <>
                  <Save size={20} className="mr-2" /> Save Configuration
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
