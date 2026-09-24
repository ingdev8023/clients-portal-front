import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { usePreferences } from '../hooks/usePreferences';
import { toUserMessage } from '../lib/errors';
import { slugify } from '../lib/format';
import {
  toProjectPayload,
  validatePayment,
  validateProject,
  validateStage,
  validateUpdate,
} from '../lib/validation';
import {
  createPayment,
  createProject,
  createProjectUpdate,
  createStage,
  deletePayment,
  deleteProjectUpdate,
  deleteStage,
  getAdminProjectData,
  updatePayment,
  updateProject,
  updateProjectUpdate,
  updateStage,
} from '../models/adminProjectModel';

const EMPTY_PROJECT = {
  client_id: '', name: '', slug: '', description: '', status: 'planned',
  progress_percentage: 0, start_date: '', estimated_end_date: '',
};

export function useAdminProjectController(projectId) {
  const isNew = !projectId;
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = usePreferences();
  const [clients, setClients] = useState([]);
  const [project, setProject] = useState(null);
  const [projectDraft, setProjectDraft] = useState(EMPTY_PROJECT);
  const [stages, setStages] = useState([]);
  const [updates, setUpdates] = useState([]);
  const [payments, setPayments] = useState([]);
  const [slugEdited, setSlugEdited] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busyAction, setBusyAction] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const applyData = useCallback((data) => {
    setClients(data.clients);
    setProject(data.project);
    setProjectDraft(data.project ? { ...EMPTY_PROJECT, ...data.project } : EMPTY_PROJECT);
    setStages(data.stages);
    setUpdates(data.updates);
    setPayments(data.payments);
  }, []);

  const loadProject = useCallback(async (showSkeleton = true) => {
    if (showSkeleton) setLoading(true);
    setError('');
    try {
      applyData(await getAdminProjectData(projectId));
    } catch (loadError) {
      setError(toUserMessage(loadError, t('errors.projectDetails'), t));
    } finally {
      if (showSkeleton) setLoading(false);
    }
  }, [applyData, projectId, t]);

  useEffect(() => {
    let active = true;
    getAdminProjectData(projectId)
      .then((data) => { if (active) applyData(data); })
      .catch((loadError) => { if (active) setError(toUserMessage(loadError, t('errors.projectDetails'), t)); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [applyData, projectId, t]);

  const updateProjectField = (field, value) => {
    if (field === 'slug') setSlugEdited(true);
    setProjectDraft((current) => {
      const next = { ...current, [field]: value };
      if (field === 'name' && isNew && !slugEdited) next.slug = slugify(value);
      return next;
    });
  };

  const runAction = async (name, action, successMessage) => {
    setBusyAction(name);
    setError('');
    setNotice('');
    try {
      await action();
      setNotice(successMessage);
      await loadProject(false);
      return true;
    } catch (actionError) {
      setError(toUserMessage(actionError, t('errors.change'), t));
      return false;
    } finally {
      setBusyAction('');
    }
  };

  const saveProject = async () => {
    const validationError = validateProject(projectDraft, t);
    if (validationError) { setError(validationError); return false; }

    setBusyAction('project');
    setError('');
    try {
      const savedProject = isNew
        ? await createProject(toProjectPayload(projectDraft))
        : await updateProject(projectId, toProjectPayload(projectDraft));
      setNotice(isNew ? t('project.created') : t('project.updated'));
      if (isNew) navigate(`/admin/projects/${savedProject.id}`, { replace: true });
      else await loadProject(false);
      return true;
    } catch (saveError) {
      setError(toUserMessage(saveError, t('errors.projectSave'), t));
      return false;
    } finally {
      setBusyAction('');
    }
  };

  const saveStage = async (draft) => {
    const validationError = validateStage(draft, t);
    if (validationError) { setError(validationError); return false; }
    const payload = { name: draft.name.trim(), description: draft.description.trim() || null, status: draft.status, position: Number(draft.position) };
    return runAction('stage', () => draft.id ? updateStage(projectId, draft.id, payload) : createStage(projectId, payload), draft.id ? t('stage.updated') : t('stage.added'));
  };

  const saveUpdate = async (draft) => {
    const validationError = validateUpdate(draft, t);
    if (validationError) { setError(validationError); return false; }
    const payload = { title: draft.title.trim() || null, message: draft.message.trim() };
    return runAction('update', () => draft.id ? updateProjectUpdate(projectId, draft.id, payload) : createProjectUpdate(projectId, user.id, payload), draft.id ? t('update.updated') : t('update.published'));
  };

  const savePayment = async (draft) => {
    const validationError = validatePayment(draft, t);
    if (validationError) { setError(validationError); return false; }
    const payload = { description: draft.description.trim(), amount: Number(draft.amount), status: draft.status, due_date: draft.due_date || null };
    return runAction('payment', () => draft.id ? updatePayment(projectId, draft.id, payload) : createPayment(projectId, payload), draft.id ? t('payment.updated') : t('payment.added'));
  };

  return {
    isNew, clients, project, projectDraft, stages, updates, payments,
    loading, busyAction, error, notice, updateProjectField, saveProject, saveStage,
    saveUpdate, savePayment,
    deleteStage: (id) => runAction('stage', () => deleteStage(projectId, id), t('stage.deleted')),
    deleteUpdate: (id) => runAction('update', () => deleteProjectUpdate(projectId, id), t('update.deleted')),
    deletePayment: (id) => runAction('payment', () => deletePayment(projectId, id), t('payment.deleted')),
    reload: loadProject,
  };
}
