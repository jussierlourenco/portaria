import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  MapPin, 
  Search, 
  Clock, 
  Download, 
  CheckCircle2, 
  Filter,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { subscribeToRooms, subscribeToLogs, subscribeToUsers } from '../firebase/db';
import { SCHEDULE_DAYS, SCHEDULE_SLOTS } from '../utils/scheduleConstants';
import { clsx } from 'clsx';
import { motion as Motion, AnimatePresence } from 'framer-motion';

const Reports = () => {
  const [rooms, setRooms] = useState([]);
  const [logs, setLogs] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [filterBlock, setFilterBlock] = useState('Todos');
  const [viewMode, setViewMode] = useState('pendente'); // 'todas', 'pendente', 'vistoriada'

  useEffect(() => {
    const unsubRooms = subscribeToRooms(setRooms);
    const unsubLogs = subscribeToLogs(setLogs);
    const unsubUsers = subscribeToUsers(setUsers);
    
    return () => {
      unsubRooms();
      unsubLogs();
      unsubUsers();
    };
  }, []);

  // Helper para formatar data do timestamp
  const isSameDay = (timestamp, dateStr) => {
    if (!timestamp) return false;
    const date = timestamp.toDate();
    const dStr = date.toISOString().split('T')[0];
    return dStr === dateStr;
  };

  // Coletar blocos únicos
  const blocks = ['Todos', ...new Set(rooms.map(r => r.block))].sort();

  // Mapear o dia da semana a partir da data selecionada
  const getDayIdFromDate = (dateStr) => {
    const d = new Date(dateStr + 'T12:00:00'); // Evitar problemas de timezone
    const days = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sab'];
    return days[d.getDay()];
  };

  const selectedDayId = getDayIdFromDate(selectedDate);

  // Lógica de Relatório de Rondas
  const getRondaReport = () => {
    const report = [];

    rooms.forEach(room => {
      if (filterBlock !== 'Todos' && room.block !== filterBlock) return;

      SCHEDULE_SLOTS.forEach(slot => {
        const isOccupied = room.schedule?.[selectedDayId]?.[slot];
        
        // Só nos interessa slots sem aula
        if (!isOccupied) {
          // Procurar log de inspeção para esta sala NESTA data
          const inspectionLog = logs.find(log => 
            log.type === 'inspection' && 
            log.roomId === room.id && 
            isSameDay(log.timestamp, selectedDate)
          );

          const inspector = inspectionLog ? users.find(u => u.id === inspectionLog.userId) : null;

          const data = {
            roomId: room.id,
            roomName: room.name,
            block: room.block,
            pavilion: room.pavilion,
            slot: slot,
            status: inspectionLog ? 'vistoriada' : 'pendente',
            inspectorName: inspector?.displayName || '---',
            inspectionTime: inspectionLog ? inspectionLog.timestamp?.toDate()?.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '---'
          };

          // Aplicar filtro de modo de visualização
          if (viewMode === 'todas' || viewMode === data.status) {
            report.push(data);
          }
        }
      });
    });

    return report.sort((a, b) => a.roomName.localeCompare(b.roomName) || a.slot.localeCompare(b.slot));
  };

  const reportData = getRondaReport();

  const handleExportCSV = () => {
    const headers = ['Sala', 'Bloco', 'Horario Vaga', 'Status', 'Porteiro', 'Hora do Bip'];
    const csvContent = [
      headers.join(','),
      ...reportData.map(r => [
        r.roomName,
        r.block,
        r.slot,
        r.status.toUpperCase(),
        r.inspectorName,
        r.inspectionTime
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `ronda_${selectedDate}.csv`);
    link.click();
  };

  return (
    <div className="space-y-8 pb-12">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-brand-primary text-white rounded-[1.5rem] flex items-center justify-center shadow-xl shadow-brand-primary/20">
            <ShieldCheck size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tighter uppercase italic leading-none">Controle de Rondas</h1>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-2 italic">Auditoria de Vistorias por QR Code</p>
          </div>
        </div>

        <div className="flex gap-2">
           <button 
            onClick={handleExportCSV}
            className="px-6 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-all flex items-center gap-3"
          >
            <Download size={16} />
            CSV
          </button>
        </div>
      </header>

      {/* Toolbar de Controle */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6 bg-white p-3 rounded-[2.5rem] border border-slate-100 shadow-sm">
        
        <div className="md:col-span-3 flex items-center gap-3 px-4 md:border-r border-slate-50">
           <Calendar size={20} className="text-brand-primary" />
           <input 
             type="date"
             value={selectedDate}
             onChange={(e) => setSelectedDate(e.target.value)}
             className="bg-transparent outline-none font-black text-xs text-slate-600 w-full"
           />
        </div>

        <div className="md:col-span-6 flex items-center gap-1.5 px-4 md:border-r border-slate-50 overflow-x-auto no-scrollbar">
           {['pendente', 'vistoriada', 'todas'].map(mode => (
             <button
               key={mode}
               onClick={() => setViewMode(mode)}
               className={clsx(
                 "px-5 py-3 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all whitespace-nowrap",
                 viewMode === mode ? "bg-brand-primary text-white shadow-lg shadow-brand-primary/20" : "text-slate-400 hover:bg-slate-50"
               )}
             >
               {mode === 'todas' ? 'Todos os Slots' : mode === 'pendente' ? 'Pendentes' : 'Vistoriados'}
             </button>
           ))}
        </div>

        <div className="md:col-span-3 flex items-center gap-2 px-4">
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

      {/* Lista de Rondas */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
           <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
             <MapPin size={18} className="text-brand-primary" />
             Ronda de {new Date(selectedDate + 'T12:00:00').toLocaleDateString('pt-BR')}
           </h2>
           <div className="flex gap-2">
              <span className="px-4 py-1.5 bg-rose-50 text-rose-500 rounded-full text-[9px] font-black uppercase tracking-widest border border-rose-100 flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-rose-500"></div>
                {reportData.filter(r => r.status === 'pendente').length} Pendentes
              </span>
              <span className="px-4 py-1.5 bg-emerald-50 text-emerald-500 rounded-full text-[9px] font-black uppercase tracking-widest border border-emerald-100 flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                {reportData.filter(r => r.status === 'vistoriada').length} Vistoriados
              </span>
           </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-5 text-left text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Sala</th>
                <th className="px-8 py-5 text-center text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Horário Vaga</th>
                <th className="px-8 py-5 text-center text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Status Ronda</th>
                <th className="px-8 py-5 text-left text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Responsável / Hora</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {reportData.length > 0 ? reportData.map((item, idx) => (
                <tr key={`${item.roomId}-${item.slot}-${idx}`} className="hover:bg-slate-50/30 transition-colors group">
                  <td className="px-8 py-5">
                    <div>
                      <p className="font-black text-slate-700 uppercase italic tracking-tight">{item.roomName}</p>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{item.block}</p>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-lg text-slate-500">
                      <Clock size={12} />
                      <span className="text-[10px] font-black">{item.slot}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-center">
                     <span className={clsx(
                       "px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest inline-flex items-center gap-2",
                       item.status === 'vistoriada' ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" : "bg-slate-100 text-slate-400"
                     )}>
                        {item.status === 'vistoriada' ? <CheckCircle2 size={12} /> : <div className="w-2 h-2 rounded-full bg-slate-300"></div>}
                        {item.status === 'vistoriada' ? 'Vistoriada' : 'Pendente'}
                     </span>
                  </td>
                  <td className="px-8 py-5">
                    {item.status === 'vistoriada' ? (
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black text-slate-700 uppercase">{item.inspectorName}</span>
                        <span className="text-[9px] font-bold text-brand-primary uppercase tracking-widest">Bipado às {item.inspectionTime}</span>
                      </div>
                    ) : (
                      <span className="text-slate-300 italic text-[10px]">Aguardando ronda...</span>
                    )}
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="4" className="px-8 py-20 text-center">
                     <div className="max-w-xs mx-auto space-y-4">
                        <div className="w-16 h-16 bg-slate-50 text-slate-100 rounded-full flex items-center justify-center mx-auto">
                           <ShieldCheck size={32} />
                        </div>
                        <p className="text-slate-300 text-[10px] font-black uppercase tracking-[0.2em]">Sem atividades de ronda para esses filtros.</p>
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
