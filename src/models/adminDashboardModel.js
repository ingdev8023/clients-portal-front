import { supabase } from '../lib/supabase';

const CLIENT_COLUMNS = 'id, name';
const PROJECT_COLUMNS = `
  id,
  client_id,
  name,
  slug,
  description,
  status,
  progress_percentage,
  start_date,
  estimated_end_date,
  completed_at,
  created_at,
  client:clients(name)
`;

function throwOnError(result) {
  if (result.error) throw result.error;
  return result.data ?? [];
}

export async function getAdminDashboardData() {
  const [clientsResult, projectsResult] = await Promise.all([
    supabase.from('clients').select(CLIENT_COLUMNS).order('name'),
    supabase.from('projects').select(PROJECT_COLUMNS).order('created_at', { ascending: false }),
  ]);

  return {
    clients: throwOnError(clientsResult),
    projects: throwOnError(projectsResult),
  };
}

export async function createProject(project) {
  const { data, error } = await supabase
    .from('projects')
    .insert(project)
    .select(PROJECT_COLUMNS)
    .single();

  if (error) throw error;
  return data;
}

export async function updateProject(projectId, changes) {
  // The database triggers remain responsible for completion timestamps and
  // any other derived values. Returning the row keeps the UI server-authoritative.
  const { data, error } = await supabase
    .from('projects')
    .update(changes)
    .eq('id', projectId)
    .select(PROJECT_COLUMNS)
    .single();

  if (error) throw error;
  return data;
}
