import { Building2, FolderKanban, Plus, RefreshCw, UserPlus } from 'lucide-react';
import { Link } from 'react-router-dom';
import CreateClientDialog from '../../components/CreateClientDialog';
import StatusBadge from '../../components/StatusBadge';
import { useAdminDashboardController } from '../../controllers/useAdminDashboardController';
import { formatDateOnly } from '../../lib/format';
import { usePreferences } from '../../hooks/usePreferences';

export default function AdminDashboard() {
  const controller = useAdminDashboardController();
  return <AdminDashboardView controller={controller} />;
}

export function AdminDashboardView({ controller }) {
  const { language, t } = usePreferences();
  const activeProjects = controller.projects.filter((project) => project.status === 'active').length;

  if (controller.loading) return <AdminDashboardSkeleton />;

  if (controller.error) {
    return (
      <div className="page-state page-state--error" role="alert">
        <p>{controller.error}</p>
        <button className="btn btn-secondary" type="button" onClick={controller.reload}><RefreshCw size={18} /> {t('common.retry')}</button>
      </div>
    );
  }

  return (
    <div className="dashboard-stack">
      <header className="page-header">
        <div><h1>{t('dashboard.title')}</h1><p>{t('dashboard.subtitle')}</p></div>
        <div className="page-actions">
          <button className="btn btn-secondary" type="button" onClick={controller.openClientDialog}><UserPlus size={18} /> {t('dashboard.newClient')}</button>
          {controller.clients.length ? (
            <Link className="btn btn-primary" to="/admin/projects/new"><Plus size={18} /> {t('dashboard.newProject')}</Link>
          ) : (
            <span className="btn btn-primary is-disabled" aria-disabled="true"><Plus size={18} /> {t('dashboard.newProject')}</span>
          )}
        </div>
      </header>

      {controller.clientNotice && <div className="alert alert-success" role="status">{controller.clientNotice}</div>}

      <section className="stats-grid" aria-label={t('dashboard.summary')}>
        <article className="stat-card"><div className="stat-icon stat-icon--teal"><Building2 size={22} /></div><div><strong>{controller.clients.length}</strong><span>{t('dashboard.totalClients')}</span></div></article>
        <article className="stat-card"><div className="stat-icon stat-icon--coral"><FolderKanban size={22} /></div><div><strong>{controller.projects.length}</strong><span>{t('dashboard.totalProjects')}</span></div></article>
        <article className="stat-card"><div className="stat-icon stat-icon--amber"><RefreshCw size={22} /></div><div><strong>{activeProjects}</strong><span>{t('dashboard.activeProjects')}</span></div></article>
      </section>

      <section id="projects" className="dashboard-section" aria-labelledby="projects-title">
        <div className="section-heading">
          <div><h2 id="projects-title">{t('dashboard.recentProjects')}</h2></div>
          {!controller.clients.length && <span className="helper-text">{t('dashboard.clientRequired')}</span>}
        </div>

        {controller.projects.length === 0 ? <div className="panel empty-list">{t('dashboard.noProjects')}</div> : (
          <>
            <div className="project-card-list">
              {controller.projects.map((project) => <ProjectCard key={project.id} project={project} language={language} t={t} />)}
            </div>
            <div className="table-shell project-table">
              <div className="responsive-table">
                <table>
                  <thead><tr><th>{t('dashboard.project')}</th><th>{t('dashboard.client')}</th><th>{t('dashboard.status')}</th><th>{t('dashboard.progress')}</th><th>{t('dashboard.targetDate')}</th></tr></thead>
                  <tbody>
                    {controller.projects.map((project) => (
                      <tr key={project.id}>
                        <td><Link className="project-link" to={`/admin/projects/${project.id}`}>{project.name}</Link><span className="table-secondary">{project.slug}</span></td>
                        <td>{project.client?.name || t('common.unknownClient')}</td>
                        <td><StatusBadge status={project.status} /></td>
                        <td><div className="progress-cell"><progress className="progress-native progress-native--compact" aria-label={`${project.name} ${t('dashboard.progress')}`} value={project.progress_percentage} max="100">{project.progress_percentage}%</progress><span>{project.progress_percentage}%</span></div></td>
                        <td>{formatDateOnly(project.estimated_end_date, language)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </section>

      {controller.clientDialogOpen && (
        <CreateClientDialog
          draft={controller.clientDraft}
          error={controller.clientError}
          busy={controller.savingClient}
          onCancel={controller.closeClientDialog}
          onChange={controller.updateClientField}
          onSubmit={controller.createClient}
        />
      )}
    </div>
  );
}

function ProjectCard({ project, language, t }) {
  return (
    <article className="project-card">
      <div><Link className="project-link" to={`/admin/projects/${project.id}`}>{project.name}</Link><span>{project.client?.name || t('common.unknownClient')}</span></div>
      <StatusBadge status={project.status} />
      <div className="project-card-progress"><progress className="progress-native" value={project.progress_percentage} max="100">{project.progress_percentage}%</progress><span>{project.progress_percentage}%</span></div>
      <span className="project-card-date">{t('common.target')} {formatDateOnly(project.estimated_end_date, language)}</span>
    </article>
  );
}

function AdminDashboardSkeleton() {
  const { t } = usePreferences();
  return (
    <div className="dashboard-stack" aria-label={t('dashboard.loading')}>
      <div><div className="skeleton skeleton-title" /><div className="skeleton skeleton-line skeleton-line--short" /></div>
      <div className="stats-grid">{[1, 2, 3].map((item) => <div className="skeleton skeleton-stat" key={item} />)}</div>
      <div className="panel panel-padded"><div className="skeleton skeleton-line" /><div className="skeleton skeleton-row" /><div className="skeleton skeleton-row" /></div>
    </div>
  );
}
