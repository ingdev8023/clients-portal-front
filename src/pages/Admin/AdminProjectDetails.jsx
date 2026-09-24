import { useState } from 'react';
import { ArrowLeft, CalendarDays, CreditCard, FileText, Layers3, Pencil, Plus, Save, Trash2 } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import ConfirmDialog from '../../components/ConfirmDialog';
import StatusBadge from '../../components/StatusBadge';
import { useAdminProjectController } from '../../controllers/useAdminProjectController';
import { formatCurrency, formatDateOnly, formatDateTime } from '../../lib/format';
import { PAYMENT_STATUSES, PROJECT_STATUSES, STAGE_STATUSES } from '../../lib/validation';
import { usePreferences } from '../../hooks/usePreferences';

const emptyUpdate = { title: '', message: '' };
const emptyPayment = { description: '', amount: '', status: 'pending', due_date: '' };

export default function AdminProjectDetails() {
  const { projectId } = useParams();
  const controller = useAdminProjectController(projectId === 'new' ? '' : projectId);
  return <AdminProjectDetailsView controller={controller} />;
}

export function AdminProjectDetailsView({ controller }) {
  const { language, t } = usePreferences();
  const [stageDraft, setStageDraft] = useState(null);
  const [updateDraft, setUpdateDraft] = useState(null);
  const [paymentDraft, setPaymentDraft] = useState(null);
  const [confirmation, setConfirmation] = useState(null);

  if (controller.loading) return <ProjectDetailSkeleton />;
  if (!controller.isNew && !controller.project && !controller.error) {
    return <div className="panel empty-state"><h1>{t('project.unavailableTitle')}</h1><p>{t('project.unavailableText')}</p><Link className="btn btn-secondary" to="/admin">{t('project.back')}</Link></div>;
  }

  const openNewStage = () => setStageDraft({ name: '', description: '', status: 'pending', position: controller.stages.length + 1 });
  const confirmDelete = (resource, item) => {
    const actions = {
      stage: () => controller.deleteStage(item.id),
      update: () => controller.deleteUpdate(item.id),
      payment: () => controller.deletePayment(item.id),
    };
    const resourceName = t(`${resource}.resource`);
    setConfirmation({ title: t('confirm.deleteTitle', { resource: resourceName }), message: t('confirm.deleteMessage', { name: item.name || item.title || item.description || resourceName }), action: actions[resource] });
  };

  const runConfirmedDelete = async () => {
    const succeeded = await confirmation.action();
    if (succeeded) setConfirmation(null);
  };

  return (
    <div className="project-detail-page dashboard-stack">
      <Link className="back-link" to="/admin"><ArrowLeft size={17} /> {t('project.back')}</Link>

      <header className="page-header">
        <div>{!controller.isNew && controller.project?.client?.name && <p className="page-context">{controller.project.client.name}</p>}<h1>{controller.isNew ? t('project.createTitle') : controller.project.name}</h1><p>{t('project.detailsSubtitle')}</p></div>
        {!controller.isNew && <StatusBadge status={controller.project.status} />}
      </header>

      {controller.error && <div className="alert alert-error" role="alert">{controller.error}</div>}
      {controller.notice && <div className="alert alert-success" role="status">{controller.notice}</div>}

      {!controller.isNew && (
        <nav className="detail-section-nav" aria-label={t('project.detailsSubtitle')}>
          <a href="#overview"><FileText size={17} /> {t('nav.overview')}</a>
          <a href="#stages"><Layers3 size={17} /> {t('nav.stages')}</a>
          <a href="#updates"><CalendarDays size={17} /> {t('nav.updates')}</a>
          <a href="#billing"><CreditCard size={17} /> {t('nav.payments')}</a>
        </nav>
      )}

      <section id="overview" className="detail-section" aria-labelledby="overview-title">
        <div className="section-heading"><div><h2 id="overview-title">{t('project.overview')}</h2></div></div>
        <ProjectForm controller={controller} />
      </section>

      {!controller.isNew && (
        <>
          <section id="stages" className="detail-section" aria-labelledby="stages-title">
            <ResourceHeading title={t('stage.title')} titleId="stages-title" buttonLabel={t('stage.add')} onAdd={openNewStage} />
            {stageDraft && <StageForm draft={stageDraft} setDraft={setStageDraft} busy={controller.busyAction === 'stage'} onCancel={() => setStageDraft(null)} onSave={async () => { if (await controller.saveStage(stageDraft)) setStageDraft(null); }} />}
            <div className="resource-list">
              {controller.stages.length === 0 ? <div className="panel empty-list">{t('stage.empty')}</div> : controller.stages.map((stage) => (
                <article className="resource-card" key={stage.id}>
                  <div className="resource-order">{stage.position}</div>
                  <div className="resource-copy"><div className="resource-title"><h3>{stage.name}</h3><StatusBadge status={stage.status} /></div><p>{stage.description || t('stage.noInfo')}</p></div>
                  <ResourceActions label={stage.name} onEdit={() => setStageDraft({ ...stage })} onDelete={() => confirmDelete('stage', stage)} />
                </article>
              ))}
            </div>
          </section>

          <section id="updates" className="detail-section" aria-labelledby="updates-title">
            <ResourceHeading title={t('update.title')} titleId="updates-title" buttonLabel={t('update.publish')} onAdd={() => setUpdateDraft(emptyUpdate)} />
            {updateDraft && <UpdateForm draft={updateDraft} setDraft={setUpdateDraft} busy={controller.busyAction === 'update'} onCancel={() => setUpdateDraft(null)} onSave={async () => { if (await controller.saveUpdate(updateDraft)) setUpdateDraft(null); }} />}
            <div className="resource-list">
              {controller.updates.length === 0 ? <div className="panel empty-list">{t('update.empty')}</div> : controller.updates.map((update) => (
                <article className="resource-card resource-card--timeline" key={update.id}>
                  <div className="resource-copy"><time dateTime={update.created_at}>{formatDateTime(update.created_at, language)}</time><h3>{update.title || t('update.defaultTitle')}</h3><p>{update.message}</p></div>
                  <ResourceActions label={update.title || t('update.resource')} onEdit={() => setUpdateDraft({ ...update, title: update.title || '' })} onDelete={() => confirmDelete('update', update)} />
                </article>
              ))}
            </div>
          </section>

          <section id="billing" className="detail-section" aria-labelledby="billing-title">
            <ResourceHeading title={t('payment.title')} titleId="billing-title" buttonLabel={t('payment.add')} onAdd={() => setPaymentDraft(emptyPayment)} />
            {paymentDraft && <PaymentForm draft={paymentDraft} setDraft={setPaymentDraft} busy={controller.busyAction === 'payment'} onCancel={() => setPaymentDraft(null)} onSave={async () => { if (await controller.savePayment(paymentDraft)) setPaymentDraft(null); }} />}
            <div className="resource-list">
              {controller.payments.length === 0 ? <div className="panel empty-list">{t('payment.empty')}</div> : controller.payments.map((payment) => (
                <article className="resource-card" key={payment.id}>
                  <div className="payment-resource-icon"><CreditCard size={21} /></div>
                  <div className="resource-copy"><div className="resource-title"><h3>{payment.description}</h3><StatusBadge status={payment.status} /></div><p>{formatCurrency(payment.amount, language)} · {t('payment.due', { date: formatDateOnly(payment.due_date, language) })}</p></div>
                  <ResourceActions label={payment.description} onEdit={() => setPaymentDraft({ ...payment })} onDelete={() => confirmDelete('payment', payment)} />
                </article>
              ))}
            </div>
          </section>
        </>
      )}

      {confirmation && <ConfirmDialog title={confirmation.title} message={confirmation.message} busy={Boolean(controller.busyAction)} onCancel={() => setConfirmation(null)} onConfirm={runConfirmedDelete} />}
    </div>
  );
}

