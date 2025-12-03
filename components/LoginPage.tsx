
import React, { useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { UserIcon } from './icons/UserIcon';
import { LockClosedIcon } from './icons/LockClosedIcon';
import { SparklesIcon } from './icons/SparklesIcon';

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      await login(username, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleQuickLogin = async (user: 'alice' | 'bob') => {
    setIsLoading(true);
    setError(null);
    try {
      await login(user, 'password');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white dark:bg-slate-900 transition-colors duration-200">
      {/* Left Panel: Login Form */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 mb-8">
            <SparklesIcon className="w-8 h-8" />
            <span className="text-2xl font-bold tracking-tight">TaskFlow</span>
          </div>

          <div>
            <h2 className="mt-6 text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Welcome back
            </h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              Please sign in to your account to continue
            </p>
          </div>

          <div className="mt-8">
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Username
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <UserIcon className="h-5 w-5 text-slate-400" aria-hidden="true" />
                  </div>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    autoComplete="username"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md leading-5 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-colors duration-200"
                    placeholder="Enter your username"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Password
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <LockClosedIcon className="h-5 w-5 text-slate-400" aria-hidden="true" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md leading-5 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-colors duration-200"
                    placeholder="Enter your password"
                  />
                </div>
              </div>

              {error && (
                <div className="rounded-md bg-red-50 dark:bg-red-900/30 p-3">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      {/* Simple alert icon */}
                      <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-red-700 dark:text-red-200">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  {isLoading ? 'Signing in...' : 'Sign in'}
                </button>
              </div>
            </form>

            <div className="mt-8">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-300 dark:border-slate-700" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400">
                    Or use a demo account
                  </span>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleQuickLogin('alice')}
                  disabled={isLoading}
                  className="w-full inline-flex justify-center items-center py-2 px-4 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm bg-white dark:bg-slate-800 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500 transition-colors"
                >
                  <span className="sr-only">Sign in as </span>Alice (Admin)
                </button>
                <button
                  onClick={() => handleQuickLogin('bob')}
                  disabled={isLoading}
                  className="w-full inline-flex justify-center items-center py-2 px-4 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm bg-white dark:bg-slate-800 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500 transition-colors"
                >
                  <span className="sr-only">Sign in as </span>Bob (User)
                </button>
              </div>
              <p className="mt-2 text-center text-xs text-slate-400">
                Password for demo accounts is "password"
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel: Hero / Visuals */}
      <div className="hidden lg:block relative w-0 flex-1 bg-indigo-600 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 to-violet-700" />
        
        {/* Abstract decorative shapes */}
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-white opacity-10 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 w-[500px] h-[500px] rounded-full bg-indigo-400 opacity-20 blur-3xl transform -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full bg-purple-500 opacity-20 blur-3xl" />

        <div className="relative h-full flex flex-col justify-center items-center p-12 text-center">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 max-w-lg border border-white/20 shadow-2xl">
                <div className="mb-6 flex justify-center">
                    <div className="bg-indigo-500/30 p-4 rounded-full ring-4 ring-indigo-400/20">
                         <SparklesIcon className="w-12 h-12 text-white" />
                    </div>
                </div>
                <h2 className="text-3xl font-bold text-white mb-4">
                    Manage tasks with AI precision
                </h2>
                <p className="text-indigo-100 text-lg leading-relaxed">
                    "TaskFlow has completely transformed how our team collaborates. The AI-powered breakdown of complex goals into actionable tasks is a game changer."
                </p>
                <div className="mt-6 flex items-center justify-center space-x-2">
                    <div className="w-2 h-2 rounded-full bg-white"></div>
                    <div className="w-2 h-2 rounded-full bg-white/40"></div>
                    <div className="w-2 h-2 rounded-full bg-white/40"></div>
                </div>
            </div>
            
            <div className="mt-12 text-indigo-200 text-sm font-medium">
                © {new Date().getFullYear()} TaskFlow Inc. All rights reserved.
            </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
