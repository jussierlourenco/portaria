import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  ChevronDown, 
  Save, 
  Trash2, 
  CheckCircle2, 
  Info, 
  LayoutGrid,
  MapPin,
  Clock
} from 'lucide-react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { subscribeToRooms, subscribeToSubjects, updateRoom } from '../firebase/db';
import { SCHEDULE_DAYS, SCHEDULE_SLOTS, getPastelColor } from '../utils/scheduleConstants';
import SubjectPickerModal from '../components/SubjectPickerModal';
import { clsx } from 'clsx';

const Distribution = () => {
  const [rooms, setRooms] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedRoomId, setSelectedRoomId] = useState('');
  const [tempSchedule, setTempSchedule] = useState({});
  const [activeCell, setActiveCell] = useState(null); // { day, slot }
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    const unsubRooms = subscribeToRooms(setRooms);
    const unsubSubjects = subscribeToSubjects(setSubjects);
    return () => {
      unsubRooms();
      unsubSubjects();
    };
  }, []);

  // Quando o ID da sala muda, carrega o schedule atual dela
  useEffect(() => {
    if (selectedRoomId) {
      const room = rooms.find(r => r.id === selectedRoomId);
      if (room) setTempSchedule(room.schedule || {});
    }
  }, [selectedRoomId, rooms]);

  const handleCellClick = (day, slot) => {
    setActiveCell({ day, slot });
    setIsModalOpen(true);
  };

  const handleSubjectSelect = (subject) => {
    const newSchedule = { ...tempSchedule };
    const day = activeCell.day;
    const slot = activeCell.slot;

    if (!newSchedule[day]) newSchedule[day] = {};

    if (subject) {
      newSchedule[day][slot] = subject.code;
    } else {
      delete newSchedule[day][slot];
    }

    setTempSchedule(newSchedule);
    setIsModalOpen(false);
  };

  const handleSave = async () => {
    if (!selectedRoomId) return;
    setIsSaving(true);
    try {
      await updateRoom(selectedRoomId, { schedule: tempSchedule });
      setMessage({ type: 'success', text: 'Grade de horários salva com sucesso!' });
      setTimeout(() => setMessage(null), 3000);
    } catch (e) {
      setMessage({ type: 'error', text: 'Erro ao salvar: ' + e.message });
    } finally {
      setIsSaving(false);
    }
  };

  const handleClearAll = () => {
    if (window.confirm('Deseja limpar todos os horários desta sala?')) {
      setTempSchedule({});
    }
  };

  const currentRoom = rooms.find(r => r.id === selectedRoomId);

  // Helper para buscar informações da disciplina pelo código
  const getSubjectInfo = (code) => {
    const subject = subjects.find(s => s.code === code);
    return subject || { code, name: 'Disciplina não encontrada', department: 'Geral' };
  };

  return (
    <div className="space-y-8 pb-20">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-4xl font-black text-brand-primary tracking-tighter uppercase italic leading-none">Distribuição de Salas</h1>
          <p className="text-slate-500 font-medium italic mt-2 flex items-center gap-2">
             <Calendar size={16} /> Gestão de horários e disciplinas semanais
          </p>
        </div>

        <div className="w-full md:w-80 space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Selecionar Sala para Edição</label>
          <div className="relative group">
            <LayoutGrid className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-hover:text-brand-primary transition-colors" size={20} />
            <select
              value={selectedRoomId}
              onChange={(e) => setSelectedRoomId(e.target.value)}
              className="w-full pl-12 pr-10 py-4 rounded-2xl bg-white border border-slate-100 shadow-sm focus:ring-4 focus:ring-brand-primary/5 outline-none font-bold text-slate-600 appearance-none cursor-pointer transition-all"
            >
              <option value="">Escolha uma sala...</option>
              {rooms.map(room => (
                <option key={room.id} value={room.id}>{room.name} ({room.block})</option>
              ))}
            </select>
            <ChevronDown size={20} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" />
          </div>
        </div>
      </header>

      {/* Info Card */}
      {selectedRoomId ? (
        <Motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6"
        >
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-3xl bg-brand-primary/5 flex items-center justify-center text-brand-primary">
              <MapPin size={32} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tighter leading-none">{currentRoom?.name}</h2>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Localização: Bloco {currentRoom?.block} • {currentRoom?.pavilion}</p>
            </div>
          </div>

          <div className="flex gap-3 w-full md:w-auto">
            <button 
              onClick={handleClearAll}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest text-rose-500 hover:bg-rose-50 transition-all border border-rose-100"
            >
              <Trash2 size={18} />
              Limpar
            </button>
            <button 
              disabled={isSaving}
              onClick={handleSave}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest bg-brand-primary text-white shadow-xl shadow-brand-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
            >
              <Save size={18} />
              {isSaving ? 'Salvando...' : 'Salvar Alterações'}
            </button>
          </div>
        </Motion.div>
      ) : (
        <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2.5rem] py-20 text-center space-y-4">
           <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto shadow-sm text-slate-300">
             <Info size={32} />
           </div>
           <p className="font-bold text-slate-400 italic">Selecione uma sala no menu acima para gerenciar a distribuição de horários.</p>
        </div>
      )}

      {/* Grid Container */}
      <AnimatePresence>
        {selectedRoomId && (
          <Motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glass-card overflow-x-auto min-w-[800px]"
          >
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="p-6 bg-slate-50/50 border-r border-b border-slate-100 text-left w-32">
                     <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                       <Clock size={14} /> Horário
                     </div>
                  </th>
                  {SCHEDULE_DAYS.map(day => (
                    <th key={day.id} className="p-6 bg-slate-50/50 border-b border-slate-100 text-center">
                      <span className="text-[10px] font-black text-slate-800 uppercase tracking-[0.3em]">{day.label}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {SCHEDULE_SLOTS.map((slot, rowIndex) => (
                  <tr key={slot} className="group hover:bg-slate-50/30 transition-colors">
                    <td className="p-4 border-r border-b border-slate-100 bg-slate-50/20">
                      <span className="text-[10px] font-black text-slate-500">{slot}</span>
                    </td>
                    {SCHEDULE_DAYS.map(day => {
                      const subjectCode = tempSchedule[day.id]?.[slot];
                      const subjectInfo = subjectCode ? getSubjectInfo(subjectCode) : null;
                      const pastelClass = subjectInfo ? getPastelColor(subjectInfo.department) : 'bg-transparent text-slate-300';

                      return (
                        <td 
                          key={`${day.id}-${slot}`} 
                          className="border-b border-slate-100 p-2 relative h-20"
                          onClick={() => handleCellClick(day.id, slot)}
                        >
                          <div className={clsx(
                            "w-full h-full rounded-2xl flex flex-col items-center justify-center text-center p-2 cursor-pointer transition-all border border-transparent",
                            subjectInfo ? `${pastelClass} shadow-sm scale-[1.02] border-white/50` : 'hover:bg-slate-100/50 hover:border-slate-200 opacity-30 hover:opacity-100'
                          )}>
                            {subjectInfo ? (
                              <>
                                <span className="text-[11px] font-black leading-none mb-1 tracking-tight">{subjectInfo.code}</span>
                                <span className="text-[9px] font-bold opacity-70 truncate w-full px-1">{subjectInfo.name}</span>
                              </>
                            ) : (
                              <span className="text-[10px] font-black uppercase tracking-widest">+</span>
                            )}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </Motion.div>
        )}
      </AnimatePresence>

      <SubjectPickerModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelect={handleSubjectSelect}
        currentSubjectCode={activeCell ? tempSchedule[activeCell.day]?.[activeCell.slot] : null}
      />

      {/* Message Popup */}
      <AnimatePresence>
        {message && (
          <Motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className={clsx(
              "fixed bottom-10 left-1/2 -translate-x-1/2 px-8 py-4 rounded-full shadow-2xl font-black uppercase text-xs tracking-widest z-[200] flex items-center gap-3",
              message.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'
            )}
          >
            {message.type === 'success' ? <CheckCircle2 size={18} /> : <Info size={18} />}
            {message.text}
          </Motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Distribution;
