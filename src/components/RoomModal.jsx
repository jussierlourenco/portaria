import React, { useState } from 'react';
import { X, Check } from 'lucide-react';
import { clsx } from 'clsx';
import { motion as Motion, AnimatePresence } from 'framer-motion';

const RoomModal = ({ room, isOpen, onClose, onConfirm }) => {
  const [checklist, setChecklist] = useState({
    ac: false,
    lights: false,
    windows: false,
    projector: false
  });

  if (!isOpen) return null;

  const isCheckout = room.status === 'Aberta';

  const toggleCheck = (item) => {
    setChecklist(prev => ({ ...prev, [item]: !prev[item] }));
  };

  const handleConfirm = () => {
    onConfirm(room.id, checklist);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <Motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        />
        
        {/* Modal content */}
        <Motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden"
        >
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-black text-slate-800 tracking-tight">
                {isCheckout ? 'Fechar Sala' : 'Abrir Sala'}
              </h2>
              <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400">
                <X size={24} />
              </button>
            </div>

            <div className="mb-8">
              <p className="text-slate-500 font-medium">Sala:</p>
              <h3 className="text-xl font-bold text-brand-primary">{room.name}</h3>
              <p className="text-sm text-slate-400">{room.block} • {room.pavilion}</p>
            </div>

            {isCheckout && (
              <div className="space-y-3 mb-8">
                <p className="text-sm font-bold text-slate-700 uppercase tracking-widest mb-4">Checklist de Economia:</p>
                {[
                  { id: 'ac', label: 'Ar-condicionado Desligado' },
                  { id: 'lights', label: 'Luzes Apagadas' },
                  { id: 'windows', label: 'Janelas Fechadas' },
                  { id: 'projector', label: 'Projetor Desligado' }
                ].map(item => (
                  <button
                    key={item.id}
                    onClick={() => toggleCheck(item.id)}
                    className={clsx(
                      "w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all",
                      checklist[item.id] 
                        ? "border-emerald-500 bg-emerald-50/50 text-emerald-700" 
                        : "border-slate-100 bg-slate-50 text-slate-500 hover:border-slate-200"
                    )}
                  >
                    <span className="font-semibold">{item.label}</span>
                    <div className={clsx(
                      "w-6 h-6 rounded-full flex items-center justify-center transition-all",
                      checklist[item.id] ? "bg-emerald-500 text-white" : "bg-slate-200"
                    )}>
                      {checklist[item.id] && <Check size={14} strokeWidth={4} />}
                    </div>
                  </button>
                ))}
              </div>
            )}

            <button 
              onClick={handleConfirm}
              className={clsx(
                "w-full py-4 rounded-2xl font-black text-lg transition-all shadow-lg active:scale-95 mb-2",
                isCheckout 
                  ? (Object.values(checklist).every(v => v) ? "bg-emerald-600 text-white shadow-emerald-200" : "bg-slate-200 text-slate-400 cursor-not-allowed")
                  : "bg-brand-primary text-white shadow-brand-primary/20"
              )}
              disabled={isCheckout && !Object.values(checklist).every(v => v)}
            >
              Confirmar Operação
            </button>
            {isCheckout && !Object.values(checklist).every(v => v) && (
              <p className="text-center text-xs text-rose-500 font-bold animate-pulse">
                Complete todo o checklist para fechar a sala
              </p>
            )}
          </div>
        </Motion.div>
      </div>
    </AnimatePresence>
  );
};

export default RoomModal;
