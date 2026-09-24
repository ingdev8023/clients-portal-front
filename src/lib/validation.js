import { translate } from '../i18n/translations';

export const PROJECT_STATUSES = ['planned', 'active', 'paused', 'completed', 'cancelled'];
export const STAGE_STATUSES = ['pending', 'active', 'completed'];
export const PAYMENT_STATUSES = ['pending', 'paid', 'overdue', 'cancelled'];

export function validateProject(project, t = (key) => translate('en', key)) {
  if (!project.client_id) return t('validation.client');
  if (!project.name.trim()) return t('validation.projectName');
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(project.slug)) {
    return t('validation.slug');
  }
  if (!Number.isFinite(project.progress_percentage) || project.progress_percentage < 0 || project.progress_percentage > 100) {
    return t('validation.progress');
  }
  if (project.start_date && project.estimated_end_date && project.estimated_end_date < project.start_date) {
    return t('validation.date');
  }
  return '';
}

export function validateStage(stage, t = (key) => translate('en', key)) {
  if (!stage.name.trim()) return t('validation.stageName');
  if (!Number.isInteger(Number(stage.position)) || Number(stage.position) < 1) {
    return t('validation.stageOrder');
  }
  return '';
}

export function validateUpdate(update, t = (key) => translate('en', key)) {
  if (!update.message.trim()) return t('validation.update');
  return '';
}

export function validatePayment(payment, t = (key) => translate('en', key)) {
  if (!payment.description.trim()) return t('validation.paymentDescription');
  if (!Number.isFinite(Number(payment.amount)) || Number(payment.amount) < 0) {
    return t('validation.paymentAmount');
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
