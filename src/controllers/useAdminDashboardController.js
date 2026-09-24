import { useCallback, useEffect, useState } from 'react';
import { createClientAccount, getAdminDashboardData } from '../models/adminDashboardModel';
import { toUserMessage } from '../lib/errors';
import { usePreferences } from '../hooks/usePreferences';
import { validateClientAccount } from '../lib/validation';

const EMPTY_CLIENT = { name: '', email: '', password: '' };

const CLIENT_ERROR_KEYS = {
  EMAIL_EXISTS: 'errors.clientEmailExists',
  FORBIDDEN: 'errors.permission',
  INVALID_INPUT: 'errors.invalidValues',
};

export function useAdminDashboardController() {
  const { t } = usePreferences();
  const [clients, setClients] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [clientDialogOpen, setClientDialogOpen] = useState(false);
  const [clientDraft, setClientDraft] = useState(EMPTY_CLIENT);
  const [clientError, setClientError] = useState('');
  const [clientNotice, setClientNotice] = useState('');
  const [savingClient, setSavingClient] = useState(false);

  const applyData = useCallback((data) => {
    setClients(data.clients);
    setProjects(data.projects);
  }, []);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      applyData(await getAdminDashboardData());
    } catch (loadError) {
      setError(toUserMessage(loadError, t('errors.dashboard'), t));
    } finally {
      setLoading(false);
    }
  }, [applyData, t]);

  useEffect(() => {
    let active = true;
    getAdminDashboardData()
      .then((data) => { if (active) applyData(data); })
      .catch((loadError) => { if (active) setError(toUserMessage(loadError, t('errors.dashboard'), t)); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [applyData, t]);

  const openClientDialog = () => {
    setClientDraft(EMPTY_CLIENT);
    setClientError('');
    setClientDialogOpen(true);
  };

  const closeClientDialog = () => {
    if (!savingClient) setClientDialogOpen(false);
  };

  const updateClientField = (field, value) => {
    setClientDraft((current) => ({ ...current, [field]: value }));
    setClientError('');
  };

  const createClient = async () => {
    const validationError = validateClientAccount(clientDraft, t);
    if (validationError) {
      setClientError(validationError);
      return false;
    }

    setSavingClient(true);
    setClientError('');
    setClientNotice('');
    try {
      const client = await createClientAccount(clientDraft);
      setClients((current) => [...current, client].sort((a, b) => a.name.localeCompare(b.name)));
      setClientDialogOpen(false);
      setClientDraft(EMPTY_CLIENT);
      setClientNotice(t('client.created'));
      return true;
    } catch (createError) {
      const translatedError = CLIENT_ERROR_KEYS[createError.code]
        ? t(CLIENT_ERROR_KEYS[createError.code])
        : toUserMessage(createError, t('errors.clientCreate'), t);
      setClientError(translatedError);
      return false;
    } finally {
      setSavingClient(false);
    }
  };

  return {
    clients,
    projects,
    loading,
    error,
    clientDialogOpen,
    clientDraft,
    clientError,
    clientNotice,
    savingClient,
    reload: loadDashboard,
    openClientDialog,
    closeClientDialog,
    updateClientField,
    createClient,
  };
}
