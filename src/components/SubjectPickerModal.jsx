import React, { useState, useEffect } from 'react';
import { X, Search, BookOpen, GraduationCap, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { subscribeToSubjects } from '../firebase/db';

const SubjectPickerModal = ({ isOpen, onClose, onSelect, currentSubjectCode }) => {
  const [subjects, setSubjects] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isOpen) return;
    const unsubscribe = subscribeToSubjects((data) => {
      setSubjects(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [isOpen]);

  const filteredSubjects = subjects.filter(s => 
    s.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.department?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
        >
          <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
            <div>
              <h2 className="text-2xl font-black text-slate-800 tracking-tighter uppercase italic leading-none">
                Selecionar Disciplina
              </h2>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Busque pelo código ou nome</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white rounded-full transition-colors text-slate-400">
              <X size={24} />
            </button>
          </div>

          <div className="p-6 border-b border-slate-100">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
              <input 
                autoFocus
                type="text"
                placeholder="Ex: DFS0108 ou Genética..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:border-brand-primary/20 focus:ring-4 focus:ring-brand-primary/5 outline-none transition-all font-bold text-slate-600"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {/* Opção para Limpar Horário */}
            <button
              onClick={() => onSelect(null)}
              className="w-full text-left p-4 rounded-2xl hover:bg-rose-50 group transition-all flex items-center justify-between border border-transparent hover:border-rose-100"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-500 flex items-center justify-center">
                  <X size={20} />
                </div>
                <div>
                  <p className="font-black text-rose-500 uppercase text-xs tracking-widest">Remover Disciplina</p>
                  <p className="text-[10px] text-rose-300 font-bold uppercase italic">Deixar este horário livre</p>
                </div>
              </div>
            </button>

            {loading ? (
              <div className="py-20 text-center animate-pulse text-slate-300 font-bold uppercase tracking-widest">Carregando disciplinas...</div>
            ) : filteredSubjects.map(subject => (
              <button
                key={subject.id}
                onClick={() => onSelect(subject)}
                className={`w-full text-left p-4 rounded-2xl transition-all flex items-center justify-between group border ${
                  currentSubjectCode === subject.code 
                  ? 'bg-brand-primary/5 border-brand-primary/20 ring-2 ring-brand-primary/5' 
                  : 'hover:bg-slate-50 border-transparent'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black ${
                    currentSubjectCode === subject.code ? 'bg-brand-primary text-white' : 'bg-slate-100 text-slate-400 group-hover:bg-white group-hover:text-brand-primary'
                  }`}>
                    <BookOpen size={20} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-black text-slate-800 uppercase text-sm tracking-tight">{subject.code}</span>
                      <span className="text-[10px] font-black bg-slate-100 text-slate-400 px-2 py-0.5 rounded-full uppercase tracking-widest">{subject.department}</span>
                    </div>
                    <p className="text-xs text-slate-500 font-bold max-w-[300px] truncate">{subject.name}</p>
                  </div>
                </div>
              </button>
            ))}
            
            {!loading && filteredSubjects.length === 0 && (
              <div className="py-20 text-center text-slate-300 font-bold uppercase tracking-widest italic">
                Nenhuma disciplina encontrada
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default SubjectPickerModal;
