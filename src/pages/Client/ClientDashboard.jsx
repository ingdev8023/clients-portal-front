import { Activity, CheckCircle2, Clock, CreditCard, Home, MessageSquare, RefreshCw } from 'lucide-react';
import ProjectProgressPanel from '../../components/ProjectProgressPanel';
import StatusBadge from '../../components/StatusBadge';
import { useClientPortalController } from '../../controllers/useClientPortalController';
import { useAuth } from '../../hooks/useAuth';
import { useScrollSpy } from '../../hooks/useScrollSpy';
import { formatCurrency, formatDateOnly, formatDateTime } from '../../lib/format';
import { usePreferences } from '../../hooks/usePreferences';

const SECTIONS = ['welcome', 'status', 'payments', 'comments'];

function scrollToSection(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function SectionNavigation({ activeSection }) {
  const { t } = usePreferences();
  const items = [
    { id: 'welcome', label: t('nav.welcome'), Icon: Home },
    { id: 'status', label: t('nav.status'), Icon: Activity },
    { id: 'payments', label: t('nav.payments'), Icon: CreditCard },
    { id: 'comments', label: t('nav.comments'), Icon: MessageSquare },
  ];

  return (
    <nav className="section-nav" aria-label={t('client.onThisPage')}>
      {items.map(({ id, label, Icon }) => (
        <button key={id} type="button" className={`section-nav-item ${activeSection === id ? 'is-active' : ''}`} onClick={() => scrollToSection(id)}>
          <Icon size={18} /> <span>{label}</span>
        </button>
      ))}
    </nav>
  );
}

export default function ClientDashboard() {
  const { user } = useAuth();
  const { language, t } = usePreferences();
  const controller = useClientPortalController();
  const activeSection = useScrollSpy(SECTIONS);

  if (controller.loading) {
    return (
      <div className="portal-layout" aria-label={t('project.loading')}>
        <div className="portal-main dashboard-stack">
          <div className="panel panel-padded"><div className="skeleton skeleton-title" /><div className="skeleton skeleton-line" /><div className="skeleton skeleton-line skeleton-line--short" /></div>
          <div className="panel panel-padded"><div className="skeleton skeleton-block" /></div>
          <div className="panel panel-padded"><div className="skeleton skeleton-block" /></div>
        </div>
      </div>
    );
  }

  if (controller.error) {
    return (
      <div className="page-state page-state--error" role="alert">
        <p>{controller.error}</p>
        <button className="btn btn-secondary" type="button" onClick={controller.reload}><RefreshCw size={18} /> {t('common.retry')}</button>
      </div>
    );
  }

  if (!controller.project) {
    return (
      <div className="panel empty-state">
        <FolderEmptyIcon />
        <h1>{t('client.workspacePreparing')}</h1>
        <p>{t('client.workspacePreparingText')}</p>
      </div>
    );
  }

  const { project, phases, updates, payments, comments } = controller;
  const activePhase = phases.find((phase) => phase.id === project.current_phase_id || phase.status === 'active');

  return (
    <div className="portal-layout">
        <div className="portal-main dashboard-stack">
          <section id="welcome" className="section-anchor dashboard-stack">
            <header className="page-header portal-page-header">
              <div>
                <p className="page-context">{project.client?.name || t('client.workspace')}</p>
                <h1>{project.name}</h1>
                <p>{project.description || t('client.defaultDescription')}</p>
              </div>
              <StatusBadge status={project.status} />
            </header>

            {controller.projects.length > 1 && (
              <div className="project-switcher">
                <label className="form-label" htmlFor="project-selector">{t('client.currentProject')}</label>
                <select id="project-selector" className="form-input" value={controller.selectedProjectId} onChange={(event) => controller.selectProject(event.target.value)}>
                  {controller.projects.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                </select>
              </div>
            )}

            <ProjectProgressPanel project={project} activeStage={activePhase} payments={payments} />
          </section>

          <section id="status" className="section-anchor dashboard-stack" aria-labelledby="status-title">
            <div className="section-heading"><div><h2 id="status-title">{t('client.statusTimeline')}</h2></div></div>
            <div className="panel panel-padded">
              <h3>{t('client.roadmap')}</h3>
              {phases.length === 0 ? <p className="empty-copy">{t('client.noStages')}</p> : (
                <ol className="roadmap-list">
                  {phases.map((phase) => (
                    <li key={phase.id} className={`roadmap-item roadmap-item--${phase.status}`}>
                      <div className="roadmap-icon" aria-hidden="true">
                        {phase.status === 'completed' ? <CheckCircle2 size={22} /> : phase.status === 'active' ? <Clock size={22} /> : <span />}
                      </div>
                      <div className="roadmap-copy"><div><strong>{phase.position}. {phase.name}</strong><StatusBadge status={phase.status} /></div>{phase.description && <p>{phase.description}</p>}</div>
                    </li>
                  ))}
                </ol>
              )}
            </div>

            <div className="panel panel-padded">
              <h3>{t('update.title')}</h3>
              {updates.length === 0 ? <p className="empty-copy">{t('client.noUpdates')}</p> : (
                <div className="timeline-list">
                  {updates.map((update) => (
                    <article className="timeline-item" key={update.id}>
                      <time dateTime={update.created_at}>{formatDateTime(update.created_at, language)}</time>
                      {update.title && <h4>{update.title}</h4>}
                      <p>{update.message}</p>
                    </article>
                  ))}
                </div>
              )}
            </div>
          </section>

          <section id="payments" className="section-anchor dashboard-stack" aria-labelledby="payments-title">
            <div className="section-heading"><div><h2 id="payments-title">{t('payment.title')}</h2></div></div>
            <div className="panel payment-list">
              {payments.length === 0 ? <p className="empty-copy panel-padded">{t('client.noPayments')}</p> : payments.map((payment) => (
                <article className="payment-row" key={payment.id}>
                  <div><strong>{payment.description}</strong><span>{t('payment.due', { date: formatDateOnly(payment.due_date, language) })}</span></div>
                  <div><strong>{formatCurrency(payment.amount, language)}</strong><StatusBadge status={payment.status} /></div>
                </article>
              ))}
            </div>
          </section>

          <section id="comments" className="section-anchor dashboard-stack" aria-labelledby="comments-title">
            <div className="section-heading"><div><h2 id="comments-title">{t('client.discussion')}</h2></div></div>
            <div className="panel comments-panel">
              <div className="comment-list" aria-live="polite">
                {comments.length === 0 ? <p className="empty-copy">{t('client.noComments')}</p> : comments.map((item) => (
                  <article className="comment-item" key={item.id}>
                    <div><strong>{item.user_id === user.id ? t('client.you') : t('client.team')}</strong><time dateTime={item.created_at}>{formatDateTime(item.created_at, language)}</time></div>
                    <p>{item.message}</p>
                  </article>
                ))}
              </div>
              <form className="comment-form" onSubmit={(event) => { event.preventDefault(); controller.postComment(); }}>
                <label className="form-label" htmlFor="new-comment">{t('client.addComment')}</label>
                <textarea id="new-comment" className="form-input" rows="4" maxLength="2000" value={controller.comment} onChange={(event) => controller.setComment(event.target.value)} disabled={controller.postingComment} placeholder={t('client.commentPlaceholder')} />
                <div className="comment-form-footer">
                  <span className="character-count">{controller.comment.length}/2000</span>
                  <button className="btn btn-primary" type="submit" disabled={controller.postingComment || !controller.comment.trim()}><MessageSquare size={18} />{controller.postingComment ? t('client.postingComment') : t('client.postComment')}</button>
                </div>
                {controller.commentError && <div className="alert alert-error" role="alert">{controller.commentError}</div>}
              </form>
            </div>
          </section>
        </div>

        <aside className="portal-sidebar">
          <div className="panel portal-sidebar-sticky">
            <h2>{t('client.onThisPage')}</h2>
            <SectionNavigation activeSection={activeSection} />
          </div>
        </aside>
      </div>
  );
}

function FolderEmptyIcon() {
  return <div className="empty-state-icon" aria-hidden="true"><Activity size={28} /></div>;
}
