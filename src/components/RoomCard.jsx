import React from 'react';
import { LogIn, LogOut, Clock, MapPin, BookOpen } from 'lucide-react';
import { clsx } from 'clsx';
import { getRoomScheduleStatus } from '../utils/scheduleLogic';

const RoomCard = ({ room, onAction }) => {
  const isClosed = room.status === 'Fechada' || !room.status;
  const scheduleStatus = getRoomScheduleStatus(room.schedule);
  
  return (
    <div className="glass-card p-5 hover:shadow-2xl transition-all cursor-pointer group flex flex-col justify-between h-full">
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <MapPin size={14} className="text-brand-primary/60" />
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-tighter">
              {room.block} • {room.pavilion}
            </p>
          </div>
          <h3 className="text-xl font-black text-slate-800 tracking-tight">{room.name}</h3>
        </div>
        <div className="flex flex-col items-end gap-2">
          <span className={clsx(
            "status-badge",
            room.status === 'Aberta' ? "bg-emerald-100 text-emerald-600" : "bg-amber-100 text-amber-600"
          )}>
            {room.status || 'Pendente'}
          </span>
          {scheduleStatus.isOccupied && (
            <span className="flex items-center gap-1 px-3 py-1 bg-brand-primary/10 text-brand-primary text-[10px] font-black uppercase tracking-tighter rounded-full border border-brand-primary/20 animate-pulse">
              <BookOpen size={10} />
              Em Aula
            </span>
          )}
        </div>
      </div>

      <div className="bg-slate-50/50 rounded-xl p-3 mb-6 border border-slate-100">
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <Clock size={16} className="text-brand-primary" />
          <span className="font-bold">
            {scheduleStatus.isOccupied ? 'Aula Atual:' : 'Próximo Evento:'}
          </span>
        </div>
        <p className="text-sm text-slate-700 mt-1 pl-6 line-clamp-1 font-medium">
          {scheduleStatus.isOccupied ? scheduleStatus.currentClass : (scheduleStatus.nextClass || 'Sem aulas agendadas')}
        </p>
        <p className="text-xs text-slate-400 pl-6 font-bold">
          {scheduleStatus.isOccupied ? 'Agora' : (scheduleStatus.nextStartTime || '--:--')}
        </p>
      </div>

      <button 
        onClick={(e) => {
          e.stopPropagation();
          onAction(room);
        }}
        className={clsx(
          "w-full py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 active:scale-95",
          isClosed 
            ? "bg-brand-primary text-white shadow-lg shadow-brand-primary/20 hover:bg-brand-primary/90" 
            : "bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-100"
        )}
      >
        {isClosed ? (
          <>
            <LogIn size={18} />
            <span>Abrir Sala (Check-in)</span>
          </>
        ) : (
          <>
            <LogOut size={18} />
            <span>Fechar Sala (Check-out)</span>
          </>
        )}
      </button>
    </div>
  );
};

export default RoomCard;
