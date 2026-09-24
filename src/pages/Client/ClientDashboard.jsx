import { Activity, CheckCircle2, Clock, CreditCard, Home, MessageSquare, RefreshCw } from 'lucide-react';
import ProjectProgressPanel from '../../components/ProjectProgressPanel';
import StatusBadge from '../../components/StatusBadge';
import { useClientPortalController } from '../../controllers/useClientPortalController';
import { useAuth } from '../../hooks/useAuth';
import { useScrollSpy } from '../../hooks/useScrollSpy';
import { formatCurrency, formatDateOnly, formatDateTime } from '../../lib/format';

const SECTIONS = ['welcome', 'status', 'payments', 'comments'];

function scrollToSection(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function SectionNavigation({ activeSection, compact = false }) {
  const items = [
    { id: 'welcome', label: 'Welcome', Icon: Home },
    { id: 'status', label: 'Status', Icon: Activity },
    { id: 'payments', label: 'Payments', Icon: CreditCard },
    { id: 'comments', label: 'Comments', Icon: MessageSquare },
  ];

  return (
    <nav className={compact ? 'mobile-section-nav' : 'section-nav'} aria-label="Project sections">
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
  const controller = useClientPortalController();
  const activeSection = useScrollSpy(SECTIONS);

  if (controller.loading) {
    return (
      <div className="portal-layout" aria-label="Loading project">
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
        <button className="btn btn-secondary" type="button" onClick={controller.reload}><RefreshCw size={18} /> Retry</button>
      </div>
    );
  }

  if (!controller.project) {
    return (
      <div className="panel empty-state">
        <FolderEmptyIcon />
        <h1>Your workspace is being prepared</h1>
        <p>Your project details will appear here as soon as your administrator assigns a project.</p>
      </div>
    );
  }

  const { project, phases, updates, payments, comments } = controller;
  const activePhase = phases.find((phase) => phase.id === project.current_phase_id || phase.status === 'active');

  return (
    <>
      <SectionNavigation activeSection={activeSection} compact />

      <div className="portal-layout">
        <div className="portal-main dashboard-stack">
          <section id="welcome" className="section-anchor dashboard-stack">
            <header className="page-header portal-page-header">
              <div>
                <p className="eyebrow">{project.client?.name || 'Client workspace'}</p>
                <h1>{project.name}</h1>
                <p>{project.description || 'Project details and progress are available below.'}</p>
              </div>
              <StatusBadge status={project.status} />
            </header>

            {controller.projects.length > 1 && (
              <div className="project-switcher">
                <label className="form-label" htmlFor="project-selector">Current project</label>
                <select id="project-selector" className="form-input" value={controller.selectedProjectId} onChange={(event) => controller.selectProject(event.target.value)}>
                  {controller.projects.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                </select>
              </div>
            )}

            <ProjectProgressPanel project={project} activeStage={activePhase} payments={payments} />
          </section>

          <section id="status" className="section-anchor dashboard-stack" aria-labelledby="status-title">
            <div className="section-heading"><div><p className="eyebrow">Delivery</p><h2 id="status-title">Status and timeline</h2></div></div>
            <div className="panel panel-padded">
              <h3>Roadmap</h3>
              {phases.length === 0 ? <p className="empty-copy">No project phases have been published yet.</p> : (
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
              <h3>Recent updates</h3>
              {updates.length === 0 ? <p className="empty-copy">No updates have been posted yet.</p> : (
                <div className="timeline-list">
                  {updates.map((update) => (
                    <article className="timeline-item" key={update.id}>
                      <time dateTime={update.created_at}>{formatDateTime(update.created_at)}</time>
                      {update.title && <h4>{update.title}</h4>}
                      <p>{update.message}</p>
                    </article>
                  ))}
                </div>
              )}
            </div>
          </section>

          <section id="payments" className="section-anchor dashboard-stack" aria-labelledby="payments-title">
            <div className="section-heading"><div><p className="eyebrow">Billing</p><h2 id="payments-title">Payments</h2></div></div>
            <div className="panel payment-list">
              {payments.length === 0 ? <p className="empty-copy panel-padded">No payment records are available.</p> : payments.map((payment) => (
                <article className="payment-row" key={payment.id}>
                  <div><strong>{payment.description}</strong><span>Due {formatDateOnly(payment.due_date)}</span></div>
                  <div><strong>{formatCurrency(payment.amount)}</strong><StatusBadge status={payment.status} /></div>
                </article>
              ))}
            </div>
          </section>

          <section id="comments" className="section-anchor dashboard-stack" aria-labelledby="comments-title">
            <div className="section-heading"><div><p className="eyebrow">Conversation</p><h2 id="comments-title">Comments</h2></div></div>
            <div className="panel comments-panel">
              <div className="comment-list" aria-live="polite">
                {comments.length === 0 ? <p className="empty-copy">No comments yet. Start the conversation.</p> : comments.map((item) => (
                  <article className="comment-item" key={item.id}>
                    <div><strong>{item.user_id === user.id ? 'You' : 'Project team'}</strong><time dateTime={item.created_at}>{formatDateTime(item.created_at)}</time></div>
                    <p>{item.message}</p>
                  </article>
                ))}
              </div>
              <form className="comment-form" onSubmit={(event) => { event.preventDefault(); controller.postComment(); }}>
                <label className="form-label" htmlFor="new-comment">Add a comment</label>
                <textarea id="new-comment" className="form-input" rows="4" maxLength="2000" value={controller.comment} onChange={(event) => controller.setComment(event.target.value)} disabled={controller.postingComment} placeholder="Write a project comment..." />
                <div className="comment-form-footer">
                  <span className="character-count">{controller.comment.length}/2000</span>
                  <button className="btn btn-primary" type="submit" disabled={controller.postingComment || !controller.comment.trim()}><MessageSquare size={18} />{controller.postingComment ? 'Posting...' : 'Post comment'}</button>
                </div>
                {controller.commentError && <div className="alert alert-error" role="alert">{controller.commentError}</div>}
              </form>
            </div>
          </section>
        </div>

        <aside className="portal-sidebar">
          <div className="panel portal-sidebar-sticky">
            <h2>On this page</h2>
            <SectionNavigation activeSection={activeSection} />
          </div>
        </aside>
      </div>
    </>
  );
}

function FolderEmptyIcon() {
  return <div className="empty-state-icon" aria-hidden="true"><Activity size={28} /></div>;
}
