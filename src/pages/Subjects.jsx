import React, { useState, useEffect } from 'react';
import { Plus, BookOpen, Database, Trash2, Edit3, Search, Filter } from 'lucide-react';
import { 
  subscribeToSubjects, 
  subscribeToDepartments, 
  addSubject, 
  updateSubject, 
  deleteSubject, 
  syncSubjects 
} from '../firebase/db';
import SubjectAdminModal from '../components/SubjectAdminModal';
import { parseSubjectsCSV } from '../utils/subjectParser';

const Subjects = () => {
  const [subjects, setSubjects] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('all');

  useEffect(() => {
    const unsubscribeSubjects = subscribeToSubjects(setSubjects);
    const unsubscribeDepts = subscribeToDepartments(setDepartments);
    return () => {
      unsubscribeSubjects();
      unsubscribeDepts();
    };
  }, []);

  const deptMap = Object.fromEntries(departments.map(d => [d.id, d.sigla]));

  const handleCreateNew = () => {
    setEditingSubject(null);
    setIsModalOpen(true);
  };

  const handleEdit = (subject) => {
    setEditingSubject(subject);
    setIsModalOpen(true);
  };

  const handleDelete = async (subjectId) => {
    if (window.confirm('Tem certeza que deseja excluir esta disciplina?')) {
      await deleteSubject(subjectId);
    }
  };

  const handleSave = async (formData) => {
    try {
      if (editingSubject) {
        await updateSubject(editingSubject.id, formData);
      } else {
        await addSubject(formData);
      }
      setIsModalOpen(false);
    } catch (error) {
      alert('Erro ao salvar disciplina: ' + error.message);
    }
  };

  const handleSync = async () => {
    if (!window.confirm('Isso irá substituir as disciplinas atuais pelos dados do arquivo DEPTO.csv. Deseja continuar?')) return;
    
    setIsSyncing(true);
    try {
      const response = await fetch('/DEPTO.csv');
      const csvContent = await response.text();
      const subjectsData = parseSubjectsCSV(csvContent, departments);
      
      await syncSubjects(subjectsData);
      alert(`${subjectsData.length} disciplinas sincronizadas com sucesso!`);
    } catch (error) {
      console.error(error);
      alert('Erro ao sincronizar: ' + error.message);
    } finally {
      setIsSyncing(false);
    }
  };

  const filteredSubjects = subjects.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          s.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = selectedDept === 'all' || s.departmentId === selectedDept;
    return matchesSearch && matchesDept;
  });

  return (
    <div className="space-y-10">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black text-brand-primary tracking-tighter uppercase italic">Gerenciar Disciplinas</h1>
          <p className="text-slate-500 font-medium italic">Cadastro de matérias e códigos do centro</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleSync}
            disabled={isSyncing}
            className="flex items-center gap-2 px-6 py-4 rounded-2xl font-bold bg-white text-slate-500 border border-slate-100 hover:bg-slate-50 transition-all disabled:opacity-50"
          >
            <Database size={20} />
            <span>{isSyncing ? 'Sincronizando...' : 'Sincronizar CSV'}</span>
          </button>
          <button 
            onClick={handleCreateNew}
            className="btn-primary flex items-center gap-2"
          >
            <Plus size={20} />
            <span>Nova Disciplina</span>
          </button>
        </div>
      </header>
      
      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 group w-full">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-brand-primary transition-colors" size={20} />
          <input 
            type="text" 
            placeholder="Buscar por nome ou código (ex: DFS0108)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-14 pr-6 py-4 rounded-2xl bg-white border border-slate-100 outline-none focus:ring-4 focus:ring-brand-primary/5 focus:border-brand-primary/20 transition-all font-medium text-slate-600 shadow-sm"
          />
        </div>
        
        <div className="relative w-full md:w-64">
          <Filter className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
          <select 
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="w-full pl-12 pr-6 py-4 rounded-2xl bg-white border border-slate-100 outline-none focus:ring-4 focus:ring-brand-primary/5 transition-all font-bold text-slate-500 appearance-none shadow-sm cursor-pointer"
          >
            <option value="all">Todos os Deptos</option>
            {departments.map(dept => (
              <option key={dept.id} value={dept.id}>{dept.sigla}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="glass-card overflow-hidden border-white/50">
        <div className="p-6 border-b border-slate-100 bg-slate-50/10 flex justify-between items-center">
          <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight">Listagem de Disciplinas</h2>
          <span className="text-xs font-bold text-slate-400 italic">Total de {filteredSubjects.length} disciplinas</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/30 text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                <th className="px-8 py-5">Código</th>
                <th className="px-6 py-5">Nome da Disciplina</th>
                <th className="px-6 py-5">Depto</th>
                <th className="px-6 py-5">Créditos</th>
                <th className="px-6 py-5 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSubjects.map(sub => (
                <tr key={sub.id} className="hover:bg-slate-50/30 transition-colors group">
                  <td className="px-8 py-5">
                    <span className="px-3 py-1 bg-brand-primary/10 text-brand-primary rounded-lg font-black text-sm uppercase">
                      {sub.code}
                    </span>
                  </td>
                  <td className="px-6 py-5 font-bold text-slate-700">{sub.name}</td>
                  <td className="px-6 py-5">
                    {sub.departmentId ? (
                      <span className="text-xs font-black text-slate-400 uppercase bg-slate-100 px-2 py-1 rounded">
                        {deptMap[sub.departmentId] || '...'}
                      </span>
                    ) : (
                      <span className="text-xs text-slate-300 italic">Não vinculado</span>
                    )}
                  </td>
                  <td className="px-6 py-5 text-sm text-slate-500 font-bold">{sub.credits || '---'}</td>
                  <td className="px-6 py-5">
                    <div className="flex gap-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleEdit(sub)}
                        className="p-2 text-brand-primary hover:bg-brand-primary/10 rounded-lg transition-colors"
                      >
                        <Edit3 size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(sub.id)}
                        className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredSubjects.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-8 py-12 text-center text-slate-400 italic font-medium">
                    Nenhuma disciplina encontrada.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <SubjectAdminModal 
        key={editingSubject?.id || 'new'}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        subject={editingSubject}
      />
    </div>
  );
};

export default Subjects;
