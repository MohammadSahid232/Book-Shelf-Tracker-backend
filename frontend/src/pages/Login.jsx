import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState({ text: '', type: '' });
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ text: '', type: '' });

    const result = await login({ email, password });

    if (!result.success) {
      setMessage({ text: result.message || 'Login failed', type: 'error' });
      return;
    }

    if (result.user?.role === 'admin') {
      navigate('/admin/dashboard');
    } else {
      navigate('/books');
    }
  };

  return (
    <main
      className="px-4 md:px-8 min-h-screen flex items-center justify-center py-12 transition-colors"
      style={{ backgroundColor: 'var(--bg)', color: 'var(--text-primary)' }}
    >
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl shadow-lg mb-4"
            style={{ backgroundColor: 'var(--primary)', color: 'var(--text-inverse)' }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
            </svg>
          </div>
          <h1 className="text-2xl font-extrabold" style={{ color: 'var(--text-primary)' }}>Book Shelf Tracker</h1>
        </div>

        <div
          className="p-6 rounded-2xl border shadow-sm md:p-8"
          style={{ backgroundColor: 'var(--bg-raised)', borderColor: 'var(--line)' }}
        >
          <h2 className="text-slate-900 text-center text-2xl font-bold dark:text-slate-50 mb-2">Welcome back</h2>
          <p className="text-center text-sm text-slate-500 dark:text-slate-400 mb-8">Sign in to your account</p>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="mb-2 text-slate-700 font-medium text-sm inline-block dark:text-slate-300">
                Email address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="you@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="px-3 py-2.5 text-sm text-slate-900 rounded-lg bg-gray-50 w-full border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-slate-50 dark:bg-neutral-700 dark:border-neutral-600"
              />
            </div>

            <div>
              <label htmlFor="password" className="mb-2 text-slate-700 font-medium text-sm inline-block dark:text-slate-300">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                placeholder="••••••••"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="px-3 py-2.5 text-sm text-slate-900 rounded-lg bg-gray-50 w-full border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-slate-50 dark:bg-neutral-700 dark:border-neutral-600"
              />
            </div>

            {message.text && (
              <div className={`p-3 rounded-lg text-sm font-medium text-center ${
                message.type === 'error'
                  ? 'bg-red-50 text-red-700 border border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800'
                  : 'bg-green-50 text-green-700 border border-green-200'
              }`}>
                {message.text}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              id="login-submit-btn"
              className="w-full py-2.5 px-4 text-sm rounded-lg font-semibold cursor-pointer text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>

            {/* Google OAuth Button */}
            <div className="relative my-4 flex items-center justify-center">
              <div className="w-full border-t border-slate-200 dark:border-neutral-700"></div>
              <span className="absolute bg-white dark:bg-neutral-800 px-3 text-xs text-slate-400 font-medium">OR</span>
            </div>

            <a
              href={`${BACKEND_URL}/auth/google`}
              className="w-full py-2.5 px-4 text-sm rounded-lg font-semibold flex items-center justify-center gap-2 border border-slate-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-slate-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-neutral-600 transition-colors"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              Sign in with Google
            </a>

            <div className="text-slate-600 text-sm text-center dark:text-slate-400">
              Don't have an account?{' '}
              <Link to="/register" className="text-blue-600 hover:underline font-medium dark:text-blue-400">
                Create one
              </Link>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
