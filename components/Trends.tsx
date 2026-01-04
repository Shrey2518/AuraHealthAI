
import React, { useState } from 'react';
import { CheckupLog } from '../types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface TrendsProps {
  checkups: CheckupLog[];
  onAddLog: (log: CheckupLog) => void;
}

export const Trends: React.FC<TrendsProps> = ({ checkups, onAddLog }) => {
  const [showForm, setShowForm] = useState(false);
  const [newLog, setNewLog] = useState<Omit<CheckupLog, 'id'>>({
    date: new Date().toISOString().split('T')[0],
    weight: 0,
    heartRate: 0,
    systolic: 0,
    diastolic: 0,
    bloodSugar: 0
  });

  const sortedCheckups = [...checkups].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const isFormValid = newLog.weight > 0 && newLog.heartRate > 0 && newLog.systolic > 0 && newLog.diastolic > 0 && newLog.bloodSugar > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;
    onAddLog({ ...newLog, id: Date.now().toString() });
    setShowForm(false);
    setNewLog({
      date: new Date().toISOString().split('T')[0],
      weight: 0,
      heartRate: 0,
      systolic: 0,
      diastolic: 0,
      bloodSugar: 0
    });
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">Biometric Trends</h2>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Historical Data Visualization • Auto-Synced</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-3 mr-4">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Wellness Status: <span className="text-slate-800">Synchronized</span></p>
          </div>
          <button 
            onClick={() => setShowForm(!showForm)}
            className="px-8 py-3 bg-indigo-600 text-white rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest shadow-xl hover:bg-indigo-700 transition-all"
          >
            {showForm ? 'Cancel Entry' : '+ Log Checkup Result'}
          </button>
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white p-10 rounded-[3rem] border border-indigo-100 shadow-2xl animate-slideDown mb-10 relative overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
            <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-400 uppercase ml-4 tracking-widest">Date</label>
              <input type="date" className="w-full p-4 bg-slate-50 rounded-2xl border-none font-bold outline-none focus:ring-2 focus:ring-indigo-100" value={newLog.date} onChange={e => setNewLog({...newLog, date: e.target.value})} />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-400 uppercase ml-4 tracking-widest">Weight (kg)</label>
              <input type="number" placeholder="Enter Weight" className="w-full p-4 bg-slate-50 rounded-2xl border-none font-bold outline-none focus:ring-2 focus:ring-indigo-100" value={newLog.weight || ''} onChange={e => setNewLog({...newLog, weight: Number(e.target.value)})} />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-400 uppercase ml-4 tracking-widest">Heart Rate</label>
              <input type="number" placeholder="Enter BPM" className="w-full p-4 bg-slate-50 rounded-2xl border-none font-bold outline-none focus:ring-2 focus:ring-indigo-100" value={newLog.heartRate || ''} onChange={e => setNewLog({...newLog, heartRate: Number(e.target.value)})} />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-400 uppercase ml-4 tracking-widest">Systolic</label>
              <input type="number" placeholder="BP Sys" className="w-full p-4 bg-slate-50 rounded-2xl border-none font-bold outline-none focus:ring-2 focus:ring-indigo-100" value={newLog.systolic || ''} onChange={e => setNewLog({...newLog, systolic: Number(e.target.value)})} />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-400 uppercase ml-4 tracking-widest">Diastolic</label>
              <input type="number" placeholder="BP Dia" className="w-full p-4 bg-slate-50 rounded-2xl border-none font-bold outline-none focus:ring-2 focus:ring-indigo-100" value={newLog.diastolic || ''} onChange={e => setNewLog({...newLog, diastolic: Number(e.target.value)})} />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-400 uppercase ml-4 tracking-widest">Blood Sugar</label>
              <input type="number" placeholder="Enter mg/dL" className="w-full p-4 bg-slate-50 rounded-2xl border-none font-bold outline-none focus:ring-2 focus:ring-indigo-100" value={newLog.bloodSugar || ''} onChange={e => setNewLog({...newLog, bloodSugar: Number(e.target.value)})} />
            </div>
          </div>
          <button 
            type="submit" 
            disabled={!isFormValid}
            className={`mt-10 w-full py-5 rounded-[1.5rem] font-black text-[11px] uppercase tracking-widest transition-all shadow-xl ${isFormValid ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
          >
            Submit Entry
          </button>
        </form>
      )}

      {sortedCheckups.length === 0 ? (
        <div className="bg-white p-24 rounded-[3rem] border border-slate-100 text-center flex flex-col items-center gap-6 shadow-sm">
          <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center text-3xl">📉</div>
          <p className="text-xs font-black text-slate-300 uppercase tracking-[0.2em]">No data logged. Visualizations will appear once signals are recorded.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-10">Blood Pressure Progression</h4>
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={sortedCheckups}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={9} tickFormatter={(val) => val.split('-').slice(1).join('/')} />
                  <YAxis stroke="#94a3b8" fontSize={10} fontWeight="bold" />
                  <Tooltip contentStyle={{ borderRadius: '1.5rem', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.1)' }} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '9px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.1em', paddingTop: '20px' }} />
                  <Line type="monotone" dataKey="systolic" stroke="#6366f1" strokeWidth={5} dot={{ r: 4, fill: '#6366f1', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 8 }} />
                  <Line type="monotone" dataKey="diastolic" stroke="#94a3b8" strokeWidth={5} dot={{ r: 4, fill: '#94a3b8', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-10">Sugar & Heart Rate</h4>
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={sortedCheckups}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={9} />
                  <YAxis stroke="#94a3b8" fontSize={10} fontWeight="bold" />
                  <Tooltip contentStyle={{ borderRadius: '1.5rem', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.1)' }} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '9px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.1em', paddingTop: '20px' }} />
                  <Line type="monotone" dataKey="bloodSugar" stroke="#f43f5e" strokeWidth={5} dot={{ r: 4, fill: '#f43f5e', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 8 }} />
                  <Line type="monotone" dataKey="heartRate" stroke="#10b981" strokeWidth={5} dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
