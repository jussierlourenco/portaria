import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { subscribeToRooms, roomCheckIn, roomCheckOut } from '../firebase/db';
import RoomCard from '../components/RoomCard';
import RoomModal from '../components/RoomModal';
import { LogOut, Filter, Search } from 'lucide-react';
import { clsx } from 'clsx';
import { auth } from '../firebase/config';
import { signOut } from 'firebase/auth';

const Dashboard = () => {
  const { user } = useAuth();
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filter, setFilter] = useState('Todos');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const unsubscribe = subscribeToRooms((data) => {
      setRooms(data);
    });
    return () => unsubscribe();
  }, []);

  const handleAction = (room) => {
    setSelectedRoom(room);
    setIsModalOpen(true);
  };

  const confirmAction = async (roomId, checklist) => {
    if (selectedRoom.status === 'Aberta') {
      await roomCheckOut(roomId, user.uid, checklist);
    } else {
      await roomCheckIn(roomId, user.uid);
    }
  };

  const filteredRooms = rooms
    .filter(r => filter === 'Todos' || r.block === filter)
    .filter(r => r.name.toLowerCase().includes(search.toLowerCase()));

  const completedCount = rooms.filter(r => r.status === 'Fechada').length;
  const progress = rooms.length > 0 ? Math.round((completedCount / rooms.length) * 100) : 0;

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Top Navbar */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-40 px-6 py-4 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-black text-indigo-600 tracking-tighter uppercase">ClassControl</h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Painel do Inspetor</p>
        </div>
        <button 
          onClick={() => signOut(auth)}
          className="p-3 bg-slate-50 text-slate-400 hover:text-rose-500 rounded-2xl transition-all"
        >
          <LogOut size={20} />
        </button>
      </nav>

      <main className="px-6 py-8 md:max-w-6xl md:mx-auto">
        {/* Welcome & Progress */}
        <section className="mb-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h2 className="text-3xl font-black text-slate-800 tracking-tight">Olá, {user?.displayName || 'Inspetor'} 👋</h2>
              <p className="text-slate-500 font-medium">Você tem {rooms.filter(r => r.status !== 'Fechada').length} salas pendentes hoje.</p>
            </div>
            
            <div className="glass-card p-5 md:w-80 shadow-indigo-100">
               <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Ronda do Dia</span>
                <span className="text-sm font-black text-indigo-600">{progress}%</span>
              </div>
              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-indigo-500 to-indigo-400 transition-all duration-1000 ease-out" 
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          </div>
        </section>

        {/* Filters & Search */}
        <section className="mb-8 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Buscar sala pelo nome..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white border border-slate-100 focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100 outline-none transition-all"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
            {['Todos', 'Bloco A', 'Bloco B', 'Pavilhão'].map(b => (
              <button
                key={b}
                onClick={() => setFilter(b)}
                className={clsx(
                  "px-6 py-4 rounded-2xl font-bold whitespace-nowrap transition-all",
                  filter === b ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200" : "bg-white text-slate-500 border border-slate-100 hover:bg-slate-50"
                )}
              >
                {b}
              </button>
            ))}
          </div>
        </section>

        {/* Rooms Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRooms.map(room => (
            <RoomCard 
              key={room.id} 
              room={room} 
              onAction={handleAction} 
            />
          ))}
          {filteredRooms.length === 0 && (
            <div className="col-span-full py-20 text-center">
              <p className="text-slate-400 font-medium italic">Nenhuma sala encontrada para estes filtros.</p>
            </div>
          )}
        </section>
      </main>

      {/* Modals */}
      {selectedRoom && (
        <RoomModal 
          room={selectedRoom} 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)}
          onConfirm={confirmAction}
        />
      )}
    </div>
  );
};

export default Dashboard;
