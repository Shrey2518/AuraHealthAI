
import React, { useState, useEffect } from 'react';
import { CalendarEvent } from '../types';

interface CalendarProps {
  events: CalendarEvent[];
  onAddEvent: (event: CalendarEvent) => void;
}

export const Calendar: React.FC<CalendarProps> = ({ events, onAddEvent }) => {
  const [showAdd, setShowAdd] = useState(false);
  const [newEvent, setNewEvent] = useState<Omit<CalendarEvent, 'id'>>({
    title: '',
    date: new Date().toISOString().split('T')[0],
    time: '10:00',
    type: 'Appointment'
  });

  const [alerts, setAlerts] = useState<string[]>([]);
  const isEventValid = newEvent.title.trim() !== '';

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const tomorrowDate = new Date();
    tomorrowDate.setDate(tomorrowDate.getDate() + 1);
    const tomorrow = tomorrowDate.toISOString().split('T')[0];

    const newAlerts: string[] = [];
    events.forEach(e => {
      if (e.date === today) {
        newAlerts.push(`Reminder: You have a scheduled activity "${e.title}" scheduled for TODAY at ${e.time}.`);
      } else if (e.date === tomorrow) {
        newAlerts.push(`Heads up! Tomorrow: ${e.type} "${e.title}" at ${e.time}.`);
      }
    });
    setAlerts(newAlerts);
  }, [events]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isEventValid) return;
    onAddEvent({ ...newEvent, id: Date.now().toString() });
    setShowAdd(false);
    setNewEvent({ title: '', date: new Date().toISOString().split('T')[0], time: '10:00', type: 'Appointment' });
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">Health Scheduler</h2>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Protocol & Timeline</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-3 mr-4">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Wellness Status: <span className="text-slate-800">Synchronized</span></p>
          </div>
          <button 
            onClick={() => setShowAdd(!showAdd)}
            className="px-8 py-3 bg-indigo-600 text-white rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest shadow-xl hover:bg-indigo-700 transition-all"
          >
            {showAdd ? 'Cancel' : '+ Schedule Event'}
          </button>
        </div>
      </div>

      {alerts.length > 0 && (
        <div className="space-y-3">
          {alerts.map((alert, i) => (
            <div key={i} className="bg-amber-50 border border-amber-100 p-6 rounded-[2rem] flex items-center gap-6 animate-slideDown shadow-sm">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-2xl shadow-sm">🔔</div>
              <p className="text-[11px] font-black text-amber-800 uppercase tracking-tight">{alert}</p>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-3">
          {showAdd ? (
            <form onSubmit={handleSubmit} className="bg-white p-12 rounded-[3.5rem] border border-indigo-100 shadow-2xl animate-fadeIn max-w-2xl mx-auto">
              <div className="space-y-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-4 tracking-widest">Event Title</label>
                  <input type="text" placeholder="What is the occasion?" className="w-full p-5 bg-slate-50 rounded-2xl border-none font-bold outline-none focus:ring-2 focus:ring-indigo-100" value={newEvent.title} onChange={e => setNewEvent({...newEvent, title: e.target.value})} />
                </div>
                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-4 tracking-widest">Date</label>
                    <input type="date" className="w-full p-5 bg-slate-50 rounded-2xl border-none font-bold outline-none focus:ring-2 focus:ring-indigo-100" value={newEvent.date} onChange={e => setNewEvent({...newEvent, date: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-4 tracking-widest">Time</label>
                    <input type="time" className="w-full p-5 bg-slate-50 rounded-2xl border-none font-bold outline-none focus:ring-2 focus:ring-indigo-100" value={newEvent.time} onChange={e => setNewEvent({...newEvent, time: e.target.value})} />
                  </div>
                </div>
                <button 
                  type="submit" 
                  disabled={!isEventValid}
                  className={`w-full py-5 rounded-[1.5rem] font-black text-[11px] uppercase tracking-widest transition-all shadow-xl ${isEventValid ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-200' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
                >
                  Confirm Activity
                </button>
              </div>
            </form>
          ) : (
            <div className="bg-white rounded-[3.5rem] border border-slate-100 shadow-sm p-12">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] mb-10">Upcoming Agenda</h4>
              {events.length === 0 ? (
                <div className="text-center py-28 opacity-30 flex flex-col items-center gap-6">
                  <div className="w-24 h-24 bg-slate-50 rounded-[2.5rem] flex items-center justify-center text-4xl">📅</div>
                  <p className="text-xs font-black uppercase tracking-[0.3em]">No scheduled activities</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {events.sort((a,b) => a.date.localeCompare(b.date)).map(event => (
                    <div key={event.id} className="p-8 bg-slate-50/50 rounded-[2.5rem] border border-slate-100 flex items-center justify-between hover:bg-white hover:shadow-xl transition-all group cursor-default">
                      <div className="flex items-center gap-6">
                        <div className="w-16 h-16 rounded-[1.5rem] bg-indigo-50 text-indigo-600 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">📋</div>
                        <div>
                          <h5 className="text-base font-black text-slate-800 mb-1">{event.title}</h5>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{event.date}</p>
                        </div>
                      </div>
                      <span className="px-5 py-3 bg-white rounded-2xl text-[10px] font-black text-slate-600 shadow-sm uppercase tracking-widest">{event.time}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
