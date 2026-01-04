
import React, { useState, useEffect, useRef } from 'react';
import { UserProfile, DashboardTab, Message, ClinicalCondition, CheckupLog, CalendarEvent } from './types';
import { analyzeHealthScore, getHabitFeedback, generateDoctorSummary, chatWithAssistant } from './services/geminiService';
import { HabitTracker } from './components/HabitTracker';
import { MentalHealth } from './components/MentalHealth';
import { DoctorPortal } from './components/DoctorPortal';
import { Trends } from './components/Trends';
// Added Calendar import
import { Calendar } from './components/Calendar';

const App: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('aura_health_clinical_v3');
    if (saved) return JSON.parse(saved);
    return {
      firstName: '', lastName: '', email: '', age: 0, gender: '',
      height: 178, weight: 65, bloodPressure: { systolic: 120, diastolic: 80 },
      bloodSugar: 95, diet: '', activity: 'Moderate', hydration: 2.5,
      steps: 5000, heartRate: 72, spo2: 98, breathing: 16, sleep: 7.5,
      clinicalHistory: [], manualDiseases: '',
      uploadedFile: null, familyHistory: [],
      checkups: [],
      // Initialize events array
      events: []
    };
  });

  const [step, setStep] = useState<'splash' | 'privacy' | 'vitals' | 'living' | 'clinical' | 'analyzing' | 'dashboard'>(
    profile.firstName ? 'dashboard' : 'splash'
  );
  const [activeTab, setActiveTab] = useState<DashboardTab>('insights');
  const [analysis, setAnalysis] = useState<any>(null);
  const [habitFeedback, setHabitFeedback] = useState<any[]>([]);
  const [clinicalSummary, setClinicalSummary] = useState("");
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [chatHistory, setChatHistory] = useState<Message[]>([]);
  const [currentChatInput, setCurrentChatInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem('aura_health_clinical_v3', JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  const DISEASES = ["CARDIAC ARREST", "HIGH BP", "DIABETES", "HYPERTENSION", "ASTHMA", "CHOLESTEROL"];

  const handleAnalyze = async () => {
    setStep('analyzing');
    try {
      const [scoreRes, habitRes] = await Promise.all([
        analyzeHealthScore(profile),
        getHabitFeedback(profile)
      ]);
      setAnalysis(scoreRes);
      setHabitFeedback(habitRes);
      const summary = await generateDoctorSummary(profile);
      setClinicalSummary(summary);
      setStep('dashboard');
    } catch (err) {
      console.error(err);
      setStep('clinical');
    }
  };

  const toggleDisease = (d: string) => {
    setProfile(p => {
      const exists = p.clinicalHistory.find(item => item.condition === d);
      if (exists) {
        return { ...p, clinicalHistory: p.clinicalHistory.filter(i => i.condition !== d) };
      } else {
        return { ...p, clinicalHistory: [...p.clinicalHistory, { condition: d, ageAtDiagnosis: p.age || 23 }] };
      }
    });
  };

  const updateDiagnosisAge = (condition: string, age: number) => {
    setProfile(p => ({
      ...p,
      clinicalHistory: p.clinicalHistory.map(item => 
        item.condition === condition ? { ...item, ageAtDiagnosis: age } : item
      )
    }));
  };

  const handleSendMessage = async () => {
    if (!currentChatInput.trim()) return;
    const userMsg: Message = { role: 'user', content: currentChatInput };
    setChatHistory(prev => [...prev, userMsg]);
    setCurrentChatInput("");
    setIsTyping(true);
    try {
      const aiResponse = await chatWithAssistant(chatHistory, currentChatInput, clinicalSummary);
      setChatHistory(prev => [...prev, { role: 'assistant', content: aiResponse || "Health signals synchronized." }]);
    } finally {
      setIsTyping(false);
    }
  };

  const getAvatarUrl = () => profile.gender === 'female' ? 'https://avatar.iran.liara.run/public/girl' : 'https://avatar.iran.liara.run/public/boy';

  if (step === 'splash') {
    const isValid = profile.firstName.trim() && profile.lastName.trim() && profile.email.includes('@');
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="bg-white w-full max-w-md p-10 rounded-[3rem] shadow-2xl border border-slate-100 flex flex-col items-center">
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-xl mb-6">A</div>
          <h1 className="text-4xl font-black text-slate-900 mb-1">AuraHealth</h1>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-10">Next-Gen Health Ecosystem</p>
          <div className="w-full space-y-4">
            <div className="flex gap-4">
              <input type="text" placeholder="First Name" className="w-1/2 p-4 bg-slate-50 rounded-2xl font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100 transition-all" value={profile.firstName} onChange={e => setProfile({...profile, firstName: e.target.value})} />
              <input type="text" placeholder="Last Name" className="w-1/2 p-4 bg-slate-50 rounded-2xl font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100 transition-all" value={profile.lastName} onChange={e => setProfile({...profile, lastName: e.target.value})} />
            </div>
            <input type="email" placeholder="Email Address" className="w-full p-4 bg-slate-50 rounded-2xl font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100 transition-all" value={profile.email} onChange={e => setProfile({...profile, email: e.target.value})} />
            <button onClick={() => setStep('privacy')} disabled={!isValid} className={`w-full py-5 rounded-2xl font-black uppercase text-xs tracking-widest transition-all mt-4 ${isValid ? 'bg-indigo-600 text-white shadow-xl hover:bg-indigo-700' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}>Join System →</button>
            <p className="text-[9px] font-black text-rose-500 uppercase tracking-widest text-center mt-4">Required: Full Name & Valid Email</p>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'privacy') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="bg-white w-full max-w-2xl p-10 rounded-[3rem] shadow-2xl border border-slate-100">
          <h2 className="text-3xl font-black text-slate-900 text-center uppercase tracking-tighter mb-1">Privacy Policy</h2>
          <p className="text-[10px] font-black text-slate-400 text-center uppercase tracking-[0.2em] mb-10">Legal Disclosure & Consent</p>
          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-4 mb-8 custom-scrollbar">
            {["We respect your privacy and are committed to protecting your personal information.","The app collects only minimal data required to provide health-related features.","Any health data shared by users is stored securely and treated as confidential.","We do not sell, share, or disclose user data to third parties.","Collected data is used only to improve app performance and user experience.","Security measures are implemented to prevent unauthorized access to information.","Users can request deletion of their data at any time.","This app is for informational purposes only and does not replace medical advice.","By using this app, you agree to the terms of this privacy policy."].map((text, i) => (
              <div key={i} className="flex gap-4"><span className="text-xs font-black text-indigo-600">0{i+1}</span><p className="text-sm font-medium text-slate-600">{text}</p></div>
            ))}
          </div>
          <div className="flex flex-col items-center gap-6">
            <div className="flex items-center gap-3"><input type="checkbox" id="privacy-check" className="w-5 h-5 cursor-pointer rounded" checked={agreedToTerms} onChange={e => setAgreedToTerms(e.target.checked)} /><label htmlFor="privacy-check" className="text-xs font-black uppercase text-slate-400 cursor-pointer">I understand & accept terms and conditions</label></div>
            <div className="flex gap-4 w-full"><button onClick={() => setStep('splash')} className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-2xl font-black uppercase text-[10px] tracking-widest">Back</button><button onClick={() => setStep('vitals')} disabled={!agreedToTerms} className={`flex-1 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all ${agreedToTerms ? 'bg-slate-900 text-white hover:bg-black shadow-xl' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}>Next →</button></div>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'vitals' || step === 'living' || step === 'clinical') {
    const isValidVitals = profile.age > 0 && profile.gender && profile.height > 0 && profile.weight > 0;
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="bg-white w-full max-w-2xl p-10 rounded-[3rem] shadow-2xl border border-slate-100">
           {step === 'vitals' && (
             <div className="space-y-8">
               <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">Core Vitals</h2>
               <div className="grid grid-cols-2 gap-4">
                 <input type="number" placeholder="Your Age" className="w-full p-4 bg-slate-50 rounded-2xl font-bold border-none outline-none" value={profile.age || ''} onChange={e => setProfile({...profile, age: Number(e.target.value)})} />
                 <select className="w-full p-4 bg-slate-50 rounded-2xl font-bold border-none outline-none appearance-none" value={profile.gender} onChange={e => setProfile({...profile, gender: e.target.value})}>
                   <option value="">Select Gender</option><option value="male">Male</option><option value="female">Female</option>
                 </select>
                 <input type="number" placeholder="Height (cm)" className="w-full p-4 bg-slate-50 rounded-2xl font-bold border-none outline-none" value={profile.height || ''} onChange={e => setProfile({...profile, height: Number(e.target.value)})} />
                 <input type="number" placeholder="Weight (kg)" className="w-full p-4 bg-slate-50 rounded-2xl font-bold border-none outline-none" value={profile.weight || ''} onChange={e => setProfile({...profile, weight: Number(e.target.value)})} />
               </div>
               <button onClick={() => setStep('living')} disabled={!isValidVitals} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest disabled:opacity-50">Next Step</button>
             </div>
           )}
           {step === 'living' && (
             <div className="space-y-8">
               <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">Living</h2>
               <div className="flex gap-2">
                 {['Sedentary', 'Moderate', 'Active'].map(l => (
                   <button key={l} onClick={() => setProfile({...profile, activity: l})} className={`flex-1 py-4 rounded-2xl font-black text-[10px] uppercase transition-all ${profile.activity === l ? 'bg-indigo-600 text-white' : 'bg-slate-50 text-slate-400'}`}>{l}</button>
                 ))}
               </div>
               <div className="space-y-2">
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Target Hydration: {profile.hydration}L</p>
                 <input type="range" min="0" max="5" step="0.5" className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600" value={profile.hydration} onChange={(e) => setProfile({...profile, hydration: Number(e.target.value)})} />
               </div>
               <button onClick={() => setStep('clinical')} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest">Next Step</button>
             </div>
           )}
           {step === 'clinical' && (
             <div className="space-y-8">
               <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">Clinical Hub</h2>
               <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                 {DISEASES.map(d => (
                   <button key={d} onClick={() => toggleDisease(d)} className={`p-4 rounded-xl border text-[9px] font-black uppercase transition-all ${profile.clinicalHistory.some(h => h.condition === d) ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-slate-100 text-slate-400'}`}>{d}</button>
                 ))}
               </div>
               {profile.clinicalHistory.map((item, idx) => (
                 <div key={idx} className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                   <span className="text-[10px] font-black flex-1 uppercase">{item.condition}</span>
                   <input type="number" className="w-16 p-2 bg-white rounded-lg text-xs font-black border" value={item.ageAtDiagnosis || ''} onChange={e => updateDiagnosisAge(item.condition, Number(e.target.value))} />
                 </div>
               ))}
               <button onClick={handleAnalyze} className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest">Run Bio-Analysis</button>
             </div>
           )}
        </div>
      </div>
    );
  }

  if (step === 'analyzing') {
    return (
      <div className="min-h-screen bg-[#0f172a] flex flex-col items-center justify-center text-white">
        <div className="w-40 h-40 border-[6px] border-white/5 rounded-full relative"><div className="absolute inset-0 border-[6px] border-t-indigo-500 rounded-full animate-spin"></div></div>
        <h2 className="text-2xl font-black tracking-[0.3em] uppercase mt-12">Computing Bio-Signature</h2>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="glass sticky top-0 z-[60] px-8 py-4 flex items-center justify-between border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black shadow-md">A</div>
          <h1 className="text-lg font-black tracking-tighter text-indigo-900">AuraHealth</h1>
        </div>
        <nav className="flex gap-2 bg-slate-100 p-1 rounded-2xl">
          {['insights', 'mental-health', 'vitality', 'medical', 'trends', 'calendar'].map(t => (
            <button key={t} onClick={() => setActiveTab(t as DashboardTab)} className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${activeTab === t ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>{t.replace('-', ' ')}</button>
          ))}
        </nav>
        <button onClick={() => setShowProfileMenu(true)} className="w-10 h-10 rounded-full border-2 border-indigo-100 overflow-hidden shadow-sm hover:scale-105 transition-all">
          <img src={getAvatarUrl()} alt="User" className="w-full h-full object-cover" />
        </button>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full p-8 pb-20">
        <div className="mb-10 flex flex-col md:flex-row justify-between md:items-end gap-6 relative">
          <div>
            <h2 className="text-4xl font-black text-slate-900 mb-2 leading-none">Hello, {profile.firstName}!</h2>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Global Status: Synchronized • Bio-Signature Verified</p>
          </div>
          {analysis && (
            <div className="flex items-center gap-3 bg-white px-6 py-3 rounded-full shadow-sm border border-slate-100">
              <span className={`w-3 h-3 rounded-full ${analysis.wellnessLevel === 'Watchful' ? 'bg-amber-400' : 'bg-emerald-500'}`}></span>
              <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Preventive Awareness: <span className="text-slate-900">{analysis.wellnessLevel}</span></p>
            </div>
          )}
        </div>

        {activeTab === 'insights' && (
          <div className="space-y-10 animate-fadeIn">
            {analysis && (
              <div className="bg-[#1e293b] text-white p-10 rounded-[3rem] shadow-2xl relative overflow-hidden">
                <div className="flex flex-col lg:flex-row gap-12 relative z-10">
                  <div className="lg:w-1/3">
                    <h3 className="text-2xl font-black mb-6 tracking-tighter uppercase">Early Health Insights</h3>
                    <div className="bg-white/5 border border-white/10 p-6 rounded-[2rem] inline-block mb-6">
                      <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Wellness Awareness</p>
                      <p className="text-xl font-black uppercase text-white tracking-tighter">{analysis.wellnessLevel}</p>
                    </div>
                  </div>
                  <div className="lg:w-2/3 grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                    {analysis.wellnessTrends?.map((r: any, idx: number) => (
                      <div key={idx} className="bg-white/5 border border-white/10 rounded-[2rem] p-6 group transition-all hover:bg-white/10">
                        <div className="flex justify-between items-center mb-4">
                          <span className="text-[10px] font-black uppercase tracking-widest text-indigo-300">{r.trend}</span>
                          <span className="text-2xl font-black text-emerald-400">{r.strength}%</span>
                        </div>
                        <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-500" style={{ width: `${r.strength}%` }}></div>
                        </div>
                        <p className="text-[8px] font-black text-slate-500 uppercase mt-2">Optimization Signal</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {[
                { label: 'Heart Rate', val: profile.heartRate, unit: 'BPM', status: 'STEADY', icon: '❤️', color: 'bg-rose-50 text-rose-500' },
                { label: 'SPO2 Level', val: profile.spo2, unit: '%', status: 'GOOD', icon: '🌬️', color: 'bg-blue-50 text-blue-500' },
                { label: 'Blood Pressure', val: `${profile.bloodPressure.systolic}/${profile.bloodPressure.diastolic}`, unit: 'mmHg', status: 'NORMAL', icon: '🩸', color: 'bg-indigo-50 text-indigo-500' },
                { label: 'Sleep Track', val: profile.sleep, unit: 'HRS', status: 'FAIR', icon: '🌙', color: 'bg-purple-50 text-purple-500' },
                { label: 'Step Count', val: profile.steps, unit: 'STEPS', status: 'ACTIVE', icon: '👣', color: 'bg-green-50 text-green-500' },
                { label: 'Breathing', val: profile.breathing, unit: 'BPM', status: 'NORMAL', icon: '🫁', color: 'bg-teal-50 text-teal-500' }
              ].map((v, i) => (
                <div key={i} className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <div className={`w-8 h-8 ${v.color} rounded-xl flex items-center justify-center text-sm`}>{v.icon}</div>
                    <span className="text-[7px] font-black text-indigo-500 uppercase tracking-widest flex items-center gap-1"><span className="w-1 h-1 rounded-full bg-indigo-500 animate-pulse"></span> {v.status}</span>
                  </div>
                  <div>
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">{v.label}</p>
                    <p className="text-xl font-black text-slate-800 tracking-tighter">{v.val}<span className="text-[9px] text-slate-400 ml-0.5">{v.unit}</span></p>
                  </div>
                </div>
              ))}
            </div>

            <HabitTracker profile={profile} onUpdate={u => setProfile(p => ({...p, ...u}))} feedback={habitFeedback} analysis={analysis} />
          </div>
        )}

        {activeTab === 'mental-health' && <MentalHealth />}
        
        {activeTab === 'vitality' && (
          <div className="animate-fadeIn grid grid-cols-1 lg:grid-cols-3 gap-8 h-[600px]">
            <div className="lg:col-span-2 bg-white rounded-[2.5rem] p-8 border border-slate-100 flex flex-col overflow-hidden relative shadow-sm">
              <div className="flex justify-between items-center mb-6 bg-slate-50/50 p-6 rounded-[2rem] border border-slate-100">
                 <div className="flex items-center gap-4">
                   <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white text-2xl shadow-lg">🤖</div>
                   <div>
                     <h4 className="font-black text-slate-800 uppercase tracking-tight">AuraChat</h4>
                     <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Synchronizing Wellness Signals</p>
                   </div>
                 </div>
                 <button onClick={() => { setChatHistory([]); }} className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:bg-indigo-50 px-4 py-2 rounded-xl transition-all">Re-Summarize Report</button>
              </div>
              
              <div className="flex-1 overflow-y-auto space-y-4 mb-6 scrollbar-hide px-2">
                {chatHistory.length === 0 && (
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest animate-pulse flex items-center gap-2">
                     <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
                     AURACHAT IS SYNCHRONIZING WELLNESS DATA...
                   </p>
                )}
                {chatHistory.map((m, i) => (
                  <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] p-4 rounded-3xl text-sm font-medium ${m.role === 'user' ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-50 text-slate-700 border border-slate-100'}`} dangerouslySetInnerHTML={{ __html: m.content }} />
                  </div>
                ))}
                {isTyping && <div className="text-[10px] font-black text-indigo-400 uppercase tracking-widest animate-pulse ml-2 flex items-center gap-2">AuraChat is processing signals...</div>}
                <div ref={chatEndRef} />
              </div>
              <div className="flex gap-2 p-2 bg-slate-50 rounded-[2.5rem] border border-slate-200 shadow-inner">
                <input type="text" placeholder="Ask AuraChat about wellness trends, health signals..." className="flex-1 bg-transparent border-none outline-none px-6 text-sm font-bold" value={currentChatInput} onChange={e => setCurrentChatInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSendMessage()} />
                <button onClick={handleSendMessage} className="px-10 py-4 bg-indigo-600 text-white rounded-[2rem] font-black text-[10px] uppercase shadow-md transition-all hover:bg-indigo-700">Send</button>
              </div>
            </div>
            
            <div className="bg-[#0f172a] text-white p-10 rounded-[2.5rem] flex flex-col justify-center">
              <h4 className="text-[11px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-6">About AuraChat</h4>
              <p className="text-sm font-medium leading-relaxed text-slate-300 mb-8 italic">"I am AuraChat, your dedicated wellness-companion AI built to harmonize your health signals into actionable preventive wisdom."</p>
              <div className="space-y-4 pt-10 border-t border-white/5">
                <div className="flex justify-between items-center text-[10px] font-black uppercase text-slate-500 tracking-widest"><span>Privacy Shield</span><span className="text-emerald-500">Active</span></div>
                <div className="flex justify-between items-center text-[10px] font-black uppercase text-slate-500 tracking-widest"><span>Optimization Mode</span><span className="text-indigo-400">Deep Analysis</span></div>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'medical' && <DoctorPortal profile={profile} summary={clinicalSummary} onUpdateProfile={p => setProfile(prev => ({...prev, ...p}))} />}
        {activeTab === 'trends' && <Trends checkups={profile.checkups} onAddLog={log => setProfile(p => ({...p, checkups: [...p.checkups, log]}))} />}
        {/* Added Calendar tab rendering */}
        {activeTab === 'calendar' && (
          <Calendar 
            events={profile.events || []} 
            onAddEvent={ev => setProfile(p => ({...p, events: [...(p.events || []), ev]}))} 
          />
        )}
      </main>

      {showProfileMenu && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white w-full max-w-sm p-10 rounded-[3rem] shadow-2xl relative">
            <button onClick={() => setShowProfileMenu(false)} className="absolute top-8 right-8 text-slate-300 hover:text-slate-900 font-black">✕</button>
            <div className="text-center mb-10">
              <img src={getAvatarUrl()} className="w-24 h-24 mx-auto rounded-full mb-6 border-4 border-slate-50 shadow-lg" alt="User" />
              <h3 className="text-2xl font-black text-slate-800 tracking-tighter">{profile.firstName} {profile.lastName}</h3>
              <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">{profile.email}</p>
            </div>
            <button onClick={() => { localStorage.clear(); window.location.reload(); }} className="w-full py-4 bg-rose-50 text-rose-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-100 transition-all">Sign Out System</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
