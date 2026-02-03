
import React, { useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { UserIcon } from './icons/UserIcon';
import { LockClosedIcon } from './icons/LockClosedIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { ClockIcon } from './icons/ClockIcon';
import { ViewColumnsIcon } from './icons/ViewColumnsIcon';

const HERO_SLIDES = [
  {
    icon: <SparklesIcon className="w-10 h-10 text-white" />,
    title: "AI-Powered Precision",
    content: "Automatically break down complex projects into manageable daily tasks.",
    accent: "bg-primary-500/80"
  },
  {
    icon: <ViewColumnsIcon className="w-10 h-10 text-white" />,
    title: "Visual Workflow",
    content: "Kanban and Calendar views designed for clarity and team alignment.",
    accent: "bg-primary-600/80"
  },
  {
    icon: <ClockIcon className="w-10 h-10 text-white" />,
    title: "Deep Analytics",
    content: "Track time and generate AI summaries of your team's weekly wins.",
    accent: "bg-primary-400/80"
  }
];

const LoginPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [activeSlide, setActiveSlide] = useState(0);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const { login, signup } = useAuth();
  const { showNotification } = useNotification();

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!isLogin) {
        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }
    }
    setIsLoading(true);
    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await signup(email, password, fullName);
        // If successful and no error thrown:
        showNotification("Account created! Please sign in (check email if confirmation is enabled).", "success");
        setIsLogin(true); // Switch to login mode
        setPassword('');
        setConfirmPassword('');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4">
      <div className="relative z-10 w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        
        {/* Left Side: Brand & Carousel */}
        <div className="hidden lg:flex flex-col justify-center space-y-10 p-8">
          <div className="flex items-center gap-3 text-slate-800 dark:text-white">
            <div className="p-2 bg-primary-600 rounded-lg shadow-lg shadow-primary-500/30">
              <SparklesIcon className="w-8 h-8 text-white" />
            </div>
            <span className="text-3xl font-black tracking-tighter uppercase">TaskFlow</span>
          </div>

          <div className="relative h-[280px]">
            {HERO_SLIDES.map((slide, idx) => (
              <div 
                key={idx}
                className={`absolute inset-0 transition-all duration-1000 transform ${
                  activeSlide === idx 
                    ? 'opacity-100 translate-y-0 scale-100' 
                    : 'opacity-0 translate-y-4 scale-95 pointer-events-none'
                }`}
              >
                <div className={`${slide.accent} inline-flex p-4 rounded-2xl mb-6 backdrop-blur-md shadow-lg`}>
                  {slide.icon}
                </div>
                <h2 className="text-5xl font-extrabold text-slate-900 dark:text-white mb-6 leading-tight tracking-tight">
                  {slide.title}
                </h2>
                <p className="text-slate-600 dark:text-primary-100/60 text-xl leading-relaxed max-w-md">
                  {slide.content}
                </p>
              </div>
            ))}
          </div>

          <div className="flex gap-4">
            {HERO_SLIDES.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveSlide(idx)}
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  activeSlide === idx ? 'w-16 bg-slate-800 dark:bg-white' : 'w-4 bg-slate-300 dark:bg-white/10 hover:bg-slate-400 dark:hover:bg-white/30'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Right Side: Glass Login Card */}
        <div className="flex justify-center">
          <div className="w-full max-w-md bg-white/70 dark:bg-white/[0.03] backdrop-blur-3xl rounded-[2.5rem] p-10 lg:p-12 border border-slate-100 dark:border-white/10 shadow-2xl dark:shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)]">
            <div className="lg:hidden flex items-center gap-2 text-slate-900 dark:text-white mb-10">
               <SparklesIcon className="w-6 h-6 text-primary-500 dark:text-primary-400" />
               <span className="text-xl font-black uppercase tracking-tighter">TaskFlow</span>
            </div>

            <div className="mb-10">
              <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-3">
                {isLogin ? 'Welcome back' : 'Join TaskFlow'}
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-lg">
                {isLogin ? 'Sign in to your workspace.' : 'Create your free account today.'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {!isLogin && (
                <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em] ml-1">Full Name</label>
                  <div className="relative group">
                    <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-slate-500 transition-colors group-focus-within:text-primary-500 dark:group-focus-within:text-primary-400" />
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-white/[0.05] border border-slate-200 dark:border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all"
                      placeholder="Jane Doe"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em] ml-1">Email Address</label>
                <div className="relative group">
                  <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-slate-500 transition-colors group-focus-within:text-primary-500 dark:group-focus-within:text-primary-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-white/[0.05] border border-slate-200 dark:border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all"
                    placeholder="name@company.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em] ml-1">Password</label>
                <div className="relative group">
                  <LockClosedIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-slate-500 transition-colors group-focus-within:text-primary-500 dark:group-focus-within:text-primary-400" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-white/[0.05] border border-slate-200 dark:border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              {!isLogin && (
                <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em] ml-1">Confirm Password</label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-white/[0.05] border border-slate-200 dark:border-white/10 rounded-2xl py-3.5 px-4 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all"
                    placeholder="••••••••"
                  />
                </div>
              )}

              {error && (
                <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 text-sm font-medium animate-shake">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 px-6 bg-primary-600 hover:bg-primary-500 text-white font-black rounded-2xl shadow-xl shadow-primary-600/20 transition-all active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed mt-4 uppercase tracking-widest text-sm"
              >
                {isLoading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
              </button>
            </form>

            <div className="mt-10 text-center">
              <button 
                onClick={() => { setIsLogin(!isLogin); setError(null); }}
                className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors text-sm font-semibold"
              >
                {isLogin ? "New here? Create an account" : "Have an account? Sign in"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Branding */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-slate-400 dark:text-slate-600 text-[10px] font-black tracking-[0.4em] uppercase opacity-60">
        TaskFlow AI • Empowering Teams
      </div>
    </div>
  );
};

export default LoginPage;
