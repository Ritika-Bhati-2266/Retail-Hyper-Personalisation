import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import Navbar from '../components/Navbar';
import { Mail, Lock, User as UserIcon, LogIn, UserPlus } from 'lucide-react';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, register, loading, error } = useApp();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    let success = false;
    
    if (isLogin) {
      success = await login(email, password);
    } else {
      success = await register(username, email, password);
    }

    if (success) {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-bg-primary transition-colors duration-300 relative overflow-hidden flex flex-col">
      
      {/* Decorative Orbs */}
      <div className="gradient-glow-orb top-[-100px] left-[-50px] w-[350px] h-[350px] bg-brand-indigo/8 animate-pulse-glow" />
      <div className="gradient-glow-orb bottom-[-50px] right-[-50px] w-[400px] h-[400px] bg-brand-pink/5 animate-pulse-glow" style={{ animationDelay: '3.5s' }} />

      <Navbar />
      
      <div className="flex-1 flex justify-center items-center py-12 px-4 relative z-10">
        <div className="w-full max-w-md rounded-3xl border border-border-custom bg-bg-secondary/25 backdrop-blur-md p-8 shadow-2xl animate-scale-in">
          
          {/* Header Toggle */}
          <div className="flex justify-center mb-8 border-b border-border-custom/40 pb-4">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 pb-2 text-center text-xs font-bold uppercase tracking-wider border-b-2 transition-all duration-300 cursor-pointer ${
                isLogin ? 'border-brand-indigo text-text-primary' : 'border-transparent text-text-muted hover:text-text-secondary'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 pb-2 text-center text-xs font-bold uppercase tracking-wider border-b-2 transition-all duration-300 cursor-pointer ${
                !isLogin ? 'border-brand-indigo text-text-primary' : 'border-transparent text-text-muted hover:text-text-secondary'
              }`}
            >
              Sign Up
            </button>
          </div>

          <div className="text-center mb-6">
            <h2 className="text-2xl font-extrabold font-display text-text-primary">
              {isLogin ? 'Welcome Back!' : 'Create an Account'}
            </h2>
            <p className="text-xs text-text-secondary mt-2 leading-relaxed">
              {isLogin 
                ? 'Sign in to access your custom offers and recommendations.' 
                : 'Join us and start experiencing custom personal feeds.'
              }
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-5 p-3.5 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-xs font-bold text-center animate-scale-in">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Username Field for signup */}
            {!isLogin && (
              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-text-secondary uppercase tracking-wider">Username</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="Enter your username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full h-11 px-4 pl-11 rounded-2xl bg-bg-secondary/60 border border-border-custom text-xs font-semibold text-text-primary placeholder-text-muted focus:outline-none focus:border-brand-indigo focus:ring-1 focus:ring-brand-indigo/35 focus:bg-bg-secondary transition-all duration-300"
                  />
                  <UserIcon className="absolute left-4 top-3.5 w-4 h-4 text-text-muted" />
                </div>
              </div>
            )}

            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-extrabold text-text-secondary uppercase tracking-wider">Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-11 px-4 pl-11 rounded-2xl bg-bg-secondary/60 border border-border-custom text-xs font-semibold text-text-primary placeholder-text-muted focus:outline-none focus:border-brand-indigo focus:ring-1 focus:ring-brand-indigo/35 focus:bg-bg-secondary transition-all duration-300"
                />
                <Mail className="absolute left-4 top-3.5 w-4 h-4 text-text-muted" />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-extrabold text-text-secondary uppercase tracking-wider">Password</label>
              <div className="relative">
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-11 px-4 pl-11 rounded-2xl bg-bg-secondary/60 border border-border-custom text-xs font-semibold text-text-primary placeholder-text-muted focus:outline-none focus:border-brand-indigo focus:ring-1 focus:ring-brand-indigo/35 focus:bg-bg-secondary transition-all duration-300"
                />
                <Lock className="absolute left-4 top-3.5 w-4 h-4 text-text-muted" />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 mt-6 bg-gradient-to-r from-brand-indigo to-brand-purple hover:from-indigo-600 hover:to-purple-600 active:scale-95 text-white rounded-2xl text-xs font-bold uppercase tracking-wider shadow-lg shadow-brand-indigo/25 hover:shadow-brand-indigo/35 transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
            >
              {isLogin ? (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>{loading ? 'Logging in...' : 'Sign In'}</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>{loading ? 'Creating...' : 'Create Account'}</span>
                </>
              )}
            </button>

          </form>

          {/* Quick Mock Login tip */}
          <div className="mt-6 border-t border-border-custom/40 pt-5 text-center">
            <p className="text-[10px] text-text-secondary leading-relaxed">
              <strong className="font-extrabold uppercase text-text-primary tracking-wider block mb-1">Quick testing credentials</strong>
              Admin: <code className="text-brand-indigo font-bold">admin@retail.com</code> (pass: <code className="text-brand-indigo font-bold">admin123</code>)<br />
              Customer: <code className="text-brand-indigo font-bold">customer@retail.com</code> (pass: <code className="text-brand-indigo font-bold">customer123</code>)
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
