'use client';

/**
 * Form di login con credenziali hardcoded
 * Accetta solo: fromzerotohero / Attiteogio
 */
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Alert } from '@/components/ui/Alert';
import { User, Lock } from 'lucide-react';

// Credenziali autorizzate
const ALLOWED_USERNAME = 'fromzerotohero';
const ALLOWED_PASSWORD = 'Attiteogio';

export function LoginForm() {
  const router = useRouter();
  const supabase = createClient();
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Verifica credenziali hardcoded
    if (username !== ALLOWED_USERNAME || password !== ALLOWED_PASSWORD) {
      setError('Username o password non validi');
      setLoading(false);
      return;
    }

    try {
      // Login su Supabase con email completa
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: 'fromzerotohero@fromzerotohero.io',
        password: ALLOWED_PASSWORD,
      });

      if (authError) {
        // Se l'utente non esiste ancora su Supabase
        if (authError.message.includes('Invalid login credentials')) {
          setError('Utente non trovato su Supabase. Contatta l\'amministratore.');
        } else {
          setError(authError.message);
        }
        setLoading(false);
        return;
      }

      router.push('/dashboard');
      router.refresh();
    } catch {
      setError('Errore durante il login. Riprova.');
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && <Alert type="error">{error}</Alert>}

      <Input
        label="Username"
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="fromzerotohero"
        icon={<User className="h-5 w-5" />}
        required
        autoComplete="username"
      />

      <Input
        label="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="••••••••"
        icon={<Lock className="h-5 w-5" />}
        required
        autoComplete="current-password"
      />

      <Button
        type="submit"
        loading={loading}
        className="w-full"
        size="lg"
      >
        Accedi
      </Button>
    </form>
  );
}
