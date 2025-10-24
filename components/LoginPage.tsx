import React, { useState } from 'react';
import { useAuth } from '../auth/AuthContext';

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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="w-full max-w-md p-8 space-y-8 bg-white dark:bg-slate-800/50 rounded-lg shadow-2xl shadow-slate-300/20 dark:shadow-slate-900/40 border border-slate-200 dark:border-slate-700">
        <div>
          <h1 className="text-3xl font-bold text-center text-indigo-600 dark:text-indigo-400">
            TaskFlow
          </h1>
          <p className="mt-2 text-center text-sm text-slate-600 dark:text-slate-400">
            Sign in to your account
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="username-input" className="sr-only">Username</label>
              <input
                id="username-input"
                name="username"
                type="text"
                autoComplete="username"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-slate-300 placeholder-slate-500 text-slate-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm dark:bg-slate-700 dark:border-slate-600 dark:placeholder-slate-400 dark:text-white"
                placeholder="Username (e.g., alice, bob)"
              />
            </div>
            <div>
              <label htmlFor="password-input" className="sr-only">Password</label>
              <input
                id="password-input"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-slate-300 placeholder-slate-500 text-slate-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm dark:bg-slate-700 dark:border-slate-600 dark:placeholder-slate-400 dark:text-white"
                placeholder="Password"
              />
            </div>
          </div>

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400"
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </form>
        <div className="text-center">
            <p className="text-sm text-slate-500 dark:text-slate-400">Or use a quick login:</p>
            <div className="mt-2 flex justify-center space-x-2">
                <button onClick={() => handleQuickLogin('bob')} className="text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 p-2 rounded-md bg-indigo-50 dark:bg-indigo-900/50 hover:bg-indigo-100 transition-colors">Login as Bob (User)</button>
                <button onClick={() => handleQuickLogin('alice')} className="text-sm font-medium text-amber-600 hover:text-amber-500 dark:text-amber-400 dark:hover:text-amber-300 p-2 rounded-md bg-amber-50 dark:bg-amber-900/50 hover:bg-amber-100 transition-colors">Login as Alice (Admin)</button>
            </div>
            <p className="text-xs text-slate-400 mt-2 dark:text-slate-500">(Password is: "password")</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;