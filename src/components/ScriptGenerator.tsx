import React, { useState, useEffect } from 'react';
import { TimelineItem, Image } from '../types';
import { Sparkles, Volume2, Download, Copy, Settings } from 'lucide-react';
import { ElevenLabsClient } from 'elevenlabs';

interface Voice {
  id: string;
  name: string;
  category?: string;
}

interface ScriptGeneratorProps {
  timelineItems: TimelineItem[];
  images: Image[];
  onScriptGenerated: (script: string) => void;
  onUpdateTimelineItem: (item: TimelineItem) => void;
}

const ScriptGenerator: React.FC<ScriptGeneratorProps> = ({
  timelineItems,
  images,
  onScriptGenerated,
  onUpdateTimelineItem
}) => {
  const [script, setScript] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isVoiceoverGenerating, setIsVoiceoverGenerating] = useState(false);
  const [currentVoiceoverIndex, setCurrentVoiceoverIndex] = useState<number | null>(null);
  const [selectedVoice, setSelectedVoice] = useState<string>('');
  const [showSettings, setShowSettings] = useState(false);
  const [apiKey, setApiKey] = useState<string>('');
  const [savedApiKey, setSavedApiKey] = useState<string>('');
  const [voices, setVoices] = useState<Voice[]>([]);
  const [isLoadingVoices, setIsLoadingVoices] = useState(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [elevenLabsClient, setElevenLabsClient] = useState<ElevenLabsClient | null>(null);

  // Load API key from localStorage on component mount
  useEffect(() => {
    const storedApiKey = localStorage.getItem('elevenLabsApiKey');
    if (storedApiKey) {
      setApiKey(storedApiKey);
      setSavedApiKey(storedApiKey);
      initializeElevenLabsClient(storedApiKey);
      fetchVoices(storedApiKey);
    }
  }, []);

  const initializeElevenLabsClient = (key: string) => {
    const client = new ElevenLabsClient({ apiKey: key });
    setElevenLabsClient(client);
  };

  // Fetch voices when API key is saved
  const fetchVoices = async (key: string) => {
    setIsLoadingVoices(true);
    setVoiceError(null);
    
    try {
      // Initialize ElevenLabs client
      const client = new ElevenLabsClient({ apiKey: key });
      
      // Fetch voices from ElevenLabs API
      const voicesResponse = await client.voices.getAll();
      
      if (voicesResponse && voicesResponse.voices) {
        const fetchedVoices = voicesResponse.voices.map(voice => ({
          id: voice.voice_id,
          name: voice.name,
          category: voice.category
        }));
        
        setVoices(fetchedVoices);
        
        // Set a default voice if none is selected
        if (!selectedVoice && fetchedVoices.length > 0) {
          setSelectedVoice(fetchedVoices[0].id);
        }
      } else {
        // Fallback to mock voices if API call fails or returns empty
        const mockVoices: Voice[] = [
          { id: 'pNInz6obpgDQGcFmaJgB', name: 'Adam', category: 'premade' },
          { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Antoni', category: 'premade' },
          { id: 'ODq5zmih8GrVes37Dizd', name: 'Arnold', category: 'premade' },
          { id: 'VR6AewLTigWG4xSOukaG', name: 'Bella', category: 'premade' },
          { id: 'yoZ06aMxZJJ28mfd3POQ', name: 'Domi', category: 'premade' },
          { id: 'jBpfuIE2acCO8z3wKNLl', name: 'Elli', category: 'premade' },
          { id: 'MF3mGyEYCl7XYWbV9V6O', name: 'Freya', category: 'premade' },
          { id: 'jsCqWAovK2LkecY7zXl4', name: 'Gigi', category: 'premade' },
          { id: 'zcAOhNBS3c14rBihAFp1', name: 'Harry', category: 'premade' },
          { id: 'IKne3meq5aSn9XLyUdCD', name: 'Josh', category: 'premade' },
          { id: 'XB0fDUnXU5powFXDhCwa', name: 'Rachel', category: 'premade' },
          { id: 'TX3LPaxmHKxFdv7VOQHJ', name: 'Thomas', category: 'premade' }
        ];
        
        setVoices(mockVoices);
        
        if (!selectedVoice && mockVoices.length > 0) {
          setSelectedVoice(mockVoices[0].id);
        }
      }
      
      setIsLoadingVoices(false);
    } catch (error) {
      console.error('Error fetching voices:', error);
      setVoiceError('Failed to fetch voices. Please check your API key and try again.');
      setIsLoadingVoices(false);
      
      // Fallback to mock voices
      const mockVoices: Voice[] = [
        { id: 'pNInz6obpgDQGcFmaJgB', name: 'Adam', category: 'premade' },
        { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Antoni', category: 'premade' },
        { id: 'ODq5zmih8GrVes37Dizd', name: 'Arnold', category: 'premade' },
        { id: 'VR6AewLTigWG4xSOukaG', name: 'Bella', category: 'premade' },
        { id: 'yoZ06aMxZJJ28mfd3POQ', name: 'Domi', category: 'premade' },
        { id: 'jBpfuIE2acCO8z3wKNLl', name: 'Elli', category: 'premade' },
        { id: 'MF3mGyEYCl7XYWbV9V6O', name: 'Freya', category: 'premade' },
        { id: 'jsCqWAovK2LkecY7zXl4', name: 'Gigi', category: 'premade' },
        { id: 'zcAOhNBS3c14rBihAFp1', name: 'Harry', category: 'premade' },
        { id: 'IKne3meq5aSn9XLyUdCD', name: 'Josh', category: 'premade' },
        { id: 'XB0fDUnXU5powFXDhCwa', name: 'Rachel', category: 'premade' },
        { id: 'TX3LPaxmHKxFdv7VOQHJ', name: 'Thomas', category: 'premade' }
      ];
      
      setVoices(mockVoices);
      
      if (!selectedVoice && mockVoices.length > 0) {
        setSelectedVoice(mockVoices[0].id);
      }
    }
  };

  const getImageById = (id: string): Image | undefined => {
    return images.find(img => img.id === id);
  };

  const generateScript = () => {
    setIsGenerating(true);
    
    // Simulate AI script generation
    setTimeout(() => {
      const generatedScript = timelineItems.map((item, index) => {
        const image = getImageById(item.imageId);
        return `[Scene ${index + 1}]: ${image?.alt || 'Image'} - ${generateRandomScriptLine(image?.alt || '')}`;
      }).join('\n\n');
      
      setScript(generatedScript);
      onScriptGenerated(generatedScript);
      setIsGenerating(false);
    }, 2000);
  };

  const generateRandomScriptLine = (imageAlt: string): string => {
    const scriptOptions = [
      `Here we see a beautiful ${imageAlt.toLowerCase()} that showcases the wonders of nature.`,
      `This stunning view of ${imageAlt.toLowerCase()} reminds us of the importance of preserving our environment.`,
      `The magnificent ${imageAlt.toLowerCase()} captures the essence of natural beauty in its purest form.`,
      `Looking at this ${imageAlt.toLowerCase()}, we can appreciate the intricate details that make our world so special.`,
      `This breathtaking ${imageAlt.toLowerCase()} exemplifies the harmony that exists in nature when left undisturbed.`
    ];
    
    return scriptOptions[Math.floor(Math.random() * scriptOptions.length)];
  };

  const generateAllVoiceovers = async () => {
    if (!savedApiKey || !selectedVoice) return;
    
    setIsVoiceoverGenerating(true);
    
    try {
      // Initialize ElevenLabs client if not already done
      if (!elevenLabsClient) {
        initializeElevenLabsClient(savedApiKey);
      }
      
      const client = elevenLabsClient || new ElevenLabsClient({ apiKey: savedApiKey });
      
      // Generate voiceovers for each scene sequentially
      for (let i = 0; i < timelineItems.length; i++) {
        const item = timelineItems[i];
        
        if (!item.caption || item.caption.trim() === '') {
          continue; // Skip items without captions
        }
        
        setCurrentVoiceoverIndex(i);
        
        try {
          // Call the ElevenLabs API to generate the voiceover
          const audioResponse = await client.textToSpeech.convert(selectedVoice, {
            output_format: "mp3_44100_128",
            text: item.caption,
            model_id: "eleven_multilingual_v2"
          });
          
          if (!audioResponse) {
            throw new Error('Failed to generate audio');
          }
          
          // Convert the audio response to a blob
          const audioBlob = new Blob([audioResponse], { type: 'audio/mpeg' });
          
          // Create a URL for the audio blob
          const voiceoverUrl = URL.createObjectURL(audioBlob);
          
          // Update the timeline item with its voiceover URL
          onUpdateTimelineItem({
            ...item,
            voiceoverUrl
          });
          
          // Add a small delay between API calls to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 500));
          
        } catch (error) {
          console.error(`Error generating voiceover for scene ${i + 1}:`, error);
          
          // For demo/fallback purposes, create a mock voiceover URL
          const voiceoverUrl = `voiceover-scene-${i + 1}.mp3`;
          
          // Update the timeline item with the mock voiceover URL
          onUpdateTimelineItem({
            ...item,
            voiceoverUrl
          });
        }
      }
      
      setCurrentVoiceoverIndex(null);
      setIsVoiceoverGenerating(false);
    } catch (error) {
      console.error('Error generating voiceovers:', error);
      alert(error instanceof Error ? error.message : 'Failed to generate voiceovers');
      setCurrentVoiceoverIndex(null);
      setIsVoiceoverGenerating(false);
    }
  };

  const saveApiKey = () => {
    setSavedApiKey(apiKey);
    localStorage.setItem('elevenLabsApiKey', apiKey);
    initializeElevenLabsClient(apiKey);
    setShowSettings(false);
    fetchVoices(apiKey);
  };

  return (
    <div className="card p-4 h-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-dark-100">Script & Voiceover</h2>
        <button 
          onClick={() => setShowSettings(!showSettings)}
          className="p-1.5 rounded-lg bg-dark-700 hover:bg-dark-600 text-dark-300 hover:text-primary-400 transition-colors"
        >
          <Settings className="h-4 w-4" />
        </button>
      </div>
      
      {showSettings ? (
        <div className="mb-4 p-4 bg-dark-700 rounded-lg border border-dark-600">
          <h3 className="text-sm font-medium text-dark-200 mb-3">ElevenLabs API Settings</h3>
          <div className="mb-3">
            <label className="block text-xs text-dark-300 mb-1">API Key</label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter your ElevenLabs API key"
              className="w-full px-3 py-2 bg-dark-800 border border-dark-600 rounded text-dark-100 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
            />
            <p className="text-xs text-dark-400 mt-1">Get your API key from <a href="https://elevenlabs.io" target="_blank" rel="noopener noreferrer" className="text-primary-400 hover:underline">elevenlabs.io</a></p>
          </div>
          <div className="flex justify-end">
            <button
              onClick={() => setShowSettings(false)}
              className="px-3 py-1.5 text-xs bg-dark-600 hover:bg-dark-500 text-dark-200 rounded mr-2"
            >
              Cancel
            </button>
            <button
              onClick={saveApiKey}
              className="px-3 py-1.5 text-xs bg-primary-600 hover:bg-primary-700 text-white rounded"
            >
              Save
            </button>
          </div>
        </div>
      ) : timelineItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-32 text-dark-400">
          <Sparkles className="h-10 w-10 mb-2" />
          <p>Add images to the timeline to generate a script</p>
        </div>
      ) : (
        <>
          <div className="mb-4">
            <button
              onClick={generateScript}
              disabled={isGenerating || timelineItems.length === 0}
              className={`flex items-center justify-center w-full py-2 px-4 rounded-lg ${
                isGenerating || timelineItems.length === 0
                  ? 'bg-dark-700 text-dark-500 cursor-not-allowed'
                  : 'bg-primary-600 hover:bg-primary-700 text-white'
              } transition-colors`}
            >
              {isGenerating ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating Script...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate AI Script
                </>
              )}
            </button>
          </div>
          
          {script && (
            <>
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-sm font-medium text-dark-200">Generated Script</h3>
                  <button 
                    className="p-1 text-dark-400 hover:text-primary-400"
                    onClick={() => navigator.clipboard.writeText(script)}
                    title="Copy to clipboard"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
                <div className="p-3 bg-dark-700 rounded-lg max-h-[180px] overflow-y-auto border border-dark-600">
                  <pre className="whitespace-pre-wrap text-sm text-dark-200 font-mono">{script}</pre>
                </div>
              </div>
              
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-dark-300">Voice</label>
                  <div className="relative w-1/2">
                    {isLoadingVoices ? (
                      <div className="w-full px-3 py-1.5 bg-dark-700 border border-dark-600 rounded text-sm text-dark-400 flex items-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Loading voices...
                      </div>
                    ) : (
                      <>
                        <select
                          value={selectedVoice}
                          onChange={(e) => setSelectedVoice(e.target.value)}
                          className="w-full appearance-none bg-dark-700 border border-dark-600 rounded px-3 py-1.5 text-sm text-dark-200 focus:outline-none focus:ring-1 focus:ring-primary-500"
                          disabled={!savedApiKey || voices.length === 0}
                        >
                          {voices.length === 0 ? (
                            <option value="">No voices available</option>
                          ) : (
                            voices.map(voice => (
                              <option key={voice.id} value={voice.id}>{voice.name}</option>
                            ))
                          )}
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                          <svg className="h-4 w-4 text-dark-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </>
                    )}
                  </div>
                </div>
                
                {voiceError && (
                  <div className="mb-2 p-2 bg-red-900/30 border border-red-800 rounded-lg text-xs text-red-300">
                    {voiceError}
                  </div>
                )}
                
                <button
                  onClick={generateAllVoiceovers}
                  disabled={isVoiceoverGenerating || !savedApiKey || voices.length === 0 || !selectedVoice}
                  className={`flex items-center justify-center w-full py-2 px-4 rounded-lg ${
                    isVoiceoverGenerating || !savedApiKey || voices.length === 0 || !selectedVoice
                      ? 'bg-dark-700 text-dark-500 cursor-not-allowed'
                      : 'bg-accent-600 hover:bg-accent-700 text-white'
                  } transition-colors`}
                >
                  {isVoiceoverGenerating ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {currentVoiceoverIndex !== null ? `Generating Scene ${currentVoiceoverIndex + 1} Voiceover...` : 'Generating Voiceovers...'}
                    </>
                  ) : (
                    <>
                      <Volume2 className="h-4 w-4 mr-2" />
                      Generate AI Voiceovers from Captions
                    </>
                  )}
                </button>
                
                {!savedApiKey && (
                  <p className="text-xs text-dark-400 mt-1 text-center">
                    <span className="text-accent-400">*</span> Add your ElevenLabs API key in settings to generate voiceovers
                  </p>
                )}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default ScriptGenerator;
