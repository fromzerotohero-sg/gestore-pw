'use client';

/**
 * Componente Alert per messaggi di errore, successo o info
 */
import { AlertCircle, CheckCircle, Info, X } from 'lucide-react';
import { useState, type ReactNode } from 'react';

type AlertType = 'error' | 'success' | 'info';

interface AlertProps {
  type?: AlertType;
  children: ReactNode;
  dismissible?: boolean;
  className?: string;
}

const alertStyles = {
  error: 'bg-red-50 border-red-200 text-red-800',
  success: 'bg-green-50 border-green-200 text-green-800',
  info: 'bg-blue-50 border-blue-200 text-blue-800',
};

const iconStyles = {
  error: 'text-red-400',
  success: 'text-green-400',
  info: 'text-blue-400',
};

const icons = {
  error: AlertCircle,
  success: CheckCircle,
  info: Info,
};

export function Alert({
  type = 'info',
  children,
  dismissible = false,
  className = '',
}: AlertProps) {
  const [isVisible, setIsVisible] = useState(true);
  const Icon = icons[type];

  if (!isVisible) return null;

  return (
    <div
      className={`
        flex items-start gap-3 p-4 rounded-lg border
        ${alertStyles[type]}
        ${className}
      `}
    >
      <Icon className={`h-5 w-5 flex-shrink-0 mt-0.5 ${iconStyles[type]}`} />
      <div className="flex-1 text-sm">{children}</div>
      {dismissible && (
        <button
          onClick={() => setIsVisible(false)}
          className="flex-shrink-0 hover:opacity-70"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
