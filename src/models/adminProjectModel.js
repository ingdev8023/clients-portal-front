import { supabase } from '../lib/supabase';

const CLIENT_COLUMNS = 'id, name';
const PROJECT_COLUMNS = `
  id, client_id, name, slug, description, status, progress_percentage,
  current_phase_id, start_date, estimated_end_date, completed_at, created_at,
  client:clients(name)
`;
const STAGE_COLUMNS = 'id, project_id, name, description, status, position, started_at, completed_at';
const UPDATE_COLUMNS = 'id, project_id, created_by, title, message, created_at, updated_at';
const PAYMENT_COLUMNS = 'id, project_id, description, amount, status, due_date, paid_at';

function unwrap(result, fallback = []) {
  if (result.error) throw result.error;
  return result.data ?? fallback;
}

export async function getAdminProjectData(projectId = '') {
  const clientsPromise = supabase.from('clients').select(CLIENT_COLUMNS).order('name');
  if (!projectId) {
    return { clients: unwrap(await clientsPromise), project: null, stages: [], updates: [], payments: [] };
  }

  const projectResult = await supabase
    .from('projects')
    .select(PROJECT_COLUMNS)
    .eq('id', projectId)
    .maybeSingle();
  const project = unwrap(projectResult, null);
  const clients = unwrap(await clientsPromise);

  if (!project) return { clients, project: null, stages: [], updates: [], payments: [] };

  const [stagesResult, updatesResult, paymentsResult] = await Promise.all([
    supabase.from('project_phases').select(STAGE_COLUMNS).eq('project_id', projectId).order('position'),
    supabase.from('project_updates').select(UPDATE_COLUMNS).eq('project_id', projectId).order('created_at', { ascending: false }),
    supabase.from('payments').select(PAYMENT_COLUMNS).eq('project_id', projectId).order('due_date'),
  ]);

  return {
    clients,
    project,
    stages: unwrap(stagesResult),
    updates: unwrap(updatesResult),
    payments: unwrap(paymentsResult),
  };
}

export async function createProject(project) {
  const { data, error } = await supabase.from('projects').insert(project).select(PROJECT_COLUMNS).single();
  if (error) throw error;
  return data;
}

export async function updateProject(projectId, changes) {
  // Completion timestamps and final progress are controlled by database triggers.
  const { data, error } = await supabase.from('projects').update(changes).eq('id', projectId).select(PROJECT_COLUMNS).single();
  if (error) throw error;
  return data;
}

export async function createStage(projectId, stage) {
  const { data, error } = await supabase.from('project_phases').insert({ ...stage, project_id: projectId }).select(STAGE_COLUMNS).single();
  if (error) throw error;
  return data;
}

export async function updateStage(projectId, stageId, changes) {
  const { data, error } = await supabase.from('project_phases').update(changes).eq('id', stageId).eq('project_id', projectId).select(STAGE_COLUMNS).single();
  if (error) throw error;
  return data;
}

export async function deleteStage(projectId, stageId) {
  const { error } = await supabase.from('project_phases').delete().eq('id', stageId).eq('project_id', projectId);
  if (error) throw error;
}

export async function createProjectUpdate(projectId, userId, update) {
  const { data, error } = await supabase.from('project_updates').insert({ ...update, project_id: projectId, created_by: userId }).select(UPDATE_COLUMNS).single();
  if (error) throw error;
  return data;
}

export async function updateProjectUpdate(projectId, updateId, changes) {
  const { data, error } = await supabase.from('project_updates').update(changes).eq('id', updateId).eq('project_id', projectId).select(UPDATE_COLUMNS).single();
  if (error) throw error;
  return data;
}

export async function deleteProjectUpdate(projectId, updateId) {
  const { error } = await supabase.from('project_updates').delete().eq('id', updateId).eq('project_id', projectId);
  if (error) throw error;
}

export async function createPayment(projectId, payment) {
  const { data, error } = await supabase.from('payments').insert({ ...payment, project_id: projectId }).select(PAYMENT_COLUMNS).single();
  if (error) throw error;
  return data;
}

export async function updatePayment(projectId, paymentId, changes) {
  const { data, error } = await supabase.from('payments').update(changes).eq('id', paymentId).eq('project_id', projectId).select(PAYMENT_COLUMNS).single();
  if (error) throw error;
  return data;
}

export async function deletePayment(projectId, paymentId) {
  const { error } = await supabase.from('payments').delete().eq('id', paymentId).eq('project_id', projectId);
  if (error) throw error;
}
