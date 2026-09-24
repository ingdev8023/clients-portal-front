import { supabase } from '../lib/supabase';

const PROJECT_COLUMNS = `
  id,
  client_id,
  name,
  description,
  status,
  progress_percentage,
  current_phase_id,
  start_date,
  estimated_end_date,
  completed_at,
  created_at,
  client:clients(id, name, logo_url)
`;

function unwrap(result) {
  if (result.error) throw result.error;
  return result.data ?? [];
}

export async function getPortalData(preferredProjectId) {
  // RLS is the security boundary. Explicit columns and project_id filters also
  // keep payloads small and make each screen's data contract easy to audit.
  const projects = unwrap(
    await supabase
      .from('projects')
      .select(PROJECT_COLUMNS)
      .order('created_at', { ascending: true }),
  );

  const project =
    projects.find((candidate) => candidate.id === preferredProjectId) || projects[0] || null;

  if (!project) {
    return { projects, project: null, phases: [], updates: [], payments: [], comments: [] };
  }

  const [phasesResult, updatesResult, paymentsResult, commentsResult] = await Promise.all([
    supabase
      .from('project_phases')
      .select('id, name, description, status, position, started_at, completed_at')
      .eq('project_id', project.id)
      .order('position'),
    supabase
      .from('project_updates')
      .select('id, title, message, created_at')
      .eq('project_id', project.id)
      .order('created_at', { ascending: false }),
    supabase
      .from('payments')
      .select('id, description, amount, status, due_date, paid_at')
      .eq('project_id', project.id)
      .order('due_date'),
    supabase
      .from('comments')
      .select('id, user_id, message, created_at, updated_at')
      .eq('project_id', project.id)
      .is('deleted_at', null)
      .order('created_at', { ascending: true }),
  ]);

  return {
    projects,
    project,
    phases: unwrap(phasesResult),
    updates: unwrap(updatesResult),
    payments: unwrap(paymentsResult),
    comments: unwrap(commentsResult),
  };
}

export async function createComment({ projectId, userId, message }) {
  const { data, error } = await supabase
    .from('comments')
    .insert({ project_id: projectId, user_id: userId, message })
    .select('id, user_id, message, created_at, updated_at')
    .single();

  if (error) throw error;
  return data;
}
