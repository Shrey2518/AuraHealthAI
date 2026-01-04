
import React, { useState } from 'react';
import { UserProfile, Doctor } from '../types';

interface DoctorPortalProps {
  profile: UserProfile;
  summary: string;
  onUpdateProfile?: (updates: Partial<UserProfile>) => void;
}

const DOCTORS: Doctor[] = [
  { id: '1', name: 'Dr. Alicia Keys', specialization: 'Cardiology', email: 'akeys@aura.me', image: 'https://i.pravatar.cc/150?u=alicia' },
  { id: '2', name: 'Dr. Marcus Aurelius', specialization: 'General Physician', email: 'marcus@aura.me', image: 'https://i.pravatar.cc/150?u=marcus' },
  { id: '3', name: 'Dr. Sarah Connor', specialization: 'Orthopedics', email: 'sconnor@aura.me', image: 'https://i.pravatar.cc/150?u=sarah' },
  { id: '4', name: 'Dr. John Watson', specialization: 'Dentistry', email: 'jwatson@aura.me', image: 'https://i.pravatar.cc/150?u=watson' },
  { id: '5', name: 'Dr. Gregory House', specialization: 'Neurology', email: 'ghouse@aura.me', image: 'https://i.pravatar.cc/150?u=house' },
];

export const DoctorPortal: React.FC<DoctorPortalProps> = ({ profile, summary, onUpdateProfile }) => {
  const [selectedSpec, setSelectedSpec] = useState<string>('General Physician');
  const [showSOS, setShowSOS] = useState(false);

  const getCleanSummary = (raw: string) => {
    if (!raw) return "";
    return raw.replace(/```html|```/g, '').trim();
  };

  const handleDownload = () => {
    const cleaned = getCleanSummary(summary);
    const fullHtml = `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>body{font-family:sans-serif;padding:40px;color:#334155;background:#f8fafc;} .report-container{max-width:800px;margin:auto;border:1px solid #e2e8f0;padding:60px;border-radius:32px;background:#fff;box-shadow:0 10px 15px -3px rgba(0,0,0,0.1);}</style></head><body><div class="report-container">${cleaned}</div></body></html>`;
    const blob = new Blob([fullHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AuraHealth_Report_${profile.firstName}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredDoctors = DOCTORS.filter(d => d.specialization === selectedSpec);

  return (
    <div className="space-y-12 animate-fadeIn">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-9 space-y-8">
          <div className="bg-white p-12 rounded-[3.5rem] border border-slate-100 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between mb-10 pb-6 border-b border-slate-50">
              <div>
                <h2 className="text-3xl font-black text-slate-800 tracking-tight uppercase">Medical Summary</h2>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Professional Wellness Signature</p>
              </div>
              <button onClick={handleDownload} disabled={!summary} className="px-8 py-4 bg-slate-900 text-white rounded-[1.5rem] font-black text-[10px] hover:bg-black shadow-xl disabled:opacity-50 transition-all uppercase tracking-widest">Download HTML Report</button>
            </div>
            
            <div className="border border-slate-100 rounded-[2.5rem] overflow-hidden bg-white shadow-inner">
              <div className="bg-indigo-50/30 p-10 flex justify-between items-start border-b border-slate-100">
                <div className="space-y-1">
                  <h3 className="text-2xl font-black text-slate-800 tracking-tighter uppercase">Clinical Wellness Record</h3>
                  <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">Secure Data Synchronized</p>
                </div>
                <div className="text-right">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Generated At</p>
                  <p className="text-xs font-black text-slate-700">{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                </div>
              </div>
              
              <div className="p-12 space-y-12 bg-white">
                <section className="space-y-6">
                  <h4 className="text-[11px] font-black text-indigo-600 uppercase tracking-[0.2em] border-b border-indigo-50 pb-3">Patient Profile</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
                    {[
                      { label: 'Name', val: `${profile.firstName} ${profile.lastName}` },
                      { label: 'Email', val: profile.email },
                      { label: 'Gender', val: profile.gender || 'Not Set' },
                      { label: 'Age', val: `${profile.age} Years` },
                      { label: 'Height', val: `${profile.height} cm` },
                      { label: 'Weight', val: `${profile.weight} kg` }
                    ].map((d, i) => (
                      <div key={i}>
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">{d.label}</p>
                        <p className="text-sm font-black text-slate-700 capitalize">{d.val}</p>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="space-y-6">
                  <h4 className="text-[11px] font-black text-indigo-600 uppercase tracking-[0.2em] border-b border-indigo-50 pb-3">Health Context & Markers</h4>
                  <div className="space-y-3">
                    {profile.clinicalHistory.length > 0 ? profile.clinicalHistory.map((item, i) => (
                      <div key={i} className="flex items-center gap-4 bg-slate-50/50 p-4 rounded-2xl border border-slate-50 transition-all hover:bg-white hover:border-indigo-100">
                        <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
                        <span className="text-[11px] font-black text-slate-700 flex-1 uppercase tracking-tight">{item.condition}</span>
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest bg-white px-3 py-1 rounded-full shadow-sm">Marker Age: {item.ageAtDiagnosis}</span>
                      </div>
                    )) : (
                      <p className="text-xs font-medium text-slate-400 italic bg-slate-50 p-6 rounded-2xl text-center">No existing markers recorded.</p>
                    )}
                  </div>
                </section>

                <section className="prose prose-slate prose-sm max-w-none">
                   <div 
                    className="p-8 bg-indigo-50/20 rounded-[2.5rem] border border-indigo-50 text-slate-600 leading-relaxed space-y-6 text-sm"
                    dangerouslySetInnerHTML={{ __html: getCleanSummary(summary) || "<div class='text-center opacity-30 font-black text-[10px] uppercase tracking-[0.3em] py-16'>AuraChat is compiling wellness insights...</div>" }}
                  />
                </section>
              </div>
            </div>
          </div>

          <div className="bg-white p-12 rounded-[3.5rem] border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-10">
              <h3 className="text-2xl font-black text-slate-800 tracking-tight uppercase">Reports Archive</h3>
              <input type="file" id="portal-upload" className="hidden" onChange={e => onUpdateProfile?.({ uploadedFile: e.target.files?.[0]?.name || null })} />
              <label htmlFor="portal-upload" className="px-8 py-3 bg-indigo-600 text-white rounded-[1.5rem] font-black text-[10px] uppercase cursor-pointer hover:bg-indigo-700 transition-all tracking-widest shadow-xl">+ Archive Report</label>
            </div>
            {profile.uploadedFile ? (
              <div className="p-8 bg-indigo-50/50 border border-indigo-100 rounded-[2.5rem] flex items-center justify-between group animate-fadeIn transition-all hover:bg-white hover:shadow-lg">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-3xl shadow-sm">📄</div>
                  <div>
                    <h5 className="text-base font-black text-slate-800 truncate max-w-[250px]">{profile.uploadedFile}</h5>
                    <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Digitally Verified</p>
                  </div>
                </div>
                <button onClick={() => onUpdateProfile?.({ uploadedFile: null })} className="text-[10px] font-black text-rose-500 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity pr-4">Remove</button>
              </div>
            ) : (
              <div className="p-20 border-2 border-dashed border-slate-100 rounded-[3rem] text-center">
                <p className="text-xs font-black text-slate-300 uppercase tracking-[0.3em]">No archived documents yet</p>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-3 space-y-8">
          <div className="bg-[#0f172a] p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden group">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl group-hover:bg-indigo-500/20 transition-all"></div>
            <h3 className="text-lg font-black mb-8 uppercase tracking-widest">System Status</h3>
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Availability</span>
                <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest bg-emerald-500/10 px-3 py-1 rounded-full">Optimal</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">AI Sync</span>
                <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">12ms Latency</span>
              </div>
              <div className="pt-8 border-t border-white/5">
                <p className="text-[9px] font-bold text-slate-500 leading-relaxed italic"><span className="text-indigo-400 font-black">Pro Tip:</span> Synchronization occurs in real-time to ensure wellness signals are up-to-date.</p>
              </div>
            </div>
          </div>

          <div className="relative group">
            <button onClick={() => setShowSOS(!showSOS)} className="w-full p-10 bg-rose-600 hover:bg-rose-700 rounded-[3rem] text-white shadow-2xl shadow-rose-900/10 flex flex-col items-center transition-all hover:scale-[1.02] active:scale-95">
              <div className="bg-white/20 p-5 rounded-[2rem] mb-6 group-hover:scale-110 transition-transform"><span className="text-4xl">🆘</span></div>
              <span className="text-xs font-black tracking-[0.3em] uppercase">Emergency Hub</span>
            </button>
            {showSOS && (
              <div className="absolute top-0 left-0 w-full h-full bg-[#1e293b] rounded-[3rem] p-10 text-white flex flex-col items-center justify-center animate-fadeIn z-10 text-center border border-white/10 shadow-3xl">
                <p className="text-[11px] font-black mb-10 uppercase tracking-[0.4em] text-rose-500">Contact Emergency Services</p>
                <div className="space-y-6 w-full">
                  <a href="tel:911" className="block w-full py-6 bg-rose-600 rounded-[1.5rem] text-center font-black hover:bg-rose-700 transition-all uppercase tracking-[0.2em] text-[15px] shadow-lg shadow-rose-900/40">📞 911</a>
                  <button onClick={() => setShowSOS(false)} className="block w-full text-[10px] font-black text-slate-400 hover:text-white uppercase tracking-widest transition-colors">Return</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
