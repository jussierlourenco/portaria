import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  MapPin, 
  Calendar, 
  Search, 
  Info, 
  LayoutGrid,
  Map,
  ArrowRight,
  Navigation
} from 'lucide-react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { subscribeToRooms, subscribeToSubjects } from '../firebase/db';
import { SCHEDULE_DAYS, SCHEDULE_SLOTS, getPastelColor } from '../utils/scheduleConstants';
import { clsx } from 'clsx';
import { Link } from 'react-router-dom';

const Mosaic = () => {
  const [rooms, setRooms] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedDay, setSelectedDay] = useState('seg');
  const [activeInfo, setActiveInfo] = useState(null); // { room, slot, subject }
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const unsubRooms = subscribeToRooms(setRooms);
    const unsubSubjects = subscribeToSubjects(setSubjects);
    return () => {
      unsubRooms();
      unsubSubjects();
    };
  }, []);

  const getSubjectInfo = (code) => {
    const subject = subjects.find(s => s.code === code);
    const departmentName = subject?.department || subject?.departmentId || code.substring(0, 3) || 'Geral';
    
    if (subject) {
      return { ...subject, department: departmentName };
    }
    
    return { 
      code, 
      name: 'Disciplina não encontrada', 
      department: departmentName 
    };
  };

  const filteredRooms = rooms.filter(r => 
    r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.block.toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="min-h-screen bg-slate-50/50 p-3 md:p-10 md:space-y-10 space-y-4">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-3 md:gap-6 max-w-[1600px] mx-auto">
        <div className="space-y-1">
          <div className="flex items-center gap-2 md:gap-3">
             <div className="w-8 h-8 md:w-12 md:h-12 bg-brand-primary text-white rounded-xl md:rounded-2xl flex items-center justify-center shadow-lg shadow-brand-primary/20">
                <Map size={18} className="md:w-6 md:h-6" />
             </div>
             <div>
               <h1 className="text-xl md:text-4xl font-black text-brand-primary tracking-tighter uppercase italic leading-none">Mapa de Ocupação</h1>
               <p className="hidden md:block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">Visão geral do centro de biociências (CB)</p>
             </div>
          </div>
        </div>

        {/* Seletor de Dias em Carrossel no Mobile */}
        <div className="w-full md:w-auto overflow-x-auto no-scrollbar scroll-smooth">
          <div className="flex gap-1.5 bg-white p-1.5 rounded-2xl border border-slate-100 shadow-sm min-w-max">
            {SCHEDULE_DAYS.map(day => (
              <button
                key={day.id}
                onClick={() => setSelectedDay(day.id)}
                className={clsx(
                  "px-4 md:px-6 py-2 md:py-3 rounded-xl font-black text-[9px] md:text-[10px] uppercase tracking-widest transition-all",
                  selectedDay === day.id 
                    ? "bg-brand-primary text-white shadow-lg shadow-brand-primary/20" 
                    : "bg-transparent text-slate-400 hover:text-brand-primary hover:bg-slate-50"
                )}
              >
                {day.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Main Grid View */}
      <div className="max-w-[1600px] mx-auto md:space-y-6 space-y-3">
        {/* Toolbar */}
        <div className="flex flex-col md:flex-row gap-3 md:gap-4 items-center">
          <div className="relative flex-1 group w-full">
            <Search className="absolute left-4 md:left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-brand-primary transition-colors" size={16} />
            <input 
              type="text" 
              placeholder="Buscar sala..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 md:pl-14 md:pr-6 py-3 md:py-4 rounded-xl md:rounded-2xl bg-white border border-slate-100 outline-none focus:ring-4 focus:ring-brand-primary/5 focus:border-brand-primary/20 transition-all font-bold text-[10px] md:text-xs text-slate-600 shadow-sm"
            />
          </div>
          
          <div className="w-full md:w-auto bg-white/50 px-3 md:px-4 py-1.5 md:py-2 rounded-xl text-[8px] md:text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center justify-between md:justify-start gap-3 border border-slate-100">
             <div className="flex items-center gap-1.5"><div className="w-2 md:w-2.5 h-2 md:h-2.5 rounded-full bg-slate-200 border border-slate-300"></div> Livre</div>
             <div className="flex items-center gap-1.5"><div className="w-2 md:w-2.5 h-2 md:h-2.5 rounded-full bg-brand-primary"></div> Ocupada</div>
          </div>
        </div>


        {/* Sugestão de Orientação (Apenas Mobile) */}
        <div className="md:hidden flex items-center gap-3 p-4 bg-brand-primary/5 rounded-2xl border border-brand-primary/10">
           <Navigation size={18} className="text-brand-primary animate-pulse" />
           <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-relaxed">
             Dica: Gire o celular para o modo <span className="text-brand-primary">Horizontal</span> para uma visão panorâmica do mosaico.
           </p>
        </div>

        <div className="glass-card overflow-hidden border-white/50 group/table shadow-xl shadow-slate-200/50">
          <div className="overflow-x-auto custom-scrollbar no-scrollbar">
            <table className="w-full border-collapse md:min-w-[1400px] min-w-[850px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 shadow-sm sticky top-0 z-10">
                  <th className="p-2 md:p-5 text-left md:min-w-[200px] min-w-[85px] sticky left-0 bg-slate-50 border-r border-slate-100">
                     <div className="text-[7.5px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                       <span className="hidden md:inline"><MapPin size={12} /></span> Sala
                     </div>
                  </th>
                  {SCHEDULE_SLOTS.map(slot => (
                    <th key={slot} className="p-1 md:p-4 text-center md:min-w-[80px] min-w-[48px]">
                      <span className="text-[7.5px] md:text-[9px] font-black text-slate-500">{slot}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRooms.map((room) => (
                  <tr key={room.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-2 md:p-5 sticky left-0 bg-white border-r border-slate-100 shadow-sm z-[9]">
                       <div className="flex flex-col">
                          <span className="text-[9px] md:text-xs font-black text-slate-800 uppercase tracking-tight truncate leading-none">{room.name}</span>
                          <span className="hidden md:block text-[9px] font-bold text-slate-400 uppercase tracking-widest">{room.block} • {room.pavilion}</span>
                       </div>
                    </td>
                    {SCHEDULE_SLOTS.map(slot => {
                      const subjectCode = room.schedule?.[selectedDay]?.[slot];
                      const info = subjectCode ? getSubjectInfo(subjectCode) : null;
                      const pastelClass = info ? getPastelColor(info.department) : 'bg-transparent text-slate-200';

                      return (
                        <td key={`${room.id}-${slot}`} className="p-0.5 md:p-1 md:min-w-[80px] min-w-[48px]">
                          <Motion.div 
                            whileHover={{ scale: 1.05 }}
                            onClick={() => info && setActiveInfo({ room, slot, subject: info })}
                            className={clsx(
                              "w-full md:h-10 h-7 rounded-sm md:rounded-lg flex items-center justify-center cursor-pointer transition-all border border-transparent text-[6.5px] md:text-[9px] font-black",
                              info ? `${pastelClass} shadow-sm border-white/50 active:scale-95` : "text-slate-100 flex items-center justify-center opacity-30 hover:opacity-100 hover:bg-slate-100"
                            )}
                          >
                            {info ? info.code : '+'}
                          </Motion.div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>


      </div>

      {/* Info Modal / Tooltip */}
      <AnimatePresence>
        {activeInfo && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/10 backdrop-blur-sm" onClick={() => setActiveInfo(null)}>
            <Motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white w-full max-w-sm rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100"
            >
              <div className={clsx("h-3", getPastelColor(activeInfo.subject.department).split(' ')[0])}></div>
              
              <div className="p-8 space-y-6">
                 <div className="flex justify-between items-start">
                    <div className="w-12 h-12 rounded-2xl bg-brand-primary/5 flex items-center justify-center text-brand-primary">
                       <Clock size={24} />
                    </div>
                    <button onClick={() => setActiveInfo(null)} className="p-2 hover:bg-slate-50 rounded-full transition-colors">
                       <LayoutGrid size={20} className="text-slate-300" />
                    </button>
                 </div>

                 <div className="space-y-1">
                    <p className="text-[10px] font-black text-brand-primary uppercase tracking-widest">{activeInfo.subject.code}</p>
                    <h3 className="text-2xl font-black text-slate-800 tracking-tighter uppercase italic">{activeInfo.subject.name}</h3>
                    <p className="text-xs font-bold text-slate-400">{activeInfo.subject.department}</p>
                 </div>

                 <div className="pt-6 border-t border-slate-50 space-y-4">
                    <div className="flex items-center gap-3">
                       <MapPin size={18} className="text-slate-300" />
                       <div>
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Sala / Localização</p>
                          <p className="text-sm font-bold text-slate-600">{activeInfo.room.name} ({activeInfo.room.block})</p>
                       </div>
                    </div>
                    <div className="flex items-center gap-3">
                       <Calendar size={18} className="text-slate-300" />
                       <div>
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Horário</p>
                          <p className="text-sm font-bold text-slate-600 uppercase italic">{SCHEDULE_DAYS.find(d => d.id === selectedDay)?.label} • {activeInfo.slot}</p>
                       </div>
                    </div>
                 </div>

                 <button 
                  onClick={() => setActiveInfo(null)}
                  className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
                >
                  Fechar Detalhes
                </button>
              </div>
            </Motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Login Link for users who stumbled here */}
      <footer className="max-w-[1600px] mx-auto pt-10 border-t border-slate-100 flex flex-col items-center">
         <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em] mb-4 italic">Sistema Portaria CB • CB-Biociências UFRN</p>
         <Link 
          to="/login"
          className="flex items-center gap-2 text-brand-primary font-black text-[10px] uppercase tracking-widest hover:gap-4 transition-all"
         >
           Acesso Administrativo <ArrowRight size={14} />
         </Link>
      </footer>
    </div>
  );
};

export default Mosaic;
