import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  BookOpen, Search, BookMarked, Folder, Users,
  Sparkles, ShieldCheck, LogOut, CheckSquare, LayoutDashboard
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Sidebar({ isOpen, onClose }) {
  const location = useLocation();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    if (onClose) onClose();
    await logout();
  };

  let navItems = [
    { to: '/library', label: 'Digital Library', icon: <BookOpen className="w-4 h-4" /> },
    { to: '/search', label: 'Search Books', icon: <Search className="w-4 h-4" /> },
    { to: '/my-library', label: 'My Reading Shelf', icon: <BookMarked className="w-4 h-4" /> },
    { to: '/collections', label: 'Collections', icon: <Folder className="w-4 h-4" /> },
    { to: '/tasks', label: 'Task Manager', icon: <CheckSquare className="w-4 h-4 text-blue-500" /> },
    { to: '/ai-hub', label: 'Recommend Next Book', icon: <Sparkles className="w-4 h-4 text-purple-500" /> },
    { to: '/discover', label: 'Google Books', icon: <Search className="w-4 h-4" /> },
  ];

  if (user?.role === 'admin') {
    navItems = [
      { to: '/admin/dashboard', label: 'Admin Dashboard', icon: <ShieldCheck className="w-4 h-4 text-red-500" /> },
      { to: '/admin/tasks', label: 'Task Manager', icon: <CheckSquare className="w-4 h-4" /> },
    ];
  }

  return (
    <>
      <aside
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-white dark:bg-neutral-800 border-r border-slate-200 dark:border-neutral-700/80 transform lg:transform-none lg:opacity-100 lg:relative transition-all duration-300 ease-in-out flex flex-col justify-between ${
          isOpen ? 'translate-x-0 opacity-100' : '-translate-x-full lg:translate-x-0'
        }`}
        style={{ top: '65px', height: 'calc(100vh - 65px)' }}
      >
        <div className="px-3 py-6 overflow-y-auto flex-1">
          <p className="px-3 mb-4 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Navigation
          </p>
          <ul className="space-y-1.5">
            {navItems.map((item) => {
              const isActive = location.pathname === item.to;
              return (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    onClick={() => onClose && onClose()}
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                      isActive
                        ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 border-l-4 border-indigo-600'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-neutral-700/50 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {item.icon}
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Footer Info inside Sidebar */}
        <div className="p-4 border-t border-slate-100 dark:border-neutral-700/50 bg-slate-50/50 dark:bg-neutral-800/50">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center font-bold text-indigo-700 dark:text-indigo-300 text-sm capitalize">
              {user?.name?.[0] || 'U'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate capitalize">{user?.name}</p>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-bold text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/20 rounded-lg transition-colors border border-transparent hover:border-red-100 dark:hover:border-red-950/40"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Overlay Backdrop for Mobile screens */}
      {isOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/40 backdrop-blur-xs lg:hidden"
          onClick={() => onClose && onClose()}
        />
      )}
    </>
  );
}