function ProjectForm({ controller }) {
  const { t } = usePreferences();
  const draft = controller.projectDraft;
  return (
    <form className="panel editor-form" onSubmit={(event) => { event.preventDefault(); controller.saveProject(); }}>
      <div className="form-grid">
        <Field label={t('project.client')} id="detail-client"><select id="detail-client" className="form-input" value={draft.client_id} onChange={(event) => controller.updateProjectField('client_id', event.target.value)} required><option value="">{t('project.selectClient')}</option>{controller.clients.map((client) => <option value={client.id} key={client.id}>{client.name}</option>)}</select></Field>
        <Field label={t('project.status')} id="detail-status"><select id="detail-status" className="form-input" value={draft.status} onChange={(event) => controller.updateProjectField('status', event.target.value)}>{PROJECT_STATUSES.map((status) => <option value={status} key={status}>{t(`status.${status}`)}</option>)}</select></Field>
      </div>
      <div className="form-grid">
        <Field label={t('project.name')} id="detail-name"><input id="detail-name" className="form-input" value={draft.name} onChange={(event) => controller.updateProjectField('name', event.target.value)} maxLength="120" required /></Field>
        <Field label={t('project.slug')} id="detail-slug"><input id="detail-slug" className="form-input" value={draft.slug} onChange={(event) => controller.updateProjectField('slug', event.target.value.toLowerCase())} pattern="[a-z0-9]+(?:-[a-z0-9]+)*" required /></Field>
      </div>
      <Field label={t('project.description')} id="detail-description"><textarea id="detail-description" className="form-input" rows="4" value={draft.description || ''} onChange={(event) => controller.updateProjectField('description', event.target.value)} maxLength="1000" /></Field>
      <div className="form-grid form-grid--three">
        <Field label={t('project.progressPercent')} id="detail-progress"><input id="detail-progress" className="form-input" type="number" min="0" max="100" value={draft.progress_percentage} onChange={(event) => controller.updateProjectField('progress_percentage', Number(event.target.value))} /></Field>
        <Field label={t('project.startDate')} id="detail-start"><input id="detail-start" className="form-input" type="date" value={draft.start_date || ''} onChange={(event) => controller.updateProjectField('start_date', event.target.value)} /></Field>
        <Field label={t('project.targetDate')} id="detail-end"><input id="detail-end" className="form-input" type="date" value={draft.estimated_end_date || ''} onChange={(event) => controller.updateProjectField('estimated_end_date', event.target.value)} /></Field>
      </div>
      <div className="editor-actions"><button className="btn btn-primary" type="submit" disabled={controller.busyAction === 'project'}><Save size={18} />{controller.busyAction === 'project' ? t('common.saving') : controller.isNew ? t('project.create') : t('project.saveOverview')}</button></div>
    </form>
  );
}

