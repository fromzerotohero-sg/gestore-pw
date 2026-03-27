'use client';

/**
 * Form per creazione/modifica credenziali
 * Usato sia per nuove credenziali che per editing
 */
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Alert } from '@/components/ui/Alert';
import { CREDENTIAL_CATEGORIES } from '@/types';
import type { Credential, CredentialFormData } from '@/types';

interface CredentialFormProps {
  credential?: Credential | null;
  onSubmit: (data: CredentialFormData) => Promise<{ error?: string }>;
  onCancel: () => void;
}

const initialFormData: CredentialFormData = {
  service_name: '',
  username_email: '',
  password_value: '',
  url: '',
  notes: '',
  category: 'Altro',
};

const categoryOptions = CREDENTIAL_CATEGORIES.map((cat) => ({
  value: cat,
  label: cat,
}));

export function CredentialForm({
  credential,
  onSubmit,
  onCancel,
}: CredentialFormProps) {
  const [formData, setFormData] = useState<CredentialFormData>(initialFormData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Popola form se in modalità edit
  useEffect(() => {
    if (credential) {
      setFormData({
        service_name: credential.service_name,
        username_email: credential.username_email,
        password_value: credential.password_value,
        url: credential.url || '',
        notes: credential.notes || '',
        category: credential.category,
      });
    } else {
      setFormData(initialFormData);
    }
  }, [credential]);

  const handleChange = (
    field: keyof CredentialFormData,
    value: string
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const result = await onSubmit(formData);

    if (result.error) {
      setError(result.error);
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <Alert type="error">{error}</Alert>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Servizio *"
          value={formData.service_name}
          onChange={(e) => handleChange('service_name', e.target.value)}
          placeholder="es. AWS, GitHub, Slack"
          required
        />

        <Select
          label="Categoria *"
          value={formData.category}
          onChange={(e) => handleChange('category', e.target.value)}
          options={categoryOptions}
          required
        />
      </div>

      <Input
        label="Username / Email *"
        value={formData.username_email}
        onChange={(e) => handleChange('username_email', e.target.value)}
        placeholder="es. user@azienda.com"
        required
      />

      <Input
        label="Password *"
        type="text"
        value={formData.password_value}
        onChange={(e) => handleChange('password_value', e.target.value)}
        placeholder="Inserisci la password"
        required
      />

      <Input
        label="URL"
        type="url"
        value={formData.url}
        onChange={(e) => handleChange('url', e.target.value)}
        placeholder="https://..."
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Note
        </label>
        <textarea
          value={formData.notes}
          onChange={(e) => handleChange('notes', e.target.value)}
          placeholder="Informazioni aggiuntive..."
          rows={3}
          className="
            block w-full rounded-lg border-gray-300 border
            shadow-sm focus:border-blue-500 focus:ring-blue-500
            px-3 py-2 text-sm
          "
        />
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Annulla
        </Button>
        <Button type="submit" loading={loading}>
          {credential ? 'Salva modifiche' : 'Crea credenziale'}
        </Button>
      </div>
    </form>
  );
}
