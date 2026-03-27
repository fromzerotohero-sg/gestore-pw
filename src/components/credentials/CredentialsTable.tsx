'use client';

/**
 * Tabella credenziali con azioni
 * Accesso completo - nessuna distinzione ruoli
 */
import { useState } from 'react';
import {
  Eye,
  EyeOff,
  Copy,
  ExternalLink,
  Pencil,
  Trash2,
  Search,
  FileSpreadsheet,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal';
import { Alert } from '@/components/ui/Alert';
import { CredentialForm } from './CredentialForm';
import { useAuth } from '@/hooks/useAuth';
import { useCredentials, useFilteredCredentials } from '@/hooks/useCredentials';
import { copyToClipboard, formatDate, maskPassword } from '@/lib/utils/helpers';
import { CREDENTIAL_CATEGORIES, type CredentialFormData } from '@/types';
import * as XLSX from 'xlsx';

export function CredentialsTable() {
  const { user } = useAuth();
  const {
    credentials,
    loading,
    error,
    refresh,
    createCredential,
    updateCredential,
    deleteCredential,
  } = useCredentials(user?.id);

  // Filtri
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const filteredCredentials = useFilteredCredentials(credentials, {
    search,
    category: categoryFilter,
  });

  // Stati UI
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingCredential, setEditingCredential] = useState<typeof credentials[0] | null>(null);
  const [deletingCredential, setDeletingCredential] = useState<typeof credentials[0] | null>(null);
  const [visiblePasswords, setVisiblePasswords] = useState<Set<string>>(new Set());
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Toggle visibilità password
  const togglePasswordVisibility = (id: string) => {
    setVisiblePasswords((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Copia password
  const handleCopyPassword = async (password: string) => {
    const success = await copyToClipboard(password);
    if (success) {
      setActionSuccess('Password copiata!');
      setTimeout(() => setActionSuccess(null), 2000);
    }
  };

  // Crea nuova credenziale
  const handleCreate = async (data: CredentialFormData) => {
    const result = await createCredential(data);
    if (!result.error) {
      setIsCreateModalOpen(false);
      setActionSuccess('Credenziale creata con successo');
      setTimeout(() => setActionSuccess(null), 3000);
    }
    return result;
  };

  // Aggiorna credenziale
  const handleUpdate = async (data: CredentialFormData) => {
    if (!editingCredential) return { error: 'Nessuna credenziale selezionata' };
    const result = await updateCredential(editingCredential.id, data);
    if (!result.error) {
      setEditingCredential(null);
      setActionSuccess('Credenziale aggiornata con successo');
      setTimeout(() => setActionSuccess(null), 3000);
    }
    return result;
  };

  // Elimina credenziale
  const handleDelete = async () => {
    if (!deletingCredential) return;
    const result = await deleteCredential(deletingCredential.id);
    if (result.error) {
      setActionError(result.error);
    } else {
      setDeletingCredential(null);
      setActionSuccess('Credenziale eliminata con successo');
      setTimeout(() => setActionSuccess(null), 3000);
    }
  };

  // Export Excel
  const handleExportExcel = () => {
    const dataToExport = filteredCredentials.map((cred) => ({
      Servizio: cred.service_name,
      Categoria: cred.category,
      'Username/Email': cred.username_email,
      Password: cred.password_value,
      URL: cred.url || '',
      Note: cred.notes || '',
      'Data creazione': formatDate(cred.created_at),
      'Ultima modifica': formatDate(cred.updated_at),
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Credenziali');

    // Auto-width colonne
    const colWidths = [
      { wch: 20 },
      { wch: 15 },
      { wch: 30 },
      { wch: 25 },
      { wch: 30 },
      { wch: 40 },
      { wch: 18 },
      { wch: 18 },
    ];
    worksheet['!cols'] = colWidths;

    const fileName = `credenziali_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  const categoryOptions = [
    { value: '', label: 'Tutte le categorie' },
    ...CREDENTIAL_CATEGORIES.map((cat) => ({ value: cat, label: cat })),
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert type="error">
        Errore caricamento dati: {error}
        <Button variant="ghost" size="sm" onClick={refresh} className="ml-2">
          Riprova
        </Button>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      {/* Messaggi */}
      {actionSuccess && <Alert type="success">{actionSuccess}</Alert>}
      {actionError && (
        <Alert type="error" dismissible>
          {actionError}
        </Alert>
      )}

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
          <div className="w-full md:w-80">
            <Input
              placeholder="Cerca servizio, username..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              icon={<Search className="h-5 w-5" />}
            />
          </div>
          <div className="w-full md:w-48">
            <Select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              options={categoryOptions}
            />
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="secondary"
            onClick={handleExportExcel}
            disabled={filteredCredentials.length === 0}
          >
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Esporta Excel
          </Button>
          <Button onClick={() => setIsCreateModalOpen(true)}>
            + Nuova credenziale
          </Button>
        </div>
      </div>

      {/* Risultati filtro */}
      <div className="text-sm text-gray-500">
        {filteredCredentials.length} risultati
        {filteredCredentials.length !== credentials.length &&
          ` (di ${credentials.length} totali)`}
      </div>

      {/* Tabella */}
      <div className="overflow-x-auto border rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Servizio
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Username / Email
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Password
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Categoria
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ultima modifica
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Azioni
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredCredentials.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-8 text-center text-gray-500"
                >
                  Nessuna credenziale trovata
                </td>
              </tr>
            ) : (
              filteredCredentials.map((cred) => (
                <tr key={cred.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="font-medium text-gray-900">
                      {cred.service_name}
                    </div>
                    {cred.url && (
                      <a
                        href={cred.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1 mt-1"
                      >
                        {new URL(cred.url).hostname}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                    {cred.username_email}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                        {visiblePasswords.has(cred.id)
                          ? cred.password_value
                          : maskPassword(cred.password_value)}
                      </code>
                      <button
                        onClick={() => togglePasswordVisibility(cred.id)}
                        className="text-gray-400 hover:text-gray-600"
                        title={
                          visiblePasswords.has(cred.id)
                            ? 'Nascondi password'
                            : 'Mostra password'
                        }
                      >
                        {visiblePasswords.has(cred.id) ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                      <button
                        onClick={() => handleCopyPassword(cred.password_value)}
                        className="text-gray-400 hover:text-blue-600"
                        title="Copia password"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {cred.category}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(cred.updated_at)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => setEditingCredential(cred)}
                        className="text-blue-600 hover:text-blue-800"
                        title="Modifica"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setDeletingCredential(cred)}
                        className="text-red-600 hover:text-red-800"
                        title="Elimina"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal creazione */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Nuova Credenziale"
        size="lg"
      >
        <CredentialForm
          onSubmit={handleCreate}
          onCancel={() => setIsCreateModalOpen(false)}
        />
      </Modal>

      {/* Modal modifica */}
      <Modal
        isOpen={!!editingCredential}
        onClose={() => setEditingCredential(null)}
        title="Modifica Credenziale"
        size="lg"
      >
        <CredentialForm
          credential={editingCredential}
          onSubmit={handleUpdate}
          onCancel={() => setEditingCredential(null)}
        />
      </Modal>

      {/* Modal conferma eliminazione */}
      <Modal
        isOpen={!!deletingCredential}
        onClose={() => setDeletingCredential(null)}
        title="Conferma Eliminazione"
        size="sm"
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() => setDeletingCredential(null)}
            >
              Annulla
            </Button>
            <Button variant="danger" onClick={handleDelete}>
              Elimina
            </Button>
          </>
        }
      >
        <p className="text-gray-600">
          Sei sicuro di voler eliminare la credenziale per{' '}
          <strong>{deletingCredential?.service_name}</strong>?
          <br />
          Questa azione non può essere annullata.
        </p>
      </Modal>
    </div>
  );
}
