export const PROJECT_STATUSES = ['planned', 'active', 'paused', 'completed', 'cancelled'];
export const STAGE_STATUSES = ['pending', 'active', 'completed'];
export const PAYMENT_STATUSES = ['pending', 'paid', 'overdue', 'cancelled'];

export function validateProject(project) {
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

export function validateStage(stage) {
  if (!stage.name.trim()) return 'Enter a stage name.';
  if (!Number.isInteger(Number(stage.position)) || Number(stage.position) < 1) {
    return 'Stage order must be a positive whole number.';
  }
  return '';
}

export function validateUpdate(update) {
  if (!update.message.trim()) return 'Enter an update message.';
  return '';
}

export function validatePayment(payment) {
  if (!payment.description.trim()) return 'Enter a payment description.';
  if (!Number.isFinite(Number(payment.amount)) || Number(payment.amount) < 0) {
    return 'Payment amount must be zero or greater.';
  }
  return '';
}

export function toProjectPayload(project) {
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
