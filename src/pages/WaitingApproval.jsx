import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { LogOut, Clock, ShieldCheck } from 'lucide-react';
import { motion as Motion } from 'framer-motion';

const WaitingApproval = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-center">
      <Motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full glass-card p-10 flex flex-col items-center"
      >
        <div className="w-24 h-24 bg-amber-50 rounded-full flex items-center justify-center mb-8 relative">
          <Clock size={48} className="text-amber-500" />
          <Motion.div 
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="absolute -top-1 -right-1 bg-amber-500 w-6 h-6 rounded-full border-4 border-white"
          />
        </div>

        <h1 className="text-3xl font-black text-slate-800 tracking-tighter uppercase italic leading-none mb-4">
          Acesso Pendente
        </h1>
        
        <p className="text-slate-500 font-medium mb-8">
          Olá, <span className="font-bold text-slate-700">{user?.displayName || 'Usuário'}</span>!<br /> 
          Sua conta foi criada com sucesso, mas precisa ser ativada por um administrador do sistema.
        </p>

        <div className="w-full space-y-4">
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center gap-3 text-left">
            <ShieldCheck className="text-brand-primary" size={24} />
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Status</p>
              <p className="text-sm font-bold text-slate-700">Aguardando Avaliação</p>
            </div>
          </div>

          <button 
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-bold bg-white text-rose-500 border border-rose-100 hover:bg-rose-50 transition-all shadow-sm"
          >
            <LogOut size={20} />
            <span>Sair da Conta</span>
          </button>
        </div>

        <p className="mt-10 text-[10px] text-slate-400 font-black uppercase tracking-widest">
          Portaria CB © 2026
        </p>
      </Motion.div>
    </div>
  );
};

export default WaitingApproval;
