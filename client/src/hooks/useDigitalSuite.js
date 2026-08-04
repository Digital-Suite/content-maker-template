import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export function useDigitalSuite(navConfig) {
  const [isEmbedded, setIsEmbedded] = useState(false);
  const [settings, setSettings] = useState(() => {
    // Restore settings cached from a previous DIGITAL_SUITE_INIT in this session
    try {
      const cached = sessionStorage.getItem('ds_settings');
      return cached ? JSON.parse(cached) : null;
    } catch { return null; }
  });
  const [workspace, setWorkspace] = useState(() => {
    try {
      const cached = sessionStorage.getItem('ds_workspace');
      return cached ? JSON.parse(cached) : null;
    } catch { return null; }
  });
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const inIframe = window !== window.parent;
    setIsEmbedded(inIframe);

    if (inIframe && navConfig) {
      // Register this app's navigation with the parent DigitalSuite desktop.
      // The parent will respond with DIGITAL_SUITE_INIT containing user settings.
      window.parent.postMessage({
        type: 'DIGITAL_SUITE_REGISTER',
        navigation: navConfig
      }, '*');
    }

    const handleMessage = (event) => {
      if (event.data?.type === 'DIGITAL_SUITE_NAVIGATE') {
        const { path } = event.data;
        if (typeof path === 'string') {
          navigate(path);
        }
      } else if (event.data?.type === 'THEME_CHANGE') {
        const { theme } = event.data;
        if (theme === 'dark') {
          document.documentElement.classList.add('dark');
          document.documentElement.classList.remove('light');
        } else {
          document.documentElement.classList.add('light');
          document.documentElement.classList.remove('dark');
        }
      } else if (event.data?.type === 'DIGITAL_SUITE_INIT') {
        // Parent sends user settings (including AI API keys) after registration.
        const payload = event.data.payload || {};
        const receivedSettings = payload.settings || null;
        const receivedWorkspace = payload.workspace || null;
        const apiBaseUrl = payload.apiBaseUrl || 'http://localhost:3333';
        sessionStorage.setItem('ds_apiBaseUrl', apiBaseUrl);

        if (receivedSettings) {
          sessionStorage.setItem('ds_settings', JSON.stringify(receivedSettings));
          setSettings(receivedSettings);
        }
        if (receivedWorkspace) {
          sessionStorage.setItem('ds_workspace', JSON.stringify(receivedWorkspace));
          setWorkspace(receivedWorkspace);
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [navConfig, navigate]);

  const [workspaceId, setWorkspaceId] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    const idFromUrl = params.get('workspaceId');
    if (idFromUrl) {
      sessionStorage.setItem('ds_workspace_id', idFromUrl);
      return idFromUrl;
    }
    return sessionStorage.getItem('ds_workspace_id') || null;
  });

  useEffect(() => {
    if (isEmbedded) {
      window.parent.postMessage({
        type: 'ROUTE_CHANGE',
        path: location.pathname
      }, '*');
    }
  }, [location.pathname, isEmbedded]);

  return { isEmbedded, workspaceId, settings, workspace };
}

/**
 * Utility: read the user's Gemini API key from sessionStorage.
 * Call this from any component without needing to pass the hook result down.
 */
export function getStoredApiKey(provider = 'gemini') {
  try {
    const settings = JSON.parse(sessionStorage.getItem('ds_settings') || '{}');
    const keyMap = {
      gemini: settings.geminiApiKey,
      openai: settings.openAIApiKey,
      anthropic: settings.anthropicApiKey,
    };
    return keyMap[provider] || null;
  } catch { return null; }
}

/**
 * Utility: fetch Voicebox profiles from the local sidecar
 */
export async function fetchVoiceboxProfiles() {
  try {
    const res = await fetch("http://127.0.0.1:14800/profiles");
    if (!res.ok) return [];
    const data = await res.json();
    return data.profiles || [];
  } catch (e) {
    console.warn("Failed to fetch Voicebox profiles", e);
    return [];
  }
}
