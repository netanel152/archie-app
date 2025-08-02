// src/presentation/AuthWrapper.tsx
import { useEffect, useState } from 'react';
import { auth } from '../infrastructure/integrations/firebase';
import { onAuthStateChanged, type User } from 'firebase/auth';
import Login from './pages/Login';
import { Loader2 } from 'lucide-react';

export default function AuthWrapper({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen"><Loader2 className="w-8 h-8 animate-spin" /></div>;
  }

  if (!user) {
    return <Login />;
  }

  return <>{children}</>;
}