import React, { useState, useEffect } from 'react';
import { subscribeToRooms } from '../firebase/db';
import { Search, MapPin, Clock } from 'lucide-react';
import { clsx } from 'clsx';

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
        <h1 className="text-3xl font-black text-indigo-600 tracking-tighter uppercase italic">ClassControl</h1>
        <p className="text-slate-500 font-medium">Consulta Rápida de Disponibilidade</p>
      </header>

      <div className="max-w-4xl mx-auto">
        <div className="relative mb-8">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="Buscar sala ou bloco..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-5 rounded-3xl bg-white shadow-xl shadow-indigo-50 border-none focus:ring-4 focus:ring-indigo-100 outline-none transition-all text-lg font-medium"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredRooms.map(room => (
            <div key={room.id} className="glass-card p-6 flex justify-between items-center bg-white/40">
              <div>
                <h3 className="text-xl font-black text-slate-800 tracking-tight">{room.name}</h3>
                <div className="flex items-center gap-1 text-slate-400 text-xs font-bold uppercase mt-1">
                  <MapPin size={12} />
                  <span>{room.block}</span>
                </div>
              </div>
              <div className="text-right">
                <span className={clsx(
                  "px-4 py-2 rounded-xl text-sm font-black uppercase tracking-widest",
                   room.status === 'Aberta' ? "bg-emerald-100 text-emerald-600" : "bg-amber-100 text-amber-600"
                )}>
                  {room.status === 'Aberta' ? 'Em Uso' : 'Livre'}
                </span>
                {room.status === 'Fechada' && room.nextEventTime && (
                  <p className="text-[10px] text-slate-400 font-bold mt-2 uppercase">Livre até {room.nextEventTime}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Colaborador;
