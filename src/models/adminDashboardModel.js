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

export async function createClientAccount(client) {
  // User creation needs the Auth Admin API, so the browser calls an authenticated
  // Edge Function instead of ever receiving a service-role credential.
  const { data, error } = await supabase.functions.invoke('create-client', {
    body: {
      name: client.name.trim(),
      email: client.email.trim().toLowerCase(),
      password: client.password,
    },
  });

  if (error) {
    const functionError = new Error('Client creation failed.');
    functionError.code = data?.code || 'CLIENT_CREATE_FAILED';

    // Non-2xx function responses keep their JSON body on the Response context.
    // Read only the stable error code; server implementation details stay hidden.
    if (error.context instanceof Response) {
      try {
        const details = await error.context.clone().json();
        functionError.code = details?.code || functionError.code;
      } catch {
        // A malformed error response is handled by the generic fallback below.
      }
    }

    throw functionError;
  }

  if (!data?.client) throw new Error('Client creation returned no client.');
  return data.client;
}
