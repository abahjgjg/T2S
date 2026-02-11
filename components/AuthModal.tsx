
import React, { useState } from 'react';
import { supabaseService } from '../services/supabaseService';
import { Mail, Lock, LogIn, UserPlus, Loader2, AlertCircle } from 'lucide-react';
import { Modal } from './ui/Modal';
import { Input } from './ui/Input';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AuthModal: React.FC<Props> = ({ isOpen, onClose, onSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [touched, setTouched] = useState({ email: false, password: false });

  // Real-time validation
  const emailError = touched.email && !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/) 
    ? "Please enter a valid email address" 
    : null;
  
  const passwordStrength = !touched.password ? 0 : 
    password.length < 6 ? 1 :
    password.length < 10 ? 2 :
    /[A-Z]/.test(password) && /[0-9]/.test(password) && /[^A-Za-z0-9]/.test(password) ? 4 : 3;
  
  const strengthLabels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
  const strengthColors = ['', 'bg-red-500', 'bg-yellow-500', 'bg-blue-500', 'bg-emerald-500'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setIsLoading(true);
    setError(null);

    try {
      let result;
      if (isLogin) {
        result = await supabaseService.auth.signIn(email, password);
      } else {
        result = await supabaseService.auth.signUp(email, password);
      }

      if (result.error) {
        setError(result.error.message || "Authentication failed");
      } else {
        onSuccess();
        onClose();
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const Header = (
    <div>
      <h2 className="text-xl font-bold text-white">
        {isLogin ? 'Welcome Back' : 'Create Account'}
      </h2>
      <p className="text-slate-400 text-xs font-normal">
        {isLogin ? 'Sign in to access your cloud library.' : 'Sign up to sync your projects across devices.'}
      </p>
    </div>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={Header} className="max-w-sm">
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 flex items-start gap-2 text-xs text-red-400">
               <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
               <p>{error}</p>
            </div>
          )}

          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={() => setTouched(prev => ({ ...prev, email: true }))}
            error={emailError || undefined}
            success={touched.email && !emailError && !!email}
            leftIcon={<Mail className="w-4 h-4" />}
            placeholder="you@example.com"
            clearable
            required
          />

          <div>
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onBlur={() => setTouched(prev => ({ ...prev, password: true }))}
              leftIcon={<Lock className="w-4 h-4" />}
              placeholder="••••••••"
              clearable
              required
            />
            {/* Password Strength Indicator - Only show during signup */}
            {!isLogin && touched.password && password && (
              <div className="mt-2 space-y-1">
                <div className="flex gap-1 h-1">
                  {[1, 2, 3, 4].map((level) => (
                    <div 
                      key={level}
                      className={`flex-1 rounded-full transition-colors ${
                        passwordStrength >= level ? strengthColors[passwordStrength] : 'bg-slate-700'
                      }`}
                    />
                  ))}
                </div>
                <p className={`text-xs ${passwordStrength >= 3 ? 'text-emerald-400' : 'text-slate-400'}`}>
                  {strengthLabels[passwordStrength]} password
                </p>
              </div>
            )}
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 text-sm"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : isLogin ? (
              <><LogIn className="w-4 h-4" /> Sign In</>
            ) : (
              <><UserPlus className="w-4 h-4" /> Create Account</>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="p-4 bg-slate-950/50 border-t border-slate-800 text-center text-xs">
          <span className="text-slate-400">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
          </span>
          <button 
            onClick={() => {
              setIsLogin(!isLogin);
              setError(null);
            }}
            className="text-emerald-400 hover:text-emerald-300 font-bold hover:underline"
          >
            {isLogin ? 'Sign Up' : 'Log In'}
          </button>
        </div>
    </Modal>
  );
};
