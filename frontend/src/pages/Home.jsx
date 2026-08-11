import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // If redirected from Google OAuth, delegate to OAuthCallback page
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const userStr = params.get('user');
    if (token && userStr) {
      navigate(`/oauth/callback${window.location.search}`, { replace: true });
    }
  }, [navigate]);

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center text-center px-4 py-16 relative overflow-hidden transition-colors"
      style={{ backgroundColor: 'var(--bg)', color: 'var(--text-primary)' }}
    >
      {/* Subtle Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full blur-3xl" style={{ backgroundColor: 'var(--primary-soft)' }} />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full blur-3xl" style={{ backgroundColor: 'var(--brass-soft)' }} />
      </div>

      <div className="max-w-3xl relative z-10">
        {/* Icon */}
        <div
          className="inline-flex items-center justify-center w-20 h-20 rounded-3xl shadow-2xl mb-8 mx-auto"
          style={{ backgroundColor: 'var(--primary)', color: 'var(--text-inverse)' }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-10 h-10">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
          </svg>
        </div>

        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-6 leading-tight" style={{ color: 'var(--text-primary)' }}>
          Track Your Reading<br />
          <span style={{ color: 'var(--primary)' }}>Journey</span>
        </h1>

        <p className="text-lg md:text-xl mb-10 max-w-2xl mx-auto leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
          Organize your personal library, log your reading progress, and discover new books. Built for book lovers, entirely free.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {user ? (
            <>
              {user.role === 'admin' ? (
                <Link
                  to="/admin/dashboard"
                  id="admin-dashboard-btn"
                  className="px-8 py-3.5 font-bold rounded-xl shadow-lg transition-all hover:scale-105"
                  style={{ backgroundColor: 'var(--primary)', color: 'var(--text-inverse)' }}
                >
                  Go to Admin Dashboard →
                </Link>
              ) : (
                <Link
                  to="/books"
                  id="books-page-btn"
                  className="px-8 py-3.5 font-bold rounded-xl shadow-lg transition-all hover:scale-105"
                  style={{ backgroundColor: 'var(--primary)', color: 'var(--text-inverse)' }}
                >
                  Browse Book Shelf →
                </Link>
              )}
            </>
          ) : (
            <>
              <Link
                to="/login"
                id="home-signin-btn"
                className="px-8 py-3.5 font-bold rounded-xl shadow-lg transition-all hover:scale-105"
                style={{ backgroundColor: 'var(--primary)', color: 'var(--text-inverse)' }}
              >
                Sign In
              </Link>
              <Link
                to="/register"
                id="home-register-btn"
                className="px-8 py-3.5 font-bold rounded-xl transition-all hover:scale-105 border"
                style={{ backgroundColor: 'var(--bg-raised)', color: 'var(--text-primary)', borderColor: 'var(--line)' }}
              >
                Create Account
              </Link>
              <a
                href={`${BACKEND_URL}/auth/google`}
                className="px-8 py-3.5 font-bold rounded-xl transition-all hover:scale-105 flex items-center justify-center gap-2 shadow-lg border"
                style={{ backgroundColor: 'var(--bg-raised)', color: 'var(--text-primary)', borderColor: 'var(--line)' }}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                Google Auth
              </a>
            </>
          )}
        </div>

        {/* Feature pills */}
        <div className="flex flex-wrap gap-3 justify-center mt-12">
          {[
            { icon: '📚', text: 'Track reading progress' },
            { icon: '⭐', text: 'Rate & review books' },
            { icon: '📁', text: 'Organize your shelf' },
            { icon: '🔍', text: 'Search & filter' },
          ].map((item, idx) => (
            <div
              key={idx}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold border shadow-xs"
              style={{ backgroundColor: 'var(--bg-raised)', color: 'var(--text-secondary)', borderColor: 'var(--line)' }}
            >
              <span>{item.icon}</span>
              <span>{item.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Home;
