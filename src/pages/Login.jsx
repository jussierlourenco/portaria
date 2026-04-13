import React, { useState } from 'react';
import { auth } from '../firebase/config';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/');
    } catch (err) {
      setError('Falha no login. Verifique suas credenciais ou a configuração do Firebase.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <div className="glass-card p-10 w-full max-w-md shadow-2xl shadow-brand-primary/10 border-white/40">
        <div className="text-center mb-10">
          <img 
            src="https://firebasestorage.googleapis.com/v0/b/sicb-ed14a.appspot.com/o/brand%2Flogo_cb.png?alt=media&token=6a182060-e41c-4384-9669-02688002df35" 
            alt="Logo CB" 
            className="h-20 mx-auto mb-4 drop-shadow-sm"
          />
          <h1 className="text-3xl font-black text-brand-primary tracking-tighter uppercase italic">PORTARIA-CB</h1>
          <p className="text-slate-500 font-bold text-sm tracking-widest uppercase">Sistema de Ronda</p>
        </div>
        
        {error && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-100 text-rose-600 rounded-2xl text-sm font-bold animate-shake">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">E-mail Corporativo</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="exemplo@ufrn.br" 
              className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:border-brand-primary/30 focus:ring-4 focus:ring-brand-primary/5 outline-none transition-all font-medium" 
            />
          </div>
          <div>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Senha de Acesso</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••" 
              className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:border-brand-primary/30 focus:ring-4 focus:ring-brand-primary/5 outline-none transition-all font-medium" 
            />
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            className="btn-primary w-full py-4 text-lg font-black tracking-tight"
          >
            {loading ? 'Autenticando...' : 'Acessar Sistema'}
          </button>
        </form>

        <p className="mt-8 text-center text-xs text-slate-400 font-medium">
          Dificuldade no acesso? <span className="text-brand-primary cursor-pointer hover:underline">Contate o administrador</span>
        </p>
      </div>
    </div>
  );
};

export default Login;
