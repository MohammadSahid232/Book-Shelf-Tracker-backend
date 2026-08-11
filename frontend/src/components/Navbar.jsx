import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  BookOpen,
  LayoutDashboard,
  Compass,
  Sparkles,
  LogOut,
  ArrowLeft,
  CheckSquare
} from 'lucide-react';
import ThemeToggle from './ThemeToggle';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-white/80 dark:bg-neutral-900/80 border-b border-slate-200/80 dark:border-neutral-800 px-4 md:px-8 py-3 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {location.pathname !== '/' && (
            <button
              onClick={() => navigate(-1)}
              className="p-1.5 rounded-xl bg-slate-100/80 dark:bg-neutral-800/80 hover:bg-slate-200 dark:hover:bg-neutral-700 text-slate-600 dark:text-slate-300 transition-colors"
              title="Go Back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          {/* Brand Logo & Name */}
          <Link
          to={user?.role === 'admin' ? '/admin/dashboard' : user ? '/library' : '/'}
          className="flex items-center gap-2.5 font-bold text-lg tracking-tight group"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-purple-500 text-white flex items-center justify-center shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
            <BookOpen className="w-5 h-5" />
          </div>
          <span className="text-slate-900 dark:text-white font-extrabold text-xl bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
            BookShelf<span className="text-purple-600 dark:text-purple-400 font-black ml-0.5">AI</span>
          </span>
        </Link>
        </div>

        {/* Center Main Nav Links (Clean & Compact) */}
        {user && (
          <nav className="hidden md:flex items-center gap-1 bg-slate-100/70 dark:bg-neutral-800/70 p-1.5 rounded-2xl border border-slate-200/50 dark:border-neutral-700/50">
            {user.role !== 'admin' && (
              <Link
                to="/library"
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  isActive('/library')
                    ? 'bg-amber-100/60 dark:bg-neutral-800 text-rose-700 dark:text-rose-400 shadow-xs border border-amber-200/50 dark:border-neutral-700'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                Library
              </Link>
            )}

            {user.role !== 'admin' && (
              <> 
                <Link
                  to="/discover"
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    isActive('/discover')
                      ? 'bg-amber-100/60 dark:bg-neutral-800 text-rose-700 dark:text-rose-400 shadow-xs border border-amber-200/50 dark:border-neutral-700'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Compass className="w-4 h-4" />
                  Discover
                </Link>

                <Link
                  to="/tasks"
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    isActive('/tasks')
                      ? 'bg-amber-100/60 dark:bg-neutral-800 text-rose-700 dark:text-rose-400 shadow-xs border border-amber-200/50 dark:border-neutral-700'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <CheckSquare className="w-4 h-4 text-blue-500" />
                  Tasks
                </Link>

                <Link
                  to="/ai-hub"
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    isActive('/ai-hub')
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-500/20'
                      : 'text-slate-600 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400'
                  }`}
                >
                  <Sparkles className="w-4 h-4 text-purple-400 fill-purple-400/20" />
                  AI Recommendations
                </Link>
              </>
            )}



          </nav>
        )}

        {/* Right Action Controls */}
        <div className="flex items-center gap-3">
          <ThemeToggle />
          {user ? (
            <div className="flex items-center gap-2">
              <Link
                to="/profile"
                className="flex items-center gap-2 p-1.5 pr-3 rounded-full bg-slate-100 dark:bg-neutral-800 hover:bg-slate-200/70 dark:hover:bg-neutral-700/80 transition-all border border-slate-200/60 dark:border-neutral-700/60"
              >
                {user.avatar ? (
                  <img src={user.avatar} alt="Avatar" className="w-7 h-7 rounded-full object-cover" />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs uppercase">
                    {user.name?.[0] || 'U'}
                  </div>
                )}
                <span className="text-xs font-bold text-slate-700 dark:text-slate-200 max-w-[100px] truncate">
                  {user.name || user.first_name || 'My Profile'}
                </span>
              </Link>

              <button
                onClick={handleLogout}
                title="Sign Out"
                className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition-all"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="px-4 py-2 text-xs font-bold text-slate-700 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-neutral-800 rounded-xl transition-all"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl shadow-md shadow-blue-500/20 transition-all"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
