import { useCallback, useEffect, useState } from 'react';
import {
  createProject,
  getAdminDashboardData,
  updateProject,
} from '../models/adminDashboardModel';
import { toUserMessage } from '../lib/errors';

function validateProject(project) {
  if (!project.client_id) return 'Choose a client.';
  if (!project.name.trim()) return 'Enter a project name.';
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(project.slug)) {
    return 'Use lowercase letters, numbers, and single hyphens for the slug.';
  }
  if (!Number.isFinite(project.progress_percentage) || project.progress_percentage < 0 || project.progress_percentage > 100) {
    return 'Progress must be between 0 and 100.';
  }
  if (project.start_date && project.estimated_end_date && project.estimated_end_date < project.start_date) {
    return 'The target date cannot be before the start date.';
  }
  return '';
}

function toProjectPayload(project) {
  return {
    client_id: project.client_id,
    name: project.name.trim(),
    slug: project.slug.trim(),
    description: project.description.trim() || null,
    status: project.status,
    progress_percentage: Number(project.progress_percentage),
    start_date: project.start_date || null,
    estimated_end_date: project.estimated_end_date || null,
  };
}

export function useAdminDashboardController() {
  const [clients, setClients] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dialog, setDialog] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getAdminDashboardData();
      setClients(data.clients);
      setProjects(data.projects);
    } catch (loadError) {
      setError(toUserMessage(loadError, 'The admin dashboard could not be loaded.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    getAdminDashboardData()
      .then((data) => {
        if (!active) return;
        setClients(data.clients);
        setProjects(data.projects);
      })
      .catch((loadError) => {
        if (active) setError(toUserMessage(loadError, 'The admin dashboard could not be loaded.'));
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const openCreateDialog = () => {
    setFormError('');
    setDialog({ mode: 'create', project: null });
  };

  const openEditDialog = (project) => {
    setFormError('');
    setDialog({ mode: 'edit', project });
  };

  const closeDialog = () => {
    if (!saving) setDialog(null);
  };

  const saveProject = async (draft) => {
    const validationError = validateProject(draft);
    if (validationError) {
      setFormError(validationError);
      return false;
    }

    setSaving(true);
    setFormError('');
    try {
      const payload = toProjectPayload(draft);
      if (dialog.mode === 'create') {
        await createProject(payload);
      } else {
        await updateProject(dialog.project.id, payload);
      }
      setDialog(null);
      await loadDashboard();
      return true;
    } catch (saveError) {
      setFormError(toUserMessage(saveError, 'The project could not be saved.'));
      return false;
    } finally {
      setSaving(false);
    }
  };

  return {
    clients,
    projects,
    loading,
    error,
    dialog,
    saving,
    formError,
    openCreateDialog,
    openEditDialog,
    closeDialog,
    saveProject,
    reload: loadDashboard,
  };
}