function StageForm({ draft, setDraft, busy, onCancel, onSave }) {
  const { t } = usePreferences();
  return (
    <form className="panel editor-form resource-editor" onSubmit={(event) => { event.preventDefault(); onSave(); }}>
      <div className="resource-editor-heading"><h3>{draft.id ? t('stage.edit') : t('stage.add')}</h3><span>{t('stage.formHelp')}</span></div>
      <div className="form-grid form-grid--three">
        <Field label={t('stage.name')} id="stage-name"><input id="stage-name" className="form-input" value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} required /></Field>
        <Field label={t('stage.status')} id="stage-status"><select id="stage-status" className="form-input" value={draft.status} onChange={(event) => setDraft({ ...draft, status: event.target.value })}>{STAGE_STATUSES.map((status) => <option value={status} key={status}>{t(`status.${status}`)}</option>)}</select></Field>
        <Field label={t('stage.order')} id="stage-position"><input id="stage-position" className="form-input" type="number" min="1" step="1" value={draft.position} onChange={(event) => setDraft({ ...draft, position: Number(event.target.value) })} required /></Field>
      </div>
      <Field label={t('stage.information')} id="stage-description"><textarea id="stage-description" className="form-input" rows="4" value={draft.description || ''} onChange={(event) => setDraft({ ...draft, description: event.target.value })} placeholder={t('stage.placeholder')} /></Field>
      <EditorActions busy={busy} onCancel={onCancel} label={t('stage.save')} />
    </form>
  );
}

