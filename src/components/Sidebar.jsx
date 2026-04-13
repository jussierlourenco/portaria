import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  DoorOpen, 
  Settings, 
  LogOut, 
  History,
  ShieldCheck,
  Briefcase
} from 'lucide-react';
import { auth } from '../firebase/config';
import { signOut } from 'firebase/auth';
import { clsx } from 'clsx';

const Sidebar = () => {
  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    { icon: DoorOpen, label: 'Salas', path: '/admin' },
    { icon: Briefcase, label: 'Departamentos', path: '/admin/departments' },
    { icon: History, label: 'Relatórios', path: '/logs' },
  ];

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-slate-100 flex flex-col z-50">
      <div className="p-6 border-b border-slate-50 flex items-center gap-3">
        <img 
          src="/icon.png" 
          alt="CB Icon" 
          className="h-12 drop-shadow-sm"
        />
        <div>
          <h1 className="text-lg font-black text-brand-primary tracking-tighter leading-none">Portaria CB</h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Gestão de Salas</p>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => clsx(
              "flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all text-sm",
              isActive 
                ? "bg-brand-primary text-white shadow-lg shadow-brand-primary/20" 
                : "text-slate-500 hover:bg-slate-50"
            )}
          >
            <item.icon size={20} />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-50">
        <button 
          onClick={() => signOut(auth)}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm text-rose-500 hover:bg-rose-50 transition-all"
        >
          <LogOut size={20} />
          Sair do Sistema
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
