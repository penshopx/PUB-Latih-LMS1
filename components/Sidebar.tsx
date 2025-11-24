
import React from 'react';
import { UserRole } from '../types';
import { LayoutDashboard, BookOpen, Users, Award, Settings, LogOut, Brain, Search } from './ui/Icons';

interface SidebarProps {
  role: UserRole;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  activeTab: string;
  onNavigate: (tab: string) => void;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ role, isOpen, setIsOpen, activeTab, onNavigate, onLogout }) => {
  const getLinks = () => {
    switch (role) {
      case UserRole.ADMIN:
        return [
          { id: 'overview', icon: LayoutDashboard, label: 'Ringkasan' },
          { id: 'users', icon: Users, label: 'Manajemen Pengguna' },
          { id: 'courses', icon: BookOpen, label: 'Semua Kursus' },
          { id: 'certificates', icon: Award, label: 'Sertifikat' },
          { id: 'analytics', icon: Brain, label: 'Analitik AI' },
        ];
      case UserRole.INSTRUCTOR:
        return [
          { id: 'dashboard', icon: LayoutDashboard, label: 'Dasbor' },
          { id: 'courses', icon: BookOpen, label: 'Kursus Saya' },
          { id: 'students', icon: Users, label: 'Siswa' },
          { id: 'content', icon: Brain, label: 'Generasi Konten AI' },
        ];
      case UserRole.LEARNER:
        return [
          { id: 'learning', icon: LayoutDashboard, label: 'Pembelajaran Saya' },
          { id: 'ai-writer', icon: Brain, label: 'Executive Summary AI' },
          { id: 'browse', icon: Search, label: 'Jelajahi Kursus' },
          { id: 'achievements', icon: Award, label: 'Pencapaian' },
        ];
      default:
        return [];
    }
  };

  const links = getLinks();

  return (
    <>
      {/* Mobile Overlay */}
      <div 
        className={`fixed inset-0 bg-black/50 z-20 lg:hidden transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsOpen(false)}
      />

      <aside className={`
        fixed lg:static inset-y-0 left-0 z-30
        w-64 bg-white border-r border-slate-200 flex flex-col
        transform transition-transform duration-200 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="h-16 flex items-center px-6 border-b border-slate-100">
          <div className="flex items-center gap-2 text-indigo-600 font-bold text-xl">
            <Brain className="w-8 h-8" />
            <span>PUB-Latih AI</span>
          </div>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          <div className="mb-4 px-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Portal {role}
          </div>
          {links.map((link) => (
            <button
              key={link.id}
              onClick={() => {
                onNavigate(link.id);
                setIsOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                activeTab === link.id
                  ? 'bg-indigo-50 text-indigo-600'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <link.icon className="w-5 h-5" />
              {link.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-100">
          <button className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
            <Settings className="w-5 h-5" />
            Pengaturan
          </button>
          <button 
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Keluar
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
