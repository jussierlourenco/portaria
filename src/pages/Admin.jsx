import React from 'react';
import { Plus, Users, BarChart3, Database } from 'lucide-react';

const Admin = () => {
  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10">
      <header className="mb-10 flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black text-brand-primary tracking-tighter uppercase italic">Administração</h1>
          <p className="text-slate-500 font-medium">Controle total do Portaria CB</p>
        </div>
        <button className="btn-primary flex items-center gap-2">
          <Plus size={20} />
          <span>Nova Sala</span>
        </button>
      </header>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        {[
          { label: 'Salas Ativas', value: '42', icon: Database, color: 'text-brand-primary' },
          { label: 'Bedéis', value: '12', icon: Users, color: 'text-emerald-600' },
          { label: 'Economia (Mês)', value: '14%', icon: BarChart3, color: 'text-amber-600' },
          { label: 'Uso Médio', value: '8.5h/dia', icon: BarChart3, color: 'text-blue-600' },
        ].map(stat => (
          <div key={stat.label} className="glass-card p-6 flex items-center gap-4">
            <div className={`p-4 rounded-2xl bg-slate-50 ${stat.color}`}>
              <stat.icon size={24} />
            </div>
            <div>
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
              <p className="text-2xl font-black text-slate-800">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="glass-card overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
          <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight">Listagem de Salas</h2>
          <button className="text-sm font-bold text-brand-primary hover:underline">Exportar Relatório</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                <th className="px-6 py-4">Sala</th>
                <th className="px-6 py-4">Bloco</th>
                <th className="px-6 py-4">Status Atual</th>
                <th className="px-6 py-4">Última Ronda</th>
                <th className="px-6 py-4">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {[
                { name: 'Sala 101', block: 'Bloco A', status: 'Fechada', last: '15:30 por João' },
                { name: 'Sala 102', block: 'Bloco A', status: 'Aberta', last: '16:00 por Maria' },
                { name: 'Laboratório 04', block: 'Bloco B', status: 'Fechada', last: '14:20 por João' },
              ].map(row => (
                <tr key={row.name} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-800">{row.name}</td>
                  <td className="px-6 py-4 font-medium text-slate-500">{row.block}</td>
                  <td className="px-6 py-4">
                    <span className={`status-badge ${row.status === 'Aberta' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                      {row.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">{row.last}</td>
                  <td className="px-6 py-4">
                    <button className="text-brand-primary font-bold text-sm hover:underline">Editar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Admin;
