import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { UserProfile } from '../types';
import { supabaseService } from '../services/supabaseService';
import { AuthModal } from '../components/AuthModal';

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  isAuthModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  useEffect(() => {
    // Check active session
    supabaseService.auth.getUser().then(u => {
      if (u) setUser({ id: u.id, email: u.email || '' });
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabaseService.auth.onAuthStateChange((u) => {
      if (u) {
        setUser({ id: u.id, email: u.email || '' });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const openAuthModal = () => setIsAuthModalOpen(true);
  const closeAuthModal = () => setIsAuthModalOpen(false);

  const signOut = async () => {
    await supabaseService.auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, isAuthModalOpen, openAuthModal, closeAuthModal, signOut }}>
      {children}
      <AuthModal 
        isOpen={isAuthModalOpen}
        onClose={closeAuthModal}
        onSuccess={closeAuthModal}
      />
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
