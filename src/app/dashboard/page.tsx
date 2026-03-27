/**
 * Dashboard principale
 * Visualizza tabella credenziali con ricerca, filtri e azioni
 */
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { CredentialsTable } from '@/components/credentials/CredentialsTable';
import { DashboardHeader } from '@/components/credentials/DashboardHeader';

export const metadata = {
  title: 'Dashboard | Gestione Credenziali',
  description: 'Gestione credenziali aziendali',
};

export default async function DashboardPage() {
  const supabase = await createClient();
  
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') {
    await supabase.auth.signOut();
    redirect('/auth/login?error=unauthorized_admin');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader userEmail={user.email!} />
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 sm:px-0">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              Credenziali Aziendali
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Gestisci le credenziali di accesso ai servizi aziendali
            </p>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <CredentialsTable />
          </div>
        </div>
      </main>
    </div>
  );
}
