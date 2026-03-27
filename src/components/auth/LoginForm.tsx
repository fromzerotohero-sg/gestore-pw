'use client';

/**
 * Form di login (accesso admin verificato da middleware + profilo)
 */
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Alert } from '@/components/ui/Alert';
import { User, Lock } from 'lucide-react';

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const loginError = searchParams.get('error');
  const externalError =
    loginError === 'unauthorized_admin'
      ? 'Accesso consentito solo all\'utente admin'
      : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        setError(authError.message);
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
      {externalError && <Alert type="error">{externalError}</Alert>}
      {error && <Alert type="error">{error}</Alert>}

      <Input
        label="Email admin"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="admin@azienda.com"
        icon={<User className="h-5 w-5" />}
        required
        autoComplete="email"
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
