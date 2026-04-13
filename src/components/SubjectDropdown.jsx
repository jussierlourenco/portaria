import React, { useState, useEffect, useRef } from 'react';
import { Search, BookOpen, GraduationCap, Database, X, Check } from 'lucide-react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { subscribeToSubjects, subscribeToDepartments, syncSubjects } from '../firebase/db';
import { parseSubjectsCSV } from '../utils/subjectParser';

const SubjectDropdown = ({ isOpen, onClose, onSelect, currentSubjectCode }) => {
  const [subjects, setSubjects] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const unsubSubjects = subscribeToSubjects((data) => {
      setSubjects(data);
      setLoading(false);
    });
    const unsubDepts = subscribeToDepartments(setDepartments);
    
    return () => {
      unsubSubjects();
      unsubDepts();
    };
  }, []);

  // Fechar ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      const response = await fetch('/DISCIPLINA.csv');
      const csvContent = await response.text();
      const subjectsData = parseSubjectsCSV(csvContent, departments);
      await syncSubjects(subjectsData);
      alert(`${subjectsData.length} disciplinas sincronizadas!`);
    } catch (e) {
      alert('Erro ao sincronizar: ' + e.message);
    } finally {
      setIsSyncing(false);
    }
  };

  const filteredSubjects = subjects.filter(s => 
    s.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.name?.toLowerCase().includes(searchTerm.toLowerCase())
  ).slice(0, 50); // Limite para performance

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/10 backdrop-blur-[2px]">
        <Motion.div 
          ref={dropdownRef}
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="w-full max-w-md bg-white rounded-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[70vh] border border-slate-100"
        >
          {/* Header/Search */}
          <div className="p-6 border-b border-slate-50 bg-slate-50/30">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-tighter italic">Selecionar Disciplina</h3>
              <button onClick={onClose} className="p-1 hover:bg-white rounded-full transition-colors text-slate-400">
                <X size={18} />
              </button>
            </div>
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-brand-primary transition-colors" size={16} />
              <input
                autoFocus
                type="text"
                placeholder="Filtrar por código ou nome..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-white border border-slate-200 outline-none focus:border-brand-primary/30 focus:ring-4 focus:ring-brand-primary/5 transition-all text-sm font-bold text-slate-600"
              />
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
            {subjects.length > 0 && (
              <button
                onClick={() => { onSelect(null); onClose(); }}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-rose-50 text-rose-500 transition-all group"
              >
                <div className="w-8 h-8 rounded-lg bg-rose-100 flex items-center justify-center group-hover:bg-rose-500 group-hover:text-white transition-colors">
                  <X size={14} />
                </div>
                <div className="text-left">
                  <p className="text-[10px] font-black uppercase tracking-widest">Remover Disciplina</p>
                  <p className="text-[9px] font-bold opacity-70">Deixar este horário livre</p>
                </div>
              </button>
            )}

            {filteredSubjects.map((subject) => (
              <button
                key={subject.id}
                onClick={() => { onSelect(subject); onClose(); }}
                className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all group ${
                  currentSubjectCode === subject.code ? 'bg-brand-primary/5 border border-brand-primary/10' : 'hover:bg-slate-50 border border-transparent'
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                  currentSubjectCode === subject.code ? 'bg-brand-primary text-white' : 'bg-slate-100 text-slate-400 group-hover:bg-brand-primary/10 group-hover:text-brand-primary'
                }`}>
                  <BookOpen size={14} />
                </div>
                <div className="text-left flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-800">{subject.code}</p>
                    {currentSubjectCode === subject.code && <Check size={12} className="text-brand-primary" />}
                  </div>
                  <p className="text-[11px] font-bold text-slate-500 truncate">{subject.name}</p>
                </div>
              </button>
            ))}

            {subjects.length === 0 && !loading && (
              <div className="py-10 px-6 text-center space-y-4">
                <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-300">
                  <Database size={24} />
                </div>
                <div>
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest leading-relaxed">Nenhuma disciplina carregada</p>
                  <p className="text-[10px] text-slate-400 font-medium italic mt-1">Sincronize com o arquivo CSV para começar</p>
                </div>
                <button
                  onClick={handleSync}
                  disabled={isSyncing}
                  className="w-full py-3 bg-brand-primary text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-brand-primary-dark transition-all flex items-center justify-center gap-2 shadow-lg shadow-brand-primary/20"
                >
                  <Database size={14} />
                  {isSyncing ? 'Sincronizando...' : 'Sincronizar Agora'}
                </button>
              </div>
            )}

            {!loading && subjects.length > 0 && filteredSubjects.length === 0 && (
              <div className="py-10 text-center text-slate-300 font-bold uppercase text-[10px] tracking-widest italic">
                Nenhuma disciplina encontrada
              </div>
            )}
          </div>
        </Motion.div>
      </div>
    </AnimatePresence>
  );
};

export default SubjectDropdown;
