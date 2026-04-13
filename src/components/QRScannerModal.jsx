import React, { useEffect, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { X, Camera, ShieldCheck, AlertCircle } from 'lucide-react';
import { motion as Motion, AnimatePresence } from 'framer-motion';

const QRScannerModal = ({ isOpen, onClose, onScanSuccess }) => {
  const [error, setError] = useState(null);
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    let html5QrCode;

    if (isOpen) {
      setError(null);
      setIsScanning(true);
      
      // Pequeno delay para garantir que o container DOM esteja pronto
      const timer = setTimeout(() => {
        html5QrCode = new Html5Qrcode("reader");
        
        const qrConfig = { fps: 10, qrbox: { width: 250, height: 250 } };
        
        html5QrCode.start(
          { facingMode: "environment" }, 
          qrConfig, 
          (decodedText) => {
            // Sucesso na leitura
            try {
              const data = JSON.parse(decodedText);
              if (data.type === 'room-inspection') {
                html5QrCode.stop().then(() => {
                  onScanSuccess(data);
                  setIsScanning(false);
                });
              } else {
                setError('QR Code inválido para este sistema.');
              }
            } catch (e) {
              setError('Formato de QR Code não reconhecido.');
            }
          },
          (errorMessage) => {
            // Erros silenciosos de "não encontrado no frame"
          }
        ).catch(err => {
          console.error(err);
          setError('Não foi possível acessar a câmera. Verifique as permissões.');
          setIsScanning(false);
        });
      }, 500);

      return () => {
        clearTimeout(timer);
        if (html5QrCode && html5QrCode.isScanning) {
          html5QrCode.stop().catch(err => console.error('Erro ao parar scanner', err));
        }
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md">
        <Motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden relative"
        >
          <div className="p-8 space-y-6">
            <div className="flex justify-between items-center text-center">
               <div className="w-full">
                  <div className="w-12 h-12 bg-brand-primary/10 text-brand-primary rounded-2xl flex items-center justify-center mx-auto mb-3">
                     <Camera size={24} />
                  </div>
                  <h3 className="text-xl font-black text-slate-800 uppercase tracking-tighter italic">Escanear Ronda</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Aponte para o QR Code na porta da sala</p>
               </div>
               <button onClick={onClose} className="absolute top-8 right-8 p-2 hover:bg-slate-50 rounded-full transition-colors text-slate-400">
                  <X size={20} />
               </button>
            </div>

            <div className="relative aspect-square w-full bg-slate-100 rounded-[2rem] overflow-hidden border-2 border-slate-50 shadow-inner">
               <div id="reader" className="w-full h-full"></div>
               {error && (
                 <div className="absolute inset-x-4 bottom-4 p-4 bg-rose-500 text-white rounded-2xl text-[10px] font-bold flex items-center gap-3 shadow-lg">
                    <AlertCircle size={18} />
                    {error}
                 </div>
               )}
               {isScanning && !error && (
                  <div className="absolute top-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-brand-primary/20 backdrop-blur-sm text-brand-primary rounded-full text-[9px] font-black uppercase tracking-widest animate-pulse border border-brand-primary/20">
                    Câmera Ativa
                  </div>
               )}
            </div>

            <button 
              onClick={onClose}
              className="w-full py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest text-slate-400 hover:bg-slate-50 transition-all border border-slate-100"
            >
              Cancelar
            </button>
          </div>
        </Motion.div>
      </div>
    </AnimatePresence>
  );
};

export default QRScannerModal;
