import React, { useState, useEffect } from 'react';
import { subscribeToRooms } from '../firebase/db';
import { Search, MapPin, Clock, BookOpen } from 'lucide-react';
import { clsx } from 'clsx';
import { getRoomScheduleStatus } from '../utils/scheduleLogic';

const Colaborador = () => {
  const [rooms, setRooms] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const unsubscribe = subscribeToRooms(setRooms);
    return () => unsubscribe();
  }, []);

  const filteredRooms = rooms.filter(r => 
    r.name.toLowerCase().includes(search.toLowerCase()) || 
    r.block.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <header className="mb-10 text-center">
        <img 
          src="/logo.png" 
          alt="Logo CB" 
          className="h-28 mx-auto mb-4 drop-shadow-sm"
        />
        <h1 className="text-3xl font-black text-brand-primary tracking-tighter uppercase italic">Portaria CB</h1>
        <p className="text-slate-500 font-bold text-sm tracking-widest uppercase">Gestão de Salas</p>
      </header>

      <div className="max-w-4xl mx-auto">
        <div className="relative mb-8">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="Buscar sala ou bloco..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-5 rounded-3xl bg-white shadow-xl shadow-brand-primary/5 border-none focus:ring-4 focus:ring-brand-primary/10 outline-none transition-all text-lg font-medium"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredRooms.map(room => {
            const scheduleStatus = getRoomScheduleStatus(room.schedule);
            const isPortariaOpen = room.status === 'Aberta';
            
            return (
              <div key={room.id} className="glass-card p-6 flex justify-between items-center bg-white/40">
                <div>
                  <h3 className="text-xl font-black text-slate-800 tracking-tight">{room.name}</h3>
                  <div className="flex items-center gap-1 text-slate-400 text-xs font-bold uppercase mt-1">
                    <MapPin size={12} />
                    <span>{room.block} • {room.pavilion}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex flex-col items-end gap-2">
                    <span className={clsx(
                      "px-4 py-2 rounded-xl text-sm font-black uppercase tracking-widest",
                      isPortariaOpen ? "bg-emerald-100 text-emerald-600" : "bg-amber-100 text-amber-600"
                    )}>
                      {isPortariaOpen ? 'Aberta' : 'Livre'}
                    </span>
                    {scheduleStatus.isOccupied && (
                      <span className="flex items-center gap-1 px-3 py-1 bg-brand-primary/10 text-brand-primary text-[10px] font-black uppercase rounded-full border border-brand-primary/20">
                        <BookOpen size={10} />
                        Há Aula Agora
                      </span>
                    )}
                  </div>
                  {!scheduleStatus.isOccupied && scheduleStatus.nextStartTime && (
                    <p className="text-[10px] text-slate-400 font-bold mt-2 uppercase">Livre até {scheduleStatus.nextStartTime}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Colaborador;
