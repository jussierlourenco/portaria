import React, { useState, useEffect } from 'react';
import { Plus, Users, Database, Trash2, Edit3, Briefcase } from 'lucide-react';
import { subscribeToDepartments, addDepartment, updateDepartment, deleteDepartment, syncDepartments } from '../firebase/db';
import DepartmentAdminModal from '../components/DepartmentAdminModal';
import { parseDepartmentsCSV } from '../utils/deptParser';

const Departments = () => {
  const [departments, setDepartments] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeToDepartments(setDepartments);
    return () => unsubscribe();
  }, []);

  const handleCreateNew = () => {
    setEditingDept(null);
    setIsModalOpen(true);
  };

  const handleEdit = (dept) => {
    setEditingDept(dept);
    setIsModalOpen(true);
  };

  const handleDelete = async (deptId) => {
    if (window.confirm('Tem certeza que deseja excluir este departamento?')) {
      await deleteDepartment(deptId);
    }
  };

  const handleSave = async (formData) => {
    try {
      if (editingDept) {
        await updateDepartment(editingDept.id, formData);
      } else {
        await addDepartment(formData);
      }
      setIsModalOpen(false);
    } catch (error) {
      alert('Erro ao salvar departamento: ' + error.message);
    }
  };

  const handleSync = async () => {
    if (!window.confirm('Isso irá substituir os departamentos atuais pelos dados do arquivo SALAS.csv. Deseja continuar?')) return;
    
    setIsSyncing(true);
    try {
      const response = await fetch('/SALAS.csv');
      const csvContent = await response.text();
      const deptsData = parseDepartmentsCSV(csvContent);
      
      await syncDepartments(deptsData);
      alert(`${deptsData.length} departamentos sincronizados com sucesso!`);
    } catch (error) {
      console.error(error);
      alert('Erro ao sincronizar: ' + error.message);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="space-y-10">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black text-brand-primary tracking-tighter uppercase italic">Gerenciar Departamentos</h1>
          <p className="text-slate-500 font-medium italic">Gerencie os departamentos e siglas do centro</p>
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
            <span>Novo Departamento</span>
          </button>
        </div>
      </header>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Total de Deptos', value: departments.length, icon: Briefcase, color: 'text-brand-primary' },
          { label: 'Siglas Ativas', value: departments.length, icon: Users, color: 'text-emerald-600' },
          { label: 'Distribuição', value: 'Sede Central', icon: Database, color: 'text-blue-600' },
        ].map(stat => (
          <div key={stat.label} className="glass-card p-6 flex items-center gap-4 border-white/50">
            <div className={`p-4 rounded-2xl bg-slate-50/50 ${stat.color}`}>
              <stat.icon size={24} />
            </div>
            <div>
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
              <p className="text-2xl font-black text-slate-800">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="glass-card overflow-hidden border-white/50">
        <div className="p-6 border-b border-slate-100 bg-slate-50/10 flex justify-between items-center">
          <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight">Listagem de Departamentos</h2>
          <span className="text-xs font-bold text-slate-400 italic font-medium">Ordenado por nome</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/30 text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                <th className="px-8 py-5">Sigla</th>
                <th className="px-6 py-5">Nome do Departamento</th>
                <th className="px-6 py-5">Descrição</th>
                <th className="px-6 py-5 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {departments.map(dept => (
                <tr key={dept.id} className="hover:bg-slate-50/30 transition-colors group">
                  <td className="px-8 py-5">
                    <span className="px-3 py-1 bg-brand-primary/10 text-brand-primary rounded-lg font-black text-sm">
                      {dept.sigla}
                    </span>
                  </td>
                  <td className="px-6 py-5 font-bold text-slate-700">{dept.name}</td>
                  <td className="px-6 py-5 text-sm text-slate-500 font-medium truncate max-w-xs">{dept.description || '---'}</td>
                  <td className="px-6 py-5">
                    <div className="flex gap-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleEdit(dept)}
                        className="p-2 text-brand-primary hover:bg-brand-primary/10 rounded-lg transition-colors"
                      >
                        <Edit3 size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(dept.id)}
                        className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {departments.length === 0 && (
                <tr>
                  <td colSpan="4" className="px-8 py-12 text-center text-slate-400 italic font-medium">
                    Nenhum departamento cadastrado. Sincronize com o CSV ou clique em "Novo Departamento".
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <DepartmentAdminModal 
        key={editingDept?.id || 'new'}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        department={editingDept}
      />
    </div>
  );
};

export default Departments;
