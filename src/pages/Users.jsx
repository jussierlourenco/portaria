import React, { useState, useEffect } from 'react';
import { Shield, UserCheck, UserX, Crown, ShieldAlert, BadgeCheck } from 'lucide-react';
import { subscribeToUsers, updateUserData } from '../firebase/db';
import { motion as Motion, AnimatePresence } from 'framer-motion';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const unsubscribe = subscribeToUsers(setUsers);
    return () => unsubscribe();
  }, []);

  const handleStatusChange = async (userId, newStatus) => {
    try {
      await updateUserData(userId, { status: newStatus });
    } catch (e) {
      alert('Erro ao atualizar status: ' + e.message);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await updateUserData(userId, { role: newRole });
    } catch (e) {
      alert('Erro ao atualizar cargo: ' + e.message);
    }
  };

  const filteredUsers = users.filter(u => {
    if (filter === 'all') return true;
    if (filter === 'pending') return u.status === 'pending';
    if (filter === 'active') return u.status === 'active';
    return true;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active': return <span className="bg-emerald-100 text-emerald-600 px-3 py-1 rounded-full text-[10px] font-black uppercase">Ativo</span>;
      case 'pending': return <span className="bg-amber-100 text-amber-600 px-3 py-1 rounded-full text-[10px] font-black uppercase">Pendente</span>;
      case 'blocked': return <span className="bg-rose-100 text-rose-600 px-3 py-1 rounded-full text-[10px] font-black uppercase">Bloqueado</span>;
      default: return null;
    }
  };

  return (
    <div className="space-y-10">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black text-brand-primary tracking-tighter uppercase italic line-clamp-1">Gestão de Usuários</h1>
          <p className="text-slate-500 font-medium italic">Controle de acessos e permissões administrativas</p>
        </div>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Total de Usuários', value: users.length, icon: Shield, color: 'text-brand-primary' },
          { label: 'Aguardando Aprovação', value: users.filter(u => u.status === 'pending').length, icon: ShieldAlert, color: 'text-amber-500' },
          { label: 'Contas Ativas', value: users.filter(u => u.status === 'active').length, icon: BadgeCheck, color: 'text-emerald-600' },
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

      {/* Filters */}
      <div className="flex gap-2">
        {['all', 'pending', 'active'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${
              filter === f ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/20' : 'bg-white text-slate-400 border border-slate-100 hover:bg-slate-50'
            }`}
          >
            {f === 'all' ? 'Todos' : f === 'pending' ? 'Pendentes' : 'Ativos'}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100">
                <th className="px-8 py-6">Usuário</th>
                <th className="px-6 py-6">Cargo</th>
                <th className="px-6 py-6 text-center">Status</th>
                <th className="px-6 py-6 text-right">Ações de Controle</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              <AnimatePresence>
                {filteredUsers.map(user => (
                  <Motion.tr 
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    key={user.id} 
                    className="hover:bg-slate-50/30 transition-colors group"
                  >
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-black text-slate-400 group-hover:bg-brand-primary/10 group-hover:text-brand-primary transition-colors">
                          {user.displayName?.charAt(0) || user.email.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-slate-700 leading-none mb-1">{user.displayName || 'Sem nome'}</p>
                          <p className="text-xs text-slate-400 font-medium">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2">
                        {user.role === 'admin' ? <Crown size={14} className="text-amber-500" /> : <Shield size={14} className="text-slate-400" />}
                        <select 
                          value={user.role} 
                          onChange={(e) => handleRoleChange(user.id, e.target.value)}
                          className="bg-transparent font-bold text-slate-600 text-xs focus:outline-none cursor-pointer hover:text-brand-primary"
                        >
                          <option value="porteiro">Porteiro</option>
                          <option value="admin">Administrador</option>
                        </select>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-center">
                      {getStatusBadge(user.status)}
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex gap-2 justify-end">
                        {user.status === 'pending' && (
                          <button 
                            onClick={() => handleStatusChange(user.id, 'active')}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all text-[10px] font-black uppercase"
                          >
                            <UserCheck size={14} />
                            <span>Aprovar</span>
                          </button>
                        )}
                        {user.status === 'active' && (
                          <button 
                             onClick={() => handleStatusChange(user.id, 'blocked')}
                             className="p-2 text-rose-200 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                             title="Bloquear Usuário"
                          >
                            <UserX size={18} />
                          </button>
                        )}
                        {user.status === 'blocked' && (
                          <button 
                            onClick={() => handleStatusChange(user.id, 'active')}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all text-[10px] font-black uppercase"
                          >
                            <UserCheck size={14} />
                            <span>Reativar</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </Motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
          {filteredUsers.length === 0 && (
            <div className="py-20 text-center text-slate-400 italic font-medium">
              Nenhum usuário encontrado para este filtro.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Users;
