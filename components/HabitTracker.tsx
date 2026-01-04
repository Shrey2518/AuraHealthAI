
import React from 'react';
import { UserProfile } from '../types';

interface HabitTrackerProps {
  profile: UserProfile;
  analysis: any;
  onUpdate: (updates: Partial<UserProfile>) => void;
  feedback?: any[];
}

export const HabitTracker: React.FC<HabitTrackerProps> = ({ profile, feedback = [] }) => {
  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2 uppercase tracking-tighter">
            Preventive Wellness Protocol
          </h3>
          <div className="space-y-4">
            {feedback.length > 0 ? feedback.map((item, i) => (
              <div key={i} className="p-6 bg-slate-50 border border-slate-100 rounded-3xl hover:bg-white hover:shadow-md transition-all group">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">{item.title}</h4>
                  <span className="text-xs group-hover:scale-110 transition-transform">📋</span>
                </div>
                <p className="text-sm font-medium text-slate-600 leading-relaxed">{item.tip}</p>
              </div>
            )) : (
              <p className="text-xs font-black text-slate-300 uppercase tracking-widest text-center py-10 italic">Analyze wellness signals to unlock guidance...</p>
            )}
          </div>
        </div>

        <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-xl flex flex-col justify-between">
          <div>
            <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-4">Wellness Signals</h4>
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-xl">👣</div>
                <div>
                  <p className="text-2xl font-black">{profile.steps}</p>
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Total Daily Steps</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-xl">💧</div>
                <div>
                  <p className="text-2xl font-black">{profile.hydration} L</p>
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Hydration Balance</p>
                </div>
              </div>
            </div>
            <div className="space-y-2 mt-8">
              <div className="flex justify-between items-center text-[10px] font-bold">
                <span className="text-slate-400">Optimization Status</span>
                <span className="text-indigo-400">88%</span>
              </div>
              <div className="w-full bg-white/10 h-1 rounded-full overflow-hidden">
                <div className="bg-indigo-400 h-full" style={{ width: '88%' }}></div>
              </div>
            </div>
          </div>
          <p className="text-[9px] text-slate-500 font-bold uppercase leading-relaxed mt-10">
            Wellness signal synchronization active. Monitoring metabolic efficiency and health trends in real-time.
          </p>
        </div>
      </div>
    </div>
  );
};
