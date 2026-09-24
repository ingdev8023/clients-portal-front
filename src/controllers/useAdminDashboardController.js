import { useCallback, useEffect, useState } from 'react';
import { getAdminDashboardData } from '../models/adminDashboardModel';
import { toUserMessage } from '../lib/errors';
import { usePreferences } from '../hooks/usePreferences';

export function useAdminDashboardController() {
  const { t } = usePreferences();
  const [clients, setClients] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

  return { clients, projects, loading, error, reload: loadDashboard };
}
