import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState({ text: '', type: '' });
  const { register, loading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ text: '', type: '' });

    if (password !== confirmPassword) {
      setMessage({ text: 'Passwords do not match', type: 'error' });
      return;
    }

    // Pass as an object — arrow functions don't have 'arguments', so positional args won't work
    const result = await register({
      name,
      email,
      password,
      confirmPassword,
    });

    if (!result.success) {
      setMessage({ text: result.message || 'Registration failed', type: 'error' });
      return;
    }

    setMessage({ text: 'Account created! Redirecting to login...', type: 'success' });
    setTimeout(() => navigate('/login'), 1500);
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
          <h2 className="text-slate-900 text-center text-2xl font-bold dark:text-slate-50 mb-2">Create account</h2>
          <p className="text-center text-sm text-slate-500 dark:text-slate-400 mb-8">Join to track your reading journey</p>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="name" className="mb-2 text-slate-700 font-medium text-sm inline-block dark:text-slate-300">
                Full Name
              </label>
              <input
                type="text"
                id="name"
                placeholder="John Doe"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="px-3 py-2.5 text-sm text-slate-900 rounded-lg bg-gray-50 w-full border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-slate-50 dark:bg-neutral-700 dark:border-neutral-600"
              />
            </div>

            <div>
              <label htmlFor="email" className="mb-2 text-slate-700 font-medium text-sm inline-block dark:text-slate-300">
                Email address
              </label>
              <input
                type="email"
                id="email"
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
                placeholder="••••••••"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="px-3 py-2.5 text-sm text-slate-900 rounded-lg bg-gray-50 w-full border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-slate-50 dark:bg-neutral-700 dark:border-neutral-600"
              />
              <p className="text-xs text-slate-400 mt-1">Minimum 6 characters</p>
            </div>

            <div>
              <label htmlFor="confirm-password" className="mb-2 text-slate-700 font-medium text-sm inline-block dark:text-slate-300">
                Confirm password
              </label>
              <input
                type="password"
                id="confirm-password"
                placeholder="••••••••"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
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
              id="register-submit-btn"
              className="w-full py-2.5 px-4 text-sm rounded-lg font-semibold cursor-pointer text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 mt-2"
            >
              {loading ? 'Creating account...' : 'Create account'}
            </button>

            <div className="text-slate-600 text-sm text-center dark:text-slate-400">
              Already have an account?{' '}
              <Link to="/login" className="text-blue-600 hover:underline font-medium dark:text-blue-400">
                Sign in
              </Link>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
