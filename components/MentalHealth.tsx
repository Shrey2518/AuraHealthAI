
import React, { useState, useEffect, useRef } from 'react';
import { generateHealingStory, getStressFeedback, reciteText } from '../services/geminiService';

export const MentalHealth: React.FC = () => {
  const [stressLevel, setStressLevel] = useState(30);
  const [feedback, setFeedback] = useState("Loading calming insights...");
  const [story, setStory] = useState<string | null>(null);
  const [loadingPhase, setLoadingPhase] = useState<string | null>(null);
  const [isReciting, setIsReciting] = useState(false);
  const [activeMusic, setActiveMusic] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const musicRef = useRef<HTMLAudioElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const activeSourceRef = useRef<AudioBufferSourceNode | null>(null);

  const LOADING_PHASES = [
    "Designing your sanctuary...",
    "Calibrating sensory details...",
    "Harmonizing environmental tones...",
    "Finalizing your peace..."
  ];

  const SONGS = [
    { title: 'Silent Forest', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3', type: 'Ambient' },
    { title: 'Ocean Waves', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3', type: 'Nature' },
    { title: 'Zen Garden', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3', type: 'Meditation' },
  ];

  useEffect(() => {
    const fetchFeedback = async () => {
      const res = await getStressFeedback(stressLevel);
      setFeedback(res || "Take a moment for yourself.");
    };
    const t = setTimeout(fetchFeedback, 500);
    return () => clearTimeout(t);
  }, [stressLevel]);

  useEffect(() => {
    return () => {
      if (musicRef.current) {
        musicRef.current.pause();
        musicRef.current = null;
      }
    };
  }, []);

  const toggleMusic = (song: any) => {
    if (activeMusic === song.title) {
      if (isPlaying) {
        musicRef.current?.pause();
        setIsPlaying(false);
      } else {
        musicRef.current?.play().catch(console.error);
        setIsPlaying(true);
      }
    } else {
      if (musicRef.current) {
        musicRef.current.pause();
      }
      const newAudio = new Audio(song.url);
      newAudio.onended = () => {
        setIsPlaying(false);
        setActiveMusic(null);
      };
      musicRef.current = newAudio;
      musicRef.current.play().catch(e => {
        console.error("Play blocked:", e);
      });
      setActiveMusic(song.title);
      setIsPlaying(true);
    }
  };

  const handleGenerateStory = async () => {
    setStory(null);
    handleStopRecitation();
    
    let phaseIndex = 0;
    setLoadingPhase(LOADING_PHASES[0]);
    const interval = setInterval(() => {
      phaseIndex = (phaseIndex + 1) % LOADING_PHASES.length;
      setLoadingPhase(LOADING_PHASES[phaseIndex]);
    }, 2000);

    try {
      const res = await generateHealingStory(stressLevel);
      setStory(res);
    } finally {
      clearInterval(interval);
      setLoadingPhase(null);
    }
  };

  const decodeAndPlay = async (base64: string) => {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    const dataInt16 = new Int16Array(bytes.buffer);
    
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    }
    const ctx = audioCtxRef.current;
    if (ctx.state === 'suspended') await ctx.resume();

    const numChannels = 1;
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, 24000);
    const channelData = buffer.getChannelData(0);
    for (let i = 0; i < frameCount; i++) channelData[i] = dataInt16[i] / 32768.0;

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);
    source.onended = () => {
      setIsReciting(false);
      activeSourceRef.current = null;
    };
    
    activeSourceRef.current = source;
    source.start();
  };

  const handleRecite = async () => {
    if (!story) return;
    if (isReciting) {
      handleStopRecitation();
      return;
    }
    
    setIsReciting(true);
    try {
      const audioBase64 = await reciteText(story);
      if (audioBase64) await decodeAndPlay(audioBase64);
      else setIsReciting(false);
    } catch (e) {
      console.error(e);
      setIsReciting(false);
    }
  };

  const handleStopRecitation = () => {
    if (activeSourceRef.current) {
      activeSourceRef.current.stop();
      activeSourceRef.current = null;
    }
    setIsReciting(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fadeIn">
      <div className="space-y-8">
        <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm">
          <h2 className="text-2xl font-black text-slate-800 mb-8 uppercase tracking-tighter">Mood Harmonizer</h2>
          <div className="mb-10">
            <div className="flex justify-between items-center mb-4">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Stress Sensitivity: {stressLevel}%</label>
              <span className={`w-2 h-2 rounded-full ${stressLevel > 70 ? 'bg-rose-500 animate-pulse' : stressLevel > 40 ? 'bg-amber-400' : 'bg-emerald-500'}`}></span>
            </div>
            <input 
              type="range" min="0" max="100" 
              className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              value={stressLevel} onChange={(e) => setStressLevel(Number(e.target.value))}
            />
          </div>
          <div className="p-8 bg-indigo-50 border border-indigo-100 rounded-[2rem] flex items-start gap-4">
            <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center text-xl flex-shrink-0 shadow-sm">🧘</div>
            <p className="text-sm text-indigo-900 leading-relaxed font-medium">{feedback}</p>
          </div>
        </div>

        <div className="bg-[#1e293b] text-white p-10 rounded-[3rem] shadow-xl relative overflow-hidden border border-white/5">
          <h3 className="text-xl font-black mb-8 text-white tracking-tight uppercase">AI Healing Visualization</h3>
          
          <div className="mb-8">
            <button 
              onClick={handleGenerateStory}
              disabled={!!loadingPhase}
              className={`w-full py-5 rounded-[1.5rem] font-black uppercase text-[10px] tracking-widest transition-all flex items-center justify-center gap-3 ${loadingPhase ? 'bg-white/10 text-white/40' : 'bg-white text-indigo-900 hover:bg-slate-100 shadow-xl shadow-white/5'}`}
            >
              {loadingPhase ? (
                <>
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  {loadingPhase}
                </>
              ) : '✨ Generate Healing Story'}
            </button>
          </div>

          {story && (
            <div className="p-8 bg-white/5 rounded-[2rem] border border-white/10 animate-fadeIn mb-4">
              <p className="text-slate-300 text-sm leading-relaxed mb-10 italic">"{story}"</p>
              
              <div className="flex items-center justify-between border-t border-white/10 pt-6">
                <button 
                  onClick={handleRecite}
                  className="flex items-center gap-3 text-[10px] font-black text-indigo-400 uppercase tracking-widest hover:text-indigo-300 transition-colors"
                >
                  <span className="text-lg">{isReciting ? '🔊' : '▶'}</span>
                  {isReciting ? 'Narrating (Brisk Pace)...' : 'Recite Story'}
                </button>
                
                {isReciting && (
                  <button onClick={handleStopRecitation} className="text-[10px] font-black text-rose-500 uppercase tracking-widest hover:text-rose-400">
                    Stop
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm h-fit">
        <h2 className="text-2xl font-black text-slate-800 mb-8 uppercase tracking-tighter">Healing Melodies</h2>
        <div className="space-y-4">
          {SONGS.map((song, i) => (
            <div 
              key={i} 
              onClick={() => toggleMusic(song)}
              className={`p-6 rounded-[2rem] border cursor-pointer transition-all flex items-center justify-between ${activeMusic === song.title ? 'border-indigo-500 bg-indigo-50 shadow-md' : 'border-slate-50 hover:border-indigo-100 bg-slate-50/30'}`}
            >
              <div className="flex items-center gap-6">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${activeMusic === song.title && isPlaying ? 'bg-indigo-600 text-white animate-pulse shadow-lg' : 'bg-white text-slate-400 shadow-sm'}`}>
                  <span className="text-xl">{activeMusic === song.title && isPlaying ? '⏸' : '▶'}</span>
                </div>
                <div>
                  <h4 className="font-black text-slate-800 text-sm mb-1">{song.title}</h4>
                  <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">{song.type}</p>
                </div>
              </div>
              <div className={`text-[10px] font-black uppercase tracking-widest ${activeMusic === song.title && isPlaying ? 'text-indigo-600' : 'text-slate-400'}`}>
                {activeMusic === song.title && isPlaying ? 'Now Playing' : 'Select'}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
