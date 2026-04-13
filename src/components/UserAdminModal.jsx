import React, { useState, useEffect } from 'react';
import { X, Shield, Mail, User, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const UserAdminModal = ({ isOpen, onClose, onSave, user }) => {
  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
    role: 'porteiro',
    status: 'active'
  });

  useEffect(() => {
    if (user) {
      setFormData({
        displayName: user.displayName || '',
        email: user.email || '',
        role: user.role || 'porteiro',
        status: user.status || 'active'
      });
    } else {
      setFormData({
        displayName: '',
        email: '',
        role: 'porteiro',
        status: 'active'
      });
    }
  }, [user, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

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
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl shadow-brand-primary/10 overflow-hidden"
        >
          <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
            <div>
              <h2 className="text-2xl font-black text-slate-800 tracking-tighter uppercase italic leading-none">
                {user ? 'Editar Usuário' : 'Novo Usuário'}
              </h2>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Configurações de Acesso</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white rounded-full transition-colors text-slate-400">
              <X size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            <div className="space-y-4">
              {/* Name */}
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nome Completo</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  <input
                    type="text"
                    required
                    value={formData.displayName}
                    onChange={(e) => setFormData({...formData, displayName: e.target.value})}
                    className="w-full pl-12 pr-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:border-brand-primary/20 focus:ring-4 focus:ring-brand-primary/5 outline-none transition-all font-bold text-slate-600"
                    placeholder="Ex: João Silva"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">E-mail</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full pl-12 pr-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:border-brand-primary/20 focus:ring-4 focus:ring-brand-primary/5 outline-none transition-all font-bold text-slate-600"
                    placeholder="email@ufrn.br"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Role */}
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Cargo</label>
                  <div className="relative">
                    <Shield className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData({...formData, role: e.target.value})}
                      className="w-full pl-12 pr-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:ring-4 focus:ring-brand-primary/5 outline-none transition-all font-bold text-slate-600 appearance-none"
                    >
                      <option value="porteiro">Porteiro</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                </div>

                {/* Status */}
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Status</label>
                  <div className="relative">
                    <CheckCircle2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({...formData, status: e.target.value})}
                      className="w-full pl-12 pr-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:ring-4 focus:ring-brand-primary/5 outline-none transition-all font-bold text-slate-600 appearance-none"
                    >
                      <option value="active">Ativo</option>
                      <option value="pending">Pendente</option>
                      <option value="blocked">Bloqueado</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <button 
              type="submit"
              className="w-full py-5 rounded-[1.5rem] bg-brand-primary text-white font-black uppercase tracking-widest hover:bg-brand-primary-dark transition-all shadow-xl shadow-brand-primary/20 mt-4 active:scale-[0.98]"
            >
              {user ? 'Salvar Alterações' : 'Criar Usuário'}
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default UserAdminModal;