function UpdateForm({ draft, setDraft, busy, onCancel, onSave }) {
  const { t } = usePreferences();
  return (
    <form className="panel editor-form resource-editor" onSubmit={(event) => { event.preventDefault(); onSave(); }}>
      <div className="resource-editor-heading"><h3>{draft.id ? t('update.edit') : t('update.publish')}</h3><span>{t('update.formHelp')}</span></div>
      <Field label={t('update.titleField')} id="update-title"><input id="update-title" className="form-input" value={draft.title || ''} onChange={(event) => setDraft({ ...draft, title: event.target.value })} maxLength="120" /></Field>
      <Field label={t('update.message')} id="update-message"><textarea id="update-message" className="form-input" rows="4" value={draft.message} onChange={(event) => setDraft({ ...draft, message: event.target.value })} required /></Field>
      <EditorActions busy={busy} onCancel={onCancel} label={t('update.save')} />
    </form>
  );
}

function PaymentForm({ draft, setDraft, busy, onCancel, onSave }) {
  const { t } = usePreferences();
  return (
    <form className="panel editor-form resource-editor" onSubmit={(event) => { event.preventDefault(); onSave(); }}>
      <div className="resource-editor-heading"><h3>{draft.id ? t('payment.edit') : t('payment.add')}</h3><span>{t('payment.formHelp')}</span></div>
      <div className="form-grid form-grid--three">
        <Field label={t('payment.description')} id="payment-description"><input id="payment-description" className="form-input" value={draft.description} onChange={(event) => setDraft({ ...draft, description: event.target.value })} required /></Field>
        <Field label={t('payment.amount')} id="payment-amount"><input id="payment-amount" className="form-input" type="number" min="0" step="0.01" value={draft.amount} onChange={(event) => setDraft({ ...draft, amount: event.target.value })} required /></Field>
        <Field label={t('payment.status')} id="payment-status"><select id="payment-status" className="form-input" value={draft.status} onChange={(event) => setDraft({ ...draft, status: event.target.value })}>{PAYMENT_STATUSES.map((status) => <option value={status} key={status}>{t(`status.${status}`)}</option>)}</select></Field>
      </div>
      <Field label={t('payment.dueDate')} id="payment-due"><input id="payment-due" className="form-input" type="date" value={draft.due_date || ''} onChange={(event) => setDraft({ ...draft, due_date: event.target.value })} /></Field>
      <EditorActions busy={busy} onCancel={onCancel} label={t('payment.save')} />
    </form>
  );
}

function Field({ label, id, children }) { return <div className="form-group"><label className="form-label" htmlFor={id}>{label}</label>{children}</div>; }
function EditorActions({ busy, onCancel, label }) { const { t } = usePreferences(); return <div className="editor-actions"><button className="btn btn-secondary" type="button" onClick={onCancel} disabled={busy}>{t('common.cancel')}</button><button className="btn btn-primary" type="submit" disabled={busy}><Save size={18} />{busy ? t('common.saving') : label}</button></div>; }
function ResourceHeading({ title, titleId, buttonLabel, onAdd }) { return <div className="section-heading"><div><h2 id={titleId}>{title}</h2></div><button className="btn btn-secondary" type="button" onClick={onAdd}><Plus size={18} />{buttonLabel}</button></div>; }
function ResourceActions({ label, onEdit, onDelete }) { const { t } = usePreferences(); return <div className="resource-actions"><button className="icon-button" type="button" onClick={onEdit} aria-label={`${t('common.edit')} ${label}`} title={t('common.edit')}><Pencil size={17} /></button><button className="icon-button icon-button--danger" type="button" onClick={onDelete} aria-label={`${t('common.delete')} ${label}`} title={t('common.delete')}><Trash2 size={17} /></button></div>; }

function ProjectDetailSkeleton() {
  const { t } = usePreferences();
  return <div className="dashboard-stack" aria-label={t('project.loading')}><div className="skeleton skeleton-line skeleton-line--short" /><div><div className="skeleton skeleton-title" /><div className="skeleton skeleton-line skeleton-line--short" /></div><div className="panel panel-padded"><div className="skeleton skeleton-row" /><div className="skeleton skeleton-block" /></div><div className="panel panel-padded"><div className="skeleton skeleton-row" /><div className="skeleton skeleton-row" /></div></div>;
}
