import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { clsx } from 'clsx';
import { motion as Motion, AnimatePresence } from 'framer-motion';

const RoomAdminModal = ({ isOpen, onClose, onSave, room }) => {
  const [formData, setFormData] = useState({
    name: '',
    block: 'Bloco A',
    pavilion: 'Térreo',
    nextEventTime: ''
  });

  useEffect(() => {
    if (room) {
      setFormData({
        name: room.name || '',
        block: room.block || 'Bloco A',
        pavilion: room.pavilion || 'Térreo',
        nextEventTime: room.nextEventTime || ''
      });
    } else {
      setFormData({
        name: '',
        block: 'Bloco A',
        pavilion: 'Térreo',
        nextEventTime: ''
      });
    }
  }, [room, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
        <Motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        />
        
        <Motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden"
        >
          <form onSubmit={handleSubmit} className="p-8">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-black text-slate-800 tracking-tight">
                {room ? 'Editar Sala' : 'Cadastrar Nova Sala'}
              </h2>
              <button type="button" onClick={onClose} className="p-2 hover:bg-slate-50 rounded-full transition-colors text-slate-400">
                <X size={24} />
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Nome da Sala</label>
                <input 
                  type="text" 
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Ex: Sala 101" 
                  className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:border-brand-primary/30 focus:ring-4 focus:ring-brand-primary/5 outline-none transition-all font-medium" 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Bloco</label>
                  <select 
                    value={formData.block}
                    onChange={(e) => setFormData({...formData, block: e.target.value})}
                    className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:border-brand-primary/30 outline-none transition-all font-medium appearance-none"
                  >
                    <option>Bloco A</option>
                    <option>Bloco B</option>
                    <option>Pavilhão</option>
                    <option>Anexo</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Andar / Pavimento</label>
                  <select 
                    value={formData.pavilion}
                    onChange={(e) => setFormData({...formData, pavilion: e.target.value})}
                    className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:border-brand-primary/30 outline-none transition-all font-medium appearance-none"
                  >
                    <option>Térreo</option>
                    <option>1º Pavimento</option>
                    <option>2º Pavimento</option>
                    <option>3º Pavimento</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Horário de Aula (Ex: 18:00 - 20:00)</label>
                <input 
                  type="text" 
                  value={formData.nextEventTime}
                  onChange={(e) => setFormData({...formData, nextEventTime: e.target.value})}
                  placeholder="Informe o horário do próximo evento" 
                  className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:border-brand-primary/30 focus:ring-4 focus:ring-brand-primary/5 outline-none transition-all font-medium" 
                />
              </div>
            </div>

            <div className="mt-10 flex gap-3">
              <button 
                type="button" 
                onClick={onClose}
                className="flex-1 py-4 rounded-2xl font-bold text-slate-400 hover:bg-slate-50 transition-all"
              >
                Cancelar
              </button>
              <button 
                type="submit"
                className="flex-[2] btn-primary py-4 text-lg font-black tracking-tight"
              >
                {room ? 'Salvar Alterações' : 'Cadastrar Sala'}
              </button>
            </div>
          </form>
        </Motion.div>
      </div>
    </AnimatePresence>
  );
};

export default RoomAdminModal;
