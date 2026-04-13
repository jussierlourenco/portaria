import React, { useState, useEffect } from 'react';
import { 
  History, 
  MapPin, 
  Search, 
  Clock, 
  Download, 
  FileText, 
  AlertCircle,
  Calendar,
  Filter
} from 'lucide-react';
import { subscribeToRooms } from '../firebase/db';
import { SCHEDULE_DAYS, SCHEDULE_SLOTS } from '../utils/scheduleConstants';
import { clsx } from 'clsx';
import { motion as Motion, AnimatePresence } from 'framer-motion';

const Reports = () => {
  const [rooms, setRooms] = useState([]);
  const [selectedDay, setSelectedDay] = useState('seg');
  const [filterBlock, setFilterBlock] = useState('Todos');
  useEffect(() => {
    const unsub = subscribeToRooms((data) => {
      setRooms(data);
    });
    return () => unsub();
  }, []);


  // Coletar blocos únicos para o filtro
  const blocks = ['Todos', ...new Set(rooms.map(r => r.block))].sort();

  // Lógica para encontrar horários vagos
  const getAvailabilityReport = () => {
    const report = [];

    rooms.forEach(room => {
      // Filtrar por bloco se não for 'Todos'
      if (filterBlock !== 'Todos' && room.block !== filterBlock) return;

      SCHEDULE_SLOTS.forEach(slot => {
        const isOccupied = room.schedule?.[selectedDay]?.[slot];
        
        if (!isOccupied) {
          report.push({
            roomId: room.id,
            roomName: room.name,
            block: room.block,
            pavilion: room.pavilion,
            day: selectedDay,
            slot: slot
          });
        }
      });
    });

    return report.sort((a, b) => {
      // Ordenar por sala e depois por horário
      if (a.roomName !== b.roomName) return a.roomName.localeCompare(b.roomName);
      return a.slot.localeCompare(b.slot);
    });
  };

  const reportData = getAvailabilityReport();

  const handleExportCSV = () => {
    const headers = ['Sala', 'Bloco', 'Pavilhao', 'Dia', 'Horario'];
    const csvContent = [
      headers.join(','),
      ...reportData.map(r => [
        r.roomName,
        r.block,
        r.pavilion,
        SCHEDULE_DAYS.find(d => d.id === r.day)?.label,
        r.slot
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `disponibilidade_salas_${selectedDay}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 pb-12">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-brand-primary text-white rounded-[1.5rem] flex items-center justify-center shadow-xl shadow-brand-primary/20">
            <History size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tighter uppercase italic leading-none">Relatórios</h1>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-2">Disponibilidade e Ocupação de Salas</p>
          </div>
        </div>

        <button 
          onClick={handleExportCSV}
          className="px-6 py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-brand-primary transition-all flex items-center gap-3 shadow-xl"
        >
          <Download size={16} />
          Exportar Lista (CSV)
        </button>
      </header>

      {/* Filtros e Controles */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 bg-white p-2 rounded-[2.5rem] border border-slate-100 shadow-sm">
        
        <div className="md:col-span-8 flex flex-wrap gap-2">
           {SCHEDULE_DAYS.map(day => (
              <button
                key={day.id}
                onClick={() => setSelectedDay(day.id)}
                className={clsx(
                  "px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all",
                  selectedDay === day.id 
                    ? "bg-brand-primary text-white shadow-lg shadow-brand-primary/20" 
                    : "bg-transparent text-slate-400 hover:text-brand-primary hover:bg-slate-50"
                )}
              >
                {day.label}
              </button>
           ))}
        </div>

        <div className="md:col-span-4 flex items-center gap-2 pr-4 pl-4 md:pl-0 border-l border-slate-50">
           <Filter size={16} className="text-slate-300" />
           <select 
             value={filterBlock}
             onChange={(e) => setFilterBlock(e.target.value)}
             className="w-full bg-transparent outline-none font-black text-[10px] uppercase tracking-widest text-slate-600 cursor-pointer"
           >
             {blocks.map(b => (
               <option key={b} value={b}>{b === 'Todos' ? 'Todos os Blocos' : `Bloco ${b}`}</option>
             ))}
           </select>
        </div>
      </div>

      {/* Tabela de Resultados */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex items-center justify-between">
           <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
             <AlertCircle size={18} className="text-brand-primary" />
             Horários sem Aula Prevista
           </h2>
           <span className="px-4 py-1.5 bg-brand-primary/10 text-brand-primary rounded-full text-[9px] font-black uppercase tracking-widest">
             {reportData.length} Slots Encontrados
           </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-5 text-left text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Sala / Localização</th>
                <th className="px-8 py-5 text-center text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Dia</th>
                <th className="px-8 py-5 text-center text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Horário</th>
                <th className="px-8 py-5 text-center text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {reportData.length > 0 ? reportData.map((item, idx) => (
                <tr key={`${item.roomId}-${item.slot}-${idx}`} className="hover:bg-slate-50/30 transition-colors group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center group-hover:bg-brand-primary/10 group-hover:text-brand-primary transition-colors">
                        <MapPin size={18} />
                      </div>
                      <div>
                        <p className="font-black text-slate-700 uppercase italic tracking-tight">{item.roomName}</p>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{item.block} • {item.pavilion}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-center">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                       {SCHEDULE_DAYS.find(d => d.id === item.day)?.label}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-lg text-slate-600">
                      <Clock size={12} />
                      <span className="text-[10px] font-black">{item.slot}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-center">
                     <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest flex items-center justify-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                        Livre
                     </span>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="4" className="px-8 py-20 text-center">
                     <div className="max-w-xs mx-auto space-y-4">
                        <div className="w-16 h-16 bg-slate-50 text-slate-200 rounded-full flex items-center justify-center mx-auto">
                           <Calendar size={32} />
                        </div>
                        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Nenhuma sala vaga encontrada para este filtro.</p>
                     </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Reports;
