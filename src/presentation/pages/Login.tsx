import { auth } from '../../infrastructure/integrations/firebase';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { Button } from '../components/ui/button';

export default function Login() {
  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Error signing in with Google:", error);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-4">Welcome to Archie</h1>
        <p className="text-slate-600 mb-8">Your personal digital vault.</p>
        <Button onClick={handleGoogleLogin}>Sign in with Google</Button>
      </div>
    </div>
  );
}