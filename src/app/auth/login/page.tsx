/**
 * Pagina di login
 * Form di autenticazione con redirect a dashboard dopo successo
 */
import { LoginForm } from '@/components/auth/LoginForm';

export const metadata = {
  title: 'Login | Gestione Credenziali',
  description: 'Accesso al sistema di gestione credenziali aziendali',
};

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Logo/Header */}
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-blue-600 rounded-lg flex items-center justify-center">
            <svg
              className="h-8 w-8 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Gestione Credenziali
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Accedi per gestire le credenziali aziendali
          </p>
        </div>

        {/* Form */}
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <LoginForm />
        </div>

        {/* Info */}
        <p className="text-center text-xs text-gray-500">
          Sistema interno aziendale - Accesso riservato al personale autorizzato
        </p>
      </div>
    </div>
  );
}
