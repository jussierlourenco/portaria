import React, { useState } from 'react';
import { auth } from '../firebase/config';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  updateProfile 
} from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Lock, UserPlus, LogIn, AlertCircle } from 'lucide-react';
import { motion as Motion, AnimatePresence } from 'framer-motion';

const Login = () => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
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
      setError('E-mail ou senha incorretos. Tente novamente.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      return setError('As senhas não coincidem.');
    }
    if (password.length < 6) {
      return setError('A senha deve ter pelo menos 6 caracteres.');
    }

    setLoading(true);
    setError('');

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, {
        displayName: name
      });
      navigate('/');
    } catch (err) {
      if (err.code === 'auth/email-already-in-use') {
        setError('Este e-mail já está em uso.');
      } else {
        setError('Erro ao criar conta: ' + err.message);
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsRegistering(!isRegistering);
    setError('');
    setPassword('');
    setConfirmPassword('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <Motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-10 w-full max-w-md shadow-2xl shadow-brand-primary/10 border-white/40"
      >
        <div className="text-center mb-8">
          <img 
            src="/logo.png" 
            alt="Logo CB" 
            className="h-32 mx-auto mb-4 drop-shadow-sm"
          />
          <h1 className="text-3xl font-black text-brand-primary tracking-tighter uppercase italic leading-none">Portaria CB</h1>
          <p className="text-slate-400 font-bold text-[10px] tracking-[0.2em] uppercase mt-2">Circuito de Segurança e Salas</p>
        </div>
        
        <div className="flex bg-slate-100/50 p-1.5 rounded-2xl mb-8">
          <button 
            onClick={() => setIsRegistering(false)}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${!isRegistering ? 'bg-white text-brand-primary shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <LogIn size={16} />
            Login
          </button>
          <button 
            onClick={() => setIsRegistering(true)}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${isRegistering ? 'bg-white text-brand-primary shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <UserPlus size={16} />
            Cadastro
          </button>
        </div>

        <AnimatePresence mode="wait">
          <Motion.div
            key={isRegistering ? 'signup' : 'login'}
            initial={{ opacity: 0, x: isRegistering ? 10 : -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: isRegistering ? -10 : 10 }}
            transition={{ duration: 0.2 }}
          >
            {error && (
              <div className="mb-6 p-4 bg-rose-50 border border-rose-100 text-rose-600 rounded-2xl text-xs font-bold flex items-center gap-3">
                <AlertCircle size={18} className="flex-shrink-0" />
                {error}
              </div>
            )}

            <form onSubmit={isRegistering ? handleSignUp : handleLogin} className="space-y-4">
              {isRegistering && (
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Nome Completo</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                    <input 
                      type="text" 
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Como deseja ser chamado?" 
                      className="w-full pl-12 pr-5 py-4 rounded-2xl bg-white border border-slate-100 focus:border-brand-primary/30 focus:ring-4 focus:ring-brand-primary/5 outline-none transition-all font-bold text-slate-600" 
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">E-mail</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  <input 
                    type="email" 
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seuemail@ufrn.br" 
                    className="w-full pl-12 pr-5 py-4 rounded-2xl bg-white border border-slate-100 focus:border-brand-primary/30 focus:ring-4 focus:ring-brand-primary/5 outline-none transition-all font-bold text-slate-600" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Senha</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  <input 
                    type="password" 
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••" 
                    className="w-full pl-12 pr-5 py-4 rounded-2xl bg-white border border-slate-100 focus:border-brand-primary/30 focus:ring-4 focus:ring-brand-primary/5 outline-none transition-all font-bold text-slate-600" 
                  />
                </div>
              </div>

              {isRegistering && (
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Confirmar Senha</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                    <input 
                      type="password" 
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••" 
                      className="w-full pl-12 pr-5 py-4 rounded-2xl bg-white border border-slate-100 focus:border-brand-primary/30 focus:ring-4 focus:ring-brand-primary/5 outline-none transition-all font-bold text-slate-600" 
                    />
                  </div>
                </div>
              )}
              
              <button 
                type="submit" 
                disabled={loading}
                className="btn-primary w-full py-5 text-sm font-black uppercase tracking-widest mt-4 shadow-xl shadow-brand-primary/20 active:scale-95 transition-all"
              >
                {loading ? 'Processando...' : isRegistering ? 'Criar Minha Conta' : 'Entrar no Sistema'}
              </button>
            </form>
          </Motion.div>
        </AnimatePresence>

        <p className="mt-8 text-center text-[10px] text-slate-400 font-black uppercase tracking-widest leading-relaxed">
          {isRegistering ? (
            <>Já possui acesso? <button onClick={toggleMode} className="text-brand-primary hover:underline ml-1">Fazer Login</button></>
          ) : (
            <>Novo por aqui? <button onClick={toggleMode} className="text-brand-primary hover:underline ml-1">Solicitar Acesso</button></>
          )}
        </p>
      </Motion.div>
    </div>
  );
};

export default Login;

