import React, { useState, useEffect } from 'react';
import { Plus, Users, BarChart3, Database, Trash2, Edit3 } from 'lucide-react';
import { subscribeToRooms, subscribeToDepartments, addRoom, updateRoom, deleteRoom, syncRooms } from '../firebase/db';
import RoomAdminModal from '../components/RoomAdminModal';
import { parseRoomsCSV } from '../utils/csvParser';
import { getRoomScheduleStatus } from '../utils/scheduleLogic';

const Admin = () => {
  const [rooms, setRooms] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const unsubscribeRooms = subscribeToRooms(setRooms);
    const unsubscribeDepts = subscribeToDepartments(setDepartments);
    return () => {
      unsubscribeRooms();
      unsubscribeDepts();
    };
  }, []);

  const deptMap = Object.fromEntries(departments.map(d => [d.id, d.sigla]));

  const handleCreateNew = () => {
    setEditingRoom(null);
    setIsModalOpen(true);
  };

  const handleEdit = (room) => {
    setEditingRoom(room);
    setIsModalOpen(true);
  };

  const handleDelete = async (roomId) => {
    if (window.confirm('Tem certeza que deseja excluir esta sala? Esta ação não pode ser desfeita.')) {
      await deleteRoom(roomId);
    }
  };

  const handleSave = async (formData) => {
    try {
      if (editingRoom) {
        await updateRoom(editingRoom.id, formData);
      } else {
        await addRoom(formData);
      }
      setIsModalOpen(false);
    } catch (error) {
      alert('Erro ao salvar sala: ' + error.message);
    }
  };

  const handleSync = async () => {
    if (!window.confirm('Isso irá substituir todas as salas atuais pela escala do CSV. Deseja continuar?')) return;
    
    setIsSyncing(true);
    try {
      const response = await fetch('/mapa.csv');
      const csvContent = await response.text();
      const roomsData = parseRoomsCSV(csvContent);
      
      await syncRooms(roomsData);
      alert(`${roomsData.length} salas sincronizadas com sucesso!`);
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
          <h1 className="text-4xl font-black text-brand-primary tracking-tighter uppercase italic">Cadastro de Salas</h1>
          <p className="text-slate-500 font-medium italic">Gerencie os espaços e horários do centro</p>
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
            <span>Cadastrar Sala</span>
          </button>
        </div>
      </header>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Total de Salas', value: rooms.length, icon: Database, color: 'text-brand-primary' },
          { label: 'Salas em Aula', value: rooms.filter(r => getRoomScheduleStatus(r.schedule).isOccupied).length, icon: Users, color: 'text-emerald-600' },
          { label: 'Portas Abertas', value: rooms.filter(r => r.status === 'Aberta').length, icon: BarChart3, color: 'text-amber-600' },
          { label: 'Andares', value: [...new Set(rooms.map(r => r.pavilion))].length, icon: BarChart3, color: 'text-blue-600' },
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
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/10">
          <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight">Listagem de Salas</h2>
          <div className="text-xs font-bold text-slate-400 italic">Total de {rooms.length} registros encontrados</div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/30 text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                <th className="px-8 py-5">Sala</th>
                <th className="px-6 py-5">Andar / Pavimento</th>
                <th className="px-6 py-5">Horário Previsto</th>
                <th className="px-6 py-5">Status</th>
                <th className="px-6 py-5 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rooms.map(room => (
                <tr key={room.id} className="hover:bg-slate-50/30 transition-colors group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2">
                       <div className="font-bold text-slate-800">{room.name}</div>
                       {room.departmentId && (
                         <span className="px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded text-[9px] font-black uppercase">
                           {deptMap[room.departmentId] || '...'}
                         </span>
                       )}
                    </div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase">{room.block}</div>
                  </td>
                  <td className="px-6 py-5 font-medium text-slate-500">{room.pavilion || 'Não informado'}</td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2 text-sm text-slate-600 font-medium">
                      {room.nextEventTime || '---'}
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className={`status-badge ${room.status === 'Aberta' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                      {room.status || 'Pendente'}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex gap-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleEdit(room)}
                        className="p-2 text-brand-primary hover:bg-brand-primary/10 rounded-lg transition-colors"
                      >
                        <Edit3 size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(room.id)}
                        className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {rooms.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-8 py-12 text-center text-slate-400 italic font-medium">
                    Nenhuma sala cadastrada. Clique em "Cadastrar Sala" para começar.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <RoomAdminModal 
        key={editingRoom?.id || 'new'}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        room={editingRoom}
      />
    </div>
  );
};

export default Admin;
