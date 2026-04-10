import React from 'react';
import { LogIn, LogOut, Clock, MapPin } from 'lucide-react';
import { clsx } from 'clsx';

const RoomCard = ({ room, onAction }) => {
  const isClosed = room.status === 'Fechada' || !room.status;
  
  return (
    <div className="glass-card p-5 hover:shadow-2xl transition-all cursor-pointer group flex flex-col justify-between h-full">
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <MapPin size={14} className="text-indigo-400" />
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-tighter">
              {room.block} • {room.pavilion}
            </p>
          </div>
          <h3 className="text-xl font-black text-slate-800 tracking-tight">{room.name}</h3>
        </div>
        <span className={clsx(
          "status-badge",
          room.status === 'Aberta' ? "bg-emerald-100 text-emerald-600" : "bg-amber-100 text-amber-600"
        )}>
          {room.status || 'Pendente'}
        </span>
      </div>

      <div className="bg-slate-50/50 rounded-xl p-3 mb-6 border border-slate-100">
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <Clock size={16} className="text-indigo-500" />
          <span className="font-bold">Próximo Evento:</span>
        </div>
        <p className="text-sm text-slate-700 mt-1 pl-6">
          {room.nextEventName || 'Sem aulas agendadas'}
        </p>
        <p className="text-xs text-slate-400 pl-6">
          {room.nextEventTime || '--:--'}
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
            ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100 hover:bg-indigo-700" 
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
