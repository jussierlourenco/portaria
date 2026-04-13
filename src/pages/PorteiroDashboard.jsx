import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import { auth } from '../firebase/config';
import { subscribeToRooms, roomCheckIn, roomCheckOut, logRoomInspection } from '../firebase/db';
import { signOut } from 'firebase/auth'; 

import QRScannerModal from '../components/QRScannerModal';
import { getRoomScheduleStatus } from '../utils/scheduleLogic';
import { LogOut, Bell, BellOff, CheckCircle2, AlertTriangle, Clock, Camera, Navigation } from 'lucide-react';
import { clsx } from 'clsx';
import { motion as Motion, AnimatePresence } from 'framer-motion';

const PorteiroDashboard = () => {

  const { user } = useAuth();
  const [rooms, setRooms] = useState([]);
  const [isAlarmEnabled, setIsAlarmEnabled] = useState(false);
  const [lastNotificationTime, setLastNotificationTime] = useState(null);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [scanMessage, setScanMessage] = useState(null);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      window.location.href = '/login'; // Garantir o redirecionamento
    } catch (e) {
      alert('Erro ao sair: ' + e.message);
    }
  };

  const handleScanSuccess = useCallback(async (data) => {
    try {
      await logRoomInspection(data.id, user.uid);
      setScanMessage({ type: 'success', text: `Vistoria confirmada: ${data.name}` });
      setIsScannerOpen(false);
      setTimeout(() => setScanMessage(null), 4000);
    } catch (e) {
      setScanMessage({ type: 'error', text: 'Erro ao registrar: ' + e.message });
    }
  }, [user.uid]);


  const playAlarm = () => {

    try {
      const context = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(440, context.currentTime); // A4
      
      gain.gain.setValueAtTime(0, context.currentTime);
      gain.gain.linearRampToValueAtTime(0.5, context.currentTime + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 1);
      
      oscillator.connect(gain);
      gain.connect(context.destination);
      
      oscillator.start();
      oscillator.stop(context.currentTime + 1);
    } catch (e) {
      console.warn('Erro ao reproduzir alarme:', e);
    }
  };

  const handleCheckIn = async (roomId) => {
    await roomCheckIn(roomId, user.uid);
  };

  const handleCheckOut = async (roomId) => {
    if (window.confirm('Confirma que desligou Ar-Condicionado e Luzes?')) {
      await roomCheckOut(roomId, user.uid, { ac: true, lights: true, windows: true });
    }
  };

  useEffect(() => {
    const unsubscribe = subscribeToRooms(setRooms);
    return () => unsubscribe();
  }, []);

  // Monitorar horários para o Alarme
  useEffect(() => {
    if (!isAlarmEnabled) return;

    const interval = setInterval(() => {
      const now = new Date();
      const currentMinute = `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`;
      
      if (lastNotificationTime === currentMinute) return;

      rooms.forEach(room => {
        const { nextStartTime } = getRoomScheduleStatus(room.schedule);
        
        // Se falta 5 minutos para uma aula e a sala está fechada

        if (nextStartTime && room.status === 'Fechada') {
          const [h, m] = nextStartTime.split(':').map(Number);
          const startTime = new Date();
          startTime.setHours(h, m, 0, 0);
          
          const diff = (startTime - now) / (1000 * 60);
          if (diff > 0 && diff <= 5) {
             playAlarm();
             setLastNotificationTime(currentMinute);
          }
        }
      });
    }, 30000); // Checa a cada 30 segundos

    return () => clearInterval(interval);
  }, [rooms, isAlarmEnabled, lastNotificationTime]);


  // Categorizar salas para o Porteiro
  const salasParaAbrir = rooms.filter(r => {
    const status = getRoomScheduleStatus(r.schedule);
    return r.status === 'Fechada' && (status.isOccupied || status.nextClass);
  }).sort((a, b) => {
     const statusA = getRoomScheduleStatus(a.schedule);
     const statusB = getRoomScheduleStatus(b.schedule);
     return (statusA.nextStartTime || '23:59').localeCompare(statusB.nextStartTime || '23:59');
  });

  const salasAbertas = rooms.filter(r => r.status === 'Aberta');

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header Mobile */}
      <header className="bg-brand-primary text-white p-6 rounded-b-[2.5rem] shadow-xl">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-2xl font-black tracking-tight">Painel do Porteiro</h1>
            <p className="text-emerald-100 text-sm font-medium opacity-80">{user?.displayName || 'Equipe de Ronda'}</p>
          </div>
          <button 
            onClick={() => setIsAlarmEnabled(!isAlarmEnabled)}
            className={clsx(
              "p-3 rounded-2xl transition-all shadow-lg",
              isAlarmEnabled ? "bg-white text-brand-primary" : "bg-brand-primary-dark text-emerald-200"
            )}
          >
            {isAlarmEnabled ? <Bell size={24} /> : <BellOff size={24} />}
          </button>
        </div>
      </header>

      {/* Botão Flutuante de Ronda (Fixo no rodapé para mobile) */}
      <div className="fixed bottom-24 right-6 z-40">
         <button 
          onClick={() => setIsScannerOpen(true)}
          className="flex items-center gap-2 px-6 py-4 bg-slate-900 text-white rounded-2xl font-bold text-[10px] uppercase tracking-widest shadow-2xl hover:scale-105 active:scale-95 transition-all border border-slate-700"
         >
            <Camera size={16} className="text-brand-primary" />
            Ronda QR
         </button>
      </div>

      <main className="flex-1 p-4 -mt-4 space-y-6">

        {/* Alerta de Modo de Uso */}
        {!isAlarmEnabled && (
          <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl flex items-center gap-3 text-amber-700">
            <AlertTriangle className="flex-shrink-0" size={20} />
            <p className="text-xs font-bold uppercase tracking-tight">Ative o sino acima para receber avisos sonoros das próximas aulas.</p>
          </div>
        )}

        {/* Seção 1: Salas para Abrir */}
        <section>
          <div className="flex items-center gap-2 mb-4 px-2">
            <Clock size={16} className="text-brand-primary" />
            <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest">Salas para Abrir Agora / Próximas</h2>
          </div>
          
          <div className="space-y-3">
            {salasParaAbrir.length > 0 ? salasParaAbrir.slice(0, 5).map(room => {
              const schedule = getRoomScheduleStatus(room.schedule);
              return (
                <Motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  key={room.id}
                  className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between gap-4"
                >
                  <div className="flex-1 min-w-0">
                    <h3 className="font-black text-slate-800 uppercase truncate">{room.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] font-black bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded uppercase">
                        {schedule.nextStartTime || 'EM AULA'}
                      </span>
                      <span className="text-xs text-slate-400 font-medium truncate italic max-w-[120px]">
                         {schedule.currentClass || schedule.nextClass || 'Escala vazia'}
                      </span>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleCheckIn(room.id)}
                    className="bg-brand-primary text-white px-6 py-3 rounded-2xl font-black text-sm uppercase tracking-tight shadow-lg shadow-brand-primary/20"
                  >
                    Abrir
                  </button>
                </Motion.div>
              );
            }) : (
              <div className="text-center py-10 bg-white/50 rounded-3xl border border-dashed border-slate-200">
                <p className="text-slate-400 text-sm italic">Nenhuma ação imediata pendente.</p>
              </div>
            )}
          </div>
        </section>

        {/* Seção 2: Salas Abertas */}
        <section>
          <div className="flex items-center gap-2 mb-4 px-2">
            <CheckCircle2 size={16} className="text-emerald-500" />
            <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest">Salas Atualmente Abertas</h2>
          </div>
          
          <div className="grid grid-cols-1 gap-3">
            {salasAbertas.map(room => (
              <div key={room.id} className="bg-emerald-50/50 p-5 rounded-3xl border border-emerald-100 flex items-center justify-between">
                <div>
                  <h3 className="font-black text-emerald-800 uppercase">{room.name}</h3>
                  <p className="text-[10px] text-emerald-600 font-bold uppercase opacity-70">{room.block} • {room.pavilion}</p>
                </div>
                <button 
                  onClick={() => handleCheckOut(room.id)}
                  className="bg-white text-emerald-600 px-6 py-3 rounded-2xl font-black text-sm uppercase border border-emerald-200"
                >
                  Fechar
                </button>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Footer Nav */}
      <footer className="bg-white border-t border-slate-100 p-4 pb-8 flex justify-around items-center sticky bottom-0 z-50">
        <button 
          onClick={() => setIsScannerOpen(true)}
          className="flex flex-col items-center gap-1 text-brand-primary"
        >
          <Camera size={24} />
          <span className="text-[10px] font-black uppercase">Ronda QR</span>
        </button>
        <button 
          onClick={handleLogout}
          className="flex flex-col items-center gap-1 text-slate-300 hover:text-rose-500 transition-all active:scale-95"
        >
          <LogOut size={24} />
          <span className="text-[10px] font-black uppercase">Sair</span>
        </button>
      </footer>

      <QRScannerModal 
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScanSuccess={handleScanSuccess}
      />

      {/* Toast de Confirmação de Scan */}
      <AnimatePresence>
        {scanMessage && (
          <Motion.div 
            initial={{ opacity: 0, y: 50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 50, x: '-50%' }}
            className={clsx(
              "fixed bottom-28 left-1/2 -translate-x-1/2 px-8 py-4 rounded-full shadow-2xl font-black uppercase text-[10px] tracking-widest z-[150] flex items-center gap-3 border min-w-[280px] justify-center",
              scanMessage.type === 'success' ? 'bg-emerald-500 text-white border-emerald-400' : 'bg-rose-500 text-white border-rose-400'
            )}
          >
            {scanMessage.type === 'success' ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
            {scanMessage.text}
          </Motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};


export default PorteiroDashboard;
