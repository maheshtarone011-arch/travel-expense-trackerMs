
import React, { useState } from 'react';
import { Lock, Mail, ArrowRight, UserPlus, LogIn, PlaneTakeoff, AlertCircle } from 'lucide-react';

interface LoginProps {
  onLogin: (email: string, password: string) => void;
  onSignup: (email: string, password: string) => void;
  error?: string;
  clearError: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin, onSignup, error: externalError, clearError }) => {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [localError, setLocalError] = useState('');

  const displayError = externalError || localError;

  const validate = () => {
    setLocalError('');
    clearError();
    
    if (!email || !password) {
        setLocalError('Please fill in all required fields.');
        return false;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
        setLocalError('Please enter a valid email address.');
        return false;
    }
    if (password.length < 6) {
        setLocalError('Password must be at least 6 characters.');
        return false;
    }
    if (mode === 'signup' && password !== confirmPassword) {
        setLocalError('Passwords do not match.');
        return false;
    }
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    if (mode === 'login') {
        onLogin(email, password);
    } else {
        onSignup(email, password);
    }
  };

  const switchMode = (newMode: 'login' | 'signup') => {
      setMode(newMode);
      setLocalError('');
      clearError();
      setPassword('');
      setConfirmPassword('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 to-indigo-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in-up">
        
        {/* Logo Section */}
        <div className="bg-indigo-700 p-8 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white to-transparent"></div>
            <div className="relative z-10 flex flex-col items-center">
                <div className="bg-white/20 p-3 rounded-full mb-3 backdrop-blur-sm shadow-lg">
                    <PlaneTakeoff className="text-white h-10 w-10" />
                </div>
                <h1 className="text-2xl font-bold text-white tracking-wide">Travel Expense Tracker</h1>
                <p className="text-indigo-200 text-sm mt-1">Manage your tours efficiently</p>
            </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-gray-200">
            <button 
                onClick={() => switchMode('login')}
                className={`flex-1 py-4 text-sm font-semibold transition-colors duration-200 ${mode === 'login' ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50' : 'text-gray-500 hover:text-gray-700'}`}
            >
                Login
            </button>
            <button 
                onClick={() => switchMode('signup')}
                className={`flex-1 py-4 text-sm font-semibold transition-colors duration-200 ${mode === 'signup' ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50' : 'text-gray-500 hover:text-gray-700'}`}
            >
                Sign Up
            </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-5">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <div className="relative">
                    <Mail className={`absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 ${displayError ? 'text-red-400' : 'text-gray-400'}`} />
                    <input 
                        type="email" 
                        value={email}
                        onChange={(e) => { setEmail(e.target.value); if(displayError) clearError(); }}
                        className={`w-full pl-10 pr-4 py-3 border rounded-lg outline-none transition ${displayError ? 'border-red-300 focus:ring-red-200 bg-red-50' : 'border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500'}`}
                        placeholder="yourname@example.com"
                    />
                </div>
            </div>
            
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <div className="relative">
                    <Lock className={`absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 ${displayError ? 'text-red-400' : 'text-gray-400'}`} />
                    <input 
                        type="password" 
                        value={password}
                        onChange={(e) => { setPassword(e.target.value); if(displayError) clearError(); }}
                        className={`w-full pl-10 pr-4 py-3 border rounded-lg outline-none transition ${displayError ? 'border-red-300 focus:ring-red-200 bg-red-50' : 'border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500'}`}
                        placeholder="••••••••"
                    />
                </div>
            </div>

            {mode === 'signup' && (
                <div className="animate-fade-in-up">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                    <div className="relative">
                        <Lock className={`absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 ${localError.includes('match') ? 'text-red-400' : 'text-gray-400'}`} />
                        <input 
                            type="password" 
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className={`w-full pl-10 pr-4 py-3 border rounded-lg outline-none transition ${localError.includes('match') ? 'border-red-300 focus:ring-red-200 bg-red-50' : 'border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500'}`}
                            placeholder="••••••••"
                        />
                    </div>
                </div>
            )}

            {/* Error Indicator */}
            {displayError && (
                <div className="flex items-center gap-2 bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-100 animate-pulse">
                    <AlertCircle size={16} />
                    <span>{displayError}</span>
                </div>
            )}

            <button 
                type="submit" 
                className="w-full bg-indigo-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 flex items-center justify-center gap-2 transition-transform transform active:scale-95 shadow-md mt-2"
            >
                {mode === 'signup' ? <UserPlus size={20} /> : <LogIn size={20} />}
                {mode === 'signup' ? 'Create Account' : 'Login'}
                <ArrowRight size={18} />
            </button>
            
            <p className="text-center text-xs text-gray-400 mt-4">
                {mode === 'signup' ? 'Your data is saved locally on this device.' : 'Welcome back to your travel manager.'}
            </p>
        </form>
      </div>
    </div>
  );
};

export default Login;
