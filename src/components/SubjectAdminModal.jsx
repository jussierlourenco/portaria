import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { subscribeToDepartments } from '../firebase/db';

const SubjectAdminModal = ({ isOpen, onClose, onSave, subject }) => {
  const [formData, setFormData] = useState({
    code: subject?.code || '',
    name: subject?.name || '',
    departmentId: subject?.departmentId || '',
    credits: subject?.credits || '',
  });

  const [departments, setDepartments] = useState([]);

  useEffect(() => {
    const unsubscribe = subscribeToDepartments(setDepartments);
    return () => unsubscribe();
  }, []);

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
                {subject ? 'Editar Disciplina' : 'Nova Disciplina'}
              </h2>
              <button type="button" onClick={onClose} className="p-2 hover:bg-slate-50 rounded-full transition-colors text-slate-400">
                <X size={24} />
              </button>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-1">
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Código</label>
                  <input 
                    type="text" 
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
                    placeholder="Ex: DFS0108" 
                    className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:border-brand-primary/30 outline-none transition-all font-bold text-center" 
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Nome da Disciplina</label>
                  <input 
                    type="text" 
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Ex: Fisiologia Humana" 
                    className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:border-brand-primary/30 outline-none transition-all font-medium" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Departamento Responsável</label>
                <select 
                  required
                  value={formData.departmentId}
                  onChange={(e) => setFormData({...formData, departmentId: e.target.value})}
                  className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:border-brand-primary/30 outline-none transition-all font-medium appearance-none"
                >
                  <option value="">Selecione um departamento...</option>
                  {departments.map(dept => (
                    <option key={dept.id} value={dept.id}>
                      [{dept.sigla}] {dept.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Créditos</label>
                <input 
                  type="text" 
                  value={formData.credits}
                  onChange={(e) => setFormData({...formData, credits: e.target.value})}
                  placeholder="Ex: 4" 
                  className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:border-brand-primary/30 outline-none transition-all font-medium" 
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
                {subject ? 'Salvar Alterações' : 'Cadastrar Disciplina'}
              </button>
            </div>
          </form>
        </Motion.div>
      </div>
    </AnimatePresence>
  );
};

export default SubjectAdminModal;
