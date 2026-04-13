import React, { useRef } from 'react';
import { X, Printer, Download, MapPin } from 'lucide-react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';

const RoomQRCodeModal = ({ isOpen, onClose, room }) => {
  const printRef = useRef();

  if (!room) return null;

  const handlePrint = () => {
    const printContent = printRef.current;
    const WindowPrt = window.open('', '', 'left=0,top=0,width=800,height=900,toolbar=0,scrollbars=0,status=0');
    WindowPrt.document.write(`
      <html>
        <head>
          <title>Imprimir QR Code - ${room.name}</title>
          <style>
            body { 
              font-family: 'Inter', sans-serif; 
              display: flex; 
              flex-direction: column; 
              align-items: center; 
              justify-content: center; 
              height: 100vh;
              margin: 0;
            }
            .label-card {
              border: 4px solid #006738;
              padding: 40px;
              border-radius: 40px;
              text-align: center;
              width: 400px;
            }
            .title {
              font-size: 28px;
              font-weight: 900;
              margin-top: 20px;
              text-transform: uppercase;
              color: #006738;
            }
            .subtitle {
              font-size: 14px;
              font-weight: 700;
              color: #64748b;
              margin-top: 5px;
              text-transform: uppercase;
              letter-spacing: 2px;
            }
            .logo {
               font-size: 12px;
               font-weight: 900;
               color: #cbd5e1;
               margin-top: 30px;
               text-transform: uppercase;
               letter-spacing: 4px;
            }
          </style>
        </head>
        <body>
          <div class="label-card">
            ${printContent.innerHTML}
          </div>
          <script>
            setTimeout(() => {
              window.print();
              window.close();
            }, 500);
          </script>
        </body>
      </html>
    `);
    WindowPrt.document.close();
  };

  // O conteúdo do QR Code será uma string JSON simples para facilitar o parsing no scanner
  const qrValue = JSON.stringify({
    type: 'room-inspection',
    id: room.id,
    name: room.name
  });

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm">
          <Motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden"
          >
            <div className="p-8 space-y-8">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 rounded-xl bg-brand-primary/10 flex items-center justify-center text-brand-primary">
                      <MapPin size={20} />
                   </div>
                   <div>
                     <h3 className="text-xl font-black text-slate-800 uppercase tracking-tighter italic">QR Code da Sala</h3>
                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Identificação para Ronda</p>
                   </div>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-full transition-colors text-slate-400">
                  <X size={20} />
                </button>
              </div>

              {/* Área do QR Code (para visualização e preparação de impressão) */}
              <div ref={printRef} className="flex flex-col items-center py-6">
                <div className="p-4 bg-white border-4 border-brand-primary rounded-[2.5rem] shadow-inner mb-4">
                  <QRCodeSVG 
                    value={qrValue} 
                    size={200}
                    level="H"
                    includeMargin={true}
                    fgColor="#006738"
                  />
                </div>
                <h4 className="title text-2xl font-black text-brand-primary uppercase tracking-tighter italic text-center">{room.name}</h4>
                <p className="subtitle text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] text-center mt-1">Vistoria de Segurança CB</p>
                <p className="logo text-[9px] font-black text-slate-200 uppercase tracking-[0.5em] text-center mt-6">Portaria CB • UFRN</p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-4">
                <button 
                  onClick={onClose}
                  className="py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest text-slate-400 hover:bg-slate-50 transition-all border border-slate-100"
                >
                  Fechar
                </button>
                <button 
                  onClick={handlePrint}
                  className="py-4 rounded-2xl bg-brand-primary text-white font-black text-[10px] uppercase tracking-widest hover:bg-brand-primary-dark transition-all shadow-lg shadow-brand-primary/20 flex items-center justify-center gap-2"
                >
                  <Printer size={14} />
                  Imprimir Etiqueta
                </button>
              </div>
            </div>
          </Motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default RoomQRCodeModal;
